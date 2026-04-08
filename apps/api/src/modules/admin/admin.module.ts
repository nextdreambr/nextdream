import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminContactMessage } from '../../entities/admin-contact-message.entity';
import { AdminReport } from '../../entities/admin-report.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { Message } from '../../entities/message.entity';
import { Proposal } from '../../entities/proposal.entity';
import { User } from '../../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Dream,
      Proposal,
      Conversation,
      Message,
      AdminContactMessage,
      AdminReport,
      AuditLog,
    ]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
