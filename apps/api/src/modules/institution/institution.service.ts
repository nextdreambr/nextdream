import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { In, Repository } from 'typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { ManagedPatient } from '../../entities/managed-patient.entity';
import { PatientInvite } from '../../entities/patient-invite.entity';
import { Proposal } from '../../entities/proposal.entity';
import { User } from '../../entities/user.entity';
import { buildLocationLabel, normalizeLocationPart } from '../../lib/location';
import {
  buildPaginatedResult,
  hasQueryFilters,
  normalizeQueryTerm,
  parsePagination,
} from '../../lib/pagination';
import { MailService } from '../mail/mail.service';
import { JwtPayload } from '../auth/jwt-auth.guard';
import { ChangeInstitutionPasswordDto } from './dto/change-institution-password.dto';
import { CreateManagedPatientAccessInviteDto } from './dto/create-managed-patient-access-invite.dto';
import { CreateManagedPatientDto } from './dto/create-managed-patient.dto';
import { UpdateInstitutionProfileDto } from './dto/update-institution-profile.dto';
import { UpdateManagedPatientDto } from './dto/update-managed-patient.dto';

@Injectable()
export class InstitutionService {
  private readonly managedPatientsRepository: Repository<ManagedPatient>;
  private readonly patientInvitesRepository: Repository<PatientInvite>;
  private readonly usersRepository: Repository<User>;
  private readonly dreamsRepository: Repository<Dream>;
  private readonly proposalsRepository: Repository<Proposal>;
  private readonly conversationsRepository: Repository<Conversation>;
  private readonly mailService: MailService;

  constructor(
    @InjectRepository(ManagedPatient) managedPatientsRepository: Repository<ManagedPatient>,
    @InjectRepository(PatientInvite) patientInvitesRepository: Repository<PatientInvite>,
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(Dream) dreamsRepository: Repository<Dream>,
    @InjectRepository(Proposal) proposalsRepository: Repository<Proposal>,
    @InjectRepository(Conversation) conversationsRepository: Repository<Conversation>,
    @Inject(MailService) mailService: MailService,
  ) {
    this.managedPatientsRepository = managedPatientsRepository;
    this.patientInvitesRepository = patientInvitesRepository;
    this.usersRepository = usersRepository;
    this.dreamsRepository = dreamsRepository;
    this.proposalsRepository = proposalsRepository;
    this.conversationsRepository = conversationsRepository;
    this.mailService = mailService;
  }

  async overview(currentUser: JwtPayload) {
    await this.requireApprovedInstitution(currentUser.sub);

    const now = new Date();
    const [
      managedPatients,
      linkedPatients,
      pendingAccessInvites,
      dreams,
      dreamsPublished,
      dreamsInConversation,
      proposals,
      pendingProposals,
      acceptedProposals,
      activeConversations,
      supporterConnectionsRaw,
    ] = await Promise.all([
      this.managedPatientsRepository.count({ where: { institutionId: currentUser.sub } }),
      this.managedPatientsRepository
        .createQueryBuilder('patient')
        .where('patient.institutionId = :institutionId', { institutionId: currentUser.sub })
        .andWhere('patient.linkedUserId IS NOT NULL')
        .getCount(),
      this.patientInvitesRepository
        .createQueryBuilder('invite')
        .where('invite.institutionId = :institutionId', { institutionId: currentUser.sub })
        .andWhere('invite.usedAt IS NULL')
        .andWhere('invite.expiresAt > :now', { now })
        .getCount(),
      this.dreamsRepository.count({ where: { patientId: currentUser.sub } }),
      this.dreamsRepository.count({ where: { patientId: currentUser.sub, status: 'publicado' } }),
      this.dreamsRepository.count({ where: { patientId: currentUser.sub, status: 'em-conversa' } }),
      this.proposalsRepository
        .createQueryBuilder('proposal')
        .leftJoin('proposal.dream', 'dream')
        .where('dream.patientId = :patientId', { patientId: currentUser.sub })
        .getCount(),
      this.proposalsRepository
        .createQueryBuilder('proposal')
        .leftJoin('proposal.dream', 'dream')
        .where('dream.patientId = :patientId', { patientId: currentUser.sub })
        .andWhere('proposal.status IN (:...statuses)', { statuses: ['enviada', 'em-analise'] })
        .getCount(),
      this.proposalsRepository
        .createQueryBuilder('proposal')
        .leftJoin('proposal.dream', 'dream')
        .where('dream.patientId = :patientId', { patientId: currentUser.sub })
        .andWhere('proposal.status = :status', { status: 'aceita' })
        .getCount(),
      this.conversationsRepository.count({
        where: {
          patientId: currentUser.sub,
          status: 'ativa',
        },
      }),
      this.proposalsRepository
        .createQueryBuilder('proposal')
        .select('COUNT(DISTINCT proposal.supporterId)', 'count')
        .leftJoin('proposal.dream', 'dream')
        .where('dream.patientId = :patientId', { patientId: currentUser.sub })
        .getRawOne<{ count: string }>(),
    ]);

    return {
      managedPatients,
      linkedPatients,
      pendingAccessInvites,
      dreams,
      dreamsPublished,
      dreamsInConversation,
      proposals,
      pendingProposals,
      acceptedProposals,
      activeConversations,
      supporterConnections: Number(supporterConnectionsRaw?.count ?? 0),
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
      return this.serializePatients(patients);
    }

    const [patients, total] = await queryBuilder
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getManyAndCount();

    return buildPaginatedResult(
      await this.serializePatients(patients),
      pagination.page,
      pagination.pageSize,
      total,
    );
  }

