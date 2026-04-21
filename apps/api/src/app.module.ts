import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { resolve } from 'node:path';
import { AdminContactMessage } from './entities/admin-contact-message.entity';
import { AdminInvite } from './entities/admin-invite.entity';
import { AdminReport } from './entities/admin-report.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { ValidationPipe } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Dream } from './entities/dream.entity';
import { Proposal } from './entities/proposal.entity';
import { Conversation } from './entities/conversation.entity';
import { ManagedPatient } from './entities/managed-patient.entity';
import { getRateLimitConfig, getRequiredEnv } from './config/env';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { DreamsModule } from './modules/dreams/dreams.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { HealthModule } from './modules/health/health.module';
import { InstitutionModule } from './modules/institution/institution.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SentryTunnelModule } from './observability/sentry-tunnel.module';

@Module({
  imports: [
    // Resolve env files from monorepo root even when API runs via npm workspace.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(__dirname, '../../../.env.local'),
        resolve(__dirname, '../../../.env'),
        '.env.local',
        '.env',
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const common = {
          entities: [
            User,
            Dream,
            Proposal,
            Conversation,
            ManagedPatient,
            Message,
            Notification,
            AdminContactMessage,
            AdminInvite,
            AdminReport,
            AuditLog,
          ],
          synchronize: process.env.NODE_ENV !== 'production',
        };

        if (process.env.NODE_ENV === 'test') {
          return {
            type: 'sqljs' as const,
            autoSave: false,
            ...common,
          };
        }

        return {
          type: 'postgres' as const,
          url: getRequiredEnv('DATABASE_URL'),
          ...common,
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ...getRateLimitConfig(),
      },
    ]),
    HealthModule,
    AuthModule,
    DreamsModule,
    ProposalsModule,
    ConversationsModule,
    InstitutionModule,
    NotificationsModule,
    SentryTunnelModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
