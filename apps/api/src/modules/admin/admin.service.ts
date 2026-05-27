import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Brackets, In, Not, Repository } from 'typeorm';
import { AdminContactMessage } from '../../entities/admin-contact-message.entity';
import { AdminInvite } from '../../entities/admin-invite.entity';
import { AdminReport } from '../../entities/admin-report.entity';
import {
  AdminInstitutionalText,
  AdminSettings,
  AdminSettingsCategory,
  AdminSettingsRule,
} from '../../entities/admin-settings.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { ManagedPatient } from '../../entities/managed-patient.entity';
import { Message } from '../../entities/message.entity';
import { Proposal } from '../../entities/proposal.entity';
import { User } from '../../entities/user.entity';
import {
  buildPaginatedResult,
  normalizeQueryTerm,
  parsePagination,
} from '../../lib/pagination';
import { buildLocationLabel, normalizeLocationPart } from '../../lib/location';
import { AuthService } from '../auth/auth.service';
import { JwtPayload } from '../auth/jwt-auth.guard';
import {
  normalizeDreamLanguage,
  normalizeDreamTranslations,
} from '../dreams/dream-language';
import { MailService } from '../mail/mail.service';
import { CloseChatDto } from './dto/close-chat.dto';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { ReactivateUserDto } from './dto/reactivate-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateAdminSettingsDto } from './dto/update-admin-settings.dto';
import { UpdateDreamStatusDto } from './dto/update-dream-status.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const DEFAULT_BLOCKED_WORDS = [
  'pix',
  'doação',
  'doacao',
  'transferência',
  'transferencia',
  'pagamento',
  'dinheiro',
  'r$',
  'vaquinha',
  'arrecadação',
  'crowdfunding',
];

const DEFAULT_RULES: AdminSettingsRule[] = [
  {
    id: 'r1',
    label: 'Bloqueio em tempo real no chat',
    description: 'Impede o envio de mensagens com termos financeiros.',
    enabled: true,
  },
  {
    id: 'r2',
    label: 'Validação ao criar sonho',
    description: 'Escaneia título e descrição do sonho antes de publicar.',
    enabled: true,
  },
  {
    id: 'r3',
    label: 'Validação em propostas',
    description: 'Escaneia a mensagem da proposta ao enviar.',
    enabled: true,
  },
  {
    id: 'r4',
    label: 'Alerta automático ao admin',
    description: 'Notifica admin quando houver tentativa bloqueada.',
    enabled: false,
  },
];

const DEFAULT_CATEGORIES: AdminSettingsCategory[] = [
  { id: 'cat-0', name: 'Experiência ao ar livre' },
  { id: 'cat-1', name: 'Arte e Música' },
  { id: 'cat-2', name: 'Conversa e Companhia' },
  { id: 'cat-3', name: 'Culinária' },
  { id: 'cat-4', name: 'Literatura e Cultura' },
  { id: 'cat-5', name: 'Esporte e Lazer' },
  { id: 'cat-6', name: 'Aprendizado e Educação' },
  { id: 'cat-7', name: 'Tecnologia' },
  { id: 'cat-8', name: 'Espiritualidade' },
  { id: 'cat-9', name: 'Família e Memórias' },
  { id: 'cat-10', name: 'Saúde e Bem-estar' },
  { id: 'cat-11', name: 'Outro' },
];

const DEFAULT_INSTITUTIONAL_TEXTS: AdminInstitutionalText[] = [
  {
    id: 'txt1',
    label: 'Aviso anti-dinheiro (chat)',
    text: 'O NextDream não permite pedidos de dinheiro, PIX ou doações. Ajuste sua mensagem.',
  },
  {
    id: 'txt2',
    label: 'Aviso ao criar sonho',
    text: 'Seu sonho não pode envolver pedidos de dinheiro, PIX, transferências ou doações financeiras.',
  },
  {
    id: 'txt3',
    label: 'Microcopy no onboarding',
    text: 'Sem pedidos de dinheiro. Só conexões humanas.',
  },
];

type AdminReportSeverity = 'critical' | 'high' | 'medium' | 'low';
type AdminProposalRiskLevel = 'high' | 'medium' | 'pending' | 'low';

interface AdminReportTargetSummary {
  chatId?: string;
  dreamTitle?: string;
  patientId?: string;
  patientName?: string;
  institutionName?: string;
  supporterId?: string;
  supporterName?: string;
  hasModeratedMessages?: boolean;
  messageId?: string;
  conversationId?: string;
  senderId?: string;
  senderName?: string;
  moderated?: boolean;
  body?: string;
  dreamId?: string;
  proposalId?: string;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
  status?: string;
  createdAt?: Date | string;
}

@Injectable()
export class AdminService {
  private readonly usersRepository: Repository<User>;
  private readonly dreamsRepository: Repository<Dream>;
  private readonly proposalsRepository: Repository<Proposal>;
  private readonly conversationsRepository: Repository<Conversation>;
  private readonly managedPatientsRepository: Repository<ManagedPatient>;
  private readonly messagesRepository: Repository<Message>;
  private readonly contactMessagesRepository: Repository<AdminContactMessage>;
  private readonly adminInvitesRepository: Repository<AdminInvite>;
  private readonly reportsRepository: Repository<AdminReport>;
  private readonly settingsRepository: Repository<AdminSettings>;
  private readonly auditLogsRepository: Repository<AuditLog>;
  private readonly authService: AuthService;
  private readonly mailService: MailService;

  constructor(
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(Dream) dreamsRepository: Repository<Dream>,
    @InjectRepository(Proposal) proposalsRepository: Repository<Proposal>,
    @InjectRepository(Conversation) conversationsRepository: Repository<Conversation>,
    @InjectRepository(ManagedPatient) managedPatientsRepository: Repository<ManagedPatient>,
    @InjectRepository(Message) messagesRepository: Repository<Message>,
    @InjectRepository(AdminContactMessage) contactMessagesRepository: Repository<AdminContactMessage>,
    @InjectRepository(AdminInvite) adminInvitesRepository: Repository<AdminInvite>,
    @InjectRepository(AdminReport) reportsRepository: Repository<AdminReport>,
    @InjectRepository(AdminSettings) settingsRepository: Repository<AdminSettings>,
    @InjectRepository(AuditLog) auditLogsRepository: Repository<AuditLog>,
    @Inject(AuthService) authService: AuthService,
    @Inject(MailService) mailService: MailService,
  ) {
    this.usersRepository = usersRepository;
    this.dreamsRepository = dreamsRepository;
    this.proposalsRepository = proposalsRepository;
    this.conversationsRepository = conversationsRepository;
    this.managedPatientsRepository = managedPatientsRepository;
    this.messagesRepository = messagesRepository;
    this.contactMessagesRepository = contactMessagesRepository;
    this.adminInvitesRepository = adminInvitesRepository;
    this.reportsRepository = reportsRepository;
    this.settingsRepository = settingsRepository;
    this.auditLogsRepository = auditLogsRepository;
    this.authService = authService;
    this.mailService = mailService;
  }

  async overview() {
    const [
      users,
      dreams,
      proposals,
      conversations,
      messages,
      reports,
      contactMessages,
      auditLogs,
      adminInvites,
    ] = await Promise.all([
      this.usersRepository.find({ order: { createdAt: 'DESC' } }),
      this.dreamsRepository.find({ order: { createdAt: 'DESC' } }),
      this.proposalsRepository.find({ order: { createdAt: 'DESC' } }),
      this.conversationsRepository.find({ order: { createdAt: 'DESC' } }),
      this.messagesRepository.find({ order: { createdAt: 'DESC' } }),
      this.reportsRepository.find({ order: { createdAt: 'DESC' } }),
      this.contactMessagesRepository.find({ order: { createdAt: 'DESC' } }),
      this.auditLogsRepository.find({ order: { createdAt: 'DESC' }, take: 5 }),
      this.adminInvitesRepository.find({ order: { createdAt: 'DESC' }, take: 5 }),
    ]);

    const openReports = reports.filter((report) => report.status === 'aberto');
    const moderatedMessages = messages.filter((message) => message.moderated);
    const chatReportIds = reports
      .filter((report) => report.targetType === 'chat')
      .map((report) => report.targetId);
    const moderatedConversationIds = new Set([
      ...moderatedMessages.map((message) => message.conversationId),
      ...chatReportIds,
    ]);
    const recentModeratedConversations = conversations
      .filter((conversation) => moderatedConversationIds.has(conversation.id))
      .sort((first, second) =>
        this.getLastModerationTimestamp(second.id, moderatedMessages, reports) -
        this.getLastModerationTimestamp(first.id, moderatedMessages, reports),
      )
      .slice(0, 4);
    const recurringReportedTargets = this.buildRecurringReportedTargets(reports);
    const pendingInstitutions = users.filter((user) => user.role === 'instituicao' && !user.approved);
    const newContactMessages = contactMessages.filter((message) => message.status === 'novo');
    const pausedDreams = dreams.filter((dream) => dream.status === 'pausado');
    const proposalsInReview = proposals.filter((proposal) => proposal.status === 'em-analise');
    const recentSuspensionThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const suspendedUsersRecent = users.filter((user) =>
      user.suspended &&
      user.suspendedAt &&
      user.suspendedAt.getTime() >= recentSuspensionThreshold,
    );
    const recentModeratedChats = await Promise.all(
      recentModeratedConversations.map((conversation) => this.buildChatDetailResponse(conversation)),
    );
    const backlog =
      openReports.length +
      pendingInstitutions.length +
      newContactMessages.length +
      pausedDreams.length +
      proposalsInReview.length;

    return {
      totalUsers: users.length,
      totalDreams: dreams.length,
      totalProposals: proposals.length,
      totalChats: conversations.length,
      totalReportsOpen: openReports.length,
      generatedAt: new Date().toISOString(),
      environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development',
      systemStatus: {
        api: 'online',
        email: this.getMailStatus(),
        dataMode: process.env.APP_ENV === 'sandbox' ? 'sandbox' : 'database',
      },
      workQueues: {
        reportsOpen: openReports.length,
        institutionsPendingApproval: pendingInstitutions.length,
        chatsWithModeration: moderatedConversationIds.size,
        contactMessagesNew: newContactMessages.length,
        dreamsPaused: pausedDreams.length,
        proposalsInReview: proposalsInReview.length,
      },
      health: {
        usersByRole: this.countBy(users, 'role'),
        dreamsByStatus: this.countBy(dreams, 'status'),
        proposalsByStatus: this.countBy(proposals, 'status'),
        activeChats: conversations.filter((conversation) => conversation.status === 'ativa').length,
        closedChats: conversations.filter((conversation) => conversation.status === 'encerrada').length,
        backlog,
      },
      riskCare: {
        moderatedMessages: moderatedMessages.length,
        suspendedUsersRecent: suspendedUsersRecent.length,
        recurringReportedTargets,
      },
      recent: {
        auditLogs: auditLogs.map((log) => this.serializeAuditLog(log)),
        reports: reports.slice(0, 5).map((report) => this.serializeReportSummary(report)),
        moderatedChats: recentModeratedChats,
        adminInvites: adminInvites.map((invite) => ({
          id: invite.id,
          email: invite.email,
          expiresAt: invite.expiresAt,
          usedAt: invite.usedAt,
          createdAt: invite.createdAt,
        })),
      },
    };
  }

