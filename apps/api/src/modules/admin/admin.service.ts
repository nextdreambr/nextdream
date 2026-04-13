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
import { randomBytes } from 'node:crypto';
import { Not, Repository } from 'typeorm';
import { AdminContactMessage } from '../../entities/admin-contact-message.entity';
import { AdminInvite } from '../../entities/admin-invite.entity';
import { AdminReport } from '../../entities/admin-report.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { Message } from '../../entities/message.entity';
import { Proposal } from '../../entities/proposal.entity';
import { User } from '../../entities/user.entity';
import { JwtPayload } from '../auth/jwt-auth.guard';
import { MailService } from '../mail/mail.service';
import { CloseChatDto } from './dto/close-chat.dto';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateDreamStatusDto } from './dto/update-dream-status.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Injectable()
export class AdminService {
  private readonly usersRepository: Repository<User>;
  private readonly dreamsRepository: Repository<Dream>;
  private readonly proposalsRepository: Repository<Proposal>;
  private readonly conversationsRepository: Repository<Conversation>;
  private readonly messagesRepository: Repository<Message>;
  private readonly contactMessagesRepository: Repository<AdminContactMessage>;
  private readonly adminInvitesRepository: Repository<AdminInvite>;
  private readonly reportsRepository: Repository<AdminReport>;
  private readonly auditLogsRepository: Repository<AuditLog>;
  private readonly mailService: MailService;

  constructor(
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(Dream) dreamsRepository: Repository<Dream>,
    @InjectRepository(Proposal) proposalsRepository: Repository<Proposal>,
    @InjectRepository(Conversation) conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message) messagesRepository: Repository<Message>,
    @InjectRepository(AdminContactMessage) contactMessagesRepository: Repository<AdminContactMessage>,
    @InjectRepository(AdminInvite) adminInvitesRepository: Repository<AdminInvite>,
    @InjectRepository(AdminReport) reportsRepository: Repository<AdminReport>,
    @InjectRepository(AuditLog) auditLogsRepository: Repository<AuditLog>,
    @Inject(MailService) mailService: MailService,
  ) {
    this.usersRepository = usersRepository;
    this.dreamsRepository = dreamsRepository;
    this.proposalsRepository = proposalsRepository;
    this.conversationsRepository = conversationsRepository;
    this.messagesRepository = messagesRepository;
    this.contactMessagesRepository = contactMessagesRepository;
    this.adminInvitesRepository = adminInvitesRepository;
    this.reportsRepository = reportsRepository;
    this.auditLogsRepository = auditLogsRepository;
    this.mailService = mailService;
  }

  async overview() {
    const [totalUsers, totalDreams, totalProposals, totalChats, totalReportsOpen] = await Promise.all([
      this.usersRepository.count(),
      this.dreamsRepository.count(),
      this.proposalsRepository.count(),
      this.conversationsRepository.count(),
      this.reportsRepository.count({ where: { status: 'aberto' } }),
    ]);

    return {
      totalUsers,
      totalDreams,
      totalProposals,
      totalChats,
      totalReportsOpen,
    };
  }

  async listUsers() {
    const users = await this.usersRepository.find({
      where: { role: Not('admin') },
      order: { createdAt: 'DESC' },
    });
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      verified: user.verified,
      suspended: user.suspended,
      suspensionReason: user.suspensionReason,
      suspendedAt: user.suspendedAt,
      createdAt: user.createdAt,
    }));
  }

  async listAdmins() {
    const admins = await this.usersRepository.find({
      where: { role: 'admin' },
      order: { createdAt: 'DESC' },
    });
    return admins.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      verified: user.verified,
      suspended: user.suspended,
      suspensionReason: user.suspensionReason,
      suspendedAt: user.suspendedAt,
      createdAt: user.createdAt,
    }));
  }

  async updateAdmin(currentUser: JwtPayload, userId: string, dto: UpdateAdminDto) {
    const adminUser = await this.usersRepository.findOneBy({ id: userId });
    if (!adminUser || adminUser.role !== 'admin') {
      throw new NotFoundException('Admin user not found');
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
      adminUser.suspensionReason = dto.isActive ? undefined : 'Suspensão operacional via painel admin.';
    }
    if (dto.newPassword !== undefined) {
      adminUser.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    }

    const saved = await this.usersRepository.save(adminUser);
    await this.logAction(currentUser, {
      action: 'Admin atualizado',
      target: `${saved.name} (${saved.id})`,
      type: 'admin',
      severity: 'alta',
      outcome: 'ok',
      details: dto.newPassword ? 'Dados e senha de admin atualizados via painel' : 'Dados de admin atualizados via painel',
      refPath: '/admin/admins',
      refId: saved.id,
    });

    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      verified: saved.verified,
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
      throw new BadRequestException('Email already registered as paciente/apoiador');
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

    await this.mailService.sendAdminInviteEmail({
      to: normalizedEmail,
      inviteUrl,
      expiresInHours,
    });

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
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

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

  async listDreams() {
    const dreams = await this.dreamsRepository.find({ order: { createdAt: 'DESC' } });
    return dreams.map((dream) => ({
      id: dream.id,
      title: dream.title,
      category: dream.category,
      status: dream.status,
      patientId: dream.patientId,
      patientName: dream.patient?.name,
      createdAt: dream.createdAt,
    }));
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

  async listProposals() {
    const proposals = await this.proposalsRepository.find({ order: { createdAt: 'DESC' } });
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
    };
  }

  async listMessages() {
    const messages = await this.contactMessagesRepository.find({ order: { createdAt: 'DESC' } });
    return messages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      body: message.body,
      status: message.status,
      createdAt: message.createdAt,
    }));
  }

  async listChats() {
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

    return conversations.map((conversation) => {
      const chatMessages = messageByConversation.get(conversation.id) ?? [];
      return {
        id: conversation.id,
        dreamId: conversation.dreamId,
        patientId: conversation.patientId,
        supporterId: conversation.supporterId,
        status: conversation.status,
        messageCount: chatMessages.length,
        lastMessageAt: chatMessages[0]?.createdAt ?? null,
        createdAt: conversation.createdAt,
      };
    });
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

  async listReports() {
    const reports = await this.reportsRepository.find({ order: { createdAt: 'DESC' } });
    return reports.map((report) => ({
      id: report.id,
      type: report.type,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      status: report.status,
      resolution: report.resolution,
      createdAt: report.createdAt,
      resolvedAt: report.resolvedAt,
    }));
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

  listEmailTemplates() {
    return [
      {
        id: 'welcome-patient',
        category: 'Conta & Boas-vindas',
        name: 'Boas-vindas — Paciente',
        subject: 'Bem-vindo ao NextDream, {{name}}',
        recipient: 'Paciente',
      },
      {
        id: 'welcome-supporter',
        category: 'Conta & Boas-vindas',
        name: 'Boas-vindas — Apoiador',
        subject: 'Bem-vindo ao NextDream, {{name}}',
        recipient: 'Apoiador',
      },
      {
        id: 'admin-invite',
        category: 'Administração',
        name: 'Convite de Admin',
        subject: 'Convite de administrador - NextDream',
        recipient: 'Administrador',
      },
      {
        id: 'dream-new-proposal',
        category: 'Paciente — Sonhos',
        name: 'Nova Proposta Recebida',
        subject: '{{supporter_name}} quer ajudar a realizar seu sonho',
        recipient: 'Paciente',
      },
    ];
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
}
