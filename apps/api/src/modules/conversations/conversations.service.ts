import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminReport } from '../../entities/admin-report.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';
import { JwtPayload } from '../auth/jwt-auth.guard';
import { NotificationsService } from '../notifications/notifications.service';
import { CloseConversationDto } from './dto/close-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ConversationsService {
  private readonly conversationsRepository: Repository<Conversation>;
  private readonly messagesRepository: Repository<Message>;
  private readonly usersRepository: Repository<User>;
  private readonly auditLogsRepository: Repository<AuditLog>;
  private readonly reportsRepository: Repository<AdminReport>;
  private readonly notificationsService: NotificationsService;

  constructor(
    @InjectRepository(Conversation) conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message) messagesRepository: Repository<Message>,
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(AuditLog) auditLogsRepository: Repository<AuditLog>,
    @InjectRepository(AdminReport) reportsRepository: Repository<AdminReport>,
    @Inject(NotificationsService) notificationsService: NotificationsService,
  ) {
    this.conversationsRepository = conversationsRepository;
    this.messagesRepository = messagesRepository;
    this.usersRepository = usersRepository;
    this.auditLogsRepository = auditLogsRepository;
    this.reportsRepository = reportsRepository;
    this.notificationsService = notificationsService;
  }

  async listMine(currentUser: JwtPayload) {
    if (currentUser.role === 'admin') {
      const conversations = await this.conversationsRepository.find({ order: { createdAt: 'DESC' } });
      return conversations.map((conversation) => this.serializeConversation(conversation));
    }

    const conversations = await this.conversationsRepository
      .createQueryBuilder('conversation')
      .where('conversation.patientId = :userId OR conversation.supporterId = :userId', {
        userId: currentUser.sub,
      })
      .orderBy('conversation.createdAt', 'DESC')
      .getMany();

    return conversations.map((conversation) => this.serializeConversation(conversation));
  }

  async listMessages(currentUser: JwtPayload, conversationId: string) {
    const conversation = await this.requireConversationAccess(currentUser, conversationId);

    const messages = await this.messagesRepository.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
    });

    return messages.map((message) => this.serializeMessage(message));
  }

  async sendMessage(currentUser: JwtPayload, conversationId: string, dto: CreateMessageDto) {
    const conversation = await this.requireConversationAccess(currentUser, conversationId);

    if (conversation.status !== 'ativa') {
      throw new ForbiddenException('Conversation is closed');
    }

    if (currentUser.role !== 'admin' && currentUser.sub !== conversation.patientId && currentUser.sub !== conversation.supporterId) {
      throw new ForbiddenException('You are not allowed to send messages in this conversation');
    }

    const message = this.messagesRepository.create({
      conversationId: conversation.id,
      senderId: currentUser.sub,
      body: dto.body.trim(),
      moderated: false,
    });

    const saved = await this.messagesRepository.save(message);

    const receiverId = conversation.patientId === currentUser.sub
      ? conversation.supporterId
      : conversation.patientId;
    const receiverPath = receiverId === conversation.patientId
      ? `/paciente/chat?conversationId=${conversation.id}`
      : `/apoiador/chat?conversationId=${conversation.id}`;

    await this.notificationsService.createNotification({
      userId: receiverId,
      type: 'mensagem',
      title: 'Nova mensagem no chat',
      message: 'Você recebeu uma nova mensagem em uma conversa ativa.',
      actionPath: receiverPath,
    });

    return this.serializeMessage(saved);
  }

  async closeConversation(currentUser: JwtPayload, conversationId: string, dto: CloseConversationDto) {
    const conversation = await this.requireConversationAccess(currentUser, conversationId);

    if (conversation.status === 'encerrada') {
      return this.serializeConversation(conversation);
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

    await this.notificationsService.createNotification({
      userId: conversation.patientId,
      type: 'seguranca',
      title: 'Conversa encerrada',
      message: 'Uma conversa foi encerrada pela moderação.',
      actionPath: '/paciente/chat',
    });

    await this.notificationsService.createNotification({
      userId: conversation.supporterId,
      type: 'seguranca',
      title: 'Conversa encerrada',
      message: 'Uma conversa foi encerrada pela moderação.',
      actionPath: '/apoiador/chat',
    });

    return this.serializeConversation(saved);
  }

  private async requireConversationAccess(currentUser: JwtPayload, conversationId: string) {
    const conversation = await this.conversationsRepository.findOneBy({ id: conversationId });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      currentUser.role !== 'admin' &&
      currentUser.sub !== conversation.patientId &&
      currentUser.sub !== conversation.supporterId
    ) {
      throw new ForbiddenException('You are not allowed to access this conversation');
    }

    return conversation;
  }

  private serializeConversation(conversation: Conversation) {
    return {
      id: conversation.id,
      dreamId: conversation.dreamId,
      patientId: conversation.patientId,
      supporterId: conversation.supporterId,
      status: conversation.status,
      createdAt: conversation.createdAt,
    };
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