  async getSettings() {
    const settings = await this.requireSettings();
    return this.serializeSettings(settings);
  }

  async updateSettings(currentUser: JwtPayload, dto: UpdateAdminSettingsDto) {
    const settings = await this.requireSettings();
    settings.blockedWords = dto.blockedWords.map((word) => word.trim()).filter(Boolean);
    settings.rules = dto.rules.map((rule) => ({
      id: rule.id.trim(),
      label: rule.label.trim(),
      description: rule.description.trim(),
      enabled: rule.enabled,
    }));
    settings.categories = dto.categories.map((category) => ({
      id: category.id.trim(),
      name: category.name.trim(),
    }));
    settings.institutionalTexts = dto.institutionalTexts.map((text) => ({
      id: text.id.trim(),
      label: text.label.trim(),
      text: text.text.trim(),
    }));

    const saved = await this.settingsRepository.save(settings);

    await this.logAction(currentUser, {
      action: 'Configurações atualizadas',
      target: 'Configurações administrativas',
      type: 'configuracao',
      severity: 'media',
      outcome: 'ok',
      details: 'Regras, categorias e textos institucionais persistidos via painel.',
      refPath: '/admin/configuracoes',
      refId: saved.id,
    });

    return this.serializeSettings(saved);
  }

  async listUsers(query: Record<string, string | undefined> = {}) {
    const pagination = parsePagination(query);
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.role != :adminRole', { adminRole: 'admin' })
      .orderBy('user.createdAt', 'DESC');

    const searchTerm = normalizeQueryTerm(query.query);
    if (searchTerm) {
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('LOWER(user.name) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(user.email) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(user.city) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(user.state) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` });
        }),
      );
    }

    if (query.role && ['paciente', 'apoiador', 'instituicao'].includes(query.role)) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.status === 'ativo') {
      qb.andWhere('user.suspended = :suspended', { suspended: false });
    } else if (query.status === 'suspenso') {
      qb.andWhere('user.suspended = :suspended', { suspended: true });
    }

    if (query.approval === 'aprovado') {
      qb.andWhere('user.approved = :approved', { approved: true });
    } else if (query.approval === 'pendente') {
      qb.andWhere('user.approved = :approved', { approved: false });
    }

    if (query.verification === 'verificado') {
      qb.andWhere('user.verified = :verified', { verified: true });
    } else if (query.verification === 'pendente') {
      qb.andWhere('user.verified = :verified', { verified: false });
    }

    const [users, total] = await qb
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getManyAndCount();

    return buildPaginatedResult(
      users.map((user) => this.serializeAdminUserSummary(user)),
      pagination.page,
      pagination.pageSize,
      total,
    );
  }

  async getUserDetail(userId: string) {
    const user = await this.requireNonAdminUser(userId);
    return this.buildUserDetail(user);
  }

  async updateUser(currentUser: JwtPayload, userId: string, dto: UpdateUserDto) {
    const user = await this.requireNonAdminUser(userId);

    if (dto.email !== undefined) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      if (!normalizedEmail) {
        throw new BadRequestException('Email is required');
      }

      const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
      if (existing && existing.id !== user.id) {
        throw new ConflictException('Email already registered');
      }

      user.email = normalizedEmail;
    }

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();
      if (!normalizedName) {
        throw new BadRequestException('Name is required');
      }
      user.name = normalizedName;
    }

    if (dto.state !== undefined) {
      user.state = normalizeLocationPart(dto.state);
    }

    if (dto.city !== undefined) {
      user.city = normalizeLocationPart(dto.city);
    }

    if (dto.verified !== undefined) {
      user.verified = dto.verified;
    }

    if (dto.approved !== undefined) {
      if (user.role !== 'instituicao') {
        throw new BadRequestException('Only institution accounts can change approval state');
      }

      user.approved = dto.approved;
      user.approvedAt = dto.approved ? user.approvedAt ?? new Date() : (null as unknown as Date | undefined);
    }

    const hasInstitutionFields =
      dto.institutionType !== undefined ||
      dto.institutionResponsibleName !== undefined ||
      dto.institutionResponsiblePhone !== undefined ||
      dto.institutionDescription !== undefined;

    if (hasInstitutionFields && user.role !== 'instituicao') {
      throw new BadRequestException('Only institution accounts can update institution fields');
    }

    if (user.role === 'instituicao') {
      if (dto.institutionType !== undefined) {
        user.institutionType = this.normalizeOptionalText(dto.institutionType);
      }
      if (dto.institutionResponsibleName !== undefined) {
        user.institutionResponsibleName = this.normalizeOptionalText(dto.institutionResponsibleName);
      }
      if (dto.institutionResponsiblePhone !== undefined) {
        user.institutionResponsiblePhone = this.normalizeOptionalText(dto.institutionResponsiblePhone);
      }
      if (dto.institutionDescription !== undefined) {
        user.institutionDescription = this.normalizeOptionalText(dto.institutionDescription);
      }
    }

    const saved = await this.usersRepository.save(user);

    await this.logAction(currentUser, {
      action: 'Usuário atualizado',
      target: `${saved.name} (${saved.id})`,
      type: 'usuario',
      severity: 'media',
      outcome: 'ok',
      details: 'Dados cadastrais atualizados via painel administrativo.',
      refPath: '/admin/usuarios',
      refId: saved.id,
    });

    return this.getUserDetail(saved.id);
  }

  async listAdmins() {
    const admins = await this.usersRepository.find({
      where: { role: 'admin' },
      order: { createdAt: 'DESC' },
    });
    return admins.map((user) => this.serializeAdminUserSummary(user));
  }

  async listAdminsPage(query: Record<string, string | undefined> = {}) {
    const pagination = parsePagination(query);
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'admin' })
      .orderBy('user.createdAt', 'DESC');

    const searchTerm = normalizeQueryTerm(query.query);
    if (searchTerm) {
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('LOWER(user.name) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(user.email) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(user.city) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(user.state) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` });
        }),
      );
    }

    if (query.status === 'ativo') {
      qb.andWhere('user.suspended = :suspended', { suspended: false });
    } else if (query.status === 'suspenso') {
      qb.andWhere('user.suspended = :suspended', { suspended: true });
    }

    const [admins, total] = await qb
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getManyAndCount();

    return buildPaginatedResult(
      admins.map((user) => this.serializeAdminUserSummary(user)),
      pagination.page,
      pagination.pageSize,
      total,
    );
  }

  async getAdminDetail(userId: string) {
    const adminUser = await this.usersRepository.findOneBy({ id: userId });
    if (!adminUser || adminUser.role !== 'admin') {
      throw new NotFoundException('Admin user not found');
    }

    const securityTrail = await this.auditLogsRepository.find({
      where: { refId: userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      ...this.serializeAdminUserBase(adminUser),
      securityTrail: securityTrail.map((log) => ({
        id: log.id,
        action: log.action,
        details: log.details,
        date: log.createdAt,
        severity: log.severity,
        outcome: log.outcome,
      })),
    };
  }

  async listAdminInvites() {
    const invites = await this.adminInvitesRepository.find({
      order: { expiresAt: 'DESC' },
    });

    const now = new Date();
    return invites
      .filter((invite) => !invite.usedAt && invite.expiresAt > now)
      .map((invite) => ({
        id: invite.id,
        email: invite.email,
        expiresAt: invite.expiresAt,
      }));
  }

  async updateAdmin(currentUser: JwtPayload, userId: string, dto: UpdateAdminDto) {
    const adminUser = await this.usersRepository.findOneBy({ id: userId });
    if (!adminUser || adminUser.role !== 'admin') {
      throw new NotFoundException('Admin user not found');
    }

    const reason = dto.reason?.trim();
    if (dto.isActive === false && !reason) {
      throw new BadRequestException('Reason is required to suspend an admin');
    }

    const requiresCurrentPassword = currentUser.sub !== adminUser.id || dto.newPassword !== undefined;
    if (requiresCurrentPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required for this operation');
      }

      const operator = await this.usersRepository.findOneBy({ id: currentUser.sub });
      if (!operator) {
        throw new NotFoundException('Current admin not found');
      }

      const matches = await bcrypt.compare(dto.currentPassword, operator.passwordHash);
      if (!matches) {
        throw new UnauthorizedException('Current password is invalid');
      }
    }

    const nextRole = dto.role ?? adminUser.role;
    const nextSuspended = dto.isActive === undefined ? adminUser.suspended : !dto.isActive;
    const selfChangeCritical = currentUser.sub === adminUser.id && (nextRole !== 'admin' || nextSuspended);
    if (selfChangeCritical) {
      throw new BadRequestException('You cannot deactivate or change your own admin role');
    }

    if ((nextRole !== 'admin' || nextSuspended) && (await this.wouldLeaveNoActiveAdmins(adminUser.id))) {
      throw new BadRequestException('Cannot remove or deactivate the last active admin');
    }

    if (dto.email) {
      const normalizedEmail = dto.email.toLowerCase();
      const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
      if (existing && existing.id !== adminUser.id) {
        throw new ConflictException('Email already registered');
      }
      adminUser.email = normalizedEmail;
    }

    if (dto.name !== undefined) {
      adminUser.name = dto.name;
    }
    if (dto.role !== undefined) {
      adminUser.role = dto.role;
    }
    if (dto.isActive !== undefined) {
      adminUser.suspended = !dto.isActive;
      adminUser.suspendedAt = dto.isActive ? undefined : new Date();
      adminUser.suspensionReason = dto.isActive ? undefined : reason;
    }
    if (dto.newPassword !== undefined) {
      adminUser.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    }

    const saved = await this.usersRepository.save(adminUser);
    const details = [
      dto.newPassword ? 'senha atualizada' : undefined,
      dto.role !== undefined ? `papel definido como ${dto.role}` : undefined,
      dto.isActive !== undefined ? `status definido como ${dto.isActive ? 'ativo' : 'suspenso'}` : undefined,
      reason ? `motivo: ${reason}` : undefined,
    ].filter(Boolean).join('; ');

    await this.logAction(currentUser, {
      action: 'Admin atualizado',
      target: `${saved.name} (${saved.id})`,
      type: 'admin',
      severity: 'alta',
      outcome: 'ok',
      details: details ? `Dados de admin atualizados via painel: ${details}` : 'Dados de admin atualizados via painel',
      refPath: '/admin/admins',
      refId: saved.id,
    });

    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      verified: saved.verified,
      approved: saved.approved,
      approvedAt: saved.approvedAt,
      suspended: saved.suspended,
      suspendedAt: saved.suspendedAt,
      createdAt: saved.createdAt,
    };
  }

  async inviteAdmin(currentUser: JwtPayload, dto: InviteAdminDto) {
    const normalizedEmail = dto.email.toLowerCase();
    const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      if (existing.role === 'admin') {
        throw new ConflictException('Email already registered as admin');
      }
      throw new BadRequestException('Email already registered as another user');
    }

    await this.adminInvitesRepository.delete({ email: normalizedEmail });

    const rawToken = randomBytes(32).toString('hex');
    const expiresInHours = 48;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const invite = this.adminInvitesRepository.create({
      email: normalizedEmail,
      tokenHash: await bcrypt.hash(rawToken, 10),
      invitedByUserId: currentUser.sub,
      expiresAt,
    });
    const saved = await this.adminInvitesRepository.save(invite);

    const baseUrl = (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
    const inviteUrl = `${baseUrl}/aceitar-convite-admin?email=${encodeURIComponent(
      normalizedEmail,
    )}&token=${encodeURIComponent(rawToken)}`;

    try {
      await this.mailService.sendAdminInviteEmail({
        to: normalizedEmail,
        inviteUrl,
        expiresInHours,
      });
    } catch (error) {
      await this.adminInvitesRepository.delete({ id: saved.id });
      throw error;
    }

    await this.logAction(currentUser, {
      action: 'Convite de admin enviado',
      target: normalizedEmail,
      type: 'admin',
      severity: 'media',
      outcome: 'ok',
      details: `Convite com validade até ${expiresAt.toISOString()}`,
      refPath: '/admin/admins',
      refId: saved.id,
    });

    return {
      id: saved.id,
      email: saved.email,
      expiresAt: saved.expiresAt,
    };
  }

  async suspendUser(currentUser: JwtPayload, userId: string, dto: SuspendUserDto) {
    const user = await this.requireNonAdminUser(userId);

    user.suspended = true;
    user.suspensionReason = dto.reason;
    user.suspendedAt = new Date();

    const saved = await this.usersRepository.save(user);

    await this.logAction(currentUser, {
      action: 'Conta suspensa',
      target: `${saved.name} (${saved.id})`,
      type: 'usuario',
      severity: 'alta',
      outcome: 'warn',
      details: dto.reason,
      refPath: '/admin/usuarios',
      refId: saved.id,
    });

    return {
      id: saved.id,
      suspended: saved.suspended,
      suspensionReason: saved.suspensionReason,
      suspendedAt: saved.suspendedAt,
    };
  }

  async approveUser(currentUser: JwtPayload, userId: string) {
    const user = await this.requireNonAdminUser(userId);
    if (user.role !== 'instituicao') {
      throw new BadRequestException('Only institution accounts require manual approval');
    }

    user.approved = true;
    user.approvedAt = user.approvedAt ?? new Date();
    const saved = await this.usersRepository.save(user);

    await this.logAction(currentUser, {
      action: 'Instituição aprovada',
      target: `${saved.name} (${saved.id})`,
      type: 'usuario',
      severity: 'media',
      outcome: 'ok',
      details: 'Conta institucional aprovada manualmente.',
      refPath: '/admin/usuarios',
      refId: saved.id,
    });

    return {
      id: saved.id,
      role: saved.role,
      approved: saved.approved,
      approvedAt: saved.approvedAt,
    };
  }

  async reactivateUser(currentUser: JwtPayload, userId: string, dto: ReactivateUserDto) {
    const user = await this.requireNonAdminUser(userId);
    if (!user.suspended) {
      throw new BadRequestException('User is not suspended');
    }

    user.suspended = false;
    user.suspensionReason = null as unknown as string | undefined;
    user.suspendedAt = null as unknown as Date | undefined;

    const saved = await this.usersRepository.save(user);

    await this.logAction(currentUser, {
      action: 'Conta reativada',
      target: `${saved.name} (${saved.id})`,
      type: 'usuario',
      severity: 'media',
      outcome: 'ok',
      details: dto.reason,
      refPath: '/admin/usuarios',
      refId: saved.id,
    });

    return {
      id: saved.id,
      suspended: saved.suspended,
      suspensionReason: saved.suspensionReason,
      suspendedAt: saved.suspendedAt,
    };
  }

  async resetUserPassword(currentUser: JwtPayload, userId: string, dto: ResetUserPasswordDto) {
    const user = await this.requireNonAdminUser(userId);
    if (dto.mode === 'reset-link') {
      const response = await this.authService.issueAdminPasswordResetLink(user, currentUser.sub);

      await this.logAction(currentUser, {
        action: 'Senha resetada por admin',
        target: `${user.name} (${user.id})`,
        type: 'usuario',
        severity: 'alta',
        outcome: 'ok',
        details: 'link administrativo de redefinição enviado por email.',
        refPath: '/admin/usuarios',
        refId: user.id,
      });

      return {
        id: user.id,
        mode: 'reset-link',
        delivery: response.delivery,
        email: response.email,
        expiresAt: response.expiresAt,
      };
    }

    if (!dto.newPassword) {
      throw new BadRequestException('New password is required for manual reset');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.sessionVersion = (user.sessionVersion ?? 0) + 1;
    const saved = await this.usersRepository.save(user);

    await this.logAction(currentUser, {
      action: 'Senha resetada por admin',
      target: `${saved.name} (${saved.id})`,
      type: 'usuario',
      severity: 'alta',
      outcome: 'ok',
      details: 'Senha definida manualmente via painel administrativo.',
      refPath: '/admin/usuarios',
      refId: saved.id,
    });

    return {
      id: saved.id,
      mode: dto.mode,
    };
  }

  async listDreams(query: Record<string, string | undefined> = {}) {
    const [dreams, proposals, conversations, reports] = await Promise.all([
      this.dreamsRepository.find({ order: { createdAt: 'DESC' } }),
      this.proposalsRepository.find({ order: { createdAt: 'DESC' } }),
      this.conversationsRepository.find({ order: { createdAt: 'DESC' } }),
      this.reportsRepository.find({ order: { createdAt: 'DESC' } }),
    ]);

    const proposalsByDreamId = this.groupBy(proposals, (proposal) => proposal.dreamId);
    const conversationsByDreamId = this.groupBy(conversations, (conversation) => conversation.dreamId);
    const relatedReportIdsByDreamId = this.buildRelatedReportIdsByDreamId(dreams, proposals, conversations, reports);

    const normalizedQuery = this.normalizeSearchValue(query.query);
    const normalizedStatus = normalizeQueryTerm(query.status);
    const normalizedCategory = this.normalizeSearchValue(query.category);
    const normalizedFormat = normalizeQueryTerm(query.format);
    const normalizedUrgency = normalizeQueryTerm(query.urgency);
    const normalizedPrivacy = normalizeQueryTerm(query.privacy);
    const normalizedLocation = this.normalizeSearchValue(query.location);
    const reportFilter = normalizeQueryTerm(query.report);
    const proposalFilter = normalizeQueryTerm(query.proposal);

    const items = dreams
      .map((dream) =>
        this.serializeDreamSummary(
          dream,
          proposalsByDreamId.get(dream.id) ?? [],
          conversationsByDreamId.get(dream.id) ?? [],
          relatedReportIdsByDreamId.get(dream.id)?.size ?? 0,
        ),
      )
      .filter((dream) => {
        if (
          !this.matchesSearch(
            [
              dream.title,
              dream.category,
              dream.patientName,
              dream.operatorName,
              dream.managedPatientName,
              dream.institutionName,
              dream.city,
              dream.state,
              dream.locationLabel,
            ],
            normalizedQuery,
          )
        ) {
          return false;
        }
        if (normalizedStatus && dream.status !== normalizedStatus) return false;
        if (normalizedCategory && !this.matchesSearch([dream.category], normalizedCategory)) return false;
        if (normalizedFormat && dream.format !== normalizedFormat) return false;
        if (normalizedUrgency && dream.urgency !== normalizedUrgency) return false;
        if (normalizedPrivacy && dream.privacy !== normalizedPrivacy) return false;
        if (!this.matchesSearch([dream.city, dream.state, dream.locationLabel], normalizedLocation)) return false;
        if (reportFilter === 'true' && (dream.reportCount ?? 0) === 0) return false;
        if (reportFilter === 'false' && (dream.reportCount ?? 0) > 0) return false;
        if (proposalFilter === 'with' && (dream.proposalCount ?? 0) === 0) return false;
        if (proposalFilter === 'without' && (dream.proposalCount ?? 0) > 0) return false;
        return this.isWithinDateRange(new Date(dream.createdAt), query.dateFrom, query.dateTo);
      });

    return this.paginateCollection(items, query);
  }

  async getDreamDetail(dreamId: string) {
    const dream = await this.dreamsRepository.findOne({ where: { id: dreamId } });
    if (!dream) {
      throw new NotFoundException('Dream not found');
    }

    const [proposals, conversations, allReports] = await Promise.all([
      this.proposalsRepository.find({
        where: { dreamId },
        order: { createdAt: 'DESC' },
      }),
      this.conversationsRepository.find({
        where: { dreamId },
        order: { createdAt: 'DESC' },
      }),
      this.reportsRepository.find({ order: { createdAt: 'DESC' } }),
    ]);
    const conversation = conversations[0] ?? null;
    const relatedReports = this.filterReportsForDream(dream, proposals, conversations, allReports);
    const serializedSummary = this.serializeDreamSummary(dream, proposals, conversations, relatedReports.length);
    const serializedReports = await Promise.all(
      relatedReports.map(async (report) => this.serializeReportSummary(report, await this.buildReportTargetSummary(report))),
    );

    return {
      ...serializedSummary,
      description: dream.description,
      relatedProposals: proposals.map((proposal) => ({
        id: proposal.id,
        supporterId: proposal.supporterId,
        supporterName: proposal.supporter?.name,
        status: proposal.status,
        message: proposal.message,
        offering: proposal.offering,
        availability: proposal.availability,
        duration: proposal.duration,
        createdAt: proposal.createdAt,
      })),
      linkedConversation: conversation
        ? await this.buildChatDetailResponse(conversation)
        : null,
      relatedReports: serializedReports,
    };
  }

  async updateDreamStatus(currentUser: JwtPayload, dreamId: string, dto: UpdateDreamStatusDto) {
    const dream = await this.dreamsRepository.findOneBy({ id: dreamId });
    if (!dream) {
      throw new NotFoundException('Dream not found');
    }

    dream.status = dto.status;
    const saved = await this.dreamsRepository.save(dream);

    await this.logAction(currentUser, {
      action: 'Status de sonho alterado',
      target: `${saved.title} (${saved.id})`,
      type: 'sonho',
      severity: 'media',
      outcome: 'ok',
      details: dto.reason ?? `Status atualizado para ${dto.status}`,
      refPath: '/admin/sonhos',
      refId: saved.id,
    });

    return {
      id: saved.id,
      status: saved.status,
      updatedAt: saved.updatedAt,
    };
  }

  async listProposals(query: Record<string, string | undefined> = {}) {
    const [proposals, conversations, reports] = await Promise.all([
      this.proposalsRepository.find({ order: { createdAt: 'DESC' } }),
      this.conversationsRepository.find({ order: { createdAt: 'DESC' } }),
      this.reportsRepository.find({ order: { createdAt: 'DESC' } }),
    ]);
    const normalizedQuery = this.normalizeSearchValue(query.query);
    const normalizedStatus = normalizeQueryTerm(query.status);
    const normalizedSupporter = this.normalizeSearchValue(query.supporter);
    const normalizedDream = this.normalizeSearchValue(query.dream);
    const normalizedLocation = this.normalizeSearchValue(query.location);
    const conversationFilter = normalizeQueryTerm(query.conversation);
    const reportFilter = normalizeQueryTerm(query.report);
    const riskFilter = normalizeQueryTerm(query.risk);

    const items = proposals
      .map((proposal) => {
        const relatedConversation = this.findConversationForProposal(proposal, conversations);
        const relatedReports = this.filterReportsForProposal(proposal, relatedConversation, reports);
        return this.serializeProposalSummary(proposal, relatedConversation, relatedReports);
      })
      .filter((proposal) => {
        if (
          !this.matchesSearch(
            [
              proposal.message,
              proposal.offering,
              proposal.availability,
              proposal.duration,
              proposal.supporterName,
              proposal.supporterEmail,
              proposal.dreamTitle,
              proposal.dreamCategory,
              proposal.locationLabel,
            ],
            normalizedQuery,
          )
        ) {
          return false;
        }
        if (normalizedStatus && proposal.status !== normalizedStatus) return false;
        if (!this.matchesSearch([proposal.supporterName, proposal.supporterEmail], normalizedSupporter)) {
          return false;
        }
        if (!this.matchesSearch([proposal.dreamTitle, proposal.dreamCategory], normalizedDream)) {
          return false;
        }
        if (!this.matchesSearch([proposal.city, proposal.state, proposal.locationLabel], normalizedLocation)) {
          return false;
        }
        if (conversationFilter === 'true' && !proposal.conversationId) return false;
        if (conversationFilter === 'false' && proposal.conversationId) return false;
        if (reportFilter === 'true' && (proposal.reportCount ?? 0) === 0) return false;
        if (reportFilter === 'false' && (proposal.reportCount ?? 0) > 0) return false;
        if (riskFilter && proposal.riskLevel !== riskFilter) return false;
        return this.isWithinDateRange(new Date(proposal.createdAt), query.dateFrom, query.dateTo);
      });

    return this.paginateCollection(items, query);
  }

  async getProposalDetail(proposalId: string) {
    const proposal = await this.proposalsRepository.findOne({ where: { id: proposalId } });
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    const [conversations, reports] = await Promise.all([
      this.conversationsRepository.find({ where: { dreamId: proposal.dreamId }, order: { createdAt: 'DESC' } }),
      this.reportsRepository.find({ order: { createdAt: 'DESC' } }),
    ]);
    const relatedConversation = this.findConversationForProposal(proposal, conversations);
    const relatedReports = this.filterReportsForProposal(proposal, relatedConversation, reports);
    const serializedReports = await Promise.all(
      relatedReports.map(async (report) => this.serializeReportSummary(report, await this.buildReportTargetSummary(report))),
    );

    return {
      ...this.serializeProposalSummary(proposal, relatedConversation, relatedReports),
      dreamStatus: proposal.dream?.status,
      supporterEmail: proposal.supporter?.email,
      relatedConversation: relatedConversation ? await this.buildChatDetailResponse(relatedConversation) : null,
      relatedReports: serializedReports,
    };
  }

  async updateProposalStatus(currentUser: JwtPayload, proposalId: string, dto: UpdateProposalStatusDto) {
    const proposal = await this.proposalsRepository.findOneBy({ id: proposalId });
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    proposal.status = dto.status;
    const saved = await this.proposalsRepository.save(proposal);

    await this.logAction(currentUser, {
      action: 'Status de proposta alterado',
      target: `${saved.id}`,
      type: 'proposta',
      severity: 'media',
      outcome: 'ok',
      details: dto.reason ?? `Status atualizado para ${dto.status}`,
      refPath: '/admin/propostas',
      refId: saved.id,
    });

    return {
      id: saved.id,
      status: saved.status,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async listMessages(query: Record<string, string | undefined> = {}) {
    const messages = await this.contactMessagesRepository.find({ order: { createdAt: 'DESC' } });
    const normalizedQuery = this.normalizeSearchValue(query.query);
    const normalizedStatus = normalizeQueryTerm(query.status);
    const normalizedEmail = this.normalizeSearchValue(query.email);

    const items = messages
      .filter((message) => {
        if (
          !this.matchesSearch(
            [message.name, message.email, message.subject, message.body],
            normalizedQuery,
          )
        ) {
          return false;
        }
        if (normalizedStatus && message.status !== normalizedStatus) return false;
        if (!this.matchesSearch([message.email, message.name], normalizedEmail)) return false;
        return this.isWithinDateRange(message.createdAt, query.dateFrom, query.dateTo);
      })
      .map((message) => ({
        id: message.id,
        name: message.name,
        email: message.email,
        subject: message.subject,
        status: message.status,
        createdAt: message.createdAt,
      }));

    return this.paginateCollection(items, query);
  }

  async getMessageDetail(messageId: string) {
    const message = await this.contactMessagesRepository.findOneBy({ id: messageId });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return {
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      body: message.body,
      status: message.status,
      createdAt: message.createdAt,
    };
  }

  async listChats(query: Record<string, string | undefined> = {}) {
    const [conversations, messages] = await Promise.all([
      this.conversationsRepository.find({ order: { createdAt: 'DESC' } }),
      this.messagesRepository.find({ order: { createdAt: 'DESC' } }),
    ]);

    const messageByConversation = new Map<string, Message[]>();
    for (const message of messages) {
      const list = messageByConversation.get(message.conversationId) ?? [];
      list.push(message);
      messageByConversation.set(message.conversationId, list);
    }

    const [dreams, users, managedPatients, reports] = await Promise.all([
      this.dreamsRepository.findBy({ id: In(conversations.map((conversation) => conversation.dreamId)) }),
      this.usersRepository.findBy({
        id: In(
          [...new Set(conversations.flatMap((conversation) => [conversation.patientId, conversation.supporterId]))],
        ),
      }),
      this.managedPatientsRepository.findBy({
        id: In(
          conversations
            .map((conversation) => conversation.managedPatientId)
            .filter((value): value is string => Boolean(value)),
        ),
      }),
      this.reportsRepository.find({ order: { createdAt: 'DESC' } }),
    ]);

    const dreamsById = new Map(dreams.map((dream) => [dream.id, dream]));
    const usersById = new Map(users.map((user) => [user.id, user]));
    const managedPatientsById = new Map(managedPatients.map((patient) => [patient.id, patient]));
    const reportsByConversationId = new Map<string, AdminReport[]>();

    for (const report of reports) {
      if (report.targetType !== 'chat') continue;
      const bucket = reportsByConversationId.get(report.targetId) ?? [];
      bucket.push(report);
      reportsByConversationId.set(report.targetId, bucket);
    }

    const normalizedQuery = this.normalizeSearchValue(query.query);
    const normalizedStatus = normalizeQueryTerm(query.status);
    const normalizedDream = this.normalizeSearchValue(query.dream);
    const normalizedPatient = this.normalizeSearchValue(query.patient);
    const normalizedSupporter = this.normalizeSearchValue(query.supporter);
    const normalizedEntity = this.normalizeSearchValue(query.entity);
    const moderatedFilter = normalizeQueryTerm(query.moderated);
    const reportFilter = normalizeQueryTerm(query.report);
    const riskFilter = normalizeQueryTerm(query.risk);
    const unansweredFilter = normalizeQueryTerm(query.unanswered);
    const now = Date.now();
    const unansweredThresholdHours: Record<string, number> = {
      '24h': 24,
      '72h': 72,
      '7d': 168,
    };
    const chatRisk = (chat: { hasModeratedMessages: boolean; hasModerationReport: boolean }) => {
      if (chat.hasModeratedMessages && chat.hasModerationReport) return 'high';
      if (chat.hasModeratedMessages || chat.hasModerationReport) return 'medium';
      return 'low';
    };

    const items = conversations
      .map((conversation) =>
        this.buildChatSummary(
          conversation,
          messageByConversation.get(conversation.id) ?? [],
          reportsByConversationId.get(conversation.id) ?? [],
          dreamsById.get(conversation.dreamId),
          usersById.get(conversation.patientId),
          usersById.get(conversation.supporterId),
          conversation.managedPatientId ? managedPatientsById.get(conversation.managedPatientId) : undefined,
        ),
      )
      .filter((chat) => {
        if (
          !this.matchesSearch(
            [
              chat.dreamTitle,
              chat.patientName,
              chat.managedPatientName,
              chat.institutionName,
              chat.supporterName,
              chat.lastMessagePreview,
            ],
            normalizedQuery,
          )
        ) {
          return false;
        }
        if (normalizedStatus && chat.status !== normalizedStatus) return false;
        if (!this.matchesSearch([chat.dreamTitle], normalizedDream)) return false;
        if (!this.matchesSearch([chat.patientName, chat.institutionName], normalizedPatient)) return false;
        if (!this.matchesSearch([chat.supporterName], normalizedSupporter)) return false;
        if (
          !this.matchesSearch(
            [chat.dreamTitle, chat.patientName, chat.managedPatientName, chat.institutionName, chat.supporterName],
            normalizedEntity,
          )
        ) {
          return false;
        }
        if (moderatedFilter === 'true' && !chat.hasModeratedMessages) return false;
        if (moderatedFilter === 'false' && chat.hasModeratedMessages) return false;
        if (reportFilter === 'true' && !chat.hasModerationReport) return false;
        if (reportFilter === 'false' && chat.hasModerationReport) return false;
        if (riskFilter && chatRisk(chat) !== riskFilter) return false;
        if (unansweredFilter && unansweredThresholdHours[unansweredFilter]) {
          const lastActivity = new Date(chat.lastMessageAt ?? chat.createdAt).getTime();
          if (Number.isNaN(lastActivity)) return false;
          if (now - lastActivity < unansweredThresholdHours[unansweredFilter] * 60 * 60 * 1000) return false;
        }
        return this.isWithinDateRange(chat.createdAt, query.dateFrom, query.dateTo);
      });

    return this.paginateCollection(items, query);
  }

  async getChatDetail(chatId: string) {
    const conversation = await this.conversationsRepository.findOneBy({ id: chatId });
    if (!conversation) {
      throw new NotFoundException('Chat not found');
    }

    return this.buildChatDetailResponse(conversation);
  }

  async closeChat(currentUser: JwtPayload, chatId: string, dto: CloseChatDto) {
    const conversation = await this.conversationsRepository.findOneBy({ id: chatId });
    if (!conversation) {
      throw new NotFoundException('Chat not found');
    }

    conversation.status = 'encerrada';
    await this.conversationsRepository.save(conversation);

    const report = this.reportsRepository.create({
      type: 'chat-moderation',
      targetType: 'chat',
      targetId: conversation.id,
      reason: dto.reason,
      status: 'aberto',
    });
    await this.reportsRepository.save(report);

    await this.logAction(currentUser, {
      action: 'Chat encerrado',
      target: conversation.id,
      type: 'chat',
      severity: 'alta',
      outcome: 'warn',
      details: dto.reason,
      refPath: '/admin/chats',
      refId: conversation.id,
    });

    return {
      id: conversation.id,
      status: conversation.status,
    };
  }

  async listReports(query: Record<string, string | undefined> = {}) {
    const reports = await this.reportsRepository.find({ order: { createdAt: 'DESC' } });
    const normalizedQuery = this.normalizeSearchValue(query.query);
    const normalizedStatus = normalizeQueryTerm(query.status);
    const normalizedSeverity = normalizeQueryTerm(query.severity);
    const normalizedType = this.normalizeSearchValue(query.type);
    const normalizedTargetType = normalizeQueryTerm(query.targetType);
    const normalizedEntity = this.normalizeSearchValue(query.entity);

    const enrichedReports = await Promise.all(
      reports.map(async (report) => ({
        report,
        targetSummary: await this.buildReportTargetSummary(report),
      })),
    );

    const items = enrichedReports
      .filter(({ report, targetSummary }) => {
        const summary = this.serializeReportSummary(report, targetSummary);
        const targetSearchValues = this.reportTargetSearchValues(targetSummary);
        if (
          !this.matchesSearch(
            [
              report.type,
              report.targetType,
              report.targetId,
              report.reason,
              report.resolution,
              summary.entityLabel,
              summary.reporterName,
              summary.accusedName,
              ...targetSearchValues,
            ],
            normalizedQuery,
          )
        ) {
          return false;
        }
        if (normalizedStatus && report.status !== normalizedStatus) return false;
        if (normalizedSeverity && summary.severity !== normalizedSeverity) return false;
        if (!this.matchesSearch([report.type], normalizedType)) return false;
        if (normalizedTargetType && report.targetType !== normalizedTargetType) return false;
        if (
          !this.matchesSearch(
            [report.targetType, report.targetId, summary.entityLabel, ...targetSearchValues],
            normalizedEntity,
          )
        ) {
          return false;
        }
        return this.isWithinDateRange(report.createdAt, query.dateFrom, query.dateTo);
      })
      .map(({ report, targetSummary }) => this.serializeReportSummary(report, targetSummary));

    return this.paginateCollection(items, query);
  }

  async getReportDetail(reportId: string) {
    const report = await this.reportsRepository.findOneBy({ id: reportId });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const targetSummary = await this.buildReportTargetSummary(report);
    return this.serializeReportSummary(report, targetSummary);
  }

  async updateReportStatus(currentUser: JwtPayload, reportId: string, dto: UpdateReportStatusDto) {
    const report = await this.reportsRepository.findOneBy({ id: reportId });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = dto.status;
    if (dto.status === 'resolvido') {
      report.resolution = dto.resolution ?? report.resolution ?? 'Resolvido';
      report.resolvedAt = new Date();
    }

    const saved = await this.reportsRepository.save(report);

    await this.logAction(currentUser, {
      action: 'Status de denúncia alterado',
      target: saved.id,
      type: 'denuncia',
      severity: 'media',
      outcome: dto.status === 'resolvido' ? 'ok' : 'warn',
      details: dto.resolution ?? `Status atualizado para ${dto.status}`,
      refPath: '/admin/denuncias',
      refId: saved.id,
    });

    return {
      id: saved.id,
      status: saved.status,
      resolution: saved.resolution,
      resolvedAt: saved.resolvedAt,
    };
  }

  async listAudit() {
    const logs = await this.auditLogsRepository.find({ order: { createdAt: 'DESC' } });
    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      by: log.by,
      target: log.target,
      type: log.type,
      severity: log.severity,
      outcome: log.outcome,
      details: log.details,
      refPath: log.refPath,
      refId: log.refId,
      date: log.createdAt,
    }));
  }

  async listAuditPage(query: Record<string, string | undefined> = {}) {
    const pagination = parsePagination(query);
    const qb = this.auditLogsRepository
      .createQueryBuilder('audit')
      .orderBy('audit.createdAt', 'DESC');

    const searchTerm = normalizeQueryTerm(query.query);
    if (searchTerm) {
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('LOWER(audit.action) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(audit.by) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(audit.target) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(audit.type) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(audit.details) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` })
            .orWhere('LOWER(audit.refId) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` });
        }),
      );
    }

    if (query.type) {
      qb.andWhere('audit.type = :type', { type: query.type });
    }

    if (['alta', 'media', 'baixa'].includes(query.severity ?? '')) {
      qb.andWhere('audit.severity = :severity', { severity: query.severity });
    }

    if (['ok', 'warn', 'danger'].includes(query.outcome ?? '')) {
      qb.andWhere('audit.outcome = :outcome', { outcome: query.outcome });
    }

    if (query.dateFrom) {
      const dateFrom = new Date(query.dateFrom);
      if (!Number.isNaN(dateFrom.valueOf())) {
        qb.andWhere('audit.createdAt >= :dateFrom', { dateFrom });
      }
    }

    if (query.dateTo) {
      const dateTo = new Date(query.dateTo);
      if (!Number.isNaN(dateTo.valueOf())) {
        dateTo.setHours(23, 59, 59, 999);
        qb.andWhere('audit.createdAt <= :dateTo', { dateTo });
      }
    }

    const [logs, total] = await qb
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getManyAndCount();

    return buildPaginatedResult(
      logs.map((log) => this.serializeAuditLog(log)),
      pagination.page,
      pagination.pageSize,
      total,
    );
  }

  listEmailTemplates() {
    return this.mailService.getTemplateCatalog();
  }

  private getMailStatus() {
    if (process.env.APP_ENV === 'sandbox') return 'sandbox';
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) return 'resend';
    if (process.env.SMTP_HOST) return 'smtp';
    if (process.env.NODE_ENV === 'test') return 'test';
    return 'not-configured';
  }

  private countBy<T>(items: T[], field: keyof T) {
    return items.reduce<Record<string, number>>((counts, item) => {
      const value = item[field];
      if (typeof value !== 'string') return counts;
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    }, {});
  }

  private getLastModerationTimestamp(
    conversationId: string,
    moderatedMessages: Message[],
    reports: AdminReport[],
  ) {
    const timestamps = [
      ...moderatedMessages
        .filter((message) => message.conversationId === conversationId)
        .map((message) => message.createdAt.getTime()),
      ...reports
        .filter((report) => report.targetType === 'chat' && report.targetId === conversationId)
        .map((report) => report.createdAt.getTime()),
    ];

    return timestamps.length ? Math.max(...timestamps) : 0;
  }

  private buildRecurringReportedTargets(reports: AdminReport[]) {
    const byTarget = new Map<string, { targetType: string; targetId: string; count: number; latestReason: string }>();

    for (const report of reports) {
      const key = `${report.targetType}:${report.targetId}`;
      const current = byTarget.get(key);
      byTarget.set(key, {
        targetType: report.targetType,
        targetId: report.targetId,
        count: (current?.count ?? 0) + 1,
        latestReason: current?.latestReason ?? report.reason,
      });
    }

    return [...byTarget.values()]
      .filter((target) => target.count > 1)
      .sort((first, second) => second.count - first.count)
      .slice(0, 5);
  }

  private groupBy<T>(items: T[], getKey: (item: T) => string) {
    const grouped = new Map<string, T[]>();
    for (const item of items) {
      const key = getKey(item);
      const bucket = grouped.get(key) ?? [];
      bucket.push(item);
      grouped.set(key, bucket);
    }
    return grouped;
  }

  private serializeDreamSummary(
    dream: Dream,
    proposals: Proposal[] = [],
    conversations: Conversation[] = [],
    reportCount = 0,
  ) {
    const city = dream.managedPatient?.city ?? dream.patient?.city;
    const state = dream.managedPatient?.state ?? dream.patient?.state;

    return {
      id: dream.id,
      title: dream.title,
      originalLanguage: normalizeDreamLanguage(dream.originalLanguage),
      translations: normalizeDreamTranslations(dream.translations),
      category: dream.category,
      format: dream.format,
      urgency: dream.urgency,
      privacy: dream.privacy,
      status: dream.status,
      patientId: dream.managedPatientId ?? dream.patientId,
      patientName: dream.managedPatient?.name ?? dream.patient?.name,
      operatorName: dream.patient?.name,
      managedPatientName: dream.managedPatient?.name,
      institutionName: dream.managedPatientId ? dream.patient?.name : undefined,
      city,
      state,
      locationLabel: buildLocationLabel({ city, state }),
      proposalCount: proposals.length,
      chatCount: conversations.length,
      reportCount,
      createdAt: dream.createdAt,
      updatedAt: dream.updatedAt,
    };
  }

  private findConversationForProposal(proposal: Proposal, conversations: Conversation[]) {
    return (
      conversations.find(
        (conversation) =>
          conversation.dreamId === proposal.dreamId && conversation.supporterId === proposal.supporterId,
      ) ?? null
    );
  }

  private filterReportsForProposal(
    proposal: Proposal,
    conversation: Conversation | null,
    reports: AdminReport[],
  ) {
    return reports.filter((report) => {
      if (report.targetType === 'proposal' && report.targetId === proposal.id) return true;
      if (report.targetType === 'dream' && report.targetId === proposal.dreamId) return true;
      if (conversation && report.targetType === 'chat' && report.targetId === conversation.id) return true;
      return false;
    });
  }

  private proposalRiskLevel(proposal: Proposal, reports: AdminReport[]): AdminProposalRiskLevel {
    if (reports.some((report) => ['critical', 'high'].includes(this.deriveReportSeverity(report)))) {
      return 'high';
    }

    if (reports.length > 0) {
      return 'medium';
    }

    if (proposal.status === 'em-analise') {
      return 'pending';
    }

    return 'low';
  }

  private serializeProposalSummary(
    proposal: Proposal,
    conversation: Conversation | null = null,
    relatedReports: AdminReport[] = [],
  ) {
    const city = proposal.dream?.managedPatient?.city ?? proposal.dream?.patient?.city;
    const state = proposal.dream?.managedPatient?.state ?? proposal.dream?.patient?.state;

    return {
      id: proposal.id,
      dreamId: proposal.dreamId,
      dreamTitle: proposal.dream?.title,
      dreamCategory: proposal.dream?.category,
      dreamStatus: proposal.dream?.status,
      supporterId: proposal.supporterId,
      supporterName: proposal.supporter?.name,
      supporterEmail: proposal.supporter?.email,
      patientName: proposal.dream?.managedPatient?.name ?? proposal.dream?.patient?.name,
      institutionName: proposal.dream?.managedPatientId ? proposal.dream?.patient?.name : undefined,
      city,
      state,
      locationLabel: buildLocationLabel({ city, state }),
      status: proposal.status,
      message: proposal.message,
      offering: proposal.offering,
      availability: proposal.availability,
      duration: proposal.duration,
      conversationId: conversation?.id,
      conversationStatus: conversation?.status,
      reportCount: relatedReports.length,
      riskLevel: this.proposalRiskLevel(proposal, relatedReports),
      createdAt: proposal.createdAt,
      updatedAt: proposal.updatedAt ?? proposal.createdAt,
    };
  }

  private buildRelatedReportIdsByDreamId(
    dreams: Dream[],
    proposals: Proposal[],
    conversations: Conversation[],
    reports: AdminReport[],
  ) {
    const proposalDreamById = new Map(proposals.map((proposal) => [proposal.id, proposal.dreamId]));
    const conversationDreamById = new Map(conversations.map((conversation) => [conversation.id, conversation.dreamId]));
    const dreamIds = new Set(dreams.map((dream) => dream.id));
    const relatedIdsByDreamId = new Map<string, Set<string>>();

    function add(dreamId: string | undefined, reportId: string) {
      if (!dreamId) return;
      const bucket = relatedIdsByDreamId.get(dreamId) ?? new Set<string>();
      bucket.add(reportId);
      relatedIdsByDreamId.set(dreamId, bucket);
    }

    for (const report of reports) {
      if (report.targetType === 'dream' && dreamIds.has(report.targetId)) {
        add(report.targetId, report.id);
      }
      if (report.targetType === 'proposal') {
        add(proposalDreamById.get(report.targetId), report.id);
      }
      if (report.targetType === 'chat') {
        add(conversationDreamById.get(report.targetId), report.id);
      }
    }

    return relatedIdsByDreamId;
  }

  private filterReportsForDream(
    dream: Dream,
    proposals: Proposal[],
    conversations: Conversation[],
    reports: AdminReport[],
  ) {
    const proposalIds = new Set(proposals.map((proposal) => proposal.id));
    const conversationIds = new Set(conversations.map((conversation) => conversation.id));

    return reports.filter((report) => {
      if (report.targetType === 'dream' && report.targetId === dream.id) return true;
      if (report.targetType === 'proposal' && proposalIds.has(report.targetId)) return true;
      if (report.targetType === 'chat' && conversationIds.has(report.targetId)) return true;
      return false;
    });
  }

  private deriveReportSeverity(report: AdminReport): AdminReportSeverity {
    if (report.status === 'resolvido') return 'low';

    const normalized = `${report.type} ${report.targetType} ${report.reason}`.toLowerCase();
    if (
      normalized.includes('critical') ||
      normalized.includes('severe') ||
      normalized.includes('abuso') ||
      normalized.includes('ameaça') ||
      normalized.includes('ameaca')
    ) {
      return 'critical';
    }

    if (
      report.targetType === 'chat' ||
      report.targetType === 'message' ||
      report.targetType === 'user' ||
      normalized.includes('moderation') ||
      normalized.includes('moderação') ||
      normalized.includes('moderacao')
    ) {
      return 'high';
    }

    if (report.targetType === 'dream' || report.targetType === 'proposal') {
      return 'medium';
    }

    return 'medium';
  }

  private reportEntityLabel(report: AdminReport, targetSummary: AdminReportTargetSummary | null) {
    return (
      targetSummary?.dreamTitle ??
      targetSummary?.targetUserName ??
      targetSummary?.senderName ??
      targetSummary?.body?.slice(0, 80) ??
      `${report.targetType}:${report.targetId}`
    );
  }

  private reportAccusedName(targetSummary: AdminReportTargetSummary | null) {
    return (
      targetSummary?.targetUserName ??
      targetSummary?.senderName ??
      targetSummary?.supporterName ??
      targetSummary?.patientName
    );
  }

  private reportTargetSearchValues(targetSummary: AdminReportTargetSummary | null) {
    if (!targetSummary) return [];

    return [
      targetSummary.chatId,
      targetSummary.dreamId,
      targetSummary.dreamTitle,
      targetSummary.patientId,
      targetSummary.patientName,
      targetSummary.institutionName,
      targetSummary.supporterId,
      targetSummary.supporterName,
      targetSummary.messageId,
      targetSummary.conversationId,
      targetSummary.senderId,
      targetSummary.senderName,
      targetSummary.body,
      targetSummary.proposalId,
      targetSummary.targetUserId,
      targetSummary.targetUserName,
      targetSummary.targetUserEmail,
      targetSummary.status,
    ];
  }

  private serializeReportSummary(report: AdminReport, targetSummary: AdminReportTargetSummary | null = null) {
    return {
      id: report.id,
      type: report.type,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      status: report.status,
      severity: this.deriveReportSeverity(report),
      entityLabel: this.reportEntityLabel(report, targetSummary),
      reporterName: undefined,
      accusedName: this.reportAccusedName(targetSummary),
      responsibleName: undefined,
      resolution: report.resolution,
      createdAt: report.createdAt,
      updatedAt: report.resolvedAt ?? report.createdAt,
      resolvedAt: report.resolvedAt,
      targetSummary,
    };
  }

  private serializeAuditLog(log: AuditLog) {
    return {
      id: log.id,
      action: log.action,
      by: log.by,
      target: log.target,
      type: log.type,
      severity: log.severity,
      outcome: log.outcome,
      details: log.details,
      refPath: log.refPath,
      refId: log.refId,
      date: log.createdAt,
    };
  }

  private async logAction(
    currentUser: JwtPayload,
    payload: {
      action: string;
      target: string;
      type: string;
      severity: 'alta' | 'media' | 'baixa';
      outcome: 'ok' | 'warn' | 'danger';
      details: string;
      refPath: string;
      refId?: string;
    },
  ) {
    const actor = await this.usersRepository.findOneBy({ id: currentUser.sub });

    const log = this.auditLogsRepository.create({
      action: payload.action,
      by: actor?.name ?? currentUser.email,
      target: payload.target,
      type: payload.type,
      severity: payload.severity,
      outcome: payload.outcome,
      details: payload.details,
      refPath: payload.refPath,
      refId: payload.refId,
    });

    await this.auditLogsRepository.save(log);
  }

  private serializeAdminUserSummary(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      state: user.state,
      city: user.city,
      locationLabel: buildLocationLabel(user),
      verified: user.verified,
      approved: user.approved,
      approvedAt: user.approvedAt,
      suspended: user.suspended,
      suspensionReason: user.suspensionReason,
      suspendedAt: user.suspendedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private serializeAdminUserBase(user: User) {
    return {
      ...this.serializeAdminUserSummary(user),
      emailNotificationsEnabled: user.emailNotificationsEnabled,
      institutionType: user.institutionType,
      institutionResponsibleName: user.institutionResponsibleName,
      institutionResponsiblePhone: user.institutionResponsiblePhone,
      institutionDescription: user.institutionDescription,
    };
  }

  private async buildUserDetail(user: User) {
    return {
      ...this.serializeAdminUserBase(user),
      ...(await this.buildUserActivity(user)),
    };
  }

  private async buildUserActivity(user: User) {
    if (user.role === 'apoiador') {
      return this.buildSupporterActivity(user);
    }

    if (user.role === 'instituicao') {
      return this.buildInstitutionActivity(user);
    }

    return this.buildPatientActivity(user);
  }

  private async buildPatientActivity(user: User) {
    const [dreamsCount, proposalsCount, conversationsCount, activeConversationsCount, recentDreams, recentProposals, recentConversations] =
      await Promise.all([
        this.dreamsRepository.count({ where: { patientId: user.id } }),
        this.proposalsRepository
          .createQueryBuilder('proposal')
          .leftJoin('proposal.dream', 'dream')
          .where('dream.patientId = :patientId', { patientId: user.id })
          .getCount(),
        this.conversationsRepository.count({ where: { patientId: user.id } }),
        this.conversationsRepository.count({ where: { patientId: user.id, status: 'ativa' } }),
        this.dreamsRepository.find({
          where: { patientId: user.id },
          order: { updatedAt: 'DESC' },
          take: 5,
        }),
        this.proposalsRepository
          .createQueryBuilder('proposal')
          .leftJoinAndSelect('proposal.dream', 'dream')
          .leftJoinAndSelect('proposal.supporter', 'supporter')
          .where('dream.patientId = :patientId', { patientId: user.id })
          .orderBy('proposal.createdAt', 'DESC')
          .take(5)
          .getMany(),
        this.conversationsRepository.find({
          where: { patientId: user.id },
          order: { createdAt: 'DESC' },
          take: 5,
        }),
      ]);

    return {
      activitySummary: {
        dreams: dreamsCount,
        proposalsReceived: proposalsCount,
        conversations: conversationsCount,
        activeConversations: activeConversationsCount,
      },
      recentDreams: this.serializeDreamActivity(recentDreams),
      recentProposals: this.serializeReceivedProposalActivity(recentProposals),
      recentConversations: await this.serializeConversationActivity(recentConversations, 'supporter'),
    };
  }

  private async buildInstitutionActivity(user: User) {
    const [dreamsCount, proposalsCount, conversationsCount, activeConversationsCount, managedPatientsCount, linkedPatientsCount, supporterConnections, recentDreams, recentProposals, recentConversations] =
      await Promise.all([
        this.dreamsRepository.count({ where: { patientId: user.id } }),
        this.proposalsRepository
          .createQueryBuilder('proposal')
          .leftJoin('proposal.dream', 'dream')
          .where('dream.patientId = :patientId', { patientId: user.id })
          .getCount(),
        this.conversationsRepository.count({ where: { patientId: user.id } }),
        this.conversationsRepository.count({ where: { patientId: user.id, status: 'ativa' } }),
        this.managedPatientsRepository.count({ where: { institutionId: user.id } }),
        this.managedPatientsRepository
          .createQueryBuilder('managedPatient')
          .where('managedPatient.institutionId = :institutionId', { institutionId: user.id })
          .andWhere('managedPatient.linkedUserId IS NOT NULL')
          .getCount(),
        this.proposalsRepository
          .createQueryBuilder('proposal')
          .select('COUNT(DISTINCT proposal.supporterId)', 'count')
          .leftJoin('proposal.dream', 'dream')
          .where('dream.patientId = :patientId', { patientId: user.id })
          .getRawOne<{ count: string }>(),
        this.dreamsRepository.find({
          where: { patientId: user.id },
          order: { updatedAt: 'DESC' },
          take: 5,
        }),
        this.proposalsRepository
          .createQueryBuilder('proposal')
          .leftJoinAndSelect('proposal.dream', 'dream')
          .leftJoinAndSelect('proposal.supporter', 'supporter')
          .where('dream.patientId = :patientId', { patientId: user.id })
          .orderBy('proposal.createdAt', 'DESC')
          .take(5)
          .getMany(),
        this.conversationsRepository.find({
          where: { patientId: user.id },
          order: { createdAt: 'DESC' },
          take: 5,
        }),
      ]);

    return {
      activitySummary: {
        dreams: dreamsCount,
        proposalsReceived: proposalsCount,
        conversations: conversationsCount,
        activeConversations: activeConversationsCount,
        managedPatients: managedPatientsCount,
        linkedPatients: linkedPatientsCount,
        supporterConnections: Number(supporterConnections?.count ?? 0),
      },
      recentDreams: this.serializeDreamActivity(recentDreams),
      recentProposals: this.serializeReceivedProposalActivity(recentProposals),
      recentConversations: await this.serializeConversationActivity(recentConversations, 'supporter'),
    };
  }

  private async buildSupporterActivity(user: User) {
    const [proposalsCount, acceptedProposalsCount, conversationsCount, activeConversationsCount, recentProposals, recentConversations] =
      await Promise.all([
        this.proposalsRepository.count({ where: { supporterId: user.id } }),
        this.proposalsRepository.count({ where: { supporterId: user.id, status: 'aceita' } }),
        this.conversationsRepository.count({ where: { supporterId: user.id } }),
        this.conversationsRepository.count({ where: { supporterId: user.id, status: 'ativa' } }),
        this.proposalsRepository.find({
          where: { supporterId: user.id },
          order: { createdAt: 'DESC' },
          take: 5,
        }),
        this.conversationsRepository.find({
          where: { supporterId: user.id },
          order: { createdAt: 'DESC' },
          take: 5,
        }),
      ]);

    const recentDreams = this.uniqueDreamsFromProposals(recentProposals);

    return {
      activitySummary: {
        proposalsSent: proposalsCount,
        acceptedProposals: acceptedProposalsCount,
        conversations: conversationsCount,
        activeConversations: activeConversationsCount,
      },
      recentDreams: this.serializeDreamActivity(recentDreams),
      recentProposals: this.serializeSentProposalActivity(recentProposals),
      recentConversations: await this.serializeConversationActivity(recentConversations, 'patient'),
    };
  }

  private serializeDreamActivity(dreams: Dream[]) {
    return dreams.map((dream) => ({
      id: dream.id,
      title: dream.title,
      category: dream.category,
      status: dream.status,
      urgency: dream.urgency,
      updatedAt: dream.updatedAt,
    }));
  }

  private serializeReceivedProposalActivity(proposals: Proposal[]) {
    return proposals.map((proposal) => ({
      id: proposal.id,
      dreamId: proposal.dreamId,
      dreamTitle: proposal.dream?.title,
      supporterId: proposal.supporterId,
      supporterName: proposal.supporter?.name,
      status: proposal.status,
      offering: proposal.offering,
      createdAt: proposal.createdAt,
    }));
  }

  private serializeSentProposalActivity(proposals: Proposal[]) {
    return proposals.map((proposal) => ({
      id: proposal.id,
      dreamId: proposal.dreamId,
      dreamTitle: proposal.dream?.title,
      patientId: proposal.dream?.patientId,
      patientName: proposal.dream?.patient?.name,
      status: proposal.status,
      offering: proposal.offering,
      createdAt: proposal.createdAt,
    }));
  }

  private async serializeConversationActivity(
    conversations: Conversation[],
    counterpart: 'supporter' | 'patient',
  ) {
    if (conversations.length === 0) {
      return [];
    }

    const conversationIds = conversations.map((conversation) => conversation.id);
    const dreamIds = [...new Set(conversations.map((conversation) => conversation.dreamId))];
    const counterpartIds = counterpart === 'supporter'
      ? [...new Set(conversations.map((conversation) => conversation.supporterId))]
      : [...new Set(conversations.map((conversation) => conversation.patientId))];

    const [dreams, users, messages] = await Promise.all([
      dreamIds.length ? this.dreamsRepository.findBy({ id: In(dreamIds) }) : Promise.resolve([]),
      counterpartIds.length ? this.usersRepository.findBy({ id: In(counterpartIds) }) : Promise.resolve([]),
      this.messagesRepository.find({
        where: { conversationId: In(conversationIds) },
        order: { createdAt: 'DESC' },
      }),
    ]);

    const dreamsById = new Map(dreams.map((dream) => [dream.id, dream]));
    const usersById = new Map(users.map((user) => [user.id, user]));
    const messagesByConversationId = new Map<string, Message[]>();

    for (const message of messages) {
      const bucket = messagesByConversationId.get(message.conversationId) ?? [];
      bucket.push(message);
      messagesByConversationId.set(message.conversationId, bucket);
    }

    return conversations.map((conversation) => {
      const conversationMessages = messagesByConversationId.get(conversation.id) ?? [];
      return {
        id: conversation.id,
        dreamId: conversation.dreamId,
        dreamTitle: dreamsById.get(conversation.dreamId)?.title,
        supporterId: conversation.supporterId,
        supporterName: counterpart === 'supporter' ? usersById.get(conversation.supporterId)?.name : undefined,
        patientId: counterpart === 'patient' ? conversation.patientId : undefined,
        patientName: counterpart === 'patient' ? usersById.get(conversation.patientId)?.name : undefined,
        status: conversation.status,
        messageCount: conversationMessages.length,
        createdAt: conversation.createdAt,
        lastMessageAt: conversationMessages[0]?.createdAt,
      };
    });
  }

  private uniqueDreamsFromProposals(proposals: Proposal[]) {
    const uniqueDreams: Dream[] = [];
    const seenDreamIds = new Set<string>();

    for (const proposal of proposals) {
      if (!proposal.dream || seenDreamIds.has(proposal.dreamId)) {
        continue;
      }

      seenDreamIds.add(proposal.dreamId);
      uniqueDreams.push(proposal.dream);
      if (uniqueDreams.length === 5) {
        break;
      }
    }

    return uniqueDreams;
  }

  private async requireNonAdminUser(userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user || user.role === 'admin') {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private normalizeOptionalText(value?: string) {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }

  private async wouldLeaveNoActiveAdmins(candidateId: string) {
    const count = await this.usersRepository.count({
      where: {
        role: 'admin',
        suspended: false,
        id: Not(candidateId),
      },
    });
    return count === 0;
  }

  private async requireSettings() {
    let settings = await this.settingsRepository.findOneBy({ id: 'global' });
    if (settings) {
      return settings;
    }

    settings = this.settingsRepository.create({
      id: 'global',
      blockedWords: [...DEFAULT_BLOCKED_WORDS],
      rules: DEFAULT_RULES.map((rule) => ({ ...rule })),
      categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
      institutionalTexts: DEFAULT_INSTITUTIONAL_TEXTS.map((text) => ({ ...text })),
    });

    return this.settingsRepository.save(settings);
  }

  private serializeSettings(settings: AdminSettings) {
    return {
      blockedWords: settings.blockedWords,
      rules: settings.rules,
      categories: settings.categories,
      institutionalTexts: settings.institutionalTexts,
      updatedAt: settings.updatedAt,
    };
  }

  private paginateCollection<T>(items: T[], query: Record<string, string | undefined>) {
    const pagination = parsePagination(query);
    const start = pagination.skip;
    const end = start + pagination.pageSize;
    return buildPaginatedResult(items.slice(start, end), pagination.page, pagination.pageSize, items.length);
  }

  private normalizeSearchValue(value?: string) {
    return normalizeQueryTerm(value)
      ?.normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }

  private matchesSearch(values: Array<string | undefined | null>, term?: string) {
    if (!term) {
      return true;
    }

    return values.some((value) =>
      value
        ?.normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .includes(term),
    );
  }

  private isWithinDateRange(value: Date, dateFrom?: string, dateTo?: string) {
    const target = value.getTime();
    if (dateFrom) {
      const start = new Date(`${dateFrom}T00:00:00.000Z`).getTime();
      if (!Number.isNaN(start) && target < start) {
        return false;
      }
    }
    if (dateTo) {
      const end = new Date(`${dateTo}T23:59:59.999Z`).getTime();
      if (!Number.isNaN(end) && target > end) {
        return false;
      }
    }
    return true;
  }

  private buildChatSummary(
    conversation: Conversation,
    messages: Message[],
    reports: AdminReport[],
    dream?: Dream,
    patientUser?: User,
    supporter?: User,
    managedPatient?: ManagedPatient,
  ) {
    const lastMessageAt = messages[0]?.createdAt ?? null;
    const hasModeratedMessages = messages.some((message) => message.moderated);
    const hasModerationReport = reports.length > 0;
    const moderationDates = [
      ...messages.filter((message) => message.moderated).map((message) => message.createdAt.getTime()),
      ...reports.map((report) => report.createdAt.getTime()),
    ];
    const lastModerationAt = moderationDates.length
      ? new Date(Math.max(...moderationDates)).toISOString()
      : null;

    return {
      id: conversation.id,
      dreamId: conversation.dreamId,
      dreamTitle: dream?.title,
      patientId: managedPatient?.id ?? conversation.patientId,
      patientName: managedPatient?.name ?? patientUser?.name,
      institutionName: managedPatient ? patientUser?.name : undefined,
      managedPatientName: managedPatient?.name,
      supporterId: conversation.supporterId,
      supporterName: supporter?.name,
      status: conversation.status,
      messageCount: messages.length,
      lastMessageAt,
      lastMessagePreview: messages[0]?.body ?? null,
      createdAt: conversation.createdAt,
      hasModeratedMessages,
      hasModerationReport,
      lastModerationAt,
    };
  }

  private async buildChatDetailResponse(conversation: Conversation) {
    const [dream, patientUser, supporter, managedPatient, messages, reports] = await Promise.all([
      this.dreamsRepository.findOneBy({ id: conversation.dreamId }),
      this.usersRepository.findOneBy({ id: conversation.patientId }),
      this.usersRepository.findOneBy({ id: conversation.supporterId }),
      conversation.managedPatientId
        ? this.managedPatientsRepository.findOneBy({ id: conversation.managedPatientId })
        : Promise.resolve(null),
      this.messagesRepository.find({
        where: { conversationId: conversation.id },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      this.reportsRepository.find({
        where: { targetId: conversation.id },
        order: { createdAt: 'DESC' },
      }),
    ]);

    const summary = this.buildChatSummary(
      conversation,
      messages,
      reports,
      dream ?? undefined,
      patientUser ?? undefined,
      supporter ?? undefined,
      managedPatient ?? undefined,
    );

    return {
      ...summary,
      latestMessages: messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        senderName:
          message.senderId === supporter?.id
            ? supporter?.name
            : message.senderId === patientUser?.id
              ? patientUser?.name
              : managedPatient?.name,
        body: message.body,
        moderated: message.moderated,
        createdAt: message.createdAt,
      })),
      moderationReports: reports.map((report) => ({
        id: report.id,
        type: report.type,
        status: report.status,
        reason: report.reason,
        createdAt: report.createdAt,
      })),
    };
  }

  private async buildReportTargetSummary(report: AdminReport) {
    if (report.targetType === 'chat') {
      const conversation = await this.conversationsRepository.findOneBy({ id: report.targetId });
      if (!conversation) {
        return null;
      }

      const detail = await this.buildChatDetailResponse(conversation);
      return {
        chatId: conversation.id,
        dreamId: conversation.dreamId,
        dreamTitle: detail.dreamTitle,
        patientId: detail.patientId,
        patientName: detail.patientName,
        institutionName: detail.institutionName,
        supporterId: detail.supporterId,
        supporterName: detail.supporterName,
        hasModeratedMessages: detail.hasModeratedMessages,
      };
    }

    if (report.targetType === 'message') {
      const message = await this.messagesRepository.findOneBy({ id: report.targetId });
      if (!message) {
        return null;
      }

      const conversation = await this.conversationsRepository.findOneBy({ id: message.conversationId });
      const sender = await this.usersRepository.findOneBy({ id: message.senderId });
      const chatDetail = conversation ? await this.buildChatDetailResponse(conversation) : null;

      return {
        messageId: message.id,
        conversationId: message.conversationId,
        chatId: conversation?.id,
        dreamId: conversation?.dreamId,
        dreamTitle: chatDetail?.dreamTitle,
        patientId: chatDetail?.patientId,
        patientName: chatDetail?.patientName,
        institutionName: chatDetail?.institutionName,
        supporterId: chatDetail?.supporterId,
        supporterName: chatDetail?.supporterName,
        senderId: message.senderId,
        senderName: sender?.name,
        moderated: message.moderated,
        body: message.body,
        createdAt: message.createdAt,
      };
    }

    const dream = await this.dreamsRepository.findOneBy({ id: report.targetId });
    if (dream) {
      return {
        dreamId: dream.id,
        dreamTitle: dream.title,
        patientId: dream.patientId,
        patientName: dream.managedPatient?.name ?? dream.patient?.name,
        status: dream.status,
      };
    }

    const proposal = await this.proposalsRepository.findOneBy({ id: report.targetId });
    if (proposal) {
      return {
        proposalId: proposal.id,
        dreamId: proposal.dreamId,
        dreamTitle: proposal.dream?.title,
        supporterId: proposal.supporterId,
        supporterName: proposal.supporter?.name,
        status: proposal.status,
      };
    }

    const user = await this.usersRepository.findOneBy({ id: report.targetId });
    if (user) {
      return {
        targetUserId: user.id,
        targetUserName: user.name,
        targetUserEmail: user.email,
        status: user.suspended ? 'suspenso' : 'ativo',
      };
    }

    return null;
  }
}
