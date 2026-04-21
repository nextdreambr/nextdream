import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { buildLocationLabel } from '../lib/location';
import { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { CloseConversationDto } from '../modules/conversations/dto/close-conversation.dto';
import { CreateMessageDto } from '../modules/conversations/dto/create-message.dto';
import { SandboxNotificationsService } from './sandbox-notifications.service';
import { SandboxStateService } from './sandbox-state.service';
import { SandboxConversation, SandboxMessage, SandboxSessionState } from './sandbox-types';

@Injectable()
export class SandboxConversationsService {
  private readonly sandboxState: SandboxStateService;
  private readonly notificationsService: SandboxNotificationsService;

  constructor(
    @Inject(SandboxStateService) sandboxState: SandboxStateService,
    @Inject(SandboxNotificationsService) notificationsService: SandboxNotificationsService,
  ) {
    this.sandboxState = sandboxState;
    this.notificationsService = notificationsService;
  }

  async listMine(currentUser: JwtPayload) {
    const session = this.getSession(currentUser);
    const linkedManagedPatientIds = this.getLinkedManagedPatientIds(session, currentUser.sub);

    const conversations = session.conversations
      .filter((conversation) => {
        if (currentUser.sub === conversation.patientId || currentUser.sub === conversation.supporterId) {
          return true;
        }
        return currentUser.role === 'paciente'
          ? Boolean(conversation.managedPatientId && linkedManagedPatientIds.includes(conversation.managedPatientId))
          : false;
      })
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

    return this.serializeConversations(session, conversations);
  }

  async listMessages(currentUser: JwtPayload, conversationId: string) {
    const session = this.getSession(currentUser);
    this.requireConversationAccess(session, currentUser, conversationId);

    return session.messages
      .filter((message) => message.conversationId === conversationId)
      .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
      .map((message) => this.serializeMessage(message));
  }

  async sendMessage(currentUser: JwtPayload, conversationId: string, dto: CreateMessageDto) {
    const session = this.getSession(currentUser);
    const { conversation, linkedViewer } = this.requireConversationAccess(session, currentUser, conversationId);

    if (conversation.status !== 'ativa') {
      throw new ForbiddenException('Conversation is closed');
    }
    if (linkedViewer) {
      throw new ForbiddenException('Patient can follow this conversation, but the institution operates the case');
    }

    const message: SandboxMessage = {
      id: crypto.randomUUID(),
      conversationId,
      senderId: currentUser.sub,
      body: dto.body.trim(),
      moderated: false,
      createdAt: new Date(),
    };

    session.messages.push(message);
    const receiverIds = currentUser.sub === conversation.patientId
      ? [conversation.supporterId]
      : [conversation.patientId];

    for (const receiverId of receiverIds) {
      const receiverPath = receiverId === conversation.patientId
        ? conversation.managedPatientId
          ? `/instituicao/chat?conversationId=${conversation.id}`
          : `/paciente/chat?conversationId=${conversation.id}`
        : `/apoiador/chat?conversationId=${conversation.id}`;

      await this.notificationsService.createNotification(session.id, {
        userId: receiverId,
        type: 'mensagem',
        title: 'Nova mensagem no chat',
        message: 'Voce recebeu uma nova mensagem em uma conversa ativa.',
        actionPath: receiverPath,
      });
    }

    return this.serializeMessage(message);
  }

  async closeConversation(currentUser: JwtPayload, conversationId: string, dto: CloseConversationDto) {
    void dto;
    const session = this.getSession(currentUser);
    const { conversation } = this.requireConversationAccess(session, currentUser, conversationId);

    conversation.status = 'encerrada';
    await this.notificationsService.createNotification(session.id, {
      userId: conversation.patientId,
      type: 'seguranca',
      title: 'Conversa encerrada',
      message: 'Uma conversa foi encerrada no ambiente sandbox.',
      actionPath: conversation.managedPatientId ? '/instituicao/chat' : '/paciente/chat',
    });
    await this.notificationsService.createNotification(session.id, {
      userId: conversation.supporterId,
      type: 'seguranca',
      title: 'Conversa encerrada',
      message: 'Uma conversa foi encerrada no ambiente sandbox.',
      actionPath: '/apoiador/chat',
    });

    return (await this.serializeConversations(session, [conversation]))[0];
  }

  private getSession(currentUser: JwtPayload) {
    return this.sandboxState.getSessionOrThrow(currentUser.sandboxSessionId);
  }

  private requireConversationAccess(session: SandboxSessionState, currentUser: JwtPayload, conversationId: string) {
    const conversation = session.conversations.find((candidate) => candidate.id === conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const linkedViewer = Boolean(
      currentUser.role === 'paciente' &&
      conversation.managedPatientId &&
      this.getLinkedManagedPatientIds(session, currentUser.sub).includes(conversation.managedPatientId),
    );
    if (
      currentUser.sub !== conversation.patientId &&
      currentUser.sub !== conversation.supporterId &&
      !linkedViewer
    ) {
      throw new ForbiddenException('You are not allowed to access this conversation');
    }

    return { conversation, linkedViewer };
  }

  private getLinkedManagedPatientIds(session: SandboxSessionState, userId: string) {
    return session.managedPatients
      .filter((patient) => patient.linkedUserId === userId)
      .map((patient) => patient.id);
  }

  private async serializeConversations(session: SandboxSessionState, conversations: SandboxConversation[]) {
    return conversations.map((conversation) => {
      const dream = session.dreams.find((candidate) => candidate.id === conversation.dreamId);
      const operator = session.users.find((candidate) => candidate.id === conversation.patientId);
      const managedPatient = conversation.managedPatientId
        ? session.managedPatients.find((candidate) => candidate.id === conversation.managedPatientId)
        : undefined;

      return {
        id: conversation.id,
        dreamId: conversation.dreamId,
        dreamTitle: dream?.title,
        dreamStatus: dream?.status,
        dreamPath: dream
          ? dream.managedPatientId
            ? `/instituicao/sonhos/editar/${dream.id}`
            : `/paciente/sonhos/${dream.id}`
          : undefined,
        patientId: conversation.patientId,
        operatorUserId: conversation.patientId,
        managedPatientId: conversation.managedPatientId,
        supporterId: conversation.supporterId,
        status: conversation.status,
        managedByInstitution: Boolean(conversation.managedPatientId),
        patientName: managedPatient?.name ?? operator?.name,
        patientLocation: managedPatient
          ? buildLocationLabel(managedPatient)
          : buildLocationLabel(operator ?? {}),
        institutionName: conversation.managedPatientId ? operator?.name : undefined,
        createdAt: conversation.createdAt,
      };
    });
  }

  private serializeMessage(message: SandboxMessage) {
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
