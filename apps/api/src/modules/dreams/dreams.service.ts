import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { Proposal } from '../../entities/proposal.entity';
import { User } from '../../entities/user.entity';
import { buildLocationLabel } from '../../lib/location';
import {
  buildPaginatedResult,
  hasQueryFilters,
  normalizeQueryTerm,
  parsePagination,
} from '../../lib/pagination';
import { JwtPayload } from '../auth/jwt-auth.guard';
import { InstitutionService } from '../institution/institution.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDreamDto } from './dto/create-dream.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateDreamDto } from './dto/update-dream.dto';

function buildOperatorRoute(role: User['role'], section: 'propostas' | 'chat') {
  if (role === 'instituicao') {
    return `/instituicao/${section}`;
  }
  if (role === 'paciente') {
    return `/paciente/${section}`;
  }

  throw new Error(`Unsupported operator role for operator route: ${role}`);
}

@Injectable()
export class DreamsService {
  private readonly dreamsRepository: Repository<Dream>;
  private readonly usersRepository: Repository<User>;
  private readonly proposalsRepository: Repository<Proposal>;
  private readonly conversationsRepository: Repository<Conversation>;
  private readonly institutionService: InstitutionService;
  private readonly notificationsService: NotificationsService;

  constructor(
    @InjectRepository(Dream) dreamsRepository: Repository<Dream>,
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(Proposal) proposalsRepository: Repository<Proposal>,
    @InjectRepository(Conversation) conversationsRepository: Repository<Conversation>,
    @Inject(InstitutionService) institutionService: InstitutionService,
    @Inject(NotificationsService) notificationsService: NotificationsService,
  ) {
    this.dreamsRepository = dreamsRepository;
    this.usersRepository = usersRepository;
    this.proposalsRepository = proposalsRepository;
    this.conversationsRepository = conversationsRepository;
    this.institutionService = institutionService;
    this.notificationsService = notificationsService;
  }

