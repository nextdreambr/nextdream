import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { ManagedPatient } from '../../entities/managed-patient.entity';
import { Proposal } from '../../entities/proposal.entity';
import { User } from '../../entities/user.entity';
import { buildLocationLabel, normalizeLocationPart } from '../../lib/location';
import {
  buildPaginatedResult,
  hasQueryFilters,
  normalizeQueryTerm,
  parsePagination,
} from '../../lib/pagination';
import { JwtPayload } from '../auth/jwt-auth.guard';
import { ChangeInstitutionPasswordDto } from './dto/change-institution-password.dto';
import { CreateManagedPatientDto } from './dto/create-managed-patient.dto';
import { UpdateInstitutionProfileDto } from './dto/update-institution-profile.dto';
import { UpdateManagedPatientDto } from './dto/update-managed-patient.dto';

@Injectable()
export class InstitutionService {
  private readonly managedPatientsRepository: Repository<ManagedPatient>;
  private readonly usersRepository: Repository<User>;
  private readonly dreamsRepository: Repository<Dream>;
  private readonly proposalsRepository: Repository<Proposal>;
  private readonly conversationsRepository: Repository<Conversation>;

  constructor(
    @InjectRepository(ManagedPatient) managedPatientsRepository: Repository<ManagedPatient>,
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(Dream) dreamsRepository: Repository<Dream>,
    @InjectRepository(Proposal) proposalsRepository: Repository<Proposal>,
    @InjectRepository(Conversation) conversationsRepository: Repository<Conversation>,
  ) {
    this.managedPatientsRepository = managedPatientsRepository;
    this.usersRepository = usersRepository;
    this.dreamsRepository = dreamsRepository;
    this.proposalsRepository = proposalsRepository;
    this.conversationsRepository = conversationsRepository;
  }

  async overview(currentUser: JwtPayload) {
    await this.requireApprovedInstitution(currentUser.sub);

    const [managedPatients, dreams, proposals, activeConversations] = await Promise.all([
      this.managedPatientsRepository.count({ where: { institutionId: currentUser.sub } }),
      this.dreamsRepository.count({ where: { patientId: currentUser.sub } }),
      this.proposalsRepository
        .createQueryBuilder('proposal')
        .leftJoin('proposal.dream', 'dream')
        .where('dream.patientId = :patientId', { patientId: currentUser.sub })
        .getCount(),
      this.conversationsRepository.count({
        where: {
          patientId: currentUser.sub,
          status: 'ativa',
        },
      }),
    ]);

    return {
      managedPatients,
      dreams,
      proposals,
      activeConversations,
    };
  }

  async listPatients(
    currentUser: JwtPayload,
    query: { page?: string; pageSize?: string; query?: string } = {},
  ) {
    await this.requireApprovedInstitution(currentUser.sub);

    const normalizedQuery = normalizeQueryTerm(query.query);
    const pagination = parsePagination(query);
    const shouldPaginate = pagination.enabled || hasQueryFilters({ query: normalizedQuery });

    const queryBuilder = this.managedPatientsRepository
      .createQueryBuilder('patient')
      .where('patient.institutionId = :institutionId', { institutionId: currentUser.sub })
      .orderBy('patient.createdAt', 'DESC');

    if (normalizedQuery) {
      queryBuilder.andWhere('LOWER(patient.name) LIKE :query', {
        query: `%${normalizedQuery.toLowerCase()}%`,
      });
    }

    if (!shouldPaginate) {
      const patients = await queryBuilder.getMany();
      return patients.map((patient) => this.serializePatient(patient));
    }

    const [patients, total] = await queryBuilder
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getManyAndCount();

    return buildPaginatedResult(
      patients.map((patient) => this.serializePatient(patient)),
      pagination.page,
      pagination.pageSize,
      total,
    );
  }

  async createPatient(currentUser: JwtPayload, dto: CreateManagedPatientDto) {
    const institution = await this.requireApprovedInstitution(currentUser.sub);

    const patient = this.managedPatientsRepository.create({
      institution,
      institutionId: institution.id,
      name: dto.name.trim(),
      state: normalizeLocationPart(dto.state),
      city: normalizeLocationPart(dto.city),
    });

    const saved = await this.managedPatientsRepository.save(patient);
    return this.serializePatient(saved);
  }

