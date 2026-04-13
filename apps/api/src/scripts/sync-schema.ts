import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AdminContactMessage } from '../entities/admin-contact-message.entity';
import { AdminInvite } from '../entities/admin-invite.entity';
import { AdminReport } from '../entities/admin-report.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Conversation } from '../entities/conversation.entity';
import { Dream } from '../entities/dream.entity';
import { Message } from '../entities/message.entity';
import { Notification } from '../entities/notification.entity';
import { Proposal } from '../entities/proposal.entity';
import { User } from '../entities/user.entity';

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to sync schema.');
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [
      User,
      Dream,
      Proposal,
      Conversation,
      Message,
      Notification,
      AdminContactMessage,
      AdminInvite,
      AdminReport,
      AuditLog,
    ],
    synchronize: false,
  });

  await dataSource.initialize();
  await dataSource.synchronize(false);
  await dataSource.destroy();
}

void run();
