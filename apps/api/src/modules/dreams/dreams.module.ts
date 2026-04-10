import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { Proposal } from '../../entities/proposal.entity';
import { User } from '../../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DreamsController } from './dreams.controller';
import { DreamsService } from './dreams.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dream, User, Proposal, Conversation]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [DreamsController],
  providers: [DreamsService],
  exports: [DreamsService],
})
export class DreamsModule {}
