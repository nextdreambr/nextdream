import 'reflect-metadata';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { AdminContactMessage } from '../entities/admin-contact-message.entity';
import { AdminInvite } from '../entities/admin-invite.entity';
import { AdminReport } from '../entities/admin-report.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Conversation } from '../entities/conversation.entity';
import { Dream } from '../entities/dream.entity';
import { ManagedPatient } from '../entities/managed-patient.entity';
import { Message } from '../entities/message.entity';
import { Notification } from '../entities/notification.entity';
import { PatientInvite } from '../entities/patient-invite.entity';
import { Proposal } from '../entities/proposal.entity';
import { User } from '../entities/user.entity';

function loadLocalEnv() {
  const candidateRoots = [
    process.cwd(),
    resolve(process.cwd(), '..'),
    resolve(process.cwd(), '..', '..'),
    resolve(process.cwd(), '..', '..', '..'),
    resolve(process.cwd(), '..', '..', '..', '..'),
  ];
  const envFiles = candidateRoots.flatMap((root) =>
    ['.env.local', '.env'].map((name) => resolve(root, name)),
  );

  for (const file of envFiles) {
    if (!existsSync(file)) continue;

    const raw = readFileSync(file, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index <= 0) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

async function run() {
  loadLocalEnv();

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
      ManagedPatient,
      Message,
      Notification,
      PatientInvite,
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
