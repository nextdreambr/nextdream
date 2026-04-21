import {
  BadRequestException,
  ConflictException,
  Inject,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, IsNull, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { AdminInvite } from '../../entities/admin-invite.entity';
import ms, { type StringValue } from 'ms';
import { getEnvOrDefault, getRequiredEnv } from '../../config/env';
import { ManagedPatient } from '../../entities/managed-patient.entity';
import { PatientInvite } from '../../entities/patient-invite.entity';
import { User } from '../../entities/user.entity';
import { buildLocationLabel, normalizeLocationPart } from '../../lib/location';
import { AcceptAdminInviteDto } from './dto/accept-admin-invite.dto';
import { AcceptPatientInviteDto } from './dto/accept-patient-invite.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';

export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  role: 'paciente' | 'apoiador' | 'instituicao' | 'admin';
  state?: string;
  city?: string;
  locationLabel?: string;
  institutionType?: string;
  institutionDescription?: string;
  verified: boolean;
  approved: boolean;
  emailNotificationsEnabled?: boolean;
}

export interface AuthSessionPayload {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayload;
}

@Injectable()
export class AuthService {
  private readonly accessTokenExpiresIn: StringValue = this.readJwtTtl('JWT_ACCESS_EXPIRES_IN', '1h');
  private readonly refreshTokenExpiresIn: StringValue = this.readJwtTtl('JWT_REFRESH_EXPIRES_IN', '7d');
  private readonly usersRepository: Repository<User>;
  private readonly adminInvitesRepository: Repository<AdminInvite>;
  private readonly patientInvitesRepository: Repository<PatientInvite>;
  private readonly managedPatientsRepository: Repository<ManagedPatient>;
  private readonly jwtService: JwtService;
  private readonly mailService: MailService;
  private readonly dataSource: DataSource;

  constructor(
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(AdminInvite) adminInvitesRepository: Repository<AdminInvite>,
    @InjectRepository(PatientInvite) patientInvitesRepository: Repository<PatientInvite>,
    @InjectRepository(ManagedPatient) managedPatientsRepository: Repository<ManagedPatient>,
    @Inject(JwtService) jwtService: JwtService,
    @Inject(MailService) mailService: MailService,
    @InjectDataSource() dataSource: DataSource,
  ) {
    this.usersRepository = usersRepository;
    this.adminInvitesRepository = adminInvitesRepository;
    this.patientInvitesRepository = patientInvitesRepository;
    this.managedPatientsRepository = managedPatientsRepository;
    this.jwtService = jwtService;
    this.mailService = mailService;
    this.dataSource = dataSource;
  }

