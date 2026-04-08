import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminContactMessage } from './entities/admin-contact-message.entity';
import { AdminReport } from './entities/admin-report.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Message } from './entities/message.entity';
import { ValidationPipe } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Dream } from './entities/dream.entity';
import { Proposal } from './entities/proposal.entity';
import { Conversation } from './entities/conversation.entity';
import { getRequiredEnv } from './config/env';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { DreamsModule } from './modules/dreams/dreams.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const common = {
          entities: [
            User,
            Dream,
            Proposal,
            Conversation,
            Message,
            AdminContactMessage,
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
    HealthModule,
    AuthModule,
    DreamsModule,
    ProposalsModule,
    ConversationsModule,
    AdminModule,
  ],
  providers: [
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
