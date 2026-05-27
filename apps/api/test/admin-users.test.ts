import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Repository } from 'typeorm';
import { AuditLog } from '../src/entities/audit-log.entity';
import { PasswordResetRequest } from '../src/entities/password-reset-request.entity';
import { User } from '../src/entities/user.entity';
import { MailService } from '../src/modules/mail/mail.service';

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

describe('Admin user management', () => {
  let appModule: (typeof import('../src/app.module'))['AppModule'];
  let currentApp: INestApplication | null = null;
  const mailServiceMock = {
    sendWelcomeEmail: vi.fn(async (params: { to: string; name: string; role: string }) => {
      void params;
    }),
    sendAdminInviteEmail: vi.fn(async (params: { to: string; inviteUrl: string; expiresInHours: number }) => {
      void params;
    }),
    sendPatientInviteEmail: vi.fn(
      async (params: { to: string; inviteUrl: string; patientName: string; invitedBy: string }) => {
        void params;
      },
    ),
    sendPasswordResetEmail: vi.fn(async (params: { to: string; resetUrl: string; expiresInHours: number }) => {
      void params;
    }),
    sendEmailVerificationEmail: vi.fn(async (params: {
      to: string;
      name: string;
      verifyUrl: string;
      expiresInHours: number;
    }) => {
      void params;
    }),
  };
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAppUrl = process.env.APP_URL;
  const originalCorsOrigin = process.env.CORS_ORIGIN;
  const originalLoginThrottleLimit = process.env.LOGIN_THROTTLE_LIMIT;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.APP_URL = 'http://localhost:5173';
    process.env.CORS_ORIGIN = 'http://localhost:5173';
    process.env.LOGIN_THROTTLE_LIMIT = '100';
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

    if (originalLoginThrottleLimit === undefined) {
      delete process.env.LOGIN_THROTTLE_LIMIT;
    } else {
      process.env.LOGIN_THROTTLE_LIMIT = originalLoginThrottleLimit;
    }
  });

  async function createApp(options: { mockMailService?: boolean } = {}) {
    const builder = Test.createTestingModule({
      imports: [appModule],
    });

    if (options.mockMailService) {
      builder.overrideProvider(MailService).useValue(mailServiceMock);
    }

    const moduleRef = await builder.compile();

    const app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();

    return {
      app,
      usersRepository: moduleRef.get<Repository<User>>(getRepositoryToken(User)),
      auditLogsRepository: moduleRef.get<Repository<AuditLog>>(getRepositoryToken(AuditLog)),
      passwordResetRequestsRepository: moduleRef.get<Repository<PasswordResetRequest>>(
        getRepositoryToken(PasswordResetRequest),
      ),
    };
  }

  async function createAdmin(app: INestApplication, usersRepository: Repository<User>) {
    const password = 'AdminSecret123!';
    const admin = await usersRepository.save(
      usersRepository.create({
        name: 'Admin NextDream',
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash(password, 10),
        role: 'admin',
        verified: true,
        approved: true,
        approvedAt: new Date(),
        suspended: false,
      }),
    );

    const login = await request(app.getHttpServer()).post('/auth/login').send({
      email: admin.email,
      password,
    });
    expect(login.status).toBe(200);

    return {
      admin,
      password,
      token: getAccessTokenFromSetCookie(login.headers['set-cookie']),
    };
  }

  async function registerUser(
    app: INestApplication,
    input: {
      name: string;
      email: string;
      password: string;
      role: 'paciente' | 'apoiador' | 'instituicao';
      state?: string;
      city?: string;
    },
  ) {
    const payload = {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      state: input.state,
      city: input.city,
      institutionType: input.role === 'instituicao' ? 'Hospital filantrópico' : undefined,
      institutionResponsibleName: input.role === 'instituicao' ? 'Mariana Silva' : undefined,
      institutionResponsiblePhone: input.role === 'instituicao' ? '(11) 98888-0000' : undefined,
      institutionDescription: input.role === 'instituicao' ? 'Rede de apoio para casos crônicos.' : undefined,
    };
    const verificationCallIndex = mailServiceMock.sendEmailVerificationEmail.mock.calls.length;

    const response = await request(app.getHttpServer()).post('/auth/register').send(payload);
    expect(response.status).toBe(201);

    const verificationCall = mailServiceMock.sendEmailVerificationEmail.mock.calls.at(verificationCallIndex);
    expect(verificationCall).toBeDefined();
    if (!verificationCall) {
      throw new Error('Expected verification email to be sent.');
    }

    const [verificationEmail] = verificationCall;
    const verifyUrl = new URL(verificationEmail.verifyUrl);
    const token = verifyUrl.searchParams.get('token');
    expect(token).toBeTruthy();

    const verifyEmail = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token });
    expect(verifyEmail.status).toBe(200);

    const login = await request(app.getHttpServer()).post('/auth/login').send({
      email: input.email,
      password: input.password,
    });
    expect(login.status).toBe(200);

    return {
      response,
      token: getAccessTokenFromSetCookie(login.headers['set-cookie']),
      userId: login.body.user.id as string,
    };
  }

  async function createDream(
    app: INestApplication,
    token: string,
    payload: {
      title: string;
      description: string;
      managedPatientId?: string;
    },
  ) {
    const response = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: payload.title,
        description: payload.description,
        category: 'Convivência',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
        managedPatientId: payload.managedPatientId,
      });

    expect(response.status).toBe(201);
    return response.body.id as string;
  }

  async function createProposal(app: INestApplication, token: string, dreamId: string) {
    const response = await request(app.getHttpServer())
      .post(`/dreams/${dreamId}/proposals`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'Posso ajudar com presença e escuta.',
        offering: 'Companhia',
        availability: 'Fins de semana',
        duration: '2 horas',
      });

    expect(response.status).toBe(201);
    return response.body.id as string;
  }

  async function acceptProposal(app: INestApplication, token: string, proposalId: string) {
    const response = await request(app.getHttpServer())
      .post(`/proposals/${proposalId}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    return response.body.conversationId as string;
  }

  async function createManagedPatient(app: INestApplication, token: string, name: string) {
    const response = await request(app.getHttpServer())
      .post('/institution/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name,
        state: 'RJ',
        city: 'Niterói',
      });

    expect(response.status).toBe(201);
    return response.body.id as string;
  }

  afterEach(async () => {
    if (currentApp) {
      await currentApp.close();
      currentApp = null;
    }
  });

  it('returns rich detail, edits institution data, reactivates a suspended user and resets passwords', async () => {
    const { app, usersRepository, auditLogsRepository, passwordResetRequestsRepository } = await createApp({
      mockMailService: true,
    });
    currentApp = app;

    const adminAuth = await createAdmin(app, usersRepository);
    const patient = await registerUser(app, {
      name: 'Paciente Sol',
      email: 'paciente@example.com',
      password: 'Secret123!',
      role: 'paciente',
      state: 'SP',
      city: 'Santos',
    });
    const supporter = await registerUser(app, {
      name: 'Apoiadora Luz',
      email: 'apoiadora@example.com',
      password: 'Secret123!',
      role: 'apoiador',
      state: 'SP',
      city: 'Santos',
    });
    const institution = await registerUser(app, {
      name: 'Casa Esperança',
      email: 'instituicao@example.com',
      password: 'Secret123!',
      role: 'instituicao',
      state: 'RJ',
      city: 'Niterói',
    });

    const institutionUser = await usersRepository.findOneByOrFail({ id: institution.userId });
    institutionUser.approved = true;
    institutionUser.approvedAt = new Date();
    await usersRepository.save(institutionUser);

    const paginatedUsers = await request(app.getHttpServer())
      .get('/admin/users')
      .query({
        page: 1,
        pageSize: 1,
        query: 'Niterói',
        role: 'instituicao',
        status: 'ativo',
        approval: 'aprovado',
        verification: 'verificado',
      })
      .set('Authorization', `Bearer ${adminAuth.token}`);

    expect(paginatedUsers.status).toBe(200);
    expect(paginatedUsers.body).toMatchObject({
      page: 1,
      pageSize: 1,
      total: 1,
      totalPages: 1,
    });
    expect(paginatedUsers.body.items).toHaveLength(1);
    expect(paginatedUsers.body.items[0]).toMatchObject({
      id: institution.userId,
      name: 'Casa Esperança',
      role: 'instituicao',
      city: 'Niterói',
      approved: true,
      verified: true,
      suspended: false,
    });

    const patientDreamId = await createDream(app, patient.token, {
      title: 'Passeio tranquilo no jardim',
      description: 'Quero sentir o vento e ouvir os pássaros.',
    });
    const patientProposalId = await createProposal(app, supporter.token, patientDreamId);
    await acceptProposal(app, patient.token, patientProposalId);

    const managedPatientId = await createManagedPatient(app, institution.token, 'Paciente acompanhado');
    const institutionDreamId = await createDream(app, institution.token, {
      title: 'Oficina de música assistida',
      description: 'Atividade breve para pacientes acompanhados.',
      managedPatientId,
    });
    const institutionProposalId = await createProposal(app, supporter.token, institutionDreamId);
    await acceptProposal(app, institution.token, institutionProposalId);

    const patientDetail = await request(app.getHttpServer())
      .get(`/admin/users/${patient.userId}`)
      .set('Authorization', `Bearer ${adminAuth.token}`);

    expect(patientDetail.status).toBe(200);
    expect(patientDetail.body.role).toBe('paciente');
    expect(patientDetail.body.activitySummary).toMatchObject({
      dreams: 1,
      proposalsReceived: 1,
      conversations: 1,
      activeConversations: 1,
    });
    expect(patientDetail.body.recentDreams[0]).toMatchObject({
      id: patientDreamId,
      title: 'Passeio tranquilo no jardim',
    });
    expect(patientDetail.body.recentProposals[0]).toMatchObject({
      dreamId: patientDreamId,
      supporterName: 'Apoiadora Luz',
    });

    const institutionDetail = await request(app.getHttpServer())
      .get(`/admin/users/${institution.userId}`)
      .set('Authorization', `Bearer ${adminAuth.token}`);

    expect(institutionDetail.status).toBe(200);
    expect(institutionDetail.body.role).toBe('instituicao');
    expect(institutionDetail.body.institutionResponsibleName).toBe('Mariana Silva');
    expect(institutionDetail.body.activitySummary).toMatchObject({
      dreams: 1,
      proposalsReceived: 1,
      conversations: 1,
      activeConversations: 1,
      managedPatients: 1,
      supporterConnections: 1,
    });
    expect(institutionDetail.body.recentConversations[0]).toMatchObject({
      dreamId: institutionDreamId,
      supporterName: 'Apoiadora Luz',
    });

    const updateInstitution = await request(app.getHttpServer())
      .patch(`/admin/users/${institution.userId}`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({
        name: 'Casa Esperança Atualizada',
        email: 'instituicao+editada@example.com',
        state: 'PE',
        city: 'Recife',
        verified: true,
        approved: true,
        institutionType: 'ONG de acolhimento',
        institutionResponsibleName: 'Fernanda Costa',
        institutionResponsiblePhone: '(81) 97777-1111',
        institutionDescription: 'Atendimento humanizado com foco em autonomia.',
      });

    expect(updateInstitution.status).toBe(200);
    expect(updateInstitution.body).toMatchObject({
      id: institution.userId,
      name: 'Casa Esperança Atualizada',
      email: 'instituicao+editada@example.com',
      state: 'PE',
      city: 'Recife',
      verified: true,
      institutionType: 'ONG de acolhimento',
      institutionResponsibleName: 'Fernanda Costa',
    });

    const savedInstitution = await usersRepository.findOneByOrFail({ id: institution.userId });
    expect(savedInstitution.email).toBe('instituicao+editada@example.com');
    expect(savedInstitution.institutionDescription).toBe('Atendimento humanizado com foco em autonomia.');

    const suspendInstitution = await request(app.getHttpServer())
      .post(`/admin/users/${institution.userId}/suspend`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({ reason: 'Conta em revisão documental.' });

    expect(suspendInstitution.status).toBe(200);
    expect(suspendInstitution.body.suspended).toBe(true);

    const reactivateInstitution = await request(app.getHttpServer())
      .post(`/admin/users/${institution.userId}/reactivate`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({ reason: 'Documentação conferida e regularizada.' });

    expect(reactivateInstitution.status).toBe(200);
    expect(reactivateInstitution.body.suspended).toBe(false);
    expect(reactivateInstitution.body.suspensionReason).toBeNull();

    const reactivatedInstitution = await usersRepository.findOneByOrFail({ id: institution.userId });
    expect(reactivatedInstitution.suspended).toBe(false);
    expect(reactivatedInstitution.suspensionReason).toBeNull();

    const manualReset = await request(app.getHttpServer())
      .post(`/admin/users/${institution.userId}/password/reset`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({
        mode: 'manual',
        newPassword: 'NovaSenha123!',
      });

    expect(manualReset.status).toBe(200);
    expect(manualReset.body).toMatchObject({
      id: institution.userId,
      mode: 'manual',
    });
    expect(manualReset.body.temporaryPassword).toBeUndefined();

    const loginWithManualPassword = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'instituicao+editada@example.com',
      password: 'NovaSenha123!',
    });
    expect(loginWithManualPassword.status).toBe(200);

    const resetLink = await request(app.getHttpServer())
      .post(`/admin/users/${institution.userId}/password/reset`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({
        mode: 'reset-link',
      });

    expect(resetLink.status).toBe(200);
    expect(resetLink.body).toMatchObject({
      id: institution.userId,
      mode: 'reset-link',
      delivery: 'email',
      email: 'instituicao+editada@example.com',
    });
    expect(resetLink.body.temporaryPassword).toBeUndefined();
    expect(resetLink.body.expiresAt).toEqual(expect.any(String));
    expect(mailServiceMock.sendPasswordResetEmail).toHaveBeenCalledTimes(1);

    const resetEmailCall = mailServiceMock.sendPasswordResetEmail.mock.calls.at(0);
    expect(resetEmailCall).toBeDefined();
    if (!resetEmailCall) {
      throw new Error('Expected password reset email to be sent.');
    }
    const [resetEmail] = resetEmailCall;
    expect(resetEmail.to).toBe('instituicao+editada@example.com');

    const resetUrl = new URL(resetEmail.resetUrl);
    const requestId = resetUrl.searchParams.get('requestId');
    const token = resetUrl.searchParams.get('token');

    expect(requestId).toBeTruthy();
    expect(token).toBeTruthy();

    const pendingRequest = await passwordResetRequestsRepository.findOneByOrFail({
      id: requestId ?? undefined,
    });
    expect(pendingRequest.userId).toBe(institution.userId);
    expect(pendingRequest.requestedByAdminId).toBe(adminAuth.admin.id);
    expect(pendingRequest.usedAt).toBeNull();

    const consumeResetLink = await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({
        requestId,
        token,
        newPassword: 'SenhaLink123!',
      });

    expect(consumeResetLink.status).toBe(200);
    expect(consumeResetLink.body).toMatchObject({ ok: true });

    const loginWithResetLinkPassword = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'instituicao+editada@example.com',
      password: 'SenhaLink123!',
    });
    expect(loginWithResetLinkPassword.status).toBe(200);

    const reusedResetLink = await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({
        requestId,
        token,
        newPassword: 'SenhaLink456!',
      });
    expect(reusedResetLink.status).toBe(400);

    const auditLogs = await auditLogsRepository.find({
      where: { refId: institution.userId },
      order: { createdAt: 'ASC' },
    });
    expect(auditLogs.map((log) => log.action)).toEqual(
      expect.arrayContaining([
        'Usuário atualizado',
        'Conta suspensa',
        'Conta reativada',
        'Senha resetada por admin',
      ]),
    );
    expect(
      auditLogs.some(
        (log) =>
          log.action === 'Senha resetada por admin' &&
          log.refPath === '/admin/usuarios' &&
          log.details.includes('link'),
      ),
    ).toBe(true);
  });

  it('expires admin-issued reset links and blocks their usage after the expiration window', async () => {
    const { app, usersRepository, passwordResetRequestsRepository } = await createApp({
      mockMailService: true,
    });
    currentApp = app;

    const adminAuth = await createAdmin(app, usersRepository);
    const patient = await registerUser(app, {
      name: 'Paciente Expirado',
      email: 'paciente-expirado@example.com',
      password: 'Secret123!',
      role: 'paciente',
    });

    const resetLink = await request(app.getHttpServer())
      .post(`/admin/users/${patient.userId}/password/reset`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({
        mode: 'reset-link',
      });

    expect(resetLink.status).toBe(200);

    const resetEmailCall = mailServiceMock.sendPasswordResetEmail.mock.calls.at(0);
    expect(resetEmailCall).toBeDefined();
    if (!resetEmailCall) {
      throw new Error('Expected password reset email to be sent.');
    }
    const [resetEmail] = resetEmailCall;
    const resetUrl = new URL(resetEmail.resetUrl);
    const requestId = resetUrl.searchParams.get('requestId');
    const token = resetUrl.searchParams.get('token');

    expect(requestId).toBeTruthy();
    expect(token).toBeTruthy();

    await passwordResetRequestsRepository.update(
      { id: requestId ?? undefined },
      { expiresAt: new Date(Date.now() - 60_000) },
    );

    const expiredReset = await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({
        requestId,
        token,
        newPassword: 'SenhaExpirada123!',
      });

    expect(expiredReset.status).toBe(400);
  });

  it('rejects invalid admin user operations with the expected errors', async () => {
    const { app, usersRepository } = await createApp({
      mockMailService: true,
    });
    currentApp = app;

    const adminAuth = await createAdmin(app, usersRepository);
    const patient = await registerUser(app, {
      name: 'Paciente Uno',
      email: 'paciente-uno@example.com',
      password: 'Secret123!',
      role: 'paciente',
    });
    const supporter = await registerUser(app, {
      name: 'Apoiador Dois',
      email: 'apoiador-dois@example.com',
      password: 'Secret123!',
      role: 'apoiador',
    });

    const missingUser = await request(app.getHttpServer())
      .get('/admin/users/user-inexistente')
      .set('Authorization', `Bearer ${adminAuth.token}`);
    expect(missingUser.status).toBe(404);

    const incompatibleRoleUpdate = await request(app.getHttpServer())
      .patch(`/admin/users/${supporter.userId}`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({
        institutionType: 'ONG',
      });
    expect(incompatibleRoleUpdate.status).toBe(400);

    const duplicateEmail = await request(app.getHttpServer())
      .patch(`/admin/users/${supporter.userId}`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({
        email: 'paciente-uno@example.com',
      });
    expect(duplicateEmail.status).toBe(409);

    const invalidPasswordResetPayload = await request(app.getHttpServer())
      .post(`/admin/users/${patient.userId}/password/reset`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({
        mode: 'manual',
      });
    expect(invalidPasswordResetPayload.status).toBe(400);

    const invalidResetMode = await request(app.getHttpServer())
      .post(`/admin/users/${patient.userId}/password/reset`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({
        mode: 'temporary',
      });
    expect(invalidResetMode.status).toBe(400);

    const reactivateWithoutSuspension = await request(app.getHttpServer())
      .post(`/admin/users/${patient.userId}/reactivate`)
      .set('Authorization', `Bearer ${adminAuth.token}`)
      .send({
        reason: 'Tentativa sem suspensão prévia.',
      });
    expect(reactivateWithoutSuspension.status).toBe(400);
  });
});