  async register(dto: RegisterDto): Promise<AuthSessionPayload> {
    if ((dto as { role: string }).role === 'admin') {
      throw new BadRequestException('Public registration cannot create admin users');
    }

    const existing = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: dto.role,
      state: normalizeLocationPart(dto.state),
      city: normalizeLocationPart(dto.city),
      verified: true,
      approved: dto.role !== 'instituicao',
      approvedAt: dto.role === 'instituicao' ? undefined : new Date(),
    });

    const saved = await this.usersRepository.save(user);
    await this.mailService.sendWelcomeEmail({
      to: saved.email,
      name: saved.name,
      role: saved.role,
    });
    return this.buildAuthResponse(saved);
  }

  async login(dto: LoginDto): Promise<AuthSessionPayload> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async acceptAdminInvite(dto: AcceptAdminInviteDto): Promise<AuthSessionPayload> {
    const normalizedEmail = dto.email.toLowerCase();
    const invite = await this.adminInvitesRepository.findOne({ where: { email: normalizedEmail } });
    if (!invite) {
      throw new BadRequestException('Invalid or expired invite');
    }
    if (invite.usedAt || invite.expiresAt <= new Date()) {
      throw new BadRequestException('Invite is no longer valid');
    }

    const tokenMatches = await bcrypt.compare(dto.token, invite.tokenHash);
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid invite token');
    }

    const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = this.usersRepository.create({
      name: dto.name,
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: 'admin',
      verified: true,
      approved: true,
      approvedAt: new Date(),
      suspended: false,
    });
    const saved = await this.usersRepository.save(user);

    invite.usedAt = new Date();
    await this.adminInvitesRepository.save(invite);

    await this.mailService.sendWelcomeEmail({
      to: saved.email,
      name: saved.name,
      role: saved.role,
    });

    return this.buildAuthResponse(saved);
  }

  async refresh(refreshToken: string): Promise<AuthSessionPayload> {
    let payload: {
      sub: string;
      role: User['role'];
    };

    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        role: User['role'];
      }>(refreshToken, {
        secret: getRequiredEnv('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      if (this.isJwtValidationError(error)) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw error;
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || user.suspended) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.buildAuthResponse(user);
  }

  async acceptPatientInvite(dto: AcceptPatientInviteDto): Promise<AuthSessionPayload> {
    const normalizedEmail = dto.email.toLowerCase();
    const invite = await this.patientInvitesRepository.findOne({ where: { email: normalizedEmail } });
    if (!invite) {
      throw new BadRequestException('Invalid or expired invite');
    }
    if (invite.usedAt || invite.expiresAt <= new Date()) {
      throw new BadRequestException('Invite is no longer valid');
    }

    const tokenMatches = await bcrypt.compare(dto.token, invite.tokenHash);
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid invite token');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const saved = await this.dataSource.transaction(async (manager) => {
      const txUsersRepository = manager.getRepository(User);
      const txManagedPatientsRepository = manager.getRepository(ManagedPatient);
      const txPatientInvitesRepository = manager.getRepository(PatientInvite);
      const now = new Date();
      const transactionInvite = await txPatientInvitesRepository.findOne({
        where: { id: invite.id, email: normalizedEmail },
      });
      if (!transactionInvite) {
        throw new BadRequestException('Invalid or expired invite');
      }
      if (transactionInvite.expiresAt <= now) {
        throw new BadRequestException('Invite is no longer valid');
      }
      if (transactionInvite.usedAt) {
        throw new ConflictException('Patient access has already been activated');
      }

      const transactionManagedPatient = await txManagedPatientsRepository.findOne({
        where: { id: transactionInvite.managedPatientId, institutionId: transactionInvite.institutionId },
      });
      if (!transactionManagedPatient) {
        throw new BadRequestException('Invite is no longer valid');
      }
      if (transactionManagedPatient.linkedUserId) {
        throw new ConflictException('Patient access has already been activated');
      }

      const existing = await txUsersRepository.findOne({ where: { email: normalizedEmail } });
      if (existing) {
        throw new ConflictException('Email already registered');
      }

      const inviteMarked = await txPatientInvitesRepository.update(
        { id: transactionInvite.id, usedAt: IsNull() },
        { usedAt: now },
      );
      if (inviteMarked.affected !== 1) {
        throw new ConflictException('Patient access has already been activated');
      }

      const user = this.usersRepository.create({
        name: dto.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'paciente',
        state: transactionManagedPatient.state,
        city: transactionManagedPatient.city,
        verified: true,
        approved: true,
        approvedAt: new Date(),
        suspended: false,
      });
      const transactionSavedUser = await txUsersRepository.save(user);

      const managedPatientLinked = await txManagedPatientsRepository.update(
        {
          id: transactionManagedPatient.id,
          institutionId: transactionInvite.institutionId,
          linkedUserId: IsNull(),
        },
        { linkedUserId: transactionSavedUser.id },
      );
      if (managedPatientLinked.affected !== 1) {
        throw new ConflictException('Patient access has already been activated');
      }

      return transactionSavedUser;
    });

    await this.mailService.sendWelcomeEmail({
      to: saved.email,
      name: saved.name,
      role: saved.role,
    });

    return this.buildAuthResponse(saved);
  }

  private async buildAuthResponse(user: User): Promise<AuthSessionPayload> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: getRequiredEnv('JWT_ACCESS_SECRET'),
        expiresIn: this.accessTokenExpiresIn,
        jwtid: randomUUID(),
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: getRequiredEnv('JWT_REFRESH_SECRET'),
        expiresIn: this.refreshTokenExpiresIn,
        jwtid: randomUUID(),
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        city: user.city,
        locationLabel: buildLocationLabel(user),
        institutionType: user.institutionType,
        institutionDescription: user.institutionDescription,
        verified: user.verified,
        approved: user.approved,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
      },
    };
  }

  private readJwtTtl(name: string, fallback: StringValue): StringValue {
    const value = getEnvOrDefault(name, fallback);
    if (ms(value as StringValue) === undefined) {
      throw new InternalServerErrorException(
        `Invalid JWT TTL value for ${name}: "${value}"`,
      );
    }

    return value as StringValue;
  }

  private isJwtValidationError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return [
      'JsonWebTokenError',
      'NotBeforeError',
      'TokenExpiredError',
    ].includes(error.name);
  }
}
