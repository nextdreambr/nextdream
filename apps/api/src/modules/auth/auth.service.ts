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
import { createHash, randomBytes, randomUUID } from 'crypto';
import { AdminInvite } from '../../entities/admin-invite.entity';
import ms, { type StringValue } from 'ms';
import { getEnvOrDefault, getRequiredEnv } from '../../config/env';
import { EmailVerificationToken } from '../../entities/email-verification-token.entity';
import { ManagedPatient } from '../../entities/managed-patient.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { PatientInvite } from '../../entities/patient-invite.entity';
import { User } from '../../entities/user.entity';
import { buildLocationLabel, normalizeLocationPart } from '../../lib/location';
import { AcceptAdminInviteDto } from './dto/accept-admin-invite.dto';
import { AcceptPatientInviteDto } from './dto/accept-patient-invite.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { DemoLoginDto } from './dto/demo-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
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
  institutionResponsibleName?: string;
  institutionResponsiblePhone?: string;
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

export interface AuthRegisterResponse {
  success: true;
  email: string;
  role: AuthUserPayload['role'];
  requiresEmailVerification: true;
  requiresApproval: boolean;
}

@Injectable()
export class AuthService {
  private readonly accessTokenExpiresIn: StringValue = this.readJwtTtl('JWT_ACCESS_EXPIRES_IN', '1h');
  private readonly refreshTokenExpiresIn: StringValue = this.readJwtTtl('JWT_REFRESH_EXPIRES_IN', '7d');
  private readonly usersRepository: Repository<User>;
  private readonly adminInvitesRepository: Repository<AdminInvite>;
  private readonly patientInvitesRepository: Repository<PatientInvite>;
  private readonly emailVerificationTokensRepository: Repository<EmailVerificationToken>;
  private readonly passwordResetTokensRepository: Repository<PasswordResetToken>;
  private readonly managedPatientsRepository: Repository<ManagedPatient>;
  private readonly jwtService: JwtService;
  private readonly mailService: MailService;
  private readonly dataSource: DataSource;

  constructor(
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(AdminInvite) adminInvitesRepository: Repository<AdminInvite>,
    @InjectRepository(PatientInvite) patientInvitesRepository: Repository<PatientInvite>,
    @InjectRepository(EmailVerificationToken) emailVerificationTokensRepository: Repository<EmailVerificationToken>,
    @InjectRepository(PasswordResetToken) passwordResetTokensRepository: Repository<PasswordResetToken>,
    @InjectRepository(ManagedPatient) managedPatientsRepository: Repository<ManagedPatient>,
    @Inject(JwtService) jwtService: JwtService,
    @Inject(MailService) mailService: MailService,
    @InjectDataSource() dataSource: DataSource,
  ) {
    this.usersRepository = usersRepository;
    this.adminInvitesRepository = adminInvitesRepository;
    this.patientInvitesRepository = patientInvitesRepository;
    this.emailVerificationTokensRepository = emailVerificationTokensRepository;
    this.passwordResetTokensRepository = passwordResetTokensRepository;
    this.managedPatientsRepository = managedPatientsRepository;
    this.jwtService = jwtService;
    this.mailService = mailService;
    this.dataSource = dataSource;
  }

