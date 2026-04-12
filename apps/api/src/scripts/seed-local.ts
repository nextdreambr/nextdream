import 'reflect-metadata';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { AdminContactMessage } from '../entities/admin-contact-message.entity';
import { AdminReport } from '../entities/admin-report.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Conversation } from '../entities/conversation.entity';
import { Dream } from '../entities/dream.entity';
import { Message } from '../entities/message.entity';
import { Notification } from '../entities/notification.entity';
import { Proposal } from '../entities/proposal.entity';
import { User } from '../entities/user.entity';

function loadLocalEnv() {
  const envFiles = ['.env.local', '.env'].map((name) => resolve(process.cwd(), '..', '..', name));

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

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run local seed.');
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
    AdminReport,
    AuditLog,
  ],
  synchronize: false,
});

async function run() {
  await dataSource.initialize();
  const manager = dataSource.manager;

  await manager.transaction(async (tx) => {
    await tx.query(
      'TRUNCATE TABLE notifications, messages, conversations, proposals, dreams, admin_reports, admin_contact_messages, audit_logs, users RESTART IDENTITY CASCADE',
    );

    const passwordHash = await bcrypt.hash('Seed123!', 10);

    await tx.insert(User, [
      {
        id: 'u-paciente-1',
        name: 'Paciente Demo 1',
        email: 'paciente1@nextdream.local',
        passwordHash,
        role: 'paciente',
        city: 'São Paulo, SP',
        verified: true,
        suspended: false,
        emailNotificationsEnabled: true,
      },
      {
        id: 'u-paciente-2',
        name: 'Paciente Demo 2',
        email: 'paciente2@nextdream.local',
        passwordHash,
        role: 'paciente',
        city: 'Campinas, SP',
        verified: true,
        suspended: false,
        emailNotificationsEnabled: false,
      },
      {
        id: 'u-apoiador-1',
        name: 'Apoiador Demo 1',
        email: 'apoiador1@nextdream.local',
        passwordHash,
        role: 'apoiador',
        city: 'São Paulo, SP',
        verified: true,
        suspended: false,
        emailNotificationsEnabled: true,
      },
      {
        id: 'u-apoiador-2',
        name: 'Apoiador Demo 2',
        email: 'apoiador2@nextdream.local',
        passwordHash,
        role: 'apoiador',
        city: 'Santos, SP',
        verified: true,
        suspended: false,
        emailNotificationsEnabled: false,
      },
      {
        id: 'u-admin-1',
        name: 'Admin Demo',
        email: 'admin@nextdream.local',
        passwordHash,
        role: 'admin',
        city: 'São Paulo, SP',
        verified: true,
        suspended: false,
        emailNotificationsEnabled: true,
      },
    ]);

    await tx.insert(Dream, [
      {
        id: 'd-demo-1',
        title: 'Passeio ao parque',
        description: 'Desejo companhia para uma manhã de passeio leve ao ar livre.',
        category: 'Experiência ao ar livre',
        format: 'presencial',
        urgency: 'media',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-2',
        title: 'Sessão de leitura em videochamada',
        description: 'Desejo uma conversa remota com leitura de trechos de livros.',
        category: 'Conversa e Companhia',
        format: 'remoto',
        urgency: 'baixa',
        status: 'em-conversa',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-3',
        title: 'Tocar violão em uma tarde tranquila',
        description: 'Quero dividir um momento musical simples e acolhedor.',
        category: 'Arte e Música',
        format: 'presencial',
        urgency: 'alta',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-4',
        title: 'Aprender uma receita de família por chamada',
        description: 'Preciso de ajuda para cozinhar uma receita afetiva à distância.',
        category: 'Culinária',
        format: 'remoto',
        urgency: 'alta',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-5',
        title: 'Configurar meu computador novo',
        description: 'Gostaria de apoio para instalar programas e deixar tudo pronto.',
        category: 'Tecnologia',
        format: 'ambos',
        urgency: 'media',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-6',
        title: 'Visitar uma biblioteca de bairro',
        description: 'Desejo companhia para escolher livros e conversar sobre leituras.',
        category: 'Literatura e Cultura',
        format: 'presencial',
        urgency: 'baixa',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-7',
        title: 'Montar uma rotina leve de autocuidado',
        description: 'Procuro alguém para me ajudar a organizar pequenos hábitos de bem-estar.',
        category: 'Saúde e Bem-estar',
        format: 'remoto',
        urgency: 'media',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-8',
        title: 'Organizar álbum de memórias da família',
        description: 'Quero apoio para separar fotos e registrar histórias importantes.',
        category: 'Família e Memórias',
        format: 'ambos',
        urgency: 'baixa',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-9',
        title: 'Revisar currículo e praticar entrevista',
        description: 'Preciso de alguém para simular entrevistas e dar feedback.',
        category: 'Aprendizado e Educação',
        format: 'remoto',
        urgency: 'alta',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-10',
        title: 'Caminhada curta no fim da tarde',
        description: 'Gostaria de companhia para retomar atividade física leve.',
        category: 'Esporte e Lazer',
        format: 'presencial',
        urgency: 'media',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-11',
        title: 'Momento de oração e escuta',
        description: 'Busco uma conversa tranquila com espaço para espiritualidade.',
        category: 'Espiritualidade',
        format: 'remoto',
        urgency: 'baixa',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-12',
        title: 'Passeio para fotografar a cidade',
        description: 'Quero explorar um hobby novo com companhia e incentivo.',
        category: 'Outro',
        format: 'ambos',
        urgency: 'alta',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
    ]);

    await tx.insert(Proposal, [
      {
        id: 'pr-demo-1',
        dreamId: 'd-demo-1',
        supporterId: 'u-apoiador-1',
        message: 'Posso acompanhar no sábado de manhã.',
        offering: 'Companhia e suporte no deslocamento',
        availability: 'Sábados, manhã',
        duration: '2 horas',
        status: 'enviada',
      },
      {
        id: 'pr-demo-2',
        dreamId: 'd-demo-2',
        supporterId: 'u-apoiador-2',
        message: 'Posso fazer uma sessão remota com leitura e conversa.',
        offering: 'Companhia por videochamada',
        availability: 'Noites durante a semana',
        duration: '1 hora',
        status: 'aceita',
      },
    ]);

    await tx.insert(Conversation, [
      {
        id: 'c-demo-1',
        dreamId: 'd-demo-2',
        patientId: 'u-paciente-2',
        supporterId: 'u-apoiador-2',
        status: 'ativa',
      },
    ]);

    await tx.insert(Message, [
      {
        id: 'm-demo-1',
        conversationId: 'c-demo-1',
        senderId: 'u-paciente-2',
        body: 'Olá! Obrigado por aceitar ajudar.',
        moderated: false,
      },
      {
        id: 'm-demo-2',
        conversationId: 'c-demo-1',
        senderId: 'u-apoiador-2',
        body: 'Combinado, podemos começar amanhã às 20h.',
        moderated: false,
      },
    ]);

    await tx.insert(AdminContactMessage, [
      {
        id: 'cm-demo-1',
        name: 'Contato Demo',
        email: 'contato@nextdream.local',
        subject: 'Dúvida sobre cadastro',
        body: 'Quais documentos são necessários para validação de perfil?',
        status: 'novo',
      },
    ]);

    await tx.insert(AdminReport, [
      {
        id: 'r-demo-1',
        type: 'linguagem',
        targetType: 'chat',
        targetId: 'c-demo-1',
        reason: 'Mensagem sinalizada para revisão de moderação.',
        status: 'aberto',
      },
    ]);

    await tx.insert(AuditLog, [
      {
        id: 'a-demo-1',
        action: 'Seed local executado',
        by: 'Sistema',
        target: 'Base local',
        type: 'sistema',
        severity: 'baixa',
        outcome: 'ok',
        details: 'Dados de validação de fluxo inseridos para ambiente local.',
        refPath: '/admin/overview',
      },
    ]);

    await tx.insert(Notification, [
      {
        id: 'n-demo-1',
        userId: 'u-paciente-1',
        type: 'proposta',
        title: 'Nova proposta recebida',
        message: 'Uma nova proposta foi enviada para um dos seus sonhos.',
        actionPath: '/paciente/propostas',
        read: false,
      },
      {
        id: 'n-demo-2',
        userId: 'u-apoiador-2',
        type: 'mensagem',
        title: 'Nova mensagem no chat',
        message: 'Você recebeu uma nova mensagem em uma conversa ativa.',
        actionPath: '/apoiador/chat?conversationId=c-demo-1',
        read: false,
      },
    ]);
  });
}

run()
  .then(async () => {
    await dataSource.destroy();
    process.stdout.write('Local seed completed successfully.\n');
  })
  .catch(async (error) => {
    process.stderr.write(
      `Local seed failed: ${error instanceof Error ? error.message : 'unknown error'}\n`,
    );
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exitCode = 1;
  });
