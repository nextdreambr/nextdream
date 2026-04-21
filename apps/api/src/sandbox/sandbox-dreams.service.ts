import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { buildLocationLabel } from '../lib/location';
import {
  buildPaginatedResult,
  hasQueryFilters,
  normalizeQueryTerm,
  parsePagination,
} from '../lib/pagination';
import { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { SandboxNotificationsService } from './sandbox-notifications.service';
import { SandboxStateService } from './sandbox-state.service';
import {
  SandboxConversation,
  SandboxDream,
  SandboxManagedPatient,
  SandboxProposal,
  SandboxSessionState,
  SandboxUser,
} from './sandbox-types';
import { CreateDreamDto } from '../modules/dreams/dto/create-dream.dto';
import { CreateProposalDto } from '../modules/dreams/dto/create-proposal.dto';
import { UpdateDreamDto } from '../modules/dreams/dto/update-dream.dto';

function buildOperatorRoute(role: SandboxUser['role'], section: 'propostas' | 'chat') {
  if (role === 'instituicao') {
    return `/instituicao/${section}`;
  }
  if (role === 'paciente') {
    return `/paciente/${section}`;
  }

  throw new Error(`Unsupported operator role for operator route: ${role}`);
}

@Injectable()
export class SandboxDreamsService {
  private readonly sandboxState: SandboxStateService;
  private readonly notificationsService: SandboxNotificationsService;

  constructor(
    @Inject(SandboxStateService) sandboxState: SandboxStateService,
    @Inject(SandboxNotificationsService) notificationsService: SandboxNotificationsService,
  ) {
    this.sandboxState = sandboxState;
    this.notificationsService = notificationsService;
  }

  async createDream(currentUser: JwtPayload, dto: CreateDreamDto) {
    const session = this.getSession(currentUser);
    if (currentUser.role !== 'paciente' && currentUser.role !== 'instituicao') {
      throw new ForbiddenException('Only patients or institutions can create dreams');
    }

    const operator = this.getUserOrThrow(session, currentUser.sub);
    let managedPatient: SandboxManagedPatient | undefined;

    if (currentUser.role === 'instituicao') {
      if (!dto.managedPatientId) {
        throw new BadRequestException('Institution dreams must target a managed patient');
      }
      managedPatient = this.getManagedPatientOrThrow(session, currentUser.sub, dto.managedPatientId);
    } else if (dto.managedPatientId !== undefined) {
      throw new BadRequestException('Only institutions can assign managed patients');
    }

    const dream: SandboxDream = {
      id: randomUUID(),
      title: this.requireNonEmptyText(dto.title, 'Dream title'),
      description: this.requireNonEmptyText(dto.description, 'Dream description'),
      category: this.requireNonEmptyText(dto.category, 'Dream category'),
      format: dto.format,
      urgency: dto.urgency,
      privacy: dto.privacy,
      status: 'publicado',
      patientId: operator.id,
      managedPatientId: managedPatient?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    session.dreams.unshift(dream);
    return this.serializeDream(session, dream, currentUser);
  }

  async listPublicDreams() {
    const catalog = this.sandboxState.getPublicCatalog();
    return catalog.dreams
      .filter((dream) => dream.status === 'publicado')
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .map((dream) => this.serializeDream(catalog, dream));
  }

  async getDreamForUser(currentUser: JwtPayload, dreamId: string) {
    const session = this.getSession(currentUser);
    const dream = this.getDreamOrThrow(session, dreamId);

    if (currentUser.role === 'admin') {
      return this.serializeDream(session, dream, currentUser);
    }

    if (currentUser.role === 'instituicao' && dream.patientId === currentUser.sub) {
      if (dream.managedPatientId) {
        this.getManagedPatientOrThrow(session, currentUser.sub, dream.managedPatientId);
      }
      return this.serializeDream(session, dream, currentUser);
    }

    if (currentUser.role === 'paciente') {
      const linkedManagedPatientIds = this.getLinkedManagedPatientIds(session, currentUser.sub);
      if (dream.patientId === currentUser.sub || (dream.managedPatientId && linkedManagedPatientIds.includes(dream.managedPatientId))) {
        return this.serializeDream(session, dream, currentUser);
      }
    }

    if (currentUser.role === 'apoiador') {
      const hasProposal = session.proposals.some(
        (proposal) => proposal.dreamId === dream.id && proposal.supporterId === currentUser.sub,
      );
      if (dream.status === 'publicado' || hasProposal) {
        return this.serializeDream(session, dream, currentUser);
      }
    }

    throw new ForbiddenException('You are not allowed to view this dream');
  }

  async listMyDreams(
    currentUser: JwtPayload,
    query: { page?: string; pageSize?: string; query?: string; status?: string } = {},
  ) {
    const session = this.getSession(currentUser);
    if (currentUser.role !== 'paciente' && currentUser.role !== 'instituicao') {
      throw new ForbiddenException('Only patients or institutions can list their dreams');
    }

    const normalizedQuery = normalizeQueryTerm(query.query);
    const normalizedStatus = normalizeQueryTerm(query.status);
    const pagination = parsePagination(query);
    const shouldPaginate = pagination.enabled || hasQueryFilters({
      query: normalizedQuery,
      status: normalizedStatus,
    });
    const linkedManagedPatientIds = this.getLinkedManagedPatientIds(session, currentUser.sub);

    let dreams = session.dreams.filter((dream) => {
      if (dream.patientId === currentUser.sub) {
        return true;
      }
      return currentUser.role === 'paciente'
        ? Boolean(dream.managedPatientId && linkedManagedPatientIds.includes(dream.managedPatientId))
        : false;
    });

    if (normalizedStatus) {
      dreams = dreams.filter((dream) => dream.status === normalizedStatus);
    }

    if (normalizedQuery) {
      const loweredQuery = normalizedQuery.toLowerCase();
      dreams = dreams.filter((dream) => {
        const managedPatientName = dream.managedPatientId
          ? this.findManagedPatient(session, dream.managedPatientId)?.name ?? ''
          : '';
        return [
          dream.title,
          dream.description,
          dream.category,
          managedPatientName,
        ].some((value) => value.toLowerCase().includes(loweredQuery));
      });
    }

    dreams = dreams
      .slice()
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

    const serialized = dreams.map((dream) => this.serializeDream(session, dream, currentUser));
    if (!shouldPaginate) {
      return serialized;
    }

    return buildPaginatedResult(
      serialized.slice(pagination.skip, pagination.skip + pagination.pageSize),
      pagination.page,
      pagination.pageSize,
      serialized.length,
    );
  }

  async updateDream(currentUser: JwtPayload, dreamId: string, dto: UpdateDreamDto) {
    const session = this.getSession(currentUser);
    if (currentUser.role !== 'paciente' && currentUser.role !== 'instituicao') {
      throw new ForbiddenException('Only patients or institutions can update dreams');
    }

    const dream = this.getDreamOrThrow(session, dreamId);
    if (dream.patientId !== currentUser.sub) {
      throw new ForbiddenException('Only the dream owner can update this dream');
    }

    if (currentUser.role === 'instituicao' && dto.managedPatientId !== undefined) {
      const managedPatient = this.getManagedPatientOrThrow(session, currentUser.sub, dto.managedPatientId);
      dream.managedPatientId = managedPatient.id;
    } else if (currentUser.role !== 'instituicao' && dto.managedPatientId !== undefined) {
      throw new BadRequestException('Only institutions can assign managed patients');
    }

    if (dto.title !== undefined) {
      dream.title = this.requireNonEmptyText(dto.title, 'Dream title');
    }
    if (dto.description !== undefined) {
      dream.description = this.requireNonEmptyText(dto.description, 'Dream description');
    }
    if (dto.category !== undefined) {
      dream.category = this.requireNonEmptyText(dto.category, 'Dream category');
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
    dream.updatedAt = new Date();

    return this.serializeDream(session, dream, currentUser);
  }

  async listDreamProposals(currentUser: JwtPayload, dreamId: string) {
    const session = this.getSession(currentUser);
    const dream = this.getDreamOrThrow(session, dreamId);

    if (currentUser.role === 'instituicao') {
      if (dream.patientId !== currentUser.sub) {
        throw new ForbiddenException('Only the dream owner can view proposals');
      }
      if (dream.managedPatientId) {
        this.getManagedPatientOrThrow(session, currentUser.sub, dream.managedPatientId);
      }
    } else if (currentUser.role === 'paciente') {
      const linkedManagedPatientIds = this.getLinkedManagedPatientIds(session, currentUser.sub);
      if (dream.patientId !== currentUser.sub && !(dream.managedPatientId && linkedManagedPatientIds.includes(dream.managedPatientId))) {
        throw new ForbiddenException('Only the dream owner can view proposals');
      }
    } else {
      throw new ForbiddenException('Only patients or institutions can view proposals');
    }

    return session.proposals
      .filter((proposal) => proposal.dreamId === dream.id)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .map((proposal) => this.serializeProposal(session, proposal, currentUser));
  }

  async createProposal(currentUser: JwtPayload, dreamId: string, dto: CreateProposalDto) {
    const session = this.getSession(currentUser);
    if (currentUser.role !== 'apoiador') {
      throw new ForbiddenException('Only supporters can send proposals');
    }

    const supporter = this.getUserOrThrow(session, currentUser.sub);
    const dream = this.getDreamOrThrow(session, dreamId);
    if (dream.status !== 'publicado') {
      throw new ConflictException('Este sonho nao esta disponivel para novas propostas.');
    }

    const existingProposal = session.proposals.find(
      (proposal) => proposal.dreamId === dream.id && proposal.supporterId === supporter.id,
    );
    if (existingProposal) {
      throw new ConflictException('Voce ja enviou uma proposta para este sonho.');
    }

    const proposal: SandboxProposal = {
      id: randomUUID(),
      dreamId: dream.id,
      supporterId: supporter.id,
      message: this.requireNonEmptyText(dto.message, 'Proposal message'),
      offering: this.requireNonEmptyText(dto.offering, 'Proposal offering'),
      availability: this.requireNonEmptyText(dto.availability, 'Proposal availability'),
      duration: this.requireNonEmptyText(dto.duration, 'Proposal duration'),
      status: 'enviada',
      createdAt: new Date(),
    };

    session.proposals.unshift(proposal);
    const operator = this.getUserOrThrow(session, dream.patientId);
    await this.notificationsService.createNotification(session.id, {
      userId: dream.patientId,
      type: 'proposta',
      title: 'Nova proposta recebida',
      message: `${supporter.name} enviou uma proposta para "${dream.title}".`,
      actionPath: buildOperatorRoute(operator.role, 'propostas'),
    });

    return this.serializeProposal(session, proposal, currentUser);
  }

  async acceptProposal(currentUser: JwtPayload, proposalId: string) {
    const session = this.getSession(currentUser);
    const proposal = this.getProposalOrThrow(session, proposalId);
    const dream = this.getDreamOrThrow(session, proposal.dreamId);

    if (dream.patientId !== currentUser.sub) {
      throw new ForbiddenException('Only the dream owner can accept proposals');
    }
    if (currentUser.role === 'instituicao' && dream.managedPatientId) {
      this.getManagedPatientOrThrow(session, currentUser.sub, dream.managedPatientId);
    }
    if (proposal.status !== 'enviada') {
      throw new ConflictException('Only pending proposals can be accepted');
    }
    if (dream.status !== 'publicado') {
      throw new ConflictException('This dream is not available for proposal acceptance');
    }

    proposal.status = 'aceita';
    dream.status = 'em-conversa';
    dream.updatedAt = new Date();

    const conversation: SandboxConversation = {
      id: randomUUID(),
      dreamId: dream.id,
      patientId: dream.patientId,
      managedPatientId: dream.managedPatientId,
      supporterId: proposal.supporterId,
      status: 'ativa',
      createdAt: new Date(),
    };

    session.conversations.unshift(conversation);
    const operator = this.getUserOrThrow(session, dream.patientId);
    await this.notificationsService.createNotification(session.id, {
      userId: proposal.supporterId,
      type: 'aceito',
      title: 'Proposta aceita',
      message: `Sua proposta para "${dream.title}" foi aceita.`,
      actionPath: `/apoiador/chat?conversationId=${conversation.id}`,
    });
    await this.notificationsService.createNotification(session.id, {
      userId: dream.patientId,
      type: 'aceito',
      title: 'Conversa iniciada',
      message: `Voce iniciou uma conversa para "${dream.title}".`,
      actionPath: `${buildOperatorRoute(operator.role, 'chat')}?conversationId=${conversation.id}`,
    });

    return {
      ...this.serializeProposal(session, proposal, currentUser),
      conversationId: conversation.id,
    };
  }

  async rejectProposal(currentUser: JwtPayload, proposalId: string) {
    const session = this.getSession(currentUser);
    const proposal = this.getProposalOrThrow(session, proposalId);
    const dream = this.getDreamOrThrow(session, proposal.dreamId);

    if (dream.patientId !== currentUser.sub) {
      throw new ForbiddenException('Only the dream owner can reject proposals');
    }
    if (currentUser.role === 'instituicao' && dream.managedPatientId) {
      this.getManagedPatientOrThrow(session, currentUser.sub, dream.managedPatientId);
    }
    if (proposal.status === 'aceita') {
      throw new ConflictException('Accepted proposals cannot be rejected');
    }

    proposal.status = 'recusada';
    await this.notificationsService.createNotification(session.id, {
      userId: proposal.supporterId,
      type: 'recusada',
      title: 'Proposta recusada',
      message: `Sua proposta para "${dream.title}" foi recusada.`,
      actionPath: '/apoiador/propostas',
    });

    return this.serializeProposal(session, proposal, currentUser);
  }

  async listSupporterProposals(currentUser: JwtPayload) {
    const session = this.getSession(currentUser);
    if (currentUser.role !== 'apoiador') {
      throw new ForbiddenException('Only supporters can list their proposals');
    }

    return session.proposals
      .filter((proposal) => proposal.supporterId === currentUser.sub)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .map((proposal) => this.serializeProposal(session, proposal, currentUser));
  }

  async listReceivedProposals(
    currentUser: JwtPayload,
    query: { page?: string; pageSize?: string; query?: string; status?: string } = {},
  ) {
    const session = this.getSession(currentUser);
    if (currentUser.role !== 'paciente' && currentUser.role !== 'instituicao') {
      throw new ForbiddenException('Only patients or institutions can list received proposals');
    }

    const normalizedQuery = normalizeQueryTerm(query.query);
    const normalizedStatus = normalizeQueryTerm(query.status);
    const pagination = parsePagination(query);
    const shouldPaginate = pagination.enabled || hasQueryFilters({
      query: normalizedQuery,
      status: normalizedStatus,
    });
    const linkedManagedPatientIds = this.getLinkedManagedPatientIds(session, currentUser.sub);

    let proposals = session.proposals.filter((proposal) => {
      const dream = this.findDream(session, proposal.dreamId);
      if (!dream) {
        return false;
      }

      if (dream.patientId === currentUser.sub) {
        return true;
      }

      return currentUser.role === 'paciente'
        ? Boolean(dream.managedPatientId && linkedManagedPatientIds.includes(dream.managedPatientId))
        : false;
    });

    if (normalizedStatus) {
      proposals = proposals.filter((proposal) => proposal.status === normalizedStatus);
    }

    if (normalizedQuery) {
      const loweredQuery = normalizedQuery.toLowerCase();
      proposals = proposals.filter((proposal) => {
        const dream = this.findDream(session, proposal.dreamId);
        const supporter = this.findUser(session, proposal.supporterId);
        return [
          dream?.title ?? '',
          proposal.message,
          proposal.offering,
          supporter?.name ?? '',
        ].some((value) => value.toLowerCase().includes(loweredQuery));
      });
    }

    proposals = proposals
      .slice()
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

    const serialized = proposals.map((proposal) => this.serializeProposal(session, proposal, currentUser));
    if (!shouldPaginate) {
      return serialized;
    }

    return buildPaginatedResult(
      serialized.slice(pagination.skip, pagination.skip + pagination.pageSize),
      pagination.page,
      pagination.pageSize,
      serialized.length,
    );
  }

  private getSession(currentUser: JwtPayload) {
    return this.sandboxState.getSessionOrThrow(currentUser.sandboxSessionId);
  }

  private getUserOrThrow(session: SandboxSessionState, userId: string) {
    const user = session.users.find((candidate) => candidate.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private getDreamOrThrow(session: SandboxSessionState, dreamId: string) {
    const dream = session.dreams.find((candidate) => candidate.id === dreamId);
    if (!dream) {
      throw new NotFoundException('Dream not found');
    }
    return dream;
  }

  private getProposalOrThrow(session: SandboxSessionState, proposalId: string) {
    const proposal = session.proposals.find((candidate) => candidate.id === proposalId);
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    return proposal;
  }

  private getManagedPatientOrThrow(session: SandboxSessionState, institutionId: string, managedPatientId: string) {
    const patient = session.managedPatients.find(
      (candidate) => candidate.id === managedPatientId && candidate.institutionId === institutionId,
    );
    if (!patient) {
      throw new NotFoundException('Managed patient not found');
    }
    return patient;
  }

  private findUser(session: SandboxSessionState, userId: string) {
    return session.users.find((candidate) => candidate.id === userId);
  }

  private findDream(session: SandboxSessionState, dreamId: string) {
    return session.dreams.find((candidate) => candidate.id === dreamId);
  }

  private findManagedPatient(session: SandboxSessionState, managedPatientId: string) {
    return session.managedPatients.find((candidate) => candidate.id === managedPatientId);
  }

  private getLinkedManagedPatientIds(session: SandboxSessionState, userId: string) {
    return session.managedPatients
      .filter((patient) => patient.linkedUserId === userId)
      .map((patient) => patient.id);
  }

  private requireNonEmptyText(value: string, fieldName: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new BadRequestException(`${fieldName} cannot be empty`);
    }
    return trimmed;
  }

  private serializeDream(session: SandboxSessionState, dream: SandboxDream, currentUser?: JwtPayload) {
    const operator = this.findUser(session, dream.patientId);
    const managedPatient = dream.managedPatientId
      ? this.findManagedPatient(session, dream.managedPatientId)
      : undefined;
    const patientName = managedPatient?.name ?? operator?.name;
    const patientCity = managedPatient
      ? buildLocationLabel(managedPatient)
      : buildLocationLabel(operator ?? {});
    const institutionName = dream.managedPatientId ? operator?.name : undefined;
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

  private serializeProposal(session: SandboxSessionState, proposal: SandboxProposal, currentUser?: JwtPayload) {
    const dream = this.findDream(session, proposal.dreamId);
    const operator = dream ? this.findUser(session, dream.patientId) : undefined;
    const managedPatient = dream?.managedPatientId
      ? this.findManagedPatient(session, dream.managedPatientId)
      : undefined;
    const supporter = this.findUser(session, proposal.supporterId);

    return {
      id: proposal.id,
      dreamId: proposal.dreamId,
      dreamTitle: dream?.title,
      dreamStatus: dream?.status,
      dreamCategory: dream?.category,
      patientId: dream?.managedPatientId ?? dream?.patientId,
      patientName: managedPatient?.name ?? operator?.name,
      patientCity: managedPatient
        ? buildLocationLabel(managedPatient)
        : buildLocationLabel(operator ?? {}),
      managedByInstitution: Boolean(dream?.managedPatientId),
      institutionName: dream?.managedPatientId ? operator?.name : undefined,
      canRespond: currentUser
        ? dream?.patientId === currentUser.sub && currentUser.role !== 'apoiador'
        : undefined,
      supporterId: proposal.supporterId,
      supporterName: supporter?.name,
      message: proposal.message,
      offering: proposal.offering,
      availability: proposal.availability,
      duration: proposal.duration,
      status: proposal.status,
      createdAt: proposal.createdAt,
    };
  }
}