  async createDream(currentUser: JwtPayload, dto: CreateDreamDto) {
    if (currentUser.role !== 'paciente' && currentUser.role !== 'instituicao') {
      throw new ForbiddenException('Only patients or institutions can create dreams');
    }

    const operator = await this.usersRepository.findOneByOrFail({ id: currentUser.sub });

    if (currentUser.role === 'instituicao') {
      if (!dto.managedPatientId) {
        throw new BadRequestException('Institution dreams must target a managed patient');
      }

      const managedPatient = await this.institutionService.ensureManagedPatientForInstitution(
        currentUser.sub,
        dto.managedPatientId,
      );

      const dream = this.dreamsRepository.create({
        title: dto.title,
        description: dto.description,
        category: dto.category,
        format: dto.format,
        urgency: dto.urgency,
        privacy: dto.privacy,
        status: 'publicado',
        patient: operator,
        patientId: operator.id,
        managedPatient,
        managedPatientId: managedPatient.id,
      });

      const saved = await this.dreamsRepository.save(dream);
      return this.serializeDream(saved);
    }

    const dream = this.dreamsRepository.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      format: dto.format,
      urgency: dto.urgency,
      privacy: dto.privacy,
      status: 'publicado',
      patient: operator,
      patientId: operator.id,
      managedPatient: undefined,
      managedPatientId: undefined,
    });

    const saved = await this.dreamsRepository.save(dream);
    return this.serializeDream(saved);
  }

  async listPublicDreams() {
    const dreams = await this.dreamsRepository.find({
      where: { status: 'publicado' },
      order: { createdAt: 'DESC' },
    });

    return dreams.map((dream) => this.serializeDream(dream));
  }

  async getDreamForUser(currentUser: JwtPayload, dreamId: string) {
    const dream = await this.dreamsRepository.findOneBy({ id: dreamId });
    if (!dream) {
      throw new NotFoundException('Dream not found');
    }

    if (currentUser.role === 'admin') {
      return this.serializeDream(dream);
    }

    if (currentUser.role === 'instituicao' && dream.patientId === currentUser.sub) {
      await this.ensureInstitutionManagedPatientAccess(currentUser, dream);
      return this.serializeDream(dream, currentUser);
    }

    if (currentUser.role === 'paciente') {
      const canSeeLinkedCase = await this.institutionService.isLinkedManagedPatient(
        currentUser.sub,
        dream.managedPatientId,
      );
      if (dream.patientId === currentUser.sub || canSeeLinkedCase) {
        return this.serializeDream(dream, currentUser);
      }
    }

    if (currentUser.role === 'apoiador') {
      const hasProposal = await this.proposalsRepository.findOneBy({
        dreamId: dream.id,
        supporterId: currentUser.sub,
      });

      if (dream.status === 'publicado' || hasProposal) {
        return this.serializeDream(dream, currentUser);
      }
    }

    throw new ForbiddenException('You are not allowed to view this dream');
  }

  async listMyDreams(
    currentUser: JwtPayload,
    query: {
      page?: string;
      pageSize?: string;
      query?: string;
      status?: string;
      category?: string;
      format?: string;
    } = {},
  ) {
    if (currentUser.role !== 'paciente' && currentUser.role !== 'instituicao') {
      throw new ForbiddenException('Only patients or institutions can list their dreams');
    }
    if (currentUser.role === 'instituicao') {
      await this.institutionService.overview(currentUser);
    }

    const normalizedQuery = normalizeQueryTerm(query.query);
    const normalizedStatus = normalizeQueryTerm(query.status);
    const normalizedCategory = normalizeQueryTerm(query.category);
    const normalizedFormat = normalizeQueryTerm(query.format);
    const pagination = parsePagination(query);
    const shouldPaginate = pagination.enabled || hasQueryFilters({
      query: normalizedQuery,
      status: normalizedStatus,
      category: normalizedCategory,
      format: normalizedFormat,
    });

    const linkedManagedPatientIds =
      currentUser.role === 'paciente'
        ? await this.institutionService.listLinkedManagedPatientIdsForUser(currentUser.sub)
        : [];

    const queryBuilder = this.dreamsRepository
      .createQueryBuilder('dream')
      .leftJoinAndSelect('dream.patient', 'patient')
      .leftJoinAndSelect('dream.managedPatient', 'managedPatient')
      .where(
        new Brackets((where) => {
          where.where('dream.patientId = :patientId', { patientId: currentUser.sub });
          if (currentUser.role === 'paciente' && linkedManagedPatientIds.length > 0) {
            where.orWhere('dream.managedPatientId IN (:...managedPatientIds)', {
              managedPatientIds: linkedManagedPatientIds,
            });
          }
        }),
      )
      .orderBy('dream.createdAt', 'DESC');

    if (normalizedStatus) {
      queryBuilder.andWhere('dream.status = :status', { status: normalizedStatus });
    }

    if (normalizedCategory) {
      queryBuilder.andWhere('LOWER(dream.category) = :category', {
        category: normalizedCategory.toLowerCase(),
      });
    }

    if (normalizedFormat) {
      queryBuilder.andWhere('dream.format = :format', { format: normalizedFormat });
    }

    if (normalizedQuery) {
      queryBuilder.andWhere(
        `(
          LOWER(dream.title) LIKE :query
          OR LOWER(dream.description) LIKE :query
          OR LOWER(dream.category) LIKE :query
          OR LOWER(COALESCE(managedPatient.name, '')) LIKE :query
        )`,
        { query: `%${normalizedQuery.toLowerCase()}%` },
      );
    }

    if (!shouldPaginate) {
      const dreams = await queryBuilder.getMany();
      return dreams.map((dream) => this.serializeDream(dream, currentUser));
    }

    const [dreams, total] = await queryBuilder
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getManyAndCount();

    return buildPaginatedResult(
      dreams.map((dream) => this.serializeDream(dream, currentUser)),
      pagination.page,
      pagination.pageSize,
      total,
    );
  }

  async updateDream(currentUser: JwtPayload, dreamId: string, dto: UpdateDreamDto) {
    if (currentUser.role !== 'paciente' && currentUser.role !== 'instituicao') {
      throw new ForbiddenException('Only patients or institutions can update dreams');
    }

    const dream = await this.dreamsRepository.findOneBy({ id: dreamId });
    if (!dream) {
      throw new NotFoundException('Dream not found');
    }
    if (dream.patientId !== currentUser.sub) {
      throw new ForbiddenException('Only the dream owner can update this dream');
    }

    if (currentUser.role === 'instituicao') {
      await this.ensureInstitutionManagedPatientAccess(currentUser, dream);

      if (dto.managedPatientId !== undefined) {
        const managedPatient = await this.institutionService.ensureManagedPatientForInstitution(
          currentUser.sub,
          dto.managedPatientId,
        );
        dream.managedPatient = managedPatient;
        dream.managedPatientId = managedPatient.id;
      }
    } else if (dto.managedPatientId !== undefined) {
      throw new BadRequestException('Only institutions can assign managed patients');
    }

    if (dto.title !== undefined) {
      dream.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      dream.description = dto.description.trim();
    }
    if (dto.category !== undefined) {
      dream.category = dto.category.trim();
    }
    if (dto.format !== undefined) {
      dream.format = dto.format;
    }
    if (dto.urgency !== undefined) {
      dream.urgency = dto.urgency;
    }
    if (dto.privacy !== undefined) {
      dream.privacy = dto.privacy;
    }

    const saved = await this.dreamsRepository.save(dream);
    return this.serializeDream(saved);
  }

  async listDreamProposals(currentUser: JwtPayload, dreamId: string) {
    const dream = await this.dreamsRepository.findOneBy({ id: dreamId });
    if (!dream) {
      throw new NotFoundException('Dream not found');
    }
    if (currentUser.role === 'instituicao') {
      if (dream.patientId !== currentUser.sub) {
        throw new ForbiddenException('Only the dream owner can view proposals');
      }
      await this.ensureInstitutionManagedPatientAccess(currentUser, dream);
    } else if (currentUser.role === 'paciente') {
      const canSeeLinkedCase = await this.institutionService.isLinkedManagedPatient(
        currentUser.sub,
        dream.managedPatientId,
      );
      if (dream.patientId !== currentUser.sub && !canSeeLinkedCase) {
        throw new ForbiddenException('Only the dream owner can view proposals');
      }
    } else {
      throw new ForbiddenException('Only patients or institutions can view proposals');
    }

    const proposals = await this.proposalsRepository.find({
      where: { dreamId: dream.id },
      order: { createdAt: 'DESC' },
    });

    return proposals.map((proposal) => this.serializeProposal(proposal, currentUser));
  }

  async createProposal(currentUser: JwtPayload, dreamId: string, dto: CreateProposalDto) {
    if (currentUser.role !== 'apoiador') {
      throw new ForbiddenException('Only supporters can send proposals');
    }

    const supporter = await this.usersRepository.findOneByOrFail({ id: currentUser.sub });
    const dream = await this.dreamsRepository.findOneBy({ id: dreamId });
    if (!dream) {
      throw new NotFoundException('Dream not found');
    }
    if (dream.status !== 'publicado') {
      throw new ConflictException('Este sonho não está disponível para novas propostas.');
    }

    const existingProposal = await this.proposalsRepository.findOneBy({
      dreamId: dream.id,
      supporterId: supporter.id,
    });
    if (existingProposal) {
      throw new ConflictException('Você já enviou uma proposta para este sonho.');
    }

    const proposal = this.proposalsRepository.create({
      ...dto,
      dream,
      dreamId: dream.id,
      supporter,
      supporterId: supporter.id,
      status: 'enviada',
    });

    const saved = await this.proposalsRepository.save(proposal);
    const operator = await this.usersRepository.findOneByOrFail({ id: dream.patientId });

    await this.notificationsService.createNotification({
      userId: dream.patientId,
      type: 'proposta',
      title: 'Nova proposta recebida',
      message: `${supporter.name} enviou uma proposta para "${dream.title}".`,
      actionPath: buildOperatorRoute(operator.role, 'propostas'),
    });

    return this.serializeProposal(saved, currentUser);
  }

  async acceptProposal(currentUser: JwtPayload, proposalId: string) {
    const proposal = await this.proposalsRepository.findOneBy({ id: proposalId });
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const dream = await this.dreamsRepository.findOneByOrFail({ id: proposal.dreamId });
    if (dream.patientId !== currentUser.sub) {
      throw new ForbiddenException('Only the dream owner can accept proposals');
    }
    if (currentUser.role === 'instituicao') {
      await this.ensureInstitutionManagedPatientAccess(currentUser, dream);
    }

    proposal.status = 'aceita';
    dream.status = 'em-conversa';
    await this.proposalsRepository.save(proposal);
    await this.dreamsRepository.save(dream);

    const conversation = this.conversationsRepository.create({
      dreamId: dream.id,
      patientId: dream.patientId,
      managedPatientId: dream.managedPatientId,
      supporterId: proposal.supporterId,
      status: 'ativa',
    });

    const savedConversation = await this.conversationsRepository.save(conversation);
    const operator = await this.usersRepository.findOneByOrFail({ id: dream.patientId });

    await this.notificationsService.createNotification({
      userId: proposal.supporterId,
      type: 'aceito',
      title: 'Proposta aceita',
      message: `Sua proposta para "${dream.title}" foi aceita.`,
      actionPath: `/apoiador/chat?conversationId=${savedConversation.id}`,
    });

    await this.notificationsService.createNotification({
      userId: dream.patientId,
      type: 'aceito',
      title: 'Conversa iniciada',
      message: `Você iniciou uma conversa para "${dream.title}".`,
      actionPath: `${buildOperatorRoute(operator.role, 'chat')}?conversationId=${savedConversation.id}`,
    });

    return {
      ...this.serializeProposal(proposal, currentUser),
      conversationId: savedConversation.id,
    };
  }

  async rejectProposal(currentUser: JwtPayload, proposalId: string) {
    const proposal = await this.proposalsRepository.findOneBy({ id: proposalId });
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const dream = await this.dreamsRepository.findOneByOrFail({ id: proposal.dreamId });
    if (dream.patientId !== currentUser.sub) {
      throw new ForbiddenException('Only the dream owner can reject proposals');
    }
    if (currentUser.role === 'instituicao') {
      await this.ensureInstitutionManagedPatientAccess(currentUser, dream);
    }
    if (proposal.status === 'aceita') {
      throw new ConflictException('Accepted proposals cannot be rejected');
    }

    if (proposal.status !== 'recusada') {
      proposal.status = 'recusada';
      await this.proposalsRepository.save(proposal);

      await this.notificationsService.createNotification({
        userId: proposal.supporterId,
        type: 'recusada',
        title: 'Proposta recusada',
        message: `Sua proposta para "${dream.title}" foi recusada.`,
        actionPath: '/apoiador/propostas',
      });
    }

    return this.serializeProposal(proposal, currentUser);
  }

  async listSupporterProposals(currentUser: JwtPayload) {
    if (currentUser.role !== 'apoiador') {
      throw new ForbiddenException('Only supporters can list their proposals');
    }

    const proposals = await this.proposalsRepository.find({
      where: { supporterId: currentUser.sub },
      order: { createdAt: 'DESC' },
    });

    return proposals.map((proposal) => this.serializeProposal(proposal));
  }

  async listReceivedProposals(
    currentUser: JwtPayload,
    query: { page?: string; pageSize?: string; query?: string; status?: string } = {},
  ) {
    if (currentUser.role !== 'paciente' && currentUser.role !== 'instituicao') {
      throw new ForbiddenException('Only patients or institutions can list received proposals');
    }
    if (currentUser.role === 'instituicao') {
      await this.institutionService.overview(currentUser);
    }

    const normalizedQuery = normalizeQueryTerm(query.query);
    const normalizedStatus = normalizeQueryTerm(query.status);
    const pagination = parsePagination(query);
    const shouldPaginate = pagination.enabled || hasQueryFilters({
      query: normalizedQuery,
      status: normalizedStatus,
    });

    const linkedManagedPatientIds =
      currentUser.role === 'paciente'
        ? await this.institutionService.listLinkedManagedPatientIdsForUser(currentUser.sub)
        : [];

    const queryBuilder = this.proposalsRepository
      .createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.dream', 'dream')
      .leftJoinAndSelect('proposal.supporter', 'supporter')
      .leftJoinAndSelect('dream.patient', 'patient')
      .leftJoinAndSelect('dream.managedPatient', 'managedPatient')
      .where(
        new Brackets((where) => {
          where.where('dream.patientId = :patientId', { patientId: currentUser.sub });
          if (currentUser.role === 'paciente' && linkedManagedPatientIds.length > 0) {
            where.orWhere('dream.managedPatientId IN (:...managedPatientIds)', {
              managedPatientIds: linkedManagedPatientIds,
            });
          }
        }),
      )
      .orderBy('proposal.createdAt', 'DESC');

    if (normalizedStatus) {
      queryBuilder.andWhere('proposal.status = :status', { status: normalizedStatus });
    }

    if (normalizedQuery) {
      queryBuilder.andWhere(
        `(
          LOWER(dream.title) LIKE :query
          OR LOWER(proposal.message) LIKE :query
          OR LOWER(proposal.offering) LIKE :query
          OR LOWER(COALESCE(supporter.name, '')) LIKE :query
        )`,
        { query: `%${normalizedQuery.toLowerCase()}%` },
      );
    }

    if (!shouldPaginate) {
      const proposals = await queryBuilder.getMany();
      return proposals.map((proposal) => this.serializeProposal(proposal, currentUser));
    }

    const [proposals, total] = await queryBuilder
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getManyAndCount();

    return buildPaginatedResult(
      proposals.map((proposal) => this.serializeProposal(proposal, currentUser)),
      pagination.page,
      pagination.pageSize,
      total,
    );
  }

  private serializeDream(dream: Dream, currentUser?: JwtPayload) {
    const patientName = dream.managedPatient?.name ?? dream.patient?.name;
    const patientCity = dream.managedPatient
      ? buildLocationLabel(dream.managedPatient)
      : buildLocationLabel(dream.patient ?? {});
    const institutionName = dream.managedPatientId ? dream.patient?.name : undefined;
    const isLinkedViewer = Boolean(
      currentUser?.role === 'paciente' &&
      dream.managedPatientId &&
      dream.patientId !== currentUser.sub,
    );

    return {
      id: dream.id,
      title: dream.title,
      description: dream.description,
      category: dream.category,
      format: dream.format,
      urgency: dream.urgency,
      privacy: dream.privacy,
      status: dream.status,
      patientId: dream.managedPatientId ?? dream.patientId,
      operatorUserId: dream.patientId,
      managedPatientId: dream.managedPatientId,
      managedByInstitution: Boolean(dream.managedPatientId),
      institutionName,
      patientName,
      patientCity,
      operatorRole: dream.managedPatientId ? ('instituicao' as const) : ('paciente' as const),
      canEdit: currentUser
        ? currentUser.role === 'instituicao'
          ? dream.patientId === currentUser.sub
          : currentUser.role === 'paciente'
            ? dream.patientId === currentUser.sub && !isLinkedViewer
            : false
        : undefined,
      createdAt: dream.createdAt,
      updatedAt: dream.updatedAt,
    };
  }

  private serializeProposal(proposal: Proposal, currentUser?: JwtPayload) {
    return {
      id: proposal.id,
      dreamId: proposal.dreamId,
      dreamTitle: proposal.dream?.title,
      dreamStatus: proposal.dream?.status,
      dreamCategory: proposal.dream?.category,
      patientId: proposal.dream?.managedPatientId ?? proposal.dream?.patientId,
      patientName: proposal.dream?.managedPatient?.name ?? proposal.dream?.patient?.name,
      patientCity: proposal.dream?.managedPatient
        ? buildLocationLabel(proposal.dream.managedPatient)
        : buildLocationLabel(proposal.dream?.patient ?? {}),
      managedByInstitution: Boolean(proposal.dream?.managedPatientId),
      institutionName: proposal.dream?.managedPatientId ? proposal.dream?.patient?.name : undefined,
      canRespond: currentUser
        ? proposal.dream?.patientId === currentUser.sub && currentUser.role !== 'apoiador'
        : undefined,
      supporterId: proposal.supporterId,
      supporterName: proposal.supporter?.name,
      message: proposal.message,
      offering: proposal.offering,
      availability: proposal.availability,
      duration: proposal.duration,
      status: proposal.status,
      createdAt: proposal.createdAt,
    };
  }

  private async ensureInstitutionManagedPatientAccess(currentUser: JwtPayload, dream: Dream) {
    if (currentUser.role !== 'instituicao' || dream.managedPatientId == null) {
      return;
    }

    await this.institutionService.ensureManagedPatientForInstitution(
      currentUser.sub,
      dream.managedPatientId,
    );
  }
}
