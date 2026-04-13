import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { AdminInvite } from '../src/entities/admin-invite.entity';
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

describe('NextDream API', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let adminInvitesRepository: Repository<AdminInvite>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    usersRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    adminInvitesRepository = moduleRef.get<Repository<AdminInvite>>(getRepositoryToken(AdminInvite));
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
    expect(patientRegister.body).not.toHaveProperty('accessToken');
    expect(patientRegister.body).not.toHaveProperty('refreshToken');
    expect(getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])).toEqual(expect.any(String));

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
    expect(login.body).not.toHaveProperty('accessToken');
    expect(login.body).not.toHaveProperty('refreshToken');

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`)
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
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`)
      .send({
        message: 'Posso ajudar com transporte e companhia.',
        offering: 'Companhia e transporte',
        availability: 'Fins de semana',
        duration: '3 horas',
      });

    expect(createProposal.status).toBe(201);
    expect(createProposal.body.status).toBe('enviada');

    const duplicateProposal = await request(app.getHttpServer())
      .post(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`)
      .send({
        message: 'Tentando enviar uma segunda proposta.',
        offering: 'Companhia',
        availability: 'Domingo',
        duration: '1 hora',
      });

    expect(duplicateProposal.status).toBe(409);

    const supporterMine = await request(app.getHttpServer())
      .get('/proposals/mine')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`);

    expect(supporterMine.status).toBe(200);
    expect(supporterMine.body).toHaveLength(1);
    expect(supporterMine.body[0].id).toBe(createProposal.body.id);

    const patientReceived = await request(app.getHttpServer())
      .get('/proposals/received')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`);

    expect(patientReceived.status).toBe(200);
    expect(patientReceived.body).toHaveLength(1);
    expect(patientReceived.body[0].dreamId).toBe(createDream.body.id);

    const patientDreams = await request(app.getHttpServer())
      .get('/dreams/mine')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`);

    expect(patientDreams.status).toBe(200);
    expect(patientDreams.body).toHaveLength(1);
    expect(patientDreams.body[0].id).toBe(createDream.body.id);

    const dreamProposals = await request(app.getHttpServer())
      .get(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`);

    expect(dreamProposals.status).toBe(200);
    expect(dreamProposals.body).toHaveLength(1);
    expect(dreamProposals.body[0].id).toBe(createProposal.body.id);

    const acceptProposal = await request(app.getHttpServer())
      .post(`/proposals/${createProposal.body.id}/accept`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`);

    expect(acceptProposal.status).toBe(200);
    expect(acceptProposal.body.status).toBe('aceita');
    expect(acceptProposal.body.conversationId).toEqual(expect.any(String));

    const supporterDreamDetail = await request(app.getHttpServer())
      .get(`/dreams/${createDream.body.id}`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`);

    expect(supporterDreamDetail.status).toBe(200);
    expect(supporterDreamDetail.body.id).toBe(createDream.body.id);
  });

  it('returns the duplicate proposal message on repeated supporter submission', async () => {
    const password = 'Secret123!';

    const patientRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Paciente Duplicado',
        email: 'patient-duplicate@example.com',
        password,
        role: 'paciente',
        city: 'Santos, SP',
      });
    expect(patientRegister.status).toBe(201);

    const supporterRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Apoiadora Duplicada',
        email: 'supporter-duplicate@example.com',
        password,
        role: 'apoiador',
        city: 'Santos, SP',
      });
    expect(supporterRegister.status).toBe(201);

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`)
      .send({
        title: 'Aprender violao',
        description: 'Quero tocar minhas musicas favoritas.',
        category: 'Arte e Música',
        format: 'remoto',
        urgency: 'media',
        privacy: 'publico',
      });
    expect(createDream.status).toBe(201);

    const createProposal = await request(app.getHttpServer())
      .post(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`)
      .send({
        message: 'Posso ajudar com aulas online.',
        offering: 'Aulas de violao',
        availability: 'Noites de semana',
        duration: '1 hora',
      });
    expect(createProposal.status).toBe(201);

    const duplicateProposal = await request(app.getHttpServer())
      .post(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`)
      .send({
        message: 'Tentando repetir a proposta.',
        offering: 'Aulas de violao',
        availability: 'Sabado',
        duration: '2 horas',
      });

    expect(duplicateProposal.status).toBe(409);
    expect(duplicateProposal.body.message).toBe('Você já enviou uma proposta para este sonho.');
  });

  it('accepts HttpOnly access token cookie as auth fallback', async () => {
    const password = 'Secret123!';

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Paciente Cookie',
        email: 'patient-cookie@example.com',
        password,
        role: 'paciente',
        city: 'Santos, SP',
      });

    expect(register.status).toBe(201);
    expect(register.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('nd_access_token=')]),
    );

    const cookies = register.headers['set-cookie'];
    const mine = await request(app.getHttpServer())
      .get('/dreams/mine')
      .set('Cookie', cookies);

    expect(mine.status).toBe(200);
    expect(Array.isArray(mine.body)).toBe(true);
  });

  it('clears auth cookies on logout', async () => {
    const password = 'Secret123!';

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Paciente Logout',
        email: 'patient-logout@example.com',
        password,
        role: 'paciente',
        city: 'Santos, SP',
      });

    expect(register.status).toBe(201);

    const logout = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', register.headers['set-cookie']);

    expect(logout.status).toBe(204);
    expect(logout.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('nd_access_token=;'),
        expect.stringContaining('nd_refresh_token=;'),
      ]),
    );
  });

  it('forbids a supporter without proposal from viewing a dream that is no longer published', async () => {
    const password = 'Secret123!';

    const patientRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Paciente Restrito',
        email: 'patient-restricted@example.com',
        password,
        role: 'paciente',
        city: 'Curitiba, PR',
      });
    expect(patientRegister.status).toBe(201);

    const supporterRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Apoiadora Autorizada',
        email: 'supporter-authorized@example.com',
        password,
        role: 'apoiador',
        city: 'Curitiba, PR',
      });
    expect(supporterRegister.status).toBe(201);

    const outsiderRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Apoiadora Sem Proposta',
        email: 'supporter-outsider@example.com',
        password,
        role: 'apoiador',
        city: 'Curitiba, PR',
      });
    expect(outsiderRegister.status).toBe(201);

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`)
      .send({
        title: 'Passear no jardim botanico',
        description: 'Quero visitar um lugar tranquilo e bonito.',
        category: 'Passeio',
        format: 'presencial',
        urgency: 'baixa',
        privacy: 'publico',
      });
    expect(createDream.status).toBe(201);

    const createProposal = await request(app.getHttpServer())
      .post(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`)
      .send({
        message: 'Posso acompanhar voce nesse passeio.',
        offering: 'Companhia',
        availability: 'Fim de tarde',
        duration: '2 horas',
      });
    expect(createProposal.status).toBe(201);

    const acceptProposal = await request(app.getHttpServer())
      .post(`/proposals/${createProposal.body.id}/accept`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`);
    expect(acceptProposal.status).toBe(200);

    const outsiderDreamDetail = await request(app.getHttpServer())
      .get(`/dreams/${createDream.body.id}`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(outsiderRegister.headers["set-cookie"])}`);

    expect(outsiderDreamDetail.status).toBe(403);
    expect(outsiderDreamDetail.body.message).toBe('You are not allowed to view this dream');
  });

  it('forbids a different patient from listing proposals for a dream they do not own', async () => {
    const password = 'Secret123!';

    const ownerRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Paciente Dona',
        email: 'patient-owner@example.com',
        password,
        role: 'paciente',
        city: 'Maringá, PR',
      });
    expect(ownerRegister.status).toBe(201);

    const otherPatientRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Paciente Visitante',
        email: 'patient-other@example.com',
        password,
        role: 'paciente',
        city: 'Londrina, PR',
      });
    expect(otherPatientRegister.status).toBe(201);

    const supporterRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Apoiador Proposta',
        email: 'supporter-proposal-list@example.com',
        password,
        role: 'apoiador',
        city: 'Maringá, PR',
      });
    expect(supporterRegister.status).toBe(201);

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(ownerRegister.headers["set-cookie"])}`)
      .send({
        title: 'Tomar cafe em boa companhia',
        description: 'Quero uma conversa leve em um cafe acolhedor.',
        category: 'Conversa',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
      });
    expect(createDream.status).toBe(201);

    const createProposal = await request(app.getHttpServer())
      .post(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`)
      .send({
        message: 'Posso estar com voce nesse encontro.',
        offering: 'Companhia',
        availability: 'Manha',
        duration: '1 hora',
      });
    expect(createProposal.status).toBe(201);

    const foreignPatientProposals = await request(app.getHttpServer())
      .get(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(otherPatientRegister.headers["set-cookie"])}`);

    expect(foreignPatientProposals.status).toBe(403);
    expect(foreignPatientProposals.body.message).toBe('Only the dream owner can view proposals');
  });

  it('rejects public registration with admin role', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Admin Attempt',
        email: 'admin-attempt@example.com',
        password: 'Secret123!',
        role: 'admin',
      });

    expect(response.status).toBe(400);
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

    await usersRepository.save(
      usersRepository.create({
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash(password, 10),
        role: 'admin',
        verified: true,
        suspended: false,
      }),
    );

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password,
      });
    expect(adminLogin.status).toBe(200);

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`)
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
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`)
      .send({
        message: 'Posso acompanhar no sábado pela manhã.',
        offering: 'Companhia',
        availability: 'Sábado',
        duration: '2 horas',
      });
    expect(createProposal.status).toBe(201);

    const patientNotificationsAfterProposal = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`);
    expect(patientNotificationsAfterProposal.status).toBe(200);
    expect(
      patientNotificationsAfterProposal.body.some(
        (item: { type: string }) => item.type === 'proposta',
      ),
    ).toBe(true);

    const acceptProposal = await request(app.getHttpServer())
      .post(`/proposals/${createProposal.body.id}/accept`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`);
    expect(acceptProposal.status).toBe(200);

    const supporterNotificationsAfterAccept = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`);
    expect(supporterNotificationsAfterAccept.status).toBe(200);
    expect(
      supporterNotificationsAfterAccept.body.some((item: { type: string }) => item.type === 'aceito'),
    ).toBe(true);

    const conversationId = acceptProposal.body.conversationId as string;
    expect(conversationId).toEqual(expect.any(String));

    const patientConversations = await request(app.getHttpServer())
      .get('/conversations/mine')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`);
    expect(patientConversations.status).toBe(200);
    expect(patientConversations.body.some((item: { id: string }) => item.id === conversationId)).toBe(true);

    const supporterConversations = await request(app.getHttpServer())
      .get('/conversations/mine')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`);
    expect(supporterConversations.status).toBe(200);
    expect(supporterConversations.body.some((item: { id: string }) => item.id === conversationId)).toBe(true);

    const postPatientMessage = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`)
      .send({ body: 'Olá! Obrigado por topar ajudar.' });
    expect(postPatientMessage.status).toBe(201);

    const supporterNotificationsAfterMessage = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`);
    expect(supporterNotificationsAfterMessage.status).toBe(200);
    expect(
      supporterNotificationsAfterMessage.body.some(
        (item: { type: string }) => item.type === 'mensagem',
      ),
    ).toBe(true);

    const postSupporterMessage = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`)
      .send({ body: 'Combinado, estarei lá no horário.' });
    expect(postSupporterMessage.status).toBe(201);

    const listMessages = await request(app.getHttpServer())
      .get(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`);
    expect(listMessages.status).toBe(200);
    expect(listMessages.body).toHaveLength(2);

    const closeConversation = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/close`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ reason: 'Encerrado para teste de moderação.' });
    expect(closeConversation.status).toBe(200);
    expect(closeConversation.body.status).toBe('encerrada');

    const postAfterClose = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(patientRegister.headers["set-cookie"])}`)
      .send({ body: 'Mensagem após encerramento.' });
    expect(postAfterClose.status).toBe(403);

    const adminOverview = await request(app.getHttpServer())
      .get('/admin/overview')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);
    expect(adminOverview.status).toBe(200);
    expect(adminOverview.body.totalUsers).toBeGreaterThan(0);

    const adminUsers = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);
    expect(adminUsers.status).toBe(200);
    expect(adminUsers.body.length).toBeGreaterThan(0);
    expect(adminUsers.body.every((item: { role: string }) => item.role !== 'admin')).toBe(true);

    const adminAdmins = await request(app.getHttpServer())
      .get('/admin/admins')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);
    expect(adminAdmins.status).toBe(200);
    expect(adminAdmins.body.some((item: { email: string }) => item.email === 'admin@example.com')).toBe(true);

    const selfDeactivate = await request(app.getHttpServer())
      .patch(`/admin/admins/${adminLogin.body.user.id}`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ isActive: false });
    expect(selfDeactivate.status).toBe(400);

    const createSecondAdmin = await usersRepository.save(
      usersRepository.create({
        name: 'Admin Two',
        email: 'admin2@example.com',
        passwordHash: await bcrypt.hash(password, 10),
        role: 'admin',
        verified: true,
        suspended: false,
      }),
    );

    const updateOtherAdminWithoutPassword = await request(app.getHttpServer())
      .patch(`/admin/admins/${createSecondAdmin.id}`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({
        name: 'Admin Two Updated Again',
      });
    expect(updateOtherAdminWithoutPassword.status).toBe(400);

    const updateSecondAdmin = await request(app.getHttpServer())
      .patch(`/admin/admins/${createSecondAdmin.id}`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({
        name: 'Admin Two Updated',
        email: 'admin2-updated@example.com',
        role: 'apoiador',
        isActive: true,
        currentPassword: password,
      });
    expect(updateSecondAdmin.status).toBe(200);
    expect(updateSecondAdmin.body.role).toBe('apoiador');

    const updateAdminPassword = await request(app.getHttpServer())
      .patch(`/admin/admins/${adminLogin.body.user.id}`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ newPassword: 'NewSecret123!', currentPassword: password });
    expect(updateAdminPassword.status).toBe(200);

    const reloginWithNewPassword = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'admin@example.com',
      password: 'NewSecret123!',
    });
    expect(reloginWithNewPassword.status).toBe(200);

    const inviteAdminExistingUser = await request(app.getHttpServer())
      .post('/admin/admins/invite')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ email: 'supporter2@example.com' });
    expect(inviteAdminExistingUser.status).toBe(400);

    const inviteAdmin = await request(app.getHttpServer())
      .post('/admin/admins/invite')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ email: 'admin-invite@example.com' });
    expect(inviteAdmin.status).toBe(500);

    const knownToken = 'InviteToken123!';
    await adminInvitesRepository.save(
      adminInvitesRepository.create({
        email: 'manual-invite@example.com',
        tokenHash: await bcrypt.hash(knownToken, 10),
        invitedByUserId: adminLogin.body.user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      }),
    );

    const acceptManualInvite = await request(app.getHttpServer())
      .post('/auth/admin-invites/accept')
      .send({
        email: 'manual-invite@example.com',
        token: knownToken,
        name: 'Manual Invite',
        password: 'InviteSecret123!',
      });
    expect(acceptManualInvite.status).toBe(200);
    expect(acceptManualInvite.body.user.role).toBe('admin');

    const suspendUser = await request(app.getHttpServer())
      .post(`/admin/users/${supporterRegister.body.user.id}/suspend`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ reason: 'Teste de suspensão' });
    expect(suspendUser.status).toBe(200);
    expect(suspendUser.body.suspended).toBe(true);

    const adminDreams = await request(app.getHttpServer())
      .get('/admin/dreams')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);
    expect(adminDreams.status).toBe(200);
    expect(adminDreams.body.length).toBeGreaterThan(0);

    const updateDreamStatus = await request(app.getHttpServer())
      .post(`/admin/dreams/${createDream.body.id}/status`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ status: 'pausado', reason: 'Teste de moderação de sonho' });
    expect(updateDreamStatus.status).toBe(200);
    expect(updateDreamStatus.body.status).toBe('pausado');

    const adminProposals = await request(app.getHttpServer())
      .get('/admin/proposals')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);
    expect(adminProposals.status).toBe(200);
    expect(adminProposals.body.length).toBeGreaterThan(0);

    const updateProposalStatus = await request(app.getHttpServer())
      .post(`/admin/proposals/${createProposal.body.id}/status`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ status: 'em-analise', reason: 'Teste de moderação de proposta' });
    expect(updateProposalStatus.status).toBe(200);
    expect(updateProposalStatus.body.status).toBe('em-analise');

    const adminChats = await request(app.getHttpServer())
      .get('/admin/chats')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);
    expect(adminChats.status).toBe(200);
    expect(adminChats.body.length).toBeGreaterThan(0);

    const adminMessages = await request(app.getHttpServer())
      .get('/admin/messages')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);
    expect(adminMessages.status).toBe(200);
    expect(Array.isArray(adminMessages.body)).toBe(true);
    expect(adminMessages.body).toHaveLength(0);

    const adminReports = await request(app.getHttpServer())
      .get('/admin/reports')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);
    expect(adminReports.status).toBe(200);
    expect(adminReports.body.length).toBeGreaterThan(0);

    const updateReportStatus = await request(app.getHttpServer())
      .post(`/admin/reports/${adminReports.body[0].id}/status`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ status: 'resolvido', resolution: 'Resolvido no teste' });
    expect(updateReportStatus.status).toBe(200);
    expect(updateReportStatus.body.status).toBe('resolvido');

    const adminAudit = await request(app.getHttpServer())
      .get('/admin/audit')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);
    expect(adminAudit.status).toBe(200);
    expect(adminAudit.body.length).toBeGreaterThan(0);

    const adminEmailTemplates = await request(app.getHttpServer())
      .get('/admin/email-templates')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);
    expect(adminEmailTemplates.status).toBe(200);
    expect(adminEmailTemplates.body.length).toBeGreaterThan(0);

    const notificationPreferences = await request(app.getHttpServer())
      .get('/notifications/preferences')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`);
    expect(notificationPreferences.status).toBe(200);
    expect(notificationPreferences.body.emailEnabled).toBe(false);

    const updateNotificationPreferences = await request(app.getHttpServer())
      .post('/notifications/preferences')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`)
      .send({ emailEnabled: true });
    expect(updateNotificationPreferences.status).toBe(200);
    expect(updateNotificationPreferences.body.emailEnabled).toBe(true);

    const notificationsMine = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`);
    expect(notificationsMine.status).toBe(200);
    expect(notificationsMine.body.length).toBeGreaterThan(0);

    const markRead = await request(app.getHttpServer())
      .post(`/notifications/${notificationsMine.body[0].id}/read`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`);
    expect(markRead.status).toBe(200);
    expect(markRead.body.read).toBe(true);

    const markAllRead = await request(app.getHttpServer())
      .post('/notifications/read-all')
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(supporterRegister.headers["set-cookie"])}`);
    expect(markAllRead.status).toBe(200);
    expect(markAllRead.body.ok).toBe(true);
  });
});