  async register(dto: RegisterDto): Promise<AuthRegisterResponse> {
    if ((dto as { role: string }).role === 'admin') {
      throw new BadRequestException('Public registration cannot create admin users');
    }

    const normalizedEmail = dto.email.toLowerCase();
    const existing = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashOneTimeToken(token);
    const expiresInHours = this.getEmailVerificationExpiresInHours();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const now = new Date();

    const user = this.usersRepository.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: dto.role,
      institutionType: dto.role === 'instituicao' ? dto.institutionType?.trim() || undefined : undefined,
      institutionResponsibleName: dto.role === 'instituicao'
        ? dto.institutionResponsibleName?.trim() || undefined
        : undefined,
      institutionResponsiblePhone: dto.role === 'instituicao'
        ? dto.institutionResponsiblePhone?.trim() || undefined
        : undefined,
      institutionDescription: dto.role === 'instituicao'
        ? dto.institutionDescription?.trim() || undefined
        : undefined,
      state: normalizeLocationPart(dto.state),
      city: normalizeLocationPart(dto.city),
      verified: false,
      approved: dto.role !== 'instituicao',
      approvedAt: dto.role === 'instituicao' ? undefined : new Date(),
    });

    const saved = await this.dataSource.transaction(async (manager) => {
      const txUsersRepository = manager.getRepository(User);
      const txEmailVerificationTokensRepository = manager.getRepository(EmailVerificationToken);
      const persistedUser = await txUsersRepository.save(user);

      await txEmailVerificationTokensRepository.update(
        { userId: persistedUser.id, usedAt: IsNull() },
        { usedAt: now },
      );

      const verificationToken = txEmailVerificationTokensRepository.create({
        userId: persistedUser.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      });
      await txEmailVerificationTokensRepository.save(verificationToken);

      return persistedUser;
    });

    await this.mailService.sendEmailVerificationEmail({
      to: saved.email,
      name: saved.name,
      verifyUrl: this.buildEmailVerificationUrl(token),
      expiresInHours,
    });

    return {
      success: true,
      email: saved.email,
      role: saved.role,
      requiresEmailVerification: true,
      requiresApproval: saved.role === 'instituicao',
    };
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
    if (!user.verified) {
      throw new UnauthorizedException('Email verification is required before login');
    }

    return this.buildAuthResponse(user);
  }

  async demoLogin(dto: DemoLoginDto): Promise<AuthSessionPayload> {
    void dto;
    throw new BadRequestException('Demo access is only available in sandbox mode');
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<void> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user || user.suspended || !user.verified) {
      return;
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashOneTimeToken(token);
    const expiresInHours = this.getPasswordResetExpiresInHours();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const now = new Date();

    await this.dataSource.transaction(async (manager) => {
      const txPasswordResetTokensRepository = manager.getRepository(PasswordResetToken);
      await txPasswordResetTokensRepository.update(
        { userId: user.id, usedAt: IsNull() },
        { usedAt: now },
      );

      const resetToken = txPasswordResetTokensRepository.create({
        userId: user.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      });
      await txPasswordResetTokensRepository.save(resetToken);
    });

    await this.mailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl: this.buildPasswordResetUrl(token),
      expiresInHours,
    });
  }

  async confirmPasswordReset(dto: ConfirmPasswordResetDto): Promise<{ success: true }> {
    const tokenHash = this.hashOneTimeToken(dto.token);
    const now = new Date();

    await this.dataSource.transaction(async (manager) => {
      const txUsersRepository = manager.getRepository(User);
      const txPasswordResetTokensRepository = manager.getRepository(PasswordResetToken);
      const resetToken = await txPasswordResetTokensRepository.findOne({
        where: { tokenHash },
      });

      if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
        throw new BadRequestException('Invalid or expired password reset token');
      }

      const tokenMarked = await txPasswordResetTokensRepository.update(
        { id: resetToken.id, usedAt: IsNull() },
        { usedAt: now },
      );
      if (tokenMarked.affected !== 1) {
        throw new BadRequestException('Invalid or expired password reset token');
      }

      const user = await txUsersRepository.findOne({
        where: { id: resetToken.userId },
      });
      if (!user) {
        throw new BadRequestException('Invalid or expired password reset token');
      }

      user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
      user.sessionVersion = (user.sessionVersion ?? 0) + 1;
      await txUsersRepository.save(user);

      await txPasswordResetTokensRepository.update(
        { userId: user.id, usedAt: IsNull() },
        { usedAt: now },
      );
    });

    return { success: true };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ success: true }> {
    const tokenHash = this.hashOneTimeToken(dto.token);
    const now = new Date();

    await this.dataSource.transaction(async (manager) => {
      const txUsersRepository = manager.getRepository(User);
      const txEmailVerificationTokensRepository = manager.getRepository(EmailVerificationToken);
      const verificationToken = await txEmailVerificationTokensRepository.findOne({
        where: { tokenHash },
      });

      if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt <= now) {
        throw new BadRequestException('Invalid or expired email verification token');
      }

      const tokenMarked = await txEmailVerificationTokensRepository.update(
        { id: verificationToken.id, usedAt: IsNull() },
        { usedAt: now },
      );
      if (tokenMarked.affected !== 1) {
        throw new BadRequestException('Invalid or expired email verification token');
      }

      const user = await txUsersRepository.findOne({
        where: { id: verificationToken.userId },
      });
      if (!user) {
        throw new BadRequestException('Invalid or expired email verification token');
      }

      user.verified = true;
      await txUsersRepository.save(user);

      await txEmailVerificationTokensRepository.update(
        { userId: user.id, usedAt: IsNull() },
        { usedAt: now },
      );
    });

    return { success: true };
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
      sessionVersion?: number;
    };

    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        role: User['role'];
        sessionVersion?: number;
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

    const currentSessionVersion = user?.sessionVersion ?? 0;
    if (!user || user.suspended || payload.sessionVersion !== currentSessionVersion) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const nextSessionVersion = currentSessionVersion + 1;
    const rotatedSession = await this.usersRepository.update(
      { id: user.id, sessionVersion: currentSessionVersion },
      { sessionVersion: nextSessionVersion },
    );
    if (rotatedSession.affected !== 1) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    user.sessionVersion = nextSessionVersion;
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

  private buildPasswordResetUrl(token: string) {
    const resetUrl = new URL('/redefinir-senha', this.getAppBaseUrl());
    resetUrl.searchParams.set('token', token);
    return resetUrl.toString();
  }

  private buildEmailVerificationUrl(token: string) {
    const verifyUrl = new URL('/verificar-email', this.getAppBaseUrl());
    verifyUrl.searchParams.set('token', token);
    return verifyUrl.toString();
  }

  private getAppBaseUrl() {
    return (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
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
      refreshToken: await this.jwtService.signAsync({
        ...payload,
        sessionVersion: user.sessionVersion ?? 0,
      }, {
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
        institutionResponsibleName: user.institutionResponsibleName,
        institutionResponsiblePhone: user.institutionResponsiblePhone,
        institutionDescription: user.institutionDescription,
        verified: user.verified,
        approved: user.approved,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
      },
    };
  }

  private readJwtTtl(name: string, fallback: StringValue): StringValue {
    const value = getEnvOrDefault(name, fallback);
    if (/^\d+$/.test(value)) {
      throw new InternalServerErrorException(
        `Invalid JWT TTL value for ${name}: "${value}". Add a time unit suffix such as "1h" or "3600s".`,
      );
    }
    if (ms(value as StringValue) === undefined) {
      throw new InternalServerErrorException(
        `Invalid JWT TTL value for ${name}: "${value}"`,
      );
    }

    return value as StringValue;
  }

  private getPasswordResetExpiresInHours() {
    const raw = Number(getEnvOrDefault('PASSWORD_RESET_TOKEN_TTL_HOURS', '2'));
    return Number.isFinite(raw) && raw > 0 ? raw : 2;
  }

  private getEmailVerificationExpiresInHours() {
    const raw = Number(getEnvOrDefault('EMAIL_VERIFICATION_TOKEN_TTL_HOURS', '24'));
    return Number.isFinite(raw) && raw > 0 ? raw : 24;
  }

  private hashOneTimeToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
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
