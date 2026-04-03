import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Dream } from './entities/dream.entity';
import { Proposal } from './entities/proposal.entity';
import { Conversation } from './entities/conversation.entity';
import { AuthModule } from './modules/auth/auth.module';
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
          entities: [User, Dream, Proposal, Conversation],
          synchronize: true,
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
          url: process.env.DATABASE_URL,
          ...common,
        };
      },
    }),
    HealthModule,
    AuthModule,
    DreamsModule,
    ProposalsModule,
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
