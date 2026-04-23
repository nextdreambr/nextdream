import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminReport } from '../../entities/admin-report.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { ManagedPatient } from '../../entities/managed-patient.entity';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { InstitutionModule } from '../institution/institution.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatModerationService } from './chat-moderation.service';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { OpenAiChatModerationService } from './openai-chat-moderation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User, Dream, ManagedPatient, AuditLog, AdminReport]),
    AuthModule,
    InstitutionModule,
    NotificationsModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ChatModerationService, OpenAiChatModerationService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
