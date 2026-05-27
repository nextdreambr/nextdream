import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Repository } from 'typeorm';
import { AdminContactMessage } from '../src/entities/admin-contact-message.entity';
import { AdminReport } from '../src/entities/admin-report.entity';
import { Conversation } from '../src/entities/conversation.entity';
import { Dream } from '../src/entities/dream.entity';
import { ManagedPatient } from '../src/entities/managed-patient.entity';
import { Message } from '../src/entities/message.entity';
import { Proposal } from '../src/entities/proposal.entity';
import { User } from '../src/entities/user.entity';

function getAccessTokenFromSetCookie(setCookieHeader: string | string[] | undefined): string {
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : setCookieHeader
      ? [setCookieHeader]
      : [];
  const accessCookie = cookies.find((cookie) => cookie.startsWith('nd_access_token='));
  if (!accessCookie) {
    throw new Error('Missing nd_access_token cookie');
  }

  return accessCookie.split(';', 1)[0].replace('nd_access_token=', '');
}

describe('Admin operational resources', () => {
  let appModule: (typeof import('../src/app.module'))['AppModule'];
  let currentApp: INestApplication | null = null;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAppUrl = process.env.APP_URL;
  const originalCorsOrigin = process.env.CORS_ORIGIN;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.APP_URL = 'http://localhost:5173';
    process.env.CORS_ORIGIN = 'http://localhost:5173';
    ({ AppModule: appModule } = await import('../src/app.module'));
  });

  afterAll(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalAppUrl === undefined) {
      delete process.env.APP_URL;
    } else {
      process.env.APP_URL = originalAppUrl;
    }

    if (originalCorsOrigin === undefined) {
      delete process.env.CORS_ORIGIN;
    } else {
      process.env.CORS_ORIGIN = originalCorsOrigin;
    }
  });

  async function createApp() {
    const moduleRef = await Test.createTestingModule({
      imports: [appModule],
    }).compile();

    const app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();

    return {
      app,
      usersRepository: moduleRef.get<Repository<User>>(getRepositoryToken(User)),
      dreamsRepository: moduleRef.get<Repository<Dream>>(getRepositoryToken(Dream)),
      proposalsRepository: moduleRef.get<Repository<Proposal>>(getRepositoryToken(Proposal)),
      conversationsRepository: moduleRef.get<Repository<Conversation>>(getRepositoryToken(Conversation)),
      messagesRepository: moduleRef.get<Repository<Message>>(getRepositoryToken(Message)),
      reportsRepository: moduleRef.get<Repository<AdminReport>>(getRepositoryToken(AdminReport)),
      contactMessagesRepository: moduleRef.get<Repository<AdminContactMessage>>(getRepositoryToken(AdminContactMessage)),
      managedPatientsRepository: moduleRef.get<Repository<ManagedPatient>>(getRepositoryToken(ManagedPatient)),
    };
  }

  async function createUser(
    usersRepository: Repository<User>,
    input: {
      name: string;
      email: string;
      role: User['role'];
    },
  ) {
    return usersRepository.save(
      usersRepository.create({
        name: input.name,
        email: input.email,
        passwordHash: await bcrypt.hash('Secret123!', 10),
        role: input.role,
        verified: true,
        approved: true,
        approvedAt: new Date(),
        suspended: false,
      }),
    );
  }

  async function loginAsAdmin(app: INestApplication, admin: User) {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: admin.email,
      password: 'Secret123!',
    });

    expect(response.status).toBe(200);
    return getAccessTokenFromSetCookie(response.headers['set-cookie']);
  }

  afterEach(async () => {
    if (currentApp) {
      await currentApp.close();
      currentApp = null;
    }
  });

  it('supports paginated admin listings with filters, rich details and real report counts', async () => {
    const {
      app,
      usersRepository,
      dreamsRepository,
      proposalsRepository,
      conversationsRepository,
      messagesRepository,
      reportsRepository,
      contactMessagesRepository,
      managedPatientsRepository,
    } = await createApp();
    currentApp = app;

    const admin = await createUser(usersRepository, {
      name: 'Admin Operacional',
      email: 'admin-operacional@example.com',
      role: 'admin',
    });
    const supporter = await createUser(usersRepository, {
      name: 'Apoiadora Luz',
      email: 'apoiadora-luz@example.com',
      role: 'apoiador',
    });
    const institution = await createUser(usersRepository, {
      name: 'Instituto Harmonia',
      email: 'instituto-harmonia@example.com',
      role: 'instituicao',
    });

    const managedPatient = await managedPatientsRepository.save(
      managedPatientsRepository.create({
        institutionId: institution.id,
        name: 'Paciente Melodia',
        state: 'RJ',
        city: 'Niterói',
      }),
    );

    const dream = await dreamsRepository.save(
      dreamsRepository.create({
        title: 'Oficina de música assistida',
        description: 'Sessão com instrumentos leves e apoio emocional.',
        originalLanguage: 'en-US',
        translations: {
          'pt-BR': {
            title: 'Oficina de música assistida',
            description: 'Sessão com instrumentos leves e apoio emocional.',
            source: 'machine',
            createdAt: '2026-04-21T12:00:00.000Z',
            updatedAt: '2026-04-21T12:00:00.000Z',
            reviewedAt: null,
          },
        },
        category: 'Convivência',
        format: 'presencial',
        urgency: 'alta',
        privacy: 'verificados',
        status: 'publicado',
        patientId: institution.id,
        managedPatientId: managedPatient.id,
      }),
    );

    const proposal = await proposalsRepository.save(
      proposalsRepository.create({
        dreamId: dream.id,
        supporterId: supporter.id,
        message: 'Posso conduzir uma vivência musical de 90 minutos.',
        offering: 'Vivência musical',
        availability: 'Quartas à tarde',
        duration: '90 minutos',
        status: 'enviada',
      }),
    );

    const conversation = await conversationsRepository.save(
      conversationsRepository.create({
        dreamId: dream.id,
        patientId: institution.id,
        managedPatientId: managedPatient.id,
        supporterId: supporter.id,
        status: 'ativa',
      }),
    );

    const moderatedMessage = await messagesRepository.save(
      messagesRepository.create({
        conversationId: conversation.id,
        senderId: supporter.id,
        body: 'Mensagem sinalizada para revisão manual.',
        moderated: true,
        createdAt: new Date('2026-04-20T14:50:00.000Z'),
      }),
    );
    await messagesRepository.save(
      messagesRepository.create({
        conversationId: conversation.id,
        senderId: institution.id,
        body: 'Resposta operacional da instituição.',
        moderated: false,
        createdAt: new Date('2026-04-20T15:00:00.000Z'),
      }),
    );

    await contactMessagesRepository.save(
      contactMessagesRepository.create({
        name: 'Marina Souza',
        email: 'marina@example.com',
        subject: 'Dúvida sobre apoio presencial',
        body: 'Gostaria de entender como a equipe acompanha conversas sensíveis.',
        status: 'em-analise',
      }),
    );

    const chatReport = await reportsRepository.save(
      reportsRepository.create({
        type: 'chat-moderation',
        targetType: 'chat',
        targetId: conversation.id,
        reason: 'Conversa sinalizada após moderação automática.',
        status: 'aberto',
      }),
    );
    await reportsRepository.save(
      reportsRepository.create({
        type: 'message-review',
        targetType: 'message',
        targetId: moderatedMessage.id,
        reason: 'Mensagem marcada para triagem manual.',
        status: 'aberto',
      }),
    );
    await reportsRepository.save(
      reportsRepository.create({
        type: 'message-repeat',
        targetType: 'message',
        targetId: moderatedMessage.id,
        reason: 'Segundo relato para o mesmo alvo.',
        status: 'em-analise',
      }),
    );

    const adminToken = await loginAsAdmin(app, admin);

    const overview = await request(app.getHttpServer())
      .get('/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(overview.status).toBe(200);
    expect(overview.body.totalReportsOpen).toBe(2);
    expect(overview.body).toMatchObject({
      systemStatus: {
        api: 'online',
      },
      workQueues: {
        reportsOpen: 2,
        institutionsPendingApproval: 0,
        chatsWithModeration: 1,
        contactMessagesNew: 0,
        proposalsInReview: 0,
      },
      health: {
        activeChats: 1,
        closedChats: 0,
        usersByRole: {
          admin: 1,
          apoiador: 1,
          instituicao: 1,
        },
        dreamsByStatus: {
          publicado: 1,
        },
        proposalsByStatus: {
          enviada: 1,
        },
      },
      riskCare: {
        moderatedMessages: 1,
        recurringReportedTargets: [
          {
            targetType: 'message',
            targetId: moderatedMessage.id,
            count: 2,
          },
        ],
      },
      recent: {
        reports: expect.arrayContaining([
          expect.objectContaining({
            id: chatReport.id,
            type: 'chat-moderation',
          }),
        ]),
        moderatedChats: expect.arrayContaining([
          expect.objectContaining({
            id: conversation.id,
            dreamTitle: 'Oficina de música assistida',
          }),
        ]),
      },
    });

    const dreamsList = await request(app.getHttpServer())
      .get('/admin/dreams?page=1&pageSize=10&query=musica&status=publicado&category=Convivência&format=presencial&urgency=alta&privacy=verificados&location=Niterói&report=true&proposal=with')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(dreamsList.status).toBe(200);
    expect(dreamsList.body.total).toBe(1);
    expect(dreamsList.body.pageSize).toBe(10);
    expect(dreamsList.body.items[0]).toMatchObject({
      id: dream.id,
      title: 'Oficina de música assistida',
      originalLanguage: 'en-US',
      locationLabel: 'Niterói, RJ',
      proposalCount: 1,
      chatCount: 1,
      reportCount: 1,
    });

    const dreamDetail = await request(app.getHttpServer())
      .get(`/admin/dreams/${dream.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(dreamDetail.status).toBe(200);
    expect(dreamDetail.body).toMatchObject({
      id: dream.id,
      title: 'Oficina de música assistida',
      managedPatientName: 'Paciente Melodia',
      institutionName: 'Instituto Harmonia',
      originalLanguage: 'en-US',
      translations: {
        'pt-BR': expect.objectContaining({
          source: 'machine',
          reviewedAt: null,
        }),
      },
      locationLabel: 'Niterói, RJ',
      proposalCount: 1,
      chatCount: 1,
      reportCount: 1,
    });
    expect(dreamDetail.body.relatedProposals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: proposal.id, supporterName: 'Apoiadora Luz' }),
      ]),
    );
    expect(dreamDetail.body.linkedConversation).toMatchObject({
      id: conversation.id,
      hasModeratedMessages: true,
    });
    expect(dreamDetail.body.relatedReports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: chatReport.id, targetType: 'chat' }),
      ]),
    );

    const proposalsList = await request(app.getHttpServer())
      .get('/admin/proposals?page=1&pageSize=10&query=vivência&status=enviada&supporter=Apoiadora%20Luz&dream=música&conversation=true&report=true&risk=high&location=Niterói')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(proposalsList.status).toBe(200);
    expect(proposalsList.body.total).toBe(1);
    expect(proposalsList.body.items[0]).toMatchObject({
      id: proposal.id,
      supporterName: 'Apoiadora Luz',
      dreamTitle: 'Oficina de música assistida',
      conversationId: conversation.id,
      conversationStatus: 'ativa',
      reportCount: 1,
      riskLevel: 'high',
      locationLabel: 'Niterói, RJ',
    });
    expect(proposalsList.body.items[0].updatedAt).toBeTruthy();

    const proposalDetail = await request(app.getHttpServer())
      .get(`/admin/proposals/${proposal.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(proposalDetail.status).toBe(200);
    expect(proposalDetail.body).toMatchObject({
      id: proposal.id,
      availability: 'Quartas à tarde',
      duration: '90 minutos',
      institutionName: 'Instituto Harmonia',
      conversationId: conversation.id,
      conversationStatus: 'ativa',
      reportCount: 1,
      riskLevel: 'high',
      locationLabel: 'Niterói, RJ',
    });
    expect(proposalDetail.body.relatedConversation).toMatchObject({
      id: conversation.id,
      hasModeratedMessages: true,
    });
    expect(proposalDetail.body.relatedReports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: chatReport.id, targetType: 'chat' }),
      ]),
    );

    const messagesList = await request(app.getHttpServer())
      .get('/admin/messages?page=1&pageSize=10&query=apoio&status=em-analise&email=marina@example.com')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(messagesList.status).toBe(200);
    expect(messagesList.body.total).toBe(1);
    expect(messagesList.body.items[0]).toMatchObject({
      subject: 'Dúvida sobre apoio presencial',
      email: 'marina@example.com',
    });

    const messageDetail = await request(app.getHttpServer())
      .get(`/admin/messages/${messagesList.body.items[0].id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(messageDetail.status).toBe(200);
    expect(messageDetail.body.body).toContain('acompanha conversas sensíveis');

    const chatsList = await request(app.getHttpServer())
      .get('/admin/chats?page=1&pageSize=10&status=ativa&dream=música&patient=Paciente%20Melodia&supporter=Apoiadora%20Luz&moderated=true')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(chatsList.status).toBe(200);
    expect(chatsList.body.total).toBe(1);
    expect(chatsList.body.items[0]).toMatchObject({
      id: conversation.id,
      hasModeratedMessages: true,
      hasModerationReport: true,
      lastMessagePreview: 'Resposta operacional da instituição.',
    });

    const riskyReportedChatsList = await request(app.getHttpServer())
      .get('/admin/chats?page=1&pageSize=10&report=true&risk=high&entity=Harmonia')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(riskyReportedChatsList.status).toBe(200);
    expect(riskyReportedChatsList.body.total).toBe(1);
    expect(riskyReportedChatsList.body.items[0].id).toBe(conversation.id);

    const chatDetail = await request(app.getHttpServer())
      .get(`/admin/chats/${conversation.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(chatDetail.status).toBe(200);
    expect(chatDetail.body).toMatchObject({
      id: conversation.id,
      dreamTitle: 'Oficina de música assistida',
      managedPatientName: 'Paciente Melodia',
      hasModeratedMessages: true,
      hasModerationReport: true,
    });
    expect(chatDetail.body.latestMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: moderatedMessage.id, moderated: true }),
      ]),
    );

    const reportsList = await request(app.getHttpServer())
      .get('/admin/reports?page=1&pageSize=10&status=aberto&type=chat-moderation&targetType=chat&severity=high&entity=Harmonia')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(reportsList.status).toBe(200);
    expect(reportsList.body.total).toBe(1);
    expect(reportsList.body.items[0].id).toBe(chatReport.id);
    expect(reportsList.body.items[0]).toMatchObject({
      severity: 'high',
      entityLabel: 'Oficina de música assistida',
      targetSummary: expect.objectContaining({
        chatId: conversation.id,
        dreamTitle: 'Oficina de música assistida',
        patientName: 'Paciente Melodia',
        supporterName: 'Apoiadora Luz',
      }),
    });

    const reportDetail = await request(app.getHttpServer())
      .get(`/admin/reports/${chatReport.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(reportDetail.status).toBe(200);
    expect(reportDetail.body).toMatchObject({
      id: chatReport.id,
      reason: 'Conversa sinalizada após moderação automática.',
      targetType: 'chat',
      severity: 'high',
      entityLabel: 'Oficina de música assistida',
      targetSummary: expect.objectContaining({
        chatId: conversation.id,
        dreamTitle: 'Oficina de música assistida',
      }),
    });
  });
});
