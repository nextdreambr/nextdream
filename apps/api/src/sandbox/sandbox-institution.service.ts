import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { buildLocationLabel, normalizeLocationPart } from '../lib/location';
import {
  buildPaginatedResult,
  hasQueryFilters,
  normalizeQueryTerm,
  parsePagination,
} from '../lib/pagination';
import { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { ChangeInstitutionPasswordDto } from '../modules/institution/dto/change-institution-password.dto';
import { CreateManagedPatientAccessInviteDto } from '../modules/institution/dto/create-managed-patient-access-invite.dto';
import { CreateManagedPatientDto } from '../modules/institution/dto/create-managed-patient.dto';
import { UpdateInstitutionProfileDto } from '../modules/institution/dto/update-institution-profile.dto';
import { UpdateManagedPatientDto } from '../modules/institution/dto/update-managed-patient.dto';
import { SandboxStateService } from './sandbox-state.service';
import { SandboxManagedPatient, SandboxSessionState, SandboxUser } from './sandbox-types';

@Injectable()
export class SandboxInstitutionService {
  private readonly sandboxState: SandboxStateService;

  constructor(@Inject(SandboxStateService) sandboxState: SandboxStateService) {
    this.sandboxState = sandboxState;
  }

  async overview(currentUser: JwtPayload) {
    const { session, institution } = this.requireApprovedInstitution(currentUser);
    const institutionDreams = session.dreams.filter((dream) => dream.patientId === institution.id);
    const institutionConversations = session.conversations.filter(
      (conversation) => conversation.patientId === institution.id,
    );
    const institutionProposals = session.proposals.filter((proposal) =>
      institutionDreams.some((dream) => dream.id === proposal.dreamId),
    );
    const linkedPatients = session.managedPatients.filter((patient) => patient.linkedUserId).length;
    const pendingAccessInvites = session.managedPatients.filter(
      (patient) => patient.pendingInviteEmail && patient.pendingInviteExpiresAt && patient.pendingInviteExpiresAt > new Date(),
    ).length;

    return {
      managedPatients: session.managedPatients.length,
      linkedPatients,
      pendingAccessInvites,
      dreams: institutionDreams.length,
      dreamsPublished: institutionDreams.filter((dream) => dream.status === 'publicado').length,
      dreamsInConversation: institutionDreams.filter((dream) => dream.status === 'em-conversa').length,
      proposals: institutionProposals.length,
      pendingProposals: institutionProposals.filter((proposal) => ['enviada', 'em-analise'].includes(proposal.status)).length,
      acceptedProposals: institutionProposals.filter((proposal) => proposal.status === 'aceita').length,
      activeConversations: institutionConversations.filter((conversation) => conversation.status === 'ativa').length,
      supporterConnections: new Set(institutionProposals.map((proposal) => proposal.supporterId)).size,
    };
  }

  async listPatients(
    currentUser: JwtPayload,
    query: { page?: string; pageSize?: string; query?: string } = {},
  ) {
    const { session } = this.requireApprovedInstitution(currentUser);
    const normalizedQuery = normalizeQueryTerm(query.query);
    const pagination = parsePagination(query);
    const shouldPaginate = pagination.enabled || hasQueryFilters({ query: normalizedQuery });

    let patients = session.managedPatients
      .slice()
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

    if (normalizedQuery) {
      const loweredQuery = normalizedQuery.toLowerCase();
      patients = patients.filter((patient) => patient.name.toLowerCase().includes(loweredQuery));
    }

    const serialized = patients.map((patient) => this.serializePatient(session, patient));
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

  async createPatient(currentUser: JwtPayload, dto: CreateManagedPatientDto) {
    const { session, institution } = this.requireApprovedInstitution(currentUser);
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('Patient name is required');
    }

    const patient: SandboxManagedPatient = {
      id: crypto.randomUUID(),
      institutionId: institution.id,
      name,
      state: normalizeLocationPart(dto.state),
      city: normalizeLocationPart(dto.city),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    session.managedPatients.unshift(patient);
    return this.serializePatient(session, patient);
  }

  async getPatientDetail(currentUser: JwtPayload, managedPatientId: string) {
    const { session, institution } = this.requireApprovedInstitution(currentUser);
    const patient = this.getManagedPatient(session, institution.id, managedPatientId);
    const dreams = session.dreams
      .filter((dream) => dream.patientId === institution.id && dream.managedPatientId === managedPatientId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    const proposals = session.proposals
      .filter((proposal) => dreams.some((dream) => dream.id === proposal.dreamId))
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    const conversations = session.conversations
      .filter((conversation) => conversation.patientId === institution.id && conversation.managedPatientId === managedPatientId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

    return {
      patient: this.serializePatient(session, patient),
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
        dreamTitle: dreams.find((dream) => dream.id === proposal.dreamId)?.title,
        status: proposal.status,
        supporterId: proposal.supporterId,
        supporterName: session.users.find((user) => user.id === proposal.supporterId)?.name,
        createdAt: proposal.createdAt,
      })),
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        dreamId: conversation.dreamId,
        dreamTitle: dreams.find((dream) => dream.id === conversation.dreamId)?.title,
        status: conversation.status,
        supporterId: conversation.supporterId,
        supporterName: session.users.find((user) => user.id === conversation.supporterId)?.name,
        createdAt: conversation.createdAt,
      })),
      summary: {
        dreams: dreams.length,
        proposals: proposals.length,
        activeConversations: conversations.filter((conversation) => conversation.status === 'ativa').length,
      },
    };
  }

  async updatePatient(currentUser: JwtPayload, managedPatientId: string, dto: UpdateManagedPatientDto) {
    const { session, institution } = this.requireApprovedInstitution(currentUser);
    const patient = this.getManagedPatient(session, institution.id, managedPatientId);

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
    patient.updatedAt = new Date();

    return this.serializePatient(session, patient);
  }

  async createPatientAccessInvite(
    currentUser: JwtPayload,
    managedPatientId: string,
    dto: CreateManagedPatientAccessInviteDto,
  ) {
    const { session, institution } = this.requireApprovedInstitution(currentUser);
    const patient = this.getManagedPatient(session, institution.id, managedPatientId);

    if (patient.linkedUserId) {
      throw new ConflictException('Patient already has an active account');
    }

    const email = dto.email.toLowerCase();
    const existing = session.users.find((user) => user.email === email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    patient.pendingInviteEmail = email;
    patient.pendingInviteExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    patient.updatedAt = new Date();

    return {
      id: crypto.randomUUID(),
      email,
      managedPatientId,
      expiresAt: patient.pendingInviteExpiresAt,
      inviteUrl: this.buildPatientInviteUrl(),
    };
  }

  async getProfile(currentUser: JwtPayload) {
    const { institution } = this.requireApprovedInstitution(currentUser);
    return this.serializeInstitution(institution);
  }

  async updateProfile(currentUser: JwtPayload, dto: UpdateInstitutionProfileDto) {
    const { session, institution } = this.requireApprovedInstitution(currentUser);

    if (dto.email !== undefined) {
      const normalizedEmail = dto.email.toLowerCase();
      const existing = session.users.find((user) => user.email === normalizedEmail && user.id !== institution.id);
      if (existing) {
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
    if (dto.institutionResponsibleName !== undefined) {
      institution.institutionResponsibleName = dto.institutionResponsibleName.trim() || undefined;
    }
    if (dto.institutionResponsiblePhone !== undefined) {
      institution.institutionResponsiblePhone = dto.institutionResponsiblePhone.trim() || undefined;
    }
    if (dto.institutionDescription !== undefined) {
      institution.institutionDescription = dto.institutionDescription.trim() || undefined;
    }
    institution.updatedAt = new Date();

    return this.serializeInstitution(institution);
  }

  async changePassword(currentUser: JwtPayload, dto: ChangeInstitutionPasswordDto) {
    const { institution } = this.requireApprovedInstitution(currentUser);
    if (institution.passwordHash !== dto.currentPassword) {
      throw new UnauthorizedException('Current password is invalid');
    }

    institution.passwordHash = dto.newPassword;
    institution.updatedAt = new Date();

    return { ok: true };
  }

  private requireApprovedInstitution(currentUser: JwtPayload) {
    const session = this.sandboxState.getSessionOrThrow(currentUser.sandboxSessionId);
    const institution = session.users.find((user) => user.id === currentUser.sub);
    if (!institution || institution.role !== 'instituicao') {
      throw new ForbiddenException('Only institutions can access this resource');
    }
    if (!institution.approved) {
      throw new ForbiddenException('Institution account is pending approval');
    }

    return { session, institution };
  }

  private getManagedPatient(session: SandboxSessionState, institutionId: string, managedPatientId: string) {
    const patient = session.managedPatients.find(
      (candidate) => candidate.id === managedPatientId && candidate.institutionId === institutionId,
    );
    if (!patient) {
      throw new NotFoundException('Managed patient not found');
    }

    return patient;
  }

  private serializePatient(session: SandboxSessionState, patient: SandboxManagedPatient) {
    const linkedUser = patient.linkedUserId
      ? session.users.find((user) => user.id === patient.linkedUserId)
      : undefined;
    const accessStatus = linkedUser
      ? 'ativo'
      : patient.pendingInviteEmail && patient.pendingInviteExpiresAt && patient.pendingInviteExpiresAt > new Date()
        ? 'convite-pendente'
        : 'sem-acesso';

    return {
      id: patient.id,
      institutionId: patient.institutionId,
      linkedUserId: patient.linkedUserId,
      linkedUserEmail: linkedUser?.email,
      accessStatus,
      pendingInviteEmail: patient.pendingInviteEmail,
      pendingInviteExpiresAt: patient.pendingInviteExpiresAt,
      name: patient.name,
      state: patient.state,
      city: patient.city,
      locationLabel: buildLocationLabel(patient),
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  private serializeInstitution(institution: SandboxUser) {
    return {
      id: institution.id,
      name: institution.name,
      email: institution.email,
      role: institution.role,
      state: institution.state,
      city: institution.city,
      locationLabel: buildLocationLabel(institution),
      institutionType: institution.institutionType,
      institutionResponsibleName: institution.institutionResponsibleName,
      institutionResponsiblePhone: institution.institutionResponsiblePhone,
      institutionDescription: institution.institutionDescription,
      approved: institution.approved,
      approvedAt: institution.approvedAt,
      verified: institution.verified,
      emailNotificationsEnabled: institution.emailNotificationsEnabled,
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
    };
  }

  private buildPatientInviteUrl() {
    const appUrl = (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
    return `${appUrl}/sandbox?tipo=paciente`;
  }
}