  async updatePatient(currentUser: JwtPayload, managedPatientId: string, dto: UpdateManagedPatientDto) {
    await this.requireApprovedInstitution(currentUser.sub);

    const patient = await this.managedPatientsRepository.findOneBy({
      id: managedPatientId,
      institutionId: currentUser.sub,
    });
    if (!patient) {
      throw new NotFoundException('Managed patient not found');
    }

    if (dto.name !== undefined) {
      patient.name = dto.name.trim();
    }
    if (dto.state !== undefined) {
      patient.state = normalizeLocationPart(dto.state);
    }
    if (dto.city !== undefined) {
      patient.city = normalizeLocationPart(dto.city);
    }

    const saved = await this.managedPatientsRepository.save(patient);
    return this.serializePatient(saved);
  }

  async getProfile(currentUser: JwtPayload) {
    const institution = await this.requireApprovedInstitution(currentUser.sub);
    return this.serializeInstitution(institution);
  }

  async updateProfile(currentUser: JwtPayload, dto: UpdateInstitutionProfileDto) {
    const institution = await this.requireApprovedInstitution(currentUser.sub);

    if (dto.email !== undefined) {
      const normalizedEmail = dto.email.toLowerCase();
      const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
      if (existing && existing.id !== institution.id) {
        throw new ConflictException('Email already registered');
      }
      institution.email = normalizedEmail;
    }

    if (dto.name !== undefined) {
      institution.name = dto.name.trim();
    }
    if (dto.state !== undefined) {
      institution.state = normalizeLocationPart(dto.state);
    }
    if (dto.city !== undefined) {
      institution.city = normalizeLocationPart(dto.city);
    }
    if (dto.institutionType !== undefined) {
      institution.institutionType = dto.institutionType.trim() || undefined;
    }
    if (dto.institutionDescription !== undefined) {
      institution.institutionDescription = dto.institutionDescription.trim() || undefined;
    }

    const saved = await this.usersRepository.save(institution);
    return this.serializeInstitution(saved);
  }

  async changePassword(currentUser: JwtPayload, dto: ChangeInstitutionPasswordDto) {
    const institution = await this.requireApprovedInstitution(currentUser.sub);
    const matches = await bcrypt.compare(dto.currentPassword, institution.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Current password is invalid');
    }

    institution.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.save(institution);

    return { ok: true };
  }

  async ensureManagedPatientForInstitution(institutionUserId: string, managedPatientId: string) {
    await this.requireApprovedInstitution(institutionUserId);

    const patient = await this.managedPatientsRepository.findOneBy({
      id: managedPatientId,
      institutionId: institutionUserId,
    });
    if (!patient) {
      throw new NotFoundException('Managed patient not found');
    }

    return patient;
  }

  private async requireApprovedInstitution(userId: string) {
    const institution = await this.usersRepository.findOneBy({ id: userId });
    if (!institution || institution.role !== 'instituicao') {
      throw new ForbiddenException('Only institutions can access this resource');
    }
    if (!institution.approved) {
      throw new ForbiddenException('Institution account is pending approval');
    }

    return institution;
  }

  private serializePatient(patient: ManagedPatient) {
    return {
      id: patient.id,
      institutionId: patient.institutionId,
      linkedUserId: patient.linkedUserId,
      name: patient.name,
      state: patient.state,
      city: patient.city,
      locationLabel: buildLocationLabel(patient),
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  private serializeInstitution(institution: User) {
    return {
      id: institution.id,
      name: institution.name,
      email: institution.email,
      role: institution.role,
      state: institution.state,
      city: institution.city,
      locationLabel: buildLocationLabel(institution),
      institutionType: institution.institutionType,
      institutionDescription: institution.institutionDescription,
      approved: institution.approved,
      approvedAt: institution.approvedAt,
      verified: institution.verified,
      emailNotificationsEnabled: institution.emailNotificationsEnabled,
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
    };
  }
}