  async getPatientDetail(currentUser: JwtPayload, managedPatientId: string) {
    await this.requireApprovedInstitution(currentUser.sub);
    const patient = await this.ensureManagedPatientForInstitution(currentUser.sub, managedPatientId);
    const [serializedPatient] = await this.serializePatients([patient]);

    const [dreams, proposals, conversations] = await Promise.all([
      this.dreamsRepository.find({
        where: { patientId: currentUser.sub, managedPatientId },
        order: { createdAt: 'DESC' },
      }),
      this.proposalsRepository
        .createQueryBuilder('proposal')
        .leftJoinAndSelect('proposal.dream', 'dream')
        .leftJoinAndSelect('proposal.supporter', 'supporter')
        .where('dream.patientId = :patientId', { patientId: currentUser.sub })
        .andWhere('dream.managedPatientId = :managedPatientId', { managedPatientId })
        .orderBy('proposal.createdAt', 'DESC')
        .getMany(),
      this.conversationsRepository
        .createQueryBuilder('conversation')
        .where('conversation.patientId = :patientId', { patientId: currentUser.sub })
        .andWhere('conversation.managedPatientId = :managedPatientId', { managedPatientId })
        .orderBy('conversation.createdAt', 'DESC')
        .getMany(),
    ]);

    const supporterIds = [
      ...new Set([
        ...proposals.map((proposal) => proposal.supporterId),
        ...conversations.map((conversation) => conversation.supporterId),
      ]),
    ];
    const supporters = supporterIds.length
      ? await this.usersRepository.findBy({ id: In(supporterIds) })
      : [];
    const supportersById = new Map(supporters.map((supporter) => [supporter.id, supporter]));

    return {
      patient: serializedPatient,
      dreams: dreams.map((dream) => ({
        id: dream.id,
        title: dream.title,
        category: dream.category,
        status: dream.status,
        urgency: dream.urgency,
        updatedAt: dream.updatedAt,
      })),
      proposals: proposals.map((proposal) => ({
        id: proposal.id,
        dreamId: proposal.dreamId,
        dreamTitle: proposal.dream?.title,
        status: proposal.status,
        supporterId: proposal.supporterId,
        supporterName: proposal.supporter?.name,
        createdAt: proposal.createdAt,
      })),
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        dreamId: conversation.dreamId,
        dreamTitle: dreams.find((dream) => dream.id === conversation.dreamId)?.title,
        status: conversation.status,
        supporterId: conversation.supporterId,
        supporterName: supportersById.get(conversation.supporterId)?.name,
        createdAt: conversation.createdAt,
      })),
      summary: {
        dreams: dreams.length,
        proposals: proposals.length,
        activeConversations: conversations.filter((conversation) => conversation.status === 'ativa').length,
      },
    };
  }

  async createPatient(currentUser: JwtPayload, dto: CreateManagedPatientDto) {
    const institution = await this.requireApprovedInstitution(currentUser.sub);
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('Patient name is required');
    }

    const patient = this.managedPatientsRepository.create({
      institution,
      institutionId: institution.id,
      name,
      state: normalizeLocationPart(dto.state),
      city: normalizeLocationPart(dto.city),
    });

    const saved = await this.managedPatientsRepository.save(patient);
    const [serialized] = await this.serializePatients([saved]);
    return serialized;
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
      const name = dto.name.trim();
      if (!name) {
        throw new BadRequestException('Patient name is required');
      }
      patient.name = name;
    }
    if (dto.state !== undefined) {
      patient.state = normalizeLocationPart(dto.state);
    }
    if (dto.city !== undefined) {
      patient.city = normalizeLocationPart(dto.city);
    }

    const saved = await this.managedPatientsRepository.save(patient);
    const [serialized] = await this.serializePatients([saved]);
    return serialized;
  }

  async createPatientAccessInvite(
    currentUser: JwtPayload,
    managedPatientId: string,
    dto: CreateManagedPatientAccessInviteDto,
  ) {
    const institution = await this.requireApprovedInstitution(currentUser.sub);
    const patient = await this.ensureManagedPatientForInstitution(currentUser.sub, managedPatientId);
    if (patient.linkedUserId) {
      throw new ConflictException('Patient already has an active account');
    }

    const email = dto.email.toLowerCase();
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const existingInvite = await this.patientInvitesRepository
      .createQueryBuilder('invite')
      .where('(invite.managedPatientId = :managedPatientId OR invite.email = :email)', {
        managedPatientId,
        email,
      })
      .andWhere('invite.usedAt IS NULL')
      .orderBy('invite.createdAt', 'DESC')
      .getOne();

    if (existingInvite) {
      await this.patientInvitesRepository.delete(existingInvite.id);
    }

    const token = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 72);
    const invite = this.patientInvitesRepository.create({
      email,
      tokenHash: await bcrypt.hash(token, 10),
      managedPatientId,
      institutionId: currentUser.sub,
      expiresAt,
    });
    const saved = await this.patientInvitesRepository.save(invite);
    const inviteUrl = this.buildPatientInviteUrl(email, token);

    await this.mailService.sendPatientInviteEmail({
      to: email,
      patientName: patient.name,
      institutionName: institution.name,
      inviteUrl,
      expiresInHours: 72,
    });

    return {
      id: saved.id,
      email,
      managedPatientId,
      expiresAt,
      inviteUrl,
    };
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

  async listLinkedManagedPatientIdsForUser(userId: string) {
    const linkedPatients = await this.managedPatientsRepository.find({
      where: { linkedUserId: userId },
      select: { id: true },
    });
    return linkedPatients.map((patient) => patient.id);
  }

  async isLinkedManagedPatient(userId: string, managedPatientId?: string | null) {
    if (!managedPatientId) {
      return false;
    }

    const patient = await this.managedPatientsRepository.findOne({
      where: {
        id: managedPatientId,
        linkedUserId: userId,
      },
    });
    return Boolean(patient);
  }

  private buildPatientInviteUrl(email: string, token: string) {
    const appUrl = (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
    const search = new URLSearchParams({ email, token });
    return `${appUrl}/aceitar-convite-paciente?${search.toString()}`;
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

  private async serializePatients(patients: ManagedPatient[]) {
    if (patients.length === 0) {
      return [];
    }

    const linkedUserIds = [...new Set(patients.map((patient) => patient.linkedUserId).filter(Boolean) as string[])];
    const patientIds = patients.map((patient) => patient.id);
    const now = new Date();

    const [linkedUsers, pendingInvites] = await Promise.all([
      linkedUserIds.length > 0 ? this.usersRepository.findBy({ id: In(linkedUserIds) }) : Promise.resolve([]),
      this.patientInvitesRepository
        .createQueryBuilder('invite')
        .where('invite.managedPatientId IN (:...patientIds)', { patientIds })
        .andWhere('invite.usedAt IS NULL')
        .andWhere('invite.expiresAt > :now', { now })
        .orderBy('invite.createdAt', 'DESC')
        .getMany(),
    ]);

    const linkedUsersById = new Map(linkedUsers.map((user) => [user.id, user]));
    const pendingInvitesByPatientId = new Map<string, PatientInvite>();
    for (const invite of pendingInvites) {
      if (!pendingInvitesByPatientId.has(invite.managedPatientId)) {
        pendingInvitesByPatientId.set(invite.managedPatientId, invite);
      }
    }

    return patients.map((patient) =>
      this.serializePatient(
        patient,
        patient.linkedUserId ? linkedUsersById.get(patient.linkedUserId) : undefined,
        pendingInvitesByPatientId.get(patient.id),
      ),
    );
  }

  private serializePatient(patient: ManagedPatient, linkedUser?: User, pendingInvite?: PatientInvite) {
    const accessStatus = linkedUser
      ? 'ativo'
      : pendingInvite
        ? 'convite-pendente'
        : 'sem-acesso';

    return {
      id: patient.id,
      institutionId: patient.institutionId,
      linkedUserId: patient.linkedUserId,
      linkedUserEmail: linkedUser?.email,
      accessStatus,
      pendingInviteEmail: pendingInvite?.email,
      pendingInviteExpiresAt: pendingInvite?.expiresAt,
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
