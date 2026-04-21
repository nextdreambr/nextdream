import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

describe('Sandbox API', () => {
  let app: INestApplication;
  const originalEnv = {
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    LOGIN_THROTTLE_LIMIT: process.env.LOGIN_THROTTLE_LIMIT,
    LOGIN_THROTTLE_TTL_MS: process.env.LOGIN_THROTTLE_TTL_MS,
    DATABASE_URL: process.env.DATABASE_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SMTP_HOST: process.env.SMTP_HOST,
  };

  beforeAll(async () => {
    process.env.APP_ENV = 'sandbox';
    process.env.NODE_ENV = 'test';
    process.env.APP_URL = 'http://localhost:5173';
    process.env.CORS_ORIGIN = 'http://localhost:5173';
    process.env.JWT_ACCESS_SECRET = 'sandbox-access-secret';
    process.env.JWT_REFRESH_SECRET = 'sandbox-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.LOGIN_THROTTLE_LIMIT = '100';
    process.env.LOGIN_THROTTLE_TTL_MS = '60000';
    delete process.env.DATABASE_URL;
    delete process.env.SENTRY_DSN;
    delete process.env.SMTP_HOST;

    vi.resetModules();
    const { AppModule } = await import('../src/app.module');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  async function demoLogin(persona: 'paciente' | 'apoiador' | 'instituicao') {
    const response = await request(app.getHttpServer())
      .post('/auth/demo-login')
      .send({ persona });

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe(persona);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));

    return response.body as {
      accessToken: string;
      refreshToken: string;
      user: { id: string; role: string };
    };
  }

  it('boots without DATABASE_URL and refreshes a sandbox demo session', async () => {
    const health = await request(app.getHttpServer()).get('/health');
    expect(health.status).toBe(200);

    const session = await demoLogin('paciente');
    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: session.refreshToken });

    expect(refresh.status).toBe(200);
    expect(refresh.body.user.id).toBe(session.user.id);
    expect(refresh.body.user.role).toBe('paciente');
    expect(refresh.body.accessToken).toEqual(expect.any(String));
    expect(refresh.body.refreshToken).toEqual(expect.any(String));
  });

  it('rejects refresh tokens that omit the sandbox session id', async () => {
    const jwtService = app.get(JwtService);
    const refreshToken = await jwtService.signAsync(
      {
        sub: 'paciente-1',
        role: 'paciente',
      },
      {
        secret: 'sandbox-refresh-secret',
        expiresIn: '7d',
      },
    );

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken });

    expect(refresh.status).toBe(401);
    expect(refresh.body.message).toMatch(/invalid refresh token/i);
  });

  it('normalizes the refresh sandbox session id and keeps missing sessions opaque', async () => {
    const jwtService = app.get(JwtService);
    const session = await demoLogin('paciente');
    const refreshPayload = await jwtService.verifyAsync<{
      sub: string;
      role: 'paciente';
      sandboxSessionId: string;
    }>(session.refreshToken, {
      secret: 'sandbox-refresh-secret',
    });

    const trimmedRefreshToken = await jwtService.signAsync(
      {
        sub: refreshPayload.sub,
        role: refreshPayload.role,
        sandboxSessionId: `  ${refreshPayload.sandboxSessionId}  `,
      },
      {
        secret: 'sandbox-refresh-secret',
        expiresIn: '7d',
      },
    );

    const trimmedRefresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: trimmedRefreshToken });

    expect(trimmedRefresh.status).toBe(200);
    expect(trimmedRefresh.body.user.id).toBe(session.user.id);

    const missingSessionRefreshToken = await jwtService.signAsync(
      {
        sub: refreshPayload.sub,
        role: refreshPayload.role,
        sandboxSessionId: 'missing-session-id',
      },
      {
        secret: 'sandbox-refresh-secret',
        expiresIn: '7d',
      },
    );

    const missingSessionRefresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: missingSessionRefreshToken });

    expect(missingSessionRefresh.status).toBe(401);
    expect(missingSessionRefresh.body.message).toBe('Invalid refresh token');
  });

  it('rejects public registration in sandbox mode and requires demo access', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Pessoa Real',
        email: 'real@example.com',
        password: 'Secret123!',
        role: 'paciente',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/demo|sandbox/i);
  });

  it('keeps patient dream, proposal and conversation flows inside the sandbox session', async () => {
    const session = await demoLogin('paciente');
    const authHeader = { Authorization: `Bearer ${session.accessToken}` };

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set(authHeader)
      .send({
        title: 'Passear em um jardim botanico',
        description: 'Quero uma tarde tranquila entre as plantas.',
        category: 'Experiencia',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
      });

    expect(createDream.status).toBe(201);
    expect(createDream.body.title).toBe('Passear em um jardim botanico');

    const updateDream = await request(app.getHttpServer())
      .patch(`/dreams/${createDream.body.id}`)
      .set(authHeader)
      .send({
        description: 'Quero uma tarde tranquila entre as plantas e a familia.',
      });

    expect(updateDream.status).toBe(200);
    expect(updateDream.body.description).toContain('familia');

    const proposals = await request(app.getHttpServer())
      .get('/proposals/received')
      .set(authHeader);

    expect(proposals.status).toBe(200);
    expect(proposals.body.length).toBeGreaterThan(0);

    const pendingProposal = proposals.body.find(
      (proposal: { status: string }) => proposal.status === 'enviada',
    );
    expect(pendingProposal).toBeDefined();

    const acceptedProposal = await request(app.getHttpServer())
      .post(`/proposals/${pendingProposal.id}/accept`)
      .set(authHeader);

    expect(acceptedProposal.status).toBe(200);
    expect(acceptedProposal.body.status).toBe('aceita');
    expect(acceptedProposal.body.conversationId).toEqual(expect.any(String));

    const conversations = await request(app.getHttpServer())
      .get('/conversations/mine')
      .set(authHeader);

    expect(conversations.status).toBe(200);
    expect(
      conversations.body.some(
        (conversation: { id: string }) => conversation.id === acceptedProposal.body.conversationId,
      ),
    ).toBe(true);
  });

  it('rejects whitespace-only sandbox payloads and keeps proposal acceptance idempotent', async () => {
    const patientSession = await demoLogin('paciente');
    const patientAuthHeader = { Authorization: `Bearer ${patientSession.accessToken}` };

    const invalidDream = await request(app.getHttpServer())
      .post('/dreams')
      .set(patientAuthHeader)
      .send({
        title: '   ',
        description: 'Descricao valida',
        category: 'Experiencia',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
      });

    expect(invalidDream.status).toBe(400);
    expect(invalidDream.body.message).toMatch(/dream title/i);

    const validDream = await request(app.getHttpServer())
      .post('/dreams')
      .set(patientAuthHeader)
      .send({
        title: 'Passeio no parque',
        description: 'Quero um passeio tranquilo com a familia.',
        category: 'Lazer',
        format: 'presencial',
        urgency: 'baixa',
        privacy: 'publico',
      });

    expect(validDream.status).toBe(201);

    const invalidUpdate = await request(app.getHttpServer())
      .patch(`/dreams/${validDream.body.id}`)
      .set(patientAuthHeader)
      .send({
        description: '   ',
      });

    expect(invalidUpdate.status).toBe(400);
    expect(invalidUpdate.body.message).toMatch(/dream description/i);

    const supporterSession = await demoLogin('apoiador');
    const supporterAuthHeader = { Authorization: `Bearer ${supporterSession.accessToken}` };

    const invalidProposal = await request(app.getHttpServer())
      .post('/dreams/dream-patient-public/proposals')
      .set(supporterAuthHeader)
      .send({
        message: '   ',
        offering: 'Companhia',
        availability: 'Sabado',
        duration: '2 horas',
      });

    expect(invalidProposal.status).toBe(400);
    expect(invalidProposal.body.message).toMatch(/proposal message/i);

    const proposals = await request(app.getHttpServer())
      .get('/proposals/received')
      .set(patientAuthHeader);

    expect(proposals.status).toBe(200);

    const pendingProposal = proposals.body.find(
      (proposal: { status: string }) => proposal.status === 'enviada',
    );
    expect(pendingProposal).toBeDefined();

    const acceptedProposal = await request(app.getHttpServer())
      .post(`/proposals/${pendingProposal.id}/accept`)
      .set(patientAuthHeader);

    expect(acceptedProposal.status).toBe(200);

    const acceptedAgain = await request(app.getHttpServer())
      .post(`/proposals/${pendingProposal.id}/accept`)
      .set(patientAuthHeader);

    expect(acceptedAgain.status).toBe(409);

    const invalidMessage = await request(app.getHttpServer())
      .post(`/conversations/${acceptedProposal.body.conversationId}/messages`)
      .set(patientAuthHeader)
      .send({
        body: '   ',
      });

    expect(invalidMessage.status).toBe(400);
    expect(invalidMessage.body.message).toMatch(/message body/i);

    const firstClose = await request(app.getHttpServer())
      .post(`/conversations/${acceptedProposal.body.conversationId}/close`)
      .set(patientAuthHeader)
      .send({});

    expect(firstClose.status).toBe(200);
    expect(firstClose.body.status).toBe('encerrada');

    const secondClose = await request(app.getHttpServer())
      .post(`/conversations/${acceptedProposal.body.conversationId}/close`)
      .set(patientAuthHeader)
      .send({});

    expect(secondClose.status).toBe(200);
    expect(secondClose.body.status).toBe('encerrada');
  });

  it('keeps proposal rejection idempotent inside the same sandbox session', async () => {
    const patientSession = await demoLogin('paciente');
    const patientAuthHeader = { Authorization: `Bearer ${patientSession.accessToken}` };

    const proposals = await request(app.getHttpServer())
      .get('/proposals/received')
      .set(patientAuthHeader);

    expect(proposals.status).toBe(200);

    const pendingProposal = proposals.body.find(
      (proposal: { status: string }) => proposal.status === 'enviada',
    );
    expect(pendingProposal).toBeDefined();

    const firstReject = await request(app.getHttpServer())
      .post(`/proposals/${pendingProposal.id}/reject`)
      .set(patientAuthHeader);

    expect(firstReject.status).toBe(200);
    expect(firstReject.body.status).toBe('recusada');

    const secondReject = await request(app.getHttpServer())
      .post(`/proposals/${pendingProposal.id}/reject`)
      .set(patientAuthHeader);

    expect(secondReject.status).toBe(200);
    expect(secondReject.body.status).toBe('recusada');
  });

  it('lets the supporter demo submit proposals and reuse the seeded chat', async () => {
    const session = await demoLogin('apoiador');
    const authHeader = { Authorization: `Bearer ${session.accessToken}` };

    const publicDreams = await request(app.getHttpServer()).get('/dreams/public');
    expect(publicDreams.status).toBe(200);
    expect(publicDreams.body.length).toBeGreaterThan(0);

    const targetDream = publicDreams.body.find(
      (dream: { id: string }) => dream.id === 'dream-patient-public',
    );
    expect(targetDream).toBeDefined();

    const proposal = await request(app.getHttpServer())
      .post(`/dreams/${targetDream.id}/proposals`)
      .set(authHeader)
      .send({
        message: 'Posso acompanhar a visita e registrar fotos.',
        offering: 'Companhia e transporte',
        availability: 'Sabado de manha',
        duration: '3 horas',
      });

    expect(proposal.status).toBe(201);
    expect(proposal.body.status).toBe('enviada');

    const mine = await request(app.getHttpServer())
      .get('/proposals/mine')
      .set(authHeader);

    expect(mine.status).toBe(200);
    expect(mine.body.some((item: { id: string }) => item.id === proposal.body.id)).toBe(true);

    const conversations = await request(app.getHttpServer())
      .get('/conversations/mine')
      .set(authHeader);

    expect(conversations.status).toBe(200);
    expect(conversations.body.length).toBeGreaterThan(0);
  });

  it('supports institution overview, managed patients and institution-owned dreams without a database', async () => {
    const session = await demoLogin('instituicao');
    const authHeader = { Authorization: `Bearer ${session.accessToken}` };

    const overview = await request(app.getHttpServer())
      .get('/institution/overview')
      .set(authHeader);

    expect(overview.status).toBe(200);
    expect(overview.body.managedPatients).toBeGreaterThan(0);

    const patients = await request(app.getHttpServer())
      .get('/institution/patients')
      .set(authHeader);

    expect(patients.status).toBe(200);
    expect(patients.body.length).toBeGreaterThan(0);

    const managedPatientId = patients.body[0].id as string;

    const updatePatient = await request(app.getHttpServer())
      .patch(`/institution/patients/${managedPatientId}`)
      .set(authHeader)
      .send({
        city: 'Olinda',
      });

    expect(updatePatient.status).toBe(200);
    expect(updatePatient.body.city).toBe('Olinda');

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set(authHeader)
      .send({
        title: 'Visitar um museu de arte',
        description: 'Uma tarde de passeio com atividades leves.',
        category: 'Cultura',
        format: 'presencial',
        urgency: 'baixa',
        privacy: 'publico',
        managedPatientId,
      });

    expect(createDream.status).toBe(201);
    expect(createDream.body.managedPatientId).toBe(managedPatientId);

    const accessInvite = await request(app.getHttpServer())
      .post(`/institution/patients/${managedPatientId}/access-invite`)
      .set(authHeader)
      .send({
        email: 'familia.demo@example.com',
      });

    expect(accessInvite.status).toBe(201);
    expect(accessInvite.body.inviteUrl).toContain('http://localhost:5173');
  });
});
