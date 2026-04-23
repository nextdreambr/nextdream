import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, In, MoreThanOrEqual, Repository } from 'typeorm';
import { AdminReport } from '../../entities/admin-report.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { ManagedPatient } from '../../entities/managed-patient.entity';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';
import { JwtPayload } from '../auth/jwt-auth.guard';
import { InstitutionService } from '../institution/institution.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatModerationDecision, ChatModerationService } from './chat-moderation.service';
import { CloseConversationDto } from './dto/close-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ConversationsService {
  private readonly conversationsRepository: Repository<Conversation>;
  private readonly messagesRepository: Repository<Message>;
  private readonly usersRepository: Repository<User>;
  private readonly dreamsRepository: Repository<Dream>;
  private readonly managedPatientsRepository: Repository<ManagedPatient>;
  private readonly auditLogsRepository: Repository<AuditLog>;
  private readonly reportsRepository: Repository<AdminReport>;
  private readonly institutionService: InstitutionService;
  private readonly notificationsService: NotificationsService;
  private readonly chatModerationService: ChatModerationService;

  constructor(
    @InjectRepository(Conversation) conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message) messagesRepository: Repository<Message>,
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(Dream) dreamsRepository: Repository<Dream>,
    @InjectRepository(ManagedPatient) managedPatientsRepository: Repository<ManagedPatient>,
    @InjectRepository(AuditLog) auditLogsRepository: Repository<AuditLog>,
    @InjectRepository(AdminReport) reportsRepository: Repository<AdminReport>,
    @Inject(InstitutionService) institutionService: InstitutionService,
    @Inject(NotificationsService) notificationsService: NotificationsService,
    @Inject(ChatModerationService) chatModerationService: ChatModerationService,
  ) {
    this.conversationsRepository = conversationsRepository;
    this.messagesRepository = messagesRepository;
    this.usersRepository = usersRepository;
    this.dreamsRepository = dreamsRepository;
    this.managedPatientsRepository = managedPatientsRepository;
    this.auditLogsRepository = auditLogsRepository;
    this.reportsRepository = reportsRepository;
    this.institutionService = institutionService;
    this.notificationsService = notificationsService;
    this.chatModerationService = chatModerationService;
  }

  async listMine(currentUser: JwtPayload) {
    if (currentUser.role === 'admin') {
      const conversations = await this.conversationsRepository.find({ order: { createdAt: 'DESC' } });
      return this.serializeConversations(conversations);
    }

    const linkedManagedPatientIds =
      currentUser.role === 'paciente'
        ? await this.institutionService.listLinkedManagedPatientIdsForUser(currentUser.sub)
        : [];
    if (currentUser.role === 'instituicao') {
      await this.institutionService.overview(currentUser);
    }

    const conversations = await this.conversationsRepository
      .createQueryBuilder('conversation')
      .where(
        new Brackets((where) => {
          where.where('conversation.patientId = :userId OR conversation.supporterId = :userId', {
            userId: currentUser.sub,
          });
          if (currentUser.role === 'paciente' && linkedManagedPatientIds.length > 0) {
            where.orWhere('conversation.managedPatientId IN (:...managedPatientIds)', {
              managedPatientIds: linkedManagedPatientIds,
            });
          }
        }),
      )
      .orderBy('conversation.createdAt', 'DESC')
      .getMany();

    return this.serializeConversations(conversations);
  }

  async listMessages(currentUser: JwtPayload, conversationId: string) {
    if (currentUser.role === 'instituicao') {
      await this.institutionService.overview(currentUser);
    }
    const conversation = await this.requireConversationAccess(currentUser, conversationId);

    const messages = await this.messagesRepository.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
    });

    return messages.map((message) => this.serializeMessage(message));
  }

  async sendMessage(currentUser: JwtPayload, conversationId: string, dto: CreateMessageDto) {
    if (currentUser.role === 'instituicao') {
      await this.institutionService.overview(currentUser);
    }
    const conversation = await this.requireConversationAccess(currentUser, conversationId);

    if (conversation.status !== 'ativa') {
      throw new ForbiddenException('Conversation is closed');
    }

    const linkedViewer = await this.institutionService.isLinkedManagedPatient(
      currentUser.sub,
      conversation.managedPatientId,
    );
    if (
      currentUser.role !== 'admin' &&
      currentUser.sub !== conversation.patientId &&
      currentUser.sub !== conversation.supporterId &&
      !linkedViewer
    ) {
      throw new ForbiddenException('You are not allowed to send messages in this conversation');
    }
    if (linkedViewer) {
      throw new ForbiddenException('Patient can follow this conversation, but the institution operates the case');
    }

    const body = dto.body.trim();
    const moderation = await this.chatModerationService.moderateMessage(body);
    if (moderation.reason === 'degraded_allow') {
      await this.logDegradedModeration(currentUser, conversation, moderation);
    }
    if (moderation.outcome === 'block') {
      await this.logBlockedMessage(currentUser, conversation, moderation);
      throw new BadRequestException({
        message: moderation.message,
        reason: moderation.reason,
        moderated: true,
      });
    }

    const message = this.messagesRepository.create({
      conversationId: conversation.id,
      senderId: currentUser.sub,
      body,
      moderated: false,
    });

    const saved = await this.messagesRepository.save(message);

    const receiverIds = currentUser.role === 'admin'
      ? [conversation.patientId, conversation.supporterId]
      : [conversation.patientId === currentUser.sub ? conversation.supporterId : conversation.patientId];

    for (const receiverId of new Set(receiverIds)) {
      const receiver = await this.usersRepository.findOneBy({ id: receiverId });
      const receiverPath = receiver?.role === 'instituicao'
        ? `/instituicao/chat?conversationId=${conversation.id}`
        : receiverId === conversation.patientId
          ? `/paciente/chat?conversationId=${conversation.id}`
          : `/apoiador/chat?conversationId=${conversation.id}`;

      await this.notificationsService.createNotification({
        userId: receiverId,
        type: 'mensagem',
        title: 'Nova mensagem no chat',
        message: 'Você recebeu uma nova mensagem em uma conversa ativa.',
        actionPath: receiverPath,
      });
    }

    return this.serializeMessage(saved);
  }

  async closeConversation(currentUser: JwtPayload, conversationId: string, dto: CloseConversationDto) {
    if (currentUser.role === 'instituicao') {
      await this.institutionService.overview(currentUser);
    }
    const conversation = await this.requireConversationAccess(currentUser, conversationId);

    if (conversation.status === 'encerrada') {
      return (await this.serializeConversations([conversation]))[0];
    }

    conversation.status = 'encerrada';
    const saved = await this.conversationsRepository.save(conversation);

    const actor = await this.usersRepository.findOneBy({ id: currentUser.sub });
    await this.auditLogsRepository.save(
      this.auditLogsRepository.create({
        action: 'Conversa encerrada',
        by: actor?.name ?? currentUser.email,
        target: conversation.id,
        type: 'chat',
        severity: 'media',
        outcome: 'warn',
        details: dto.reason ?? 'Conversa encerrada manualmente.',
        refPath: '/admin/chats',
        refId: conversation.id,
      }),
    );

    if (currentUser.role === 'admin') {
      await this.reportsRepository.save(
        this.reportsRepository.create({
          type: 'chat-moderation',
          targetType: 'chat',
          targetId: conversation.id,
          reason: dto.reason ?? 'Chat encerrado pela administração.',
          status: 'aberto',
        }),
      );
    }

    const operator = await this.usersRepository.findOneBy({ id: conversation.patientId });
    const operatorChatPath = operator?.role === 'instituicao' ? '/instituicao/chat' : '/paciente/chat';

    await this.notificationsService.createNotification({
      userId: conversation.patientId,
      type: 'seguranca',
      title: 'Conversa encerrada',
      message: 'Uma conversa foi encerrada pela moderação.',
      actionPath: operatorChatPath,
    });

    await this.notificationsService.createNotification({
      userId: conversation.supporterId,
      type: 'seguranca',
      title: 'Conversa encerrada',
      message: 'Uma conversa foi encerrada pela moderação.',
      actionPath: '/apoiador/chat',
    });

    return (await this.serializeConversations([saved]))[0];
  }

  private async logBlockedMessage(
    currentUser: JwtPayload,
    conversation: Conversation,
    moderation: ChatModerationDecision,
  ) {
    const actor = await this.usersRepository.findOneBy({ id: currentUser.sub });
    const auditSeverity: AuditLog['severity'] = moderation.reason === 'ofensa_grave' ? 'alta' : 'media';
    const auditLogPayload: Omit<AuditLog, 'id' | 'createdAt' | 'ensureId'> = {
      action: `Chat message blocked: ${moderation.reason}`,
      by: actor?.name ?? currentUser.email,
      target: currentUser.sub,
      type: 'chat',
      severity: auditSeverity,
      outcome: 'warn',
      details: this.buildModerationAuditDetails(moderation),
      refPath: '/admin/chats',
      refId: conversation.id,
    };

    if (moderation.reason === 'ofensa_grave') {
      await this.auditLogsRepository.save(this.auditLogsRepository.create(auditLogPayload));
      await this.createModerationReport(
        conversation.id,
        `Mensagem bloqueada por linguagem ofensiva ou desrespeitosa. Usuário: ${currentUser.sub}.`,
      );
      return;
    }

    const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const escalationReason = `Usuário ${currentUser.sub} teve a terceira tentativa financeira bloqueada em 24 horas.`;

    await this.auditLogsRepository.manager.transaction(async (manager) => {
      await manager.save(AuditLog, manager.create(AuditLog, auditLogPayload));

      const blockedAttemptsInWindow = await manager.count(AuditLog, {
        where: {
          action: 'Chat message blocked: financeiro',
          target: currentUser.sub,
          createdAt: MoreThanOrEqual(windowStart),
        },
      });

      const previousBlockedAttemptsInWindow = blockedAttemptsInWindow - 1;
      if (previousBlockedAttemptsInWindow >= 3 || blockedAttemptsInWindow < 3) {
        return;
      }

      const existingEscalation = await manager.count(AdminReport, {
        where: {
          type: 'chat-moderation',
          targetType: 'chat',
          targetId: conversation.id,
          reason: escalationReason,
          status: 'aberto',
        },
      });

      if (existingEscalation === 0) {
        await this.createModerationReport(conversation.id, escalationReason, manager);
      }
    });
  }

  private async logDegradedModeration(
    currentUser: JwtPayload,
    conversation: Conversation,
    moderation: ChatModerationDecision,
  ) {
    const actor = await this.usersRepository.findOneBy({ id: currentUser.sub });
    await this.auditLogsRepository.save(
      this.auditLogsRepository.create({
        action: 'Chat moderation degraded',
        by: actor?.name ?? currentUser.email,
        target: currentUser.sub,
        type: 'chat',
        severity: 'media',
        outcome: 'warn',
        details: this.buildModerationAuditDetails(moderation),
        refPath: '/admin/chats',
        refId: conversation.id,
      }),
    );
  }

  private buildModerationAuditDetails(moderation: ChatModerationDecision) {
    return JSON.stringify({
      source: moderation.source,
      reason: moderation.reason,
      fingerprint: moderation.fingerprint,
      snippet: moderation.redactedBody.slice(0, 160),
    });
  }

  private async createModerationReport(
    conversationId: string,
    reason: string,
    manager: EntityManager = this.reportsRepository.manager,
  ) {
    await manager.save(
      AdminReport,
      manager.create(AdminReport, {
        type: 'chat-moderation',
        targetType: 'chat',
        targetId: conversationId,
        reason,
        status: 'aberto',
      }),
    );
  }

  private async requireConversationAccess(currentUser: JwtPayload, conversationId: string) {
    const conversation = await this.conversationsRepository.findOneBy({ id: conversationId });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const linkedViewer = await this.institutionService.isLinkedManagedPatient(
      currentUser.sub,
      conversation.managedPatientId,
    );
    if (
      currentUser.role !== 'admin' &&
      currentUser.sub !== conversation.patientId &&
      currentUser.sub !== conversation.supporterId &&
      !linkedViewer
    ) {
      throw new ForbiddenException('You are not allowed to access this conversation');
    }

    return conversation;
  }

  private async serializeConversations(conversations: Conversation[]) {
    if (conversations.length === 0) {
      return [];
    }

    const dreamIds = [...new Set(conversations.map((conversation) => conversation.dreamId))];
    const operatorIds = [...new Set(conversations.map((conversation) => conversation.patientId))];
    const managedPatientIds = [
      ...new Set(conversations.map((conversation) => conversation.managedPatientId).filter(Boolean) as string[]),
    ];

    const [dreams, operators, managedPatients] = await Promise.all([
      this.dreamsRepository.findBy({ id: In(dreamIds) }),
      this.usersRepository.findBy({ id: In(operatorIds) }),
      managedPatientIds.length > 0
        ? this.managedPatientsRepository.findBy({ id: In(managedPatientIds) })
        : Promise.resolve([]),
    ]);

    const dreamsById = new Map(dreams.map((dream) => [dream.id, dream]));
    const operatorsById = new Map(operators.map((user) => [user.id, user]));
    const managedPatientsById = new Map(managedPatients.map((patient) => [patient.id, patient]));

    return conversations.map((conversation) => {
      const dream = dreamsById.get(conversation.dreamId);
      const operator = operatorsById.get(conversation.patientId);
      const managedPatient = conversation.managedPatientId
        ? managedPatientsById.get(conversation.managedPatientId)
        : undefined;
      const dreamPath = dream
        ? dream.managedPatientId
          ? `/instituicao/sonhos/editar/${dream.id}`
          : `/paciente/sonhos/${dream.id}`
        : undefined;

      return {
        id: conversation.id,
        dreamId: conversation.dreamId,
        dreamTitle: dream?.title,
        dreamStatus: dream?.status,
        dreamPath,
        patientId: conversation.patientId,
        operatorUserId: conversation.patientId,
        managedPatientId: conversation.managedPatientId,
        supporterId: conversation.supporterId,
        status: conversation.status,
        managedByInstitution: Boolean(conversation.managedPatientId),
        patientName: managedPatient?.name ?? operator?.name,
        patientLocation: managedPatient
          ? [managedPatient.city, managedPatient.state].filter(Boolean).join(', ') || undefined
          : operator
            ? [operator.city, operator.state].filter(Boolean).join(', ') || undefined
            : undefined,
        institutionName: conversation.managedPatientId ? operator?.name : undefined,
        createdAt: conversation.createdAt,
      };
    });
  }

  private serializeMessage(message: Message) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      body: message.body,
      moderated: message.moderated,
      createdAt: message.createdAt,
    };
  }
}
