import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';

describe('NextDream API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('returns a health payload', async () => {
    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'nextdream-api',
    });
  });

  it('registers a patient, logs in, creates a dream and accepts a proposal flow', async () => {
    const patientEmail = 'ana@example.com';
    const supporterEmail = 'fernanda@example.com';
    const password = 'Secret123!';

    const patientRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Ana Souza',
        email: patientEmail,
        password,
        role: 'paciente',
        city: 'Santos, SP',
      });

    expect(patientRegister.status).toBe(201);
    expect(patientRegister.body.user.role).toBe('paciente');
    expect(patientRegister.body.accessToken).toEqual(expect.any(String));

    const supporterRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Fernanda Lima',
        email: supporterEmail,
        password,
        role: 'apoiador',
        city: 'Santos, SP',
      });

    expect(supporterRegister.status).toBe(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: patientEmail,
        password,
      });

    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe(patientEmail);

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`)
      .send({
        title: 'Ver o nascer do sol na praia',
        description: 'Quero sentir a areia nos pés novamente.',
        category: 'Experiência ao ar livre',
        format: 'presencial',
        urgency: 'alta',
        privacy: 'publico',
      });

    expect(createDream.status).toBe(201);
    expect(createDream.body.status).toBe('publicado');

    const listPublicDreams = await request(app.getHttpServer()).get('/dreams/public');
    expect(listPublicDreams.status).toBe(200);
    expect(listPublicDreams.body).toHaveLength(1);

    const createProposal = await request(app.getHttpServer())
      .post(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`)
      .send({
        message: 'Posso ajudar com transporte e companhia.',
        offering: 'Companhia e transporte',
        availability: 'Fins de semana',
        duration: '3 horas',
      });

    expect(createProposal.status).toBe(201);
    expect(createProposal.body.status).toBe('enviada');

    const supporterMine = await request(app.getHttpServer())
      .get('/proposals/mine')
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`);

    expect(supporterMine.status).toBe(200);
    expect(supporterMine.body).toHaveLength(1);
    expect(supporterMine.body[0].id).toBe(createProposal.body.id);

    const patientReceived = await request(app.getHttpServer())
      .get('/proposals/received')
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`);

    expect(patientReceived.status).toBe(200);
    expect(patientReceived.body).toHaveLength(1);
    expect(patientReceived.body[0].dreamId).toBe(createDream.body.id);

    const patientDreams = await request(app.getHttpServer())
      .get('/dreams/mine')
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`);

    expect(patientDreams.status).toBe(200);
    expect(patientDreams.body).toHaveLength(1);
    expect(patientDreams.body[0].id).toBe(createDream.body.id);

    const dreamProposals = await request(app.getHttpServer())
      .get(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`);

    expect(dreamProposals.status).toBe(200);
    expect(dreamProposals.body).toHaveLength(1);
    expect(dreamProposals.body[0].id).toBe(createProposal.body.id);

    const acceptProposal = await request(app.getHttpServer())
      .post(`/proposals/${createProposal.body.id}/accept`)
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`);

    expect(acceptProposal.status).toBe(200);
    expect(acceptProposal.body.status).toBe('aceita');
    expect(acceptProposal.body.conversationId).toEqual(expect.any(String));
  });

  it('supports conversations messaging and admin moderation endpoints', async () => {
    const password = 'Secret123!';

    const patientRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Patient Two',
        email: 'patient2@example.com',
        password,
        role: 'paciente',
        city: 'Santos, SP',
      });
    expect(patientRegister.status).toBe(201);

    const supporterRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Supporter Two',
        email: 'supporter2@example.com',
        password,
        role: 'apoiador',
        city: 'Santos, SP',
      });
    expect(supporterRegister.status).toBe(201);

    const adminRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password,
        role: 'admin',
      });
    expect(adminRegister.status).toBe(201);

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`)
      .send({
        title: 'Passeio ao parque',
        description: 'Quero caminhar no parque com companhia.',
        category: 'Passeio',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
      });
    expect(createDream.status).toBe(201);

    const createProposal = await request(app.getHttpServer())
      .post(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`)
      .send({
        message: 'Posso acompanhar no sábado pela manhã.',
        offering: 'Companhia',
        availability: 'Sábado',
        duration: '2 horas',
      });
    expect(createProposal.status).toBe(201);

    const patientNotificationsAfterProposal = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`);
    expect(patientNotificationsAfterProposal.status).toBe(200);
    expect(
      patientNotificationsAfterProposal.body.some(
        (item: { type: string }) => item.type === 'proposta',
      ),
    ).toBe(true);

    const acceptProposal = await request(app.getHttpServer())
      .post(`/proposals/${createProposal.body.id}/accept`)
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`);
    expect(acceptProposal.status).toBe(200);

    const supporterNotificationsAfterAccept = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`);
    expect(supporterNotificationsAfterAccept.status).toBe(200);
    expect(
      supporterNotificationsAfterAccept.body.some((item: { type: string }) => item.type === 'aceito'),
    ).toBe(true);

    const conversationId = acceptProposal.body.conversationId as string;
    expect(conversationId).toEqual(expect.any(String));

    const patientConversations = await request(app.getHttpServer())
      .get('/conversations/mine')
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`);
    expect(patientConversations.status).toBe(200);
    expect(patientConversations.body.some((item: { id: string }) => item.id === conversationId)).toBe(true);

    const supporterConversations = await request(app.getHttpServer())
      .get('/conversations/mine')
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`);
    expect(supporterConversations.status).toBe(200);
    expect(supporterConversations.body.some((item: { id: string }) => item.id === conversationId)).toBe(true);

    const postPatientMessage = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`)
      .send({ body: 'Olá! Obrigado por topar ajudar.' });
    expect(postPatientMessage.status).toBe(201);

    const supporterNotificationsAfterMessage = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`);
    expect(supporterNotificationsAfterMessage.status).toBe(200);
    expect(
      supporterNotificationsAfterMessage.body.some(
        (item: { type: string }) => item.type === 'mensagem',
      ),
    ).toBe(true);

    const postSupporterMessage = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`)
      .send({ body: 'Combinado, estarei lá no horário.' });
    expect(postSupporterMessage.status).toBe(201);

    const listMessages = await request(app.getHttpServer())
      .get(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`);
    expect(listMessages.status).toBe(200);
    expect(listMessages.body).toHaveLength(2);

    const closeConversation = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/close`)
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`)
      .send({ reason: 'Encerrado para teste de moderação.' });
    expect(closeConversation.status).toBe(200);
    expect(closeConversation.body.status).toBe('encerrada');

    const postAfterClose = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${patientRegister.body.accessToken}`)
      .send({ body: 'Mensagem após encerramento.' });
    expect(postAfterClose.status).toBe(403);

    const adminOverview = await request(app.getHttpServer())
      .get('/admin/overview')
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`);
    expect(adminOverview.status).toBe(200);
    expect(adminOverview.body.totalUsers).toBeGreaterThan(0);

    const adminUsers = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`);
    expect(adminUsers.status).toBe(200);
    expect(adminUsers.body.length).toBeGreaterThan(0);

    const suspendUser = await request(app.getHttpServer())
      .post(`/admin/users/${supporterRegister.body.user.id}/suspend`)
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`)
      .send({ reason: 'Teste de suspensão' });
    expect(suspendUser.status).toBe(200);
    expect(suspendUser.body.suspended).toBe(true);

    const adminDreams = await request(app.getHttpServer())
      .get('/admin/dreams')
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`);
    expect(adminDreams.status).toBe(200);
    expect(adminDreams.body.length).toBeGreaterThan(0);

    const updateDreamStatus = await request(app.getHttpServer())
      .post(`/admin/dreams/${createDream.body.id}/status`)
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`)
      .send({ status: 'pausado', reason: 'Teste de moderação de sonho' });
    expect(updateDreamStatus.status).toBe(200);
    expect(updateDreamStatus.body.status).toBe('pausado');

    const adminProposals = await request(app.getHttpServer())
      .get('/admin/proposals')
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`);
    expect(adminProposals.status).toBe(200);
    expect(adminProposals.body.length).toBeGreaterThan(0);

    const updateProposalStatus = await request(app.getHttpServer())
      .post(`/admin/proposals/${createProposal.body.id}/status`)
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`)
      .send({ status: 'em-analise', reason: 'Teste de moderação de proposta' });
    expect(updateProposalStatus.status).toBe(200);
    expect(updateProposalStatus.body.status).toBe('em-analise');

    const adminChats = await request(app.getHttpServer())
      .get('/admin/chats')
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`);
    expect(adminChats.status).toBe(200);
    expect(adminChats.body.length).toBeGreaterThan(0);

    const adminMessages = await request(app.getHttpServer())
      .get('/admin/messages')
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`);
    expect(adminMessages.status).toBe(200);
    expect(Array.isArray(adminMessages.body)).toBe(true);
    expect(adminMessages.body).toHaveLength(0);

    const adminReports = await request(app.getHttpServer())
      .get('/admin/reports')
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`);
    expect(adminReports.status).toBe(200);
    expect(adminReports.body.length).toBeGreaterThan(0);

    const updateReportStatus = await request(app.getHttpServer())
      .post(`/admin/reports/${adminReports.body[0].id}/status`)
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`)
      .send({ status: 'resolvido', resolution: 'Resolvido no teste' });
    expect(updateReportStatus.status).toBe(200);
    expect(updateReportStatus.body.status).toBe('resolvido');

    const adminAudit = await request(app.getHttpServer())
      .get('/admin/audit')
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`);
    expect(adminAudit.status).toBe(200);
    expect(adminAudit.body.length).toBeGreaterThan(0);

    const adminEmailTemplates = await request(app.getHttpServer())
      .get('/admin/email-templates')
      .set('Authorization', `Bearer ${adminRegister.body.accessToken}`);
    expect(adminEmailTemplates.status).toBe(200);
    expect(adminEmailTemplates.body.length).toBeGreaterThan(0);

    const notificationPreferences = await request(app.getHttpServer())
      .get('/notifications/preferences')
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`);
    expect(notificationPreferences.status).toBe(200);
    expect(notificationPreferences.body.emailEnabled).toBe(false);

    const updateNotificationPreferences = await request(app.getHttpServer())
      .post('/notifications/preferences')
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`)
      .send({ emailEnabled: true });
    expect(updateNotificationPreferences.status).toBe(200);
    expect(updateNotificationPreferences.body.emailEnabled).toBe(true);

    const notificationsMine = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`);
    expect(notificationsMine.status).toBe(200);
    expect(notificationsMine.body.length).toBeGreaterThan(0);

    const markRead = await request(app.getHttpServer())
      .post(`/notifications/${notificationsMine.body[0].id}/read`)
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`);
    expect(markRead.status).toBe(200);
    expect(markRead.body.read).toBe(true);

    const markAllRead = await request(app.getHttpServer())
      .post('/notifications/read-all')
      .set('Authorization', `Bearer ${supporterRegister.body.accessToken}`);
    expect(markAllRead.status).toBe(200);
    expect(markAllRead.body.ok).toBe(true);
  });
});
