import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import cookieParser from 'cookie-parser';
import { AdminInvite } from '../src/entities/admin-invite.entity';
import { AdminReport } from '../src/entities/admin-report.entity';
import { AuditLog } from '../src/entities/audit-log.entity';
import { Message } from '../src/entities/message.entity';
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

type PublicRegistrationInput = {
  name: string;
  email: string;
  password: string;
  role: 'paciente' | 'apoiador' | 'instituicao';
  city?: string;
  state?: string;
  institutionResponsibleName?: string;
  institutionType?: string;
  institutionResponsiblePhone?: string;
  institutionDescription?: string;
};

describe('NextDream API', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let adminInvitesRepository: Repository<AdminInvite>;
  let messagesRepository: Repository<Message>;
  let reportsRepository: Repository<AdminReport>;
  let auditLogsRepository: Repository<AuditLog>;
  let appModule: (typeof import('../src/app.module'))['AppModule'];
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAppUrl = process.env.APP_URL;
  const originalCorsOrigin = process.env.CORS_ORIGIN;
  const originalLoginThrottleLimit = process.env.LOGIN_THROTTLE_LIMIT;
  const originalLoginThrottleTtlMs = process.env.LOGIN_THROTTLE_TTL_MS;
  const originalSentryTunnelThrottleLimit = process.env.SENTRY_TUNNEL_THROTTLE_LIMIT;
  const originalSentryTunnelThrottleTtlMs = process.env.SENTRY_TUNNEL_THROTTLE_TTL_MS;
  const originalChatModerationEnabled = process.env.CHAT_MODERATION_ENABLED;
  const originalChatModerationProvider = process.env.CHAT_MODERATION_PROVIDER;
  const originalOpenAiApiKey = process.env.OPENAI_API_KEY;
  const originalOpenAiModerationModel = process.env.OPENAI_MODERATION_MODEL;
  const originalOpenAiTimeoutMs = process.env.OPENAI_TIMEOUT_MS;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.APP_URL = 'http://localhost:5173';
    process.env.CORS_ORIGIN = 'http://localhost:5173';
    process.env.LOGIN_THROTTLE_LIMIT = '1000';
    process.env.LOGIN_THROTTLE_TTL_MS = '60000';
    process.env.SENTRY_TUNNEL_THROTTLE_LIMIT = '2';
    process.env.SENTRY_TUNNEL_THROTTLE_TTL_MS = '60000';
    ({ AppModule: appModule } = await import('../src/app.module'));

    const moduleRef = await Test.createTestingModule({
      imports: [appModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    usersRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    adminInvitesRepository = moduleRef.get<Repository<AdminInvite>>(getRepositoryToken(AdminInvite));
    messagesRepository = moduleRef.get<Repository<Message>>(getRepositoryToken(Message));
    reportsRepository = moduleRef.get<Repository<AdminReport>>(getRepositoryToken(AdminReport));
    auditLogsRepository = moduleRef.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
    await app.init();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.CHAT_MODERATION_ENABLED;
    delete process.env.CHAT_MODERATION_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODERATION_MODEL;
    delete process.env.OPENAI_TIMEOUT_MS;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CHAT_MODERATION_ENABLED;
    delete process.env.CHAT_MODERATION_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODERATION_MODEL;
    delete process.env.OPENAI_TIMEOUT_MS;
  });

  async function createIsolatedApp() {
    const moduleRef = await Test.createTestingModule({
      imports: [appModule],
    }).compile();

    const isolatedApp = moduleRef.createNestApplication();
    isolatedApp.use(cookieParser());
    await isolatedApp.init();
    return isolatedApp;
  }

  async function registerPublicUserOn(targetApp: INestApplication, input: PublicRegistrationInput) {
    const sendEmailVerificationEmail = vi
      .spyOn(MailService.prototype, 'sendEmailVerificationEmail')
      .mockResolvedValue();
    sendEmailVerificationEmail.mockClear();

    const register = await request(targetApp.getHttpServer())
      .post('/auth/register')
      .send(input);

    expect(register.status).toBe(201);
    expect(sendEmailVerificationEmail).toHaveBeenCalledTimes(1);

    const verifyUrl = sendEmailVerificationEmail.mock.calls.at(-1)?.[0]?.verifyUrl;
    if (!verifyUrl) {
      throw new Error('Missing verifyUrl in email verification payload');
    }

    const token = new URL(verifyUrl).searchParams.get('token');
    if (!token) {
      throw new Error('Missing token in email verification URL');
    }

    return {
      register,
      verifyUrl,
      token,
    };
  }

  async function registerPublicUser(input: PublicRegistrationInput) {
    return registerPublicUserOn(app, input);
  }

  async function verifyPublicUserOn(targetApp: INestApplication, token: string) {
    const verifyEmail = await request(targetApp.getHttpServer())
      .post('/auth/verify-email')
      .send({ token });

    expect(verifyEmail.status).toBe(200);
    expect(verifyEmail.body).toEqual({ success: true });
    return verifyEmail;
  }

  async function verifyPublicUser(token: string) {
    return verifyPublicUserOn(app, token);
  }

  async function loginPublicUserOn(targetApp: INestApplication, input: { email: string; password: string }) {
    const login = await request(targetApp.getHttpServer())
      .post('/auth/login')
      .send(input);

    expect(login.status).toBe(200);

    return {
      login,
      accessToken: getAccessTokenFromSetCookie(login.headers['set-cookie']),
    };
  }

  async function loginPublicUser(input: { email: string; password: string }) {
    return loginPublicUserOn(app, input);
  }

  async function registerVerifyAndLoginPublicUserOn(targetApp: INestApplication, input: PublicRegistrationInput) {
    const { register, token } = await registerPublicUserOn(targetApp, input);
    await verifyPublicUserOn(targetApp, token);
    const { login, accessToken } = await loginPublicUserOn(targetApp, {
      email: input.email,
      password: input.password,
    });

    return {
      register,
      login,
      accessToken,
    };
  }

  async function registerVerifyAndLoginPublicUser(input: PublicRegistrationInput) {
    return registerVerifyAndLoginPublicUserOn(app, input);
  }

  async function registerApprovedInstitution(input: {
    name: string;
    email: string;
    password: string;
    state?: string;
    city?: string;
    adminEmail: string;
  }) {
    const { register: institutionRegister, token } = await registerPublicUser({
      name: input.name,
      email: input.email,
      password: input.password,
      role: 'instituicao',
      institutionResponsibleName: 'Responsavel Demo',
      institutionType: 'ONG',
      institutionResponsiblePhone: '(81) 99999-0000',
      institutionDescription: 'Instituicao focada em acolhimento humanizado.',
      state: input.state,
      city: input.city,
    });
    await verifyPublicUser(token);
    const institution = await usersRepository.findOneByOrFail({ email: input.email.toLowerCase() });
    institution.approved = true;
    institution.approvedAt = new Date();
    await usersRepository.save(institution);

    const { login, accessToken: institutionToken } = await loginPublicUser({
      email: input.email,
      password: input.password,
    });

    return {
      institutionRegister,
      institution,
      institutionLogin: login,
      institutionToken,
    };
  }

  function enableOpenAiChatModeration() {
    process.env.CHAT_MODERATION_ENABLED = 'true';
    process.env.CHAT_MODERATION_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.OPENAI_MODERATION_MODEL = 'omni-moderation-latest';
    process.env.OPENAI_TIMEOUT_MS = '3000';
  }

  async function createAcceptedConversationFixture(label: string) {
    const password = 'Secret123!';
    const { login: patientLogin, accessToken: patientToken } = await registerVerifyAndLoginPublicUser({
      name: `Patient ${label}`,
      email: `patient-${label}@example.com`,
      password,
      role: 'paciente',
      city: 'Santos, SP',
    });

    const { login: supporterLogin, accessToken: supporterToken } = await registerVerifyAndLoginPublicUser({
      name: `Supporter ${label}`,
      email: `supporter-${label}@example.com`,
      password,
      role: 'apoiador',
      city: 'Santos, SP',
    });
    const patientUser = patientLogin.body.user;
    const supporterUser = supporterLogin.body.user;

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        title: `Sonho ${label}`,
        description: 'Quero uma conversa tranquila e companhia.',
        category: 'Convivencia',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
      });
    expect(createDream.status).toBe(201);

    const createProposal = await request(app.getHttpServer())
      .post(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({
        message: 'Posso acompanhar com presença e cuidado.',
        offering: 'Companhia',
        availability: 'Sábado',
        duration: '2 horas',
      });
    expect(createProposal.status).toBe(201);

    const acceptProposal = await request(app.getHttpServer())
      .post(`/proposals/${createProposal.body.id}/accept`)
      .set('Authorization', `Bearer ${patientToken}`);
    expect(acceptProposal.status).toBe(200);

    return {
      conversationId: acceptProposal.body.conversationId as string,
      patientId: patientUser.id as string,
      supporterId: supporterUser.id as string,
      patientToken,
      supporterToken,
    };
  }

  afterAll(async () => {
    if (app) {
      await app.close();
    }

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

    if (originalLoginThrottleTtlMs === undefined) {
      delete process.env.LOGIN_THROTTLE_TTL_MS;
    } else {
      process.env.LOGIN_THROTTLE_TTL_MS = originalLoginThrottleTtlMs;
    }

    if (originalSentryTunnelThrottleLimit === undefined) {
      delete process.env.SENTRY_TUNNEL_THROTTLE_LIMIT;
    } else {
      process.env.SENTRY_TUNNEL_THROTTLE_LIMIT = originalSentryTunnelThrottleLimit;
    }

    if (originalSentryTunnelThrottleTtlMs === undefined) {
      delete process.env.SENTRY_TUNNEL_THROTTLE_TTL_MS;
    } else {
      process.env.SENTRY_TUNNEL_THROTTLE_TTL_MS = originalSentryTunnelThrottleTtlMs;
    }

    if (originalChatModerationEnabled === undefined) {
      delete process.env.CHAT_MODERATION_ENABLED;
    } else {
      process.env.CHAT_MODERATION_ENABLED = originalChatModerationEnabled;
    }

    if (originalChatModerationProvider === undefined) {
      delete process.env.CHAT_MODERATION_PROVIDER;
    } else {
      process.env.CHAT_MODERATION_PROVIDER = originalChatModerationProvider;
    }

    if (originalOpenAiApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOpenAiApiKey;
    }

    if (originalOpenAiModerationModel === undefined) {
      delete process.env.OPENAI_MODERATION_MODEL;
    } else {
      process.env.OPENAI_MODERATION_MODEL = originalOpenAiModerationModel;
    }

    if (originalOpenAiTimeoutMs === undefined) {
      delete process.env.OPENAI_TIMEOUT_MS;
    } else {
      process.env.OPENAI_TIMEOUT_MS = originalOpenAiTimeoutMs;
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

  it('issues a password reset email and lets the user log in with the new password', async () => {
    const password = 'Secret123!';
    const newPassword = 'NovaSenha123!';
    const sendPasswordResetEmail = vi
      .spyOn(MailService.prototype, 'sendPasswordResetEmail')
      .mockResolvedValue();
    const isolatedApp = await createIsolatedApp();

    try {
      const { token } = await registerPublicUserOn(isolatedApp, {
        name: 'Renan Pimentel',
        email: 'renan@example.com',
        password,
        role: 'apoiador',
        city: 'Recife',
      });
      await verifyPublicUserOn(isolatedApp, token);

      const requestReset = await request(isolatedApp.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: 'renan@example.com' });

      expect(requestReset.status).toBe(204);
      expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);

      const resetUrl = sendPasswordResetEmail.mock.calls[0]?.[0]?.resetUrl;
      expect(resetUrl).toEqual(expect.any(String));

      const resetToken = new URL(resetUrl as string).searchParams.get('token');
      expect(resetToken).toEqual(expect.any(String));

      const confirmReset = await request(isolatedApp.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({
          token: resetToken,
          newPassword,
        });

      expect(confirmReset.status).toBe(200);
      expect(confirmReset.body).toEqual({ success: true });

      const oldPasswordLogin = await request(isolatedApp.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'renan@example.com',
          password,
        });
      expect(oldPasswordLogin.status).toBe(401);

      const newPasswordLogin = await request(isolatedApp.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'renan@example.com',
          password: newPassword,
        });
      expect(newPasswordLogin.status).toBe(200);
    } finally {
      await isolatedApp.close();
    }
  });

  it('accepts unknown password reset emails without revealing whether the account exists', async () => {
    const sendPasswordResetEmail = vi
      .spyOn(MailService.prototype, 'sendPasswordResetEmail')
      .mockResolvedValue();
    const isolatedApp = await createIsolatedApp();

    try {
      const requestReset = await request(isolatedApp.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: 'missing@example.com' });

      expect(requestReset.status).toBe(204);
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    } finally {
      await isolatedApp.close();
    }
  });

  it('requires email verification before allowing login for public signups', async () => {
    const password = 'Secret123!';
    const sendEmailVerificationEmail = vi
      .spyOn(MailService.prototype, 'sendEmailVerificationEmail')
      .mockResolvedValue();
    const isolatedApp = await createIsolatedApp();

    try {
      const register = await request(isolatedApp.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Ana Souza',
          email: 'ana@example.com',
          password,
          role: 'paciente',
          city: 'Santos, SP',
        });

      expect(register.status).toBe(201);
      expect(register.body).toEqual({
        success: true,
        email: 'ana@example.com',
        role: 'paciente',
        requiresEmailVerification: true,
        requiresApproval: false,
      });
      expect(register.headers['set-cookie']).toBeUndefined();
      expect(sendEmailVerificationEmail).toHaveBeenCalledTimes(1);

      const loginBeforeVerify = await request(isolatedApp.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'ana@example.com',
          password,
        });

      expect(loginBeforeVerify.status).toBe(401);
      expect(loginBeforeVerify.body.message).toBe('Email verification is required before login');

      const verifyUrl = sendEmailVerificationEmail.mock.calls[0]?.[0]?.verifyUrl;
      expect(verifyUrl).toEqual(expect.any(String));

      const token = new URL(verifyUrl as string).searchParams.get('token');
      expect(token).toEqual(expect.any(String));

      const verifyEmail = await request(isolatedApp.getHttpServer())
        .post('/auth/verify-email')
        .send({ token });

      expect(verifyEmail.status).toBe(200);
      expect(verifyEmail.body).toEqual({ success: true });

      const loginAfterVerify = await request(isolatedApp.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'ana@example.com',
          password,
        });

      expect(loginAfterVerify.status).toBe(200);
      expect(loginAfterVerify.body.user.email).toBe('ana@example.com');
    } finally {
      await isolatedApp.close();
    }
  });

  it('registers a patient, logs in, creates a dream and accepts a proposal flow', async () => {
    const patientEmail = 'ana@example.com';
    const supporterEmail = 'fernanda@example.com';
    const password = 'Secret123!';

    const { register: patientRegister, login: patientLogin, accessToken: patientToken } =
      await registerVerifyAndLoginPublicUser({
        name: 'Ana Souza',
        email: patientEmail,
        password,
        role: 'paciente',
        city: 'Santos, SP',
      });

    expect(patientRegister.status).toBe(201);
    expect(patientRegister.body).toEqual({
      success: true,
      email: patientEmail,
      role: 'paciente',
      requiresEmailVerification: true,
      requiresApproval: false,
    });
    expect(patientLogin.body.user.role).toBe('paciente');
    expect(patientToken).toEqual(expect.any(String));

    const { accessToken: supporterToken } = await registerVerifyAndLoginPublicUser({
      name: 'Fernanda Lima',
      email: supporterEmail,
      password,
      role: 'apoiador',
      city: 'Santos, SP',
    });

    expect(patientLogin.body.user.email).toBe(patientEmail);
    expect(patientLogin.body.accessToken).toEqual(expect.any(String));
    expect(patientLogin.body.refreshToken).toEqual(expect.any(String));

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: patientLogin.body.refreshToken,
      });

    expect(refresh.status).toBe(200);
    expect(refresh.body.user.email).toBe(patientEmail);
    expect(refresh.body.accessToken).toEqual(expect.any(String));
    expect(refresh.body.refreshToken).toEqual(expect.any(String));
    expect(refresh.body.accessToken).not.toBe(patientLogin.body.accessToken);
    expect(refresh.body.refreshToken).not.toBe(patientLogin.body.refreshToken);

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${patientToken}`)
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
      .set('Authorization', `Bearer ${supporterToken}`)
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
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({
        message: 'Tentando enviar uma segunda proposta.',
        offering: 'Companhia',
        availability: 'Domingo',
        duration: '1 hora',
      });

    expect(duplicateProposal.status).toBe(409);

    const supporterMine = await request(app.getHttpServer())
      .get('/proposals/mine')
      .set('Authorization', `Bearer ${supporterToken}`);

    expect(supporterMine.status).toBe(200);
    expect(supporterMine.body).toHaveLength(1);
    expect(supporterMine.body[0].id).toBe(createProposal.body.id);

    const patientReceived = await request(app.getHttpServer())
      .get('/proposals/received')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(patientReceived.status).toBe(200);
    expect(patientReceived.body).toHaveLength(1);
    expect(patientReceived.body[0].dreamId).toBe(createDream.body.id);

    const patientDreams = await request(app.getHttpServer())
      .get('/dreams/mine')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(patientDreams.status).toBe(200);
    expect(patientDreams.body).toHaveLength(1);
    expect(patientDreams.body[0].id).toBe(createDream.body.id);

    const dreamProposals = await request(app.getHttpServer())
      .get(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(dreamProposals.status).toBe(200);
    expect(dreamProposals.body).toHaveLength(1);
    expect(dreamProposals.body[0].id).toBe(createProposal.body.id);

    const acceptProposal = await request(app.getHttpServer())
      .post(`/proposals/${createProposal.body.id}/accept`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(acceptProposal.status).toBe(200);
    expect(acceptProposal.body.status).toBe('aceita');
    expect(acceptProposal.body.conversationId).toEqual(expect.any(String));

    const supporterDreamDetail = await request(app.getHttpServer())
      .get(`/dreams/${createDream.body.id}`)
      .set('Authorization', `Bearer ${supporterToken}`);

    expect(supporterDreamDetail.status).toBe(200);
    expect(supporterDreamDetail.body.id).toBe(createDream.body.id);
  });

  it('returns the duplicate proposal message on repeated supporter submission', async () => {
    const password = 'Secret123!';

    const { accessToken: patientToken } = await registerVerifyAndLoginPublicUser({
      name: 'Paciente Duplicado',
      email: 'patient-duplicate@example.com',
      password,
      role: 'paciente',
      city: 'Santos, SP',
    });

    const { accessToken: supporterToken } = await registerVerifyAndLoginPublicUser({
      name: 'Apoiadora Duplicada',
      email: 'supporter-duplicate@example.com',
      password,
      role: 'apoiador',
      city: 'Santos, SP',
    });

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${patientToken}`)
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
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({
        message: 'Posso ajudar com aulas online.',
        offering: 'Aulas de violao',
        availability: 'Noites de semana',
        duration: '1 hora',
      });
    expect(createProposal.status).toBe(201);

    const duplicateProposal = await request(app.getHttpServer())
      .post(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({
        message: 'Tentando repetir a proposta.',
        offering: 'Aulas de violao',
        availability: 'Sabado',
        duration: '2 horas',
      });

    expect(duplicateProposal.status).toBe(409);
    expect(duplicateProposal.body.message).toBe('Você já enviou uma proposta para este sonho.');
  });

  it('lets an approved institution manage a beneficiary and operate the patient-side flow', async () => {
    const password = 'Secret123!';
    const adminEmail = 'admin-institutions@example.com';
    const institutionEmail = 'casa-esperanca@example.com';
    const supporterEmail = 'supporter-institutions@example.com';

    const { register: institutionRegister, token: institutionVerificationToken } = await registerPublicUser({
        name: 'Casa Esperanca',
        email: institutionEmail,
        password,
        role: 'instituicao',
        institutionResponsibleName: 'Ana Souza',
        institutionType: 'ONG',
        institutionResponsiblePhone: '(81) 99999-0000',
        institutionDescription: 'Instituicao focada em acolhimento humanizado.',
        state: 'PE',
        city: 'Recife',
      });

    expect(institutionRegister.body).toEqual({
      success: true,
      email: institutionEmail,
      role: 'instituicao',
      requiresEmailVerification: true,
      requiresApproval: true,
    });
    const institution = await usersRepository.findOneByOrFail({ email: institutionEmail.toLowerCase() });
    expect(institution).toMatchObject({
      role: 'instituicao',
      approved: false,
      verified: false,
      state: 'PE',
      city: 'Recife',
      institutionType: 'ONG',
      institutionDescription: 'Instituicao focada em acolhimento humanizado.',
      institutionResponsibleName: 'Ana Souza',
      institutionResponsiblePhone: '(81) 99999-0000',
    });

    await verifyPublicUser(institutionVerificationToken);
    const { accessToken: institutionToken } = await loginPublicUser({
      email: institutionEmail,
      password,
    });

    const pendingInstitutionPatient = await request(app.getHttpServer())
      .post('/institution/patients')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        name: 'Maria das Dores',
        state: 'PE',
        city: 'Recife',
      });

    expect(pendingInstitutionPatient.status).toBe(403);

    await usersRepository.save(usersRepository.create({
      name: 'Admin Institucional',
      email: adminEmail,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'admin',
      verified: true,
      approved: true,
      approvedAt: new Date(),
    }));

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminEmail,
        password,
      });

    expect(adminLogin.status).toBe(200);

    const approveInstitution = await request(app.getHttpServer())
      .post(`/admin/users/${institution.id}/approve`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`);

    expect(approveInstitution.status).toBe(200);
    expect(approveInstitution.body.approved).toBe(true);

    const createManagedPatientWithBlankName = await request(app.getHttpServer())
      .post('/institution/patients')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        name: '   ',
      });

    expect(createManagedPatientWithBlankName.status).toBe(400);

    const createManagedPatient = await request(app.getHttpServer())
      .post('/institution/patients')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        name: 'Maria das Dores',
        state: 'PE',
        city: 'Recife',
      });

    expect(createManagedPatient.status).toBe(201);
    expect(createManagedPatient.body.name).toBe('Maria das Dores');
    expect(createManagedPatient.body.state).toBe('PE');
    expect(createManagedPatient.body.city).toBe('Recife');
    expect(createManagedPatient.body.locationLabel).toBe('Recife, PE');

    const createInstitutionDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        title: 'Passeio no jardim botanico',
        description: 'Uma tarde tranquila em contato com a natureza.',
        category: 'Experiência ao ar livre',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
        managedPatientId: createManagedPatient.body.id,
      });

    expect(createInstitutionDream.status).toBe(201);
    expect(createInstitutionDream.body.patientName).toBe('Maria das Dores');
    expect(createInstitutionDream.body.patientCity).toBe('Recife, PE');
    expect(createInstitutionDream.body.managedByInstitution).toBe(true);
    expect(createInstitutionDream.body.institutionName).toBe('Casa Esperanca');

    const { accessToken: supporterToken } = await registerVerifyAndLoginPublicUser({
        name: 'Pedro Oliveira',
        email: supporterEmail,
        password,
        role: 'apoiador',
        city: 'Recife, PE',
      });

    const createProposal = await request(app.getHttpServer())
      .post(`/dreams/${createInstitutionDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({
        message: 'Posso acompanhar o passeio e organizar o deslocamento.',
        offering: 'Companhia e organizacao',
        availability: 'Quintas à tarde',
        duration: '2 horas',
      });

    expect(createProposal.status).toBe(201);

    const receivedByInstitution = await request(app.getHttpServer())
      .get('/proposals/received')
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(receivedByInstitution.status).toBe(200);
    expect(receivedByInstitution.body).toHaveLength(1);
    expect(receivedByInstitution.body[0].id).toBe(createProposal.body.id);

    const acceptedProposal = await request(app.getHttpServer())
      .post(`/proposals/${createProposal.body.id}/accept`)
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(acceptedProposal.status).toBe(200);
    expect(acceptedProposal.body.conversationId).toEqual(expect.any(String));

    const institutionConversations = await request(app.getHttpServer())
      .get('/conversations/mine')
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(institutionConversations.status).toBe(200);
    expect(institutionConversations.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: acceptedProposal.body.conversationId,
          operatorUserId: institution.id,
        }),
      ]),
    );

    const institutionMessage = await request(app.getHttpServer())
      .post(`/conversations/${acceptedProposal.body.conversationId}/messages`)
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        body: 'Estamos alinhando os detalhes do passeio com a equipe.',
      });

    expect(institutionMessage.status).toBe(201);

    const supporterMessages = await request(app.getHttpServer())
      .get(`/conversations/${acceptedProposal.body.conversationId}/messages`)
      .set('Authorization', `Bearer ${supporterToken}`);

    expect(supporterMessages.status).toBe(200);
    expect(supporterMessages.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          body: 'Estamos alinhando os detalhes do passeio com a equipe.',
        }),
      ]),
    );
  });

  it('creates patient access invites and lets linked patients follow institution-managed cases', async () => {
    const password = 'Secret123!';
    const patientEmail = 'paciente-vinculado@example.com';
    const supporterEmail = 'apoiador-vinculado@example.com';
    const { institutionToken } = await registerApprovedInstitution({
      name: 'Instituicao Vinculo',
      email: 'instituicao-vinculo@example.com',
      password,
      state: 'PE',
      city: 'Recife',
      adminEmail: 'admin-vinculo@example.com',
    });

    const managedPatient = await request(app.getHttpServer())
      .post('/institution/patients')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        name: 'Lucia Beneficiaria',
        state: 'PE',
        city: 'Olinda',
      });
    expect(managedPatient.status).toBe(201);

    const dream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        title: 'Passeio cultural com a paciente',
        description: 'A instituição quer viabilizar uma visita cultural leve.',
        category: 'Literatura e Cultura',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
        managedPatientId: managedPatient.body.id,
      });
    expect(dream.status).toBe(201);

    const { accessToken: supporterToken } = await registerVerifyAndLoginPublicUser({
        name: 'Apoiador Vinculado',
        email: supporterEmail,
        password,
        role: 'apoiador',
        state: 'PE',
        city: 'Recife',
      });

    const proposal = await request(app.getHttpServer())
      .post(`/dreams/${dream.body.id}/proposals`)
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({
        message: 'Consigo acompanhar a visita e organizar a logística.',
        offering: 'Companhia e logística',
        availability: 'Terças à tarde',
        duration: '2 horas',
      });
    expect(proposal.status).toBe(201);

    const acceptedProposal = await request(app.getHttpServer())
      .post(`/proposals/${proposal.body.id}/accept`)
      .set('Authorization', `Bearer ${institutionToken}`);
    expect(acceptedProposal.status).toBe(200);

    const detailBeforeInvite = await request(app.getHttpServer())
      .get(`/institution/patients/${managedPatient.body.id}`)
      .set('Authorization', `Bearer ${institutionToken}`);
    expect(detailBeforeInvite.status).toBe(200);
    expect(detailBeforeInvite.body.patient.accessStatus).toBe('sem-acesso');
    expect(detailBeforeInvite.body.summary).toMatchObject({
      dreams: 1,
      proposals: 1,
      activeConversations: 1,
    });

    const createInvite = await request(app.getHttpServer())
      .post(`/institution/patients/${managedPatient.body.id}/access-invite`)
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({ email: patientEmail });
    expect(createInvite.status).toBe(201);
    expect(createInvite.body.inviteUrl).toContain('/aceitar-convite-paciente');

    const inviteUrl = new URL(createInvite.body.inviteUrl);
    const acceptInvite = await request(app.getHttpServer())
      .post('/auth/patient-invites/accept')
      .send({
        email: patientEmail,
        token: inviteUrl.searchParams.get('token'),
        name: 'Lucia Beneficiaria',
        password,
      });

    expect(acceptInvite.status).toBe(200);
    expect(acceptInvite.body.user.role).toBe('paciente');
    expect(acceptInvite.body.user.city).toBe('Olinda');

    const linkedPatientToken = getAccessTokenFromSetCookie(acceptInvite.headers["set-cookie"]);

    const patientDreams = await request(app.getHttpServer())
      .get('/dreams/mine')
      .set('Authorization', `Bearer ${linkedPatientToken}`);
    expect(patientDreams.status).toBe(200);
    expect(patientDreams.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: dream.body.id,
          managedByInstitution: true,
          institutionName: 'Instituicao Vinculo',
          patientName: 'Lucia Beneficiaria',
          canEdit: false,
        }),
      ]),
    );

    const patientProposals = await request(app.getHttpServer())
      .get('/proposals/received')
      .set('Authorization', `Bearer ${linkedPatientToken}`);
    expect(patientProposals.status).toBe(200);
    expect(patientProposals.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: proposal.body.id,
          managedByInstitution: true,
          institutionName: 'Instituicao Vinculo',
          patientName: 'Lucia Beneficiaria',
          canRespond: false,
        }),
      ]),
    );

    const patientConversations = await request(app.getHttpServer())
      .get('/conversations/mine')
      .set('Authorization', `Bearer ${linkedPatientToken}`);
    expect(patientConversations.status).toBe(200);
    expect(patientConversations.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: acceptedProposal.body.conversationId,
          managedByInstitution: true,
          patientName: 'Lucia Beneficiaria',
          institutionName: 'Instituicao Vinculo',
          dreamTitle: 'Passeio cultural com a paciente',
        }),
      ]),
    );

    const patientMessageAttempt = await request(app.getHttpServer())
      .post(`/conversations/${acceptedProposal.body.conversationId}/messages`)
      .set('Authorization', `Bearer ${linkedPatientToken}`)
      .send({ body: 'Posso responder aqui?' });
    expect(patientMessageAttempt.status).toBe(403);

    const detailAfterInvite = await request(app.getHttpServer())
      .get(`/institution/patients/${managedPatient.body.id}`)
      .set('Authorization', `Bearer ${institutionToken}`);
    expect(detailAfterInvite.status).toBe(200);
    expect(detailAfterInvite.body.patient).toMatchObject({
      linkedUserId: acceptInvite.body.user.id,
      linkedUserEmail: patientEmail,
      accessStatus: 'ativo',
    });
  });

  it('paginates, filters and updates managed patients for institutions', async () => {
    const password = 'Secret123!';
    const { institutionToken } = await registerApprovedInstitution({
      name: 'Instituicao Gestora',
      email: 'instituicao-gestora@example.com',
      password,
      state: 'PE',
      city: 'Recife',
      adminEmail: 'admin-gestora@example.com',
    });

    const createMaria = await request(app.getHttpServer())
      .post('/institution/patients')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        name: 'Maria das Dores',
        state: 'PE',
        city: 'Olinda',
      });
    expect(createMaria.status).toBe(201);

    const createJose = await request(app.getHttpServer())
      .post('/institution/patients')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        name: 'Jose Carlos',
        state: 'PE',
        city: 'Recife',
      });
    expect(createJose.status).toBe(201);

    const createAna = await request(app.getHttpServer())
      .post('/institution/patients')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        name: 'Ana Lucia',
        state: 'PE',
        city: 'Paulista',
      });
    expect(createAna.status).toBe(201);

    const paginatedPatients = await request(app.getHttpServer())
      .get('/institution/patients?page=1&pageSize=2')
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(paginatedPatients.status).toBe(200);
    expect(paginatedPatients.body).toMatchObject({
      page: 1,
      pageSize: 2,
      total: 3,
      totalPages: 2,
    });
    expect(paginatedPatients.body.items).toHaveLength(2);

    const filteredPatients = await request(app.getHttpServer())
      .get('/institution/patients?page=1&pageSize=10&query=jose')
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(filteredPatients.status).toBe(200);
    expect(filteredPatients.body).toMatchObject({
      total: 1,
      totalPages: 1,
    });
    expect(filteredPatients.body.items).toEqual([
      expect.objectContaining({
        id: createJose.body.id,
        name: 'Jose Carlos',
        locationLabel: 'Recife, PE',
      }),
    ]);

    const updateJose = await request(app.getHttpServer())
      .patch(`/institution/patients/${createJose.body.id}`)
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        name: 'Jose Carlos Atualizado',
        state: 'PE',
        city: 'Jaboatão dos Guararapes',
      });

    expect(updateJose.status).toBe(200);
    expect(updateJose.body).toMatchObject({
      id: createJose.body.id,
      name: 'Jose Carlos Atualizado',
      state: 'PE',
      city: 'Jaboatão dos Guararapes',
      locationLabel: 'Jaboatão dos Guararapes, PE',
    });
  });

  it('paginates institution dreams, supports dream editing and persists proposal rejection', async () => {
    const password = 'Secret123!';
    const { institutionToken } = await registerApprovedInstitution({
      name: 'Casa Sonhos',
      email: 'casa-sonhos@example.com',
      password,
      state: 'PE',
      city: 'Recife',
      adminEmail: 'admin-casa-sonhos@example.com',
    });

    const managedPatientOne = await request(app.getHttpServer())
      .post('/institution/patients')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({ name: 'Beatriz Demo', state: 'PE', city: 'Recife' });
    expect(managedPatientOne.status).toBe(201);

    const managedPatientTwo = await request(app.getHttpServer())
      .post('/institution/patients')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({ name: 'Claudia Demo', state: 'PE', city: 'Olinda' });
    expect(managedPatientTwo.status).toBe(201);

    const dreamOne = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        title: 'Passeio no jardim botanico',
        description: 'Uma tarde tranquila em contato com a natureza.',
        category: 'Experiência ao ar livre',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
        managedPatientId: managedPatientOne.body.id,
      });
    expect(dreamOne.status).toBe(201);

    const dreamTwo = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        title: 'Oficina de musica suave',
        description: 'A instituicao quer organizar uma tarde musical.',
        category: 'Arte e Música',
        format: 'presencial',
        urgency: 'baixa',
        privacy: 'publico',
        managedPatientId: managedPatientOne.body.id,
      });
    expect(dreamTwo.status).toBe(201);

    const dreamThree = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        title: 'Sessao de leitura compartilhada',
        description: 'Leituras leves com conversa acolhedora.',
        category: 'Literatura e Cultura',
        format: 'remoto',
        urgency: 'media',
        privacy: 'publico',
        managedPatientId: managedPatientOne.body.id,
      });
    expect(dreamThree.status).toBe(201);

    const { accessToken: supporterOneToken } = await registerVerifyAndLoginPublicUser({
        name: 'Apoiador Um',
        email: 'apoiador-um-sonhos@example.com',
        password,
        role: 'apoiador',
        state: 'PE',
        city: 'Recife',
      });

    const { accessToken: supporterTwoToken } = await registerVerifyAndLoginPublicUser({
        name: 'Apoiador Dois',
        email: 'apoiador-dois-sonhos@example.com',
        password,
        role: 'apoiador',
        state: 'PE',
        city: 'Olinda',
      });

    const proposalOne = await request(app.getHttpServer())
      .post(`/dreams/${dreamOne.body.id}/proposals`)
      .set('Authorization', `Bearer ${supporterOneToken}`)
      .send({
        message: 'Posso organizar o deslocamento para o passeio.',
        offering: 'Companhia e deslocamento',
        availability: 'Segundas à tarde',
        duration: '2 horas',
      });
    expect(proposalOne.status).toBe(201);

    const proposalTwo = await request(app.getHttpServer())
      .post(`/dreams/${dreamTwo.body.id}/proposals`)
      .set('Authorization', `Bearer ${supporterTwoToken}`)
      .send({
        message: 'Posso levar repertorio e acompanhar a oficina.',
        offering: 'Oficina musical guiada',
        availability: 'Quartas de manhã',
        duration: '1 hora',
      });
    expect(proposalTwo.status).toBe(201);

    const proposalThree = await request(app.getHttpServer())
      .post(`/dreams/${dreamThree.body.id}/proposals`)
      .set('Authorization', `Bearer ${supporterOneToken}`)
      .send({
        message: 'Posso conduzir a leitura com textos curtos.',
        offering: 'Leitura mediada',
        availability: 'Sextas à tarde',
        duration: '45 minutos',
      });
    expect(proposalThree.status).toBe(201);

    const acceptFirstProposal = await request(app.getHttpServer())
      .post(`/proposals/${proposalOne.body.id}/accept`)
      .set('Authorization', `Bearer ${institutionToken}`);
    expect(acceptFirstProposal.status).toBe(200);

    const paginatedDreams = await request(app.getHttpServer())
      .get('/dreams/mine?page=1&pageSize=2')
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(paginatedDreams.status).toBe(200);
    expect(paginatedDreams.body).toMatchObject({
      page: 1,
      pageSize: 2,
      total: 3,
      totalPages: 2,
    });
    expect(paginatedDreams.body.items).toHaveLength(2);

    const filteredDreams = await request(app.getHttpServer())
      .get('/dreams/mine?page=1&pageSize=10&status=publicado&query=oficina')
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(filteredDreams.status).toBe(200);
    expect(filteredDreams.body).toMatchObject({
      total: 1,
      totalPages: 1,
    });
    expect(filteredDreams.body.items).toEqual([
      expect.objectContaining({
        id: dreamTwo.body.id,
        title: 'Oficina de musica suave',
        status: 'publicado',
      }),
    ]);

    const updateDream = await request(app.getHttpServer())
      .patch(`/dreams/${dreamThree.body.id}`)
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        title: 'Sessao de leitura e pintura',
        description: 'Leitura compartilhada com atividade artistica leve.',
        category: 'Arte e Música',
        format: 'ambos',
        urgency: 'alta',
        privacy: 'verificados',
        managedPatientId: managedPatientTwo.body.id,
      });

    expect(updateDream.status).toBe(200);
    expect(updateDream.body).toMatchObject({
      id: dreamThree.body.id,
      title: 'Sessao de leitura e pintura',
      category: 'Arte e Música',
      format: 'ambos',
      urgency: 'alta',
      privacy: 'verificados',
      managedPatientId: managedPatientTwo.body.id,
      patientName: 'Claudia Demo',
      patientCity: 'Olinda, PE',
    });

    const paginatedReceivedProposals = await request(app.getHttpServer())
      .get('/proposals/received?page=1&pageSize=1&status=enviada')
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(paginatedReceivedProposals.status).toBe(200);
    expect(paginatedReceivedProposals.body).toMatchObject({
      page: 1,
      pageSize: 1,
      total: 2,
      totalPages: 2,
    });
    expect(paginatedReceivedProposals.body.items).toHaveLength(1);

    const rejectProposal = await request(app.getHttpServer())
      .post(`/proposals/${proposalTwo.body.id}/reject`)
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(rejectProposal.status).toBe(200);
    expect(rejectProposal.body.status).toBe('recusada');

    const rejectedProposals = await request(app.getHttpServer())
      .get('/proposals/received?page=1&pageSize=10&status=recusada&query=oficina')
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(rejectedProposals.status).toBe(200);
    expect(rejectedProposals.body).toMatchObject({
      total: 1,
      totalPages: 1,
    });
    expect(rejectedProposals.body.items).toEqual([
      expect.objectContaining({
        id: proposalTwo.body.id,
        status: 'recusada',
        dreamTitle: 'Oficina de musica suave',
      }),
    ]);
  });

  it('allows an institution to update its profile and change its password', async () => {
    const password = 'Secret123!';
    const { institution, institutionToken } = await registerApprovedInstitution({
      name: 'Instituicao Perfil',
      email: 'instituicao-perfil@example.com',
      password,
      state: 'PE',
      city: 'Recife',
      adminEmail: 'admin-instituicao-perfil@example.com',
    });

    const getProfile = await request(app.getHttpServer())
      .get('/institution/profile')
      .set('Authorization', `Bearer ${institutionToken}`);

    expect(getProfile.status).toBe(200);
    expect(getProfile.body).toMatchObject({
      id: institution.id,
      name: 'Instituicao Perfil',
      email: 'instituicao-perfil@example.com',
      locationLabel: 'Recife, PE',
      institutionResponsibleName: 'Responsavel Demo',
      institutionResponsiblePhone: '(81) 99999-0000',
    });

    const updateProfile = await request(app.getHttpServer())
      .patch('/institution/profile')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        name: 'Instituicao Perfil Atualizada',
        email: 'instituicao-perfil-atualizada@example.com',
        institutionResponsibleName: 'Ana Lucia Atualizada',
        institutionResponsiblePhone: '(81) 98888-7777',
        state: 'PE',
        city: 'Olinda',
        institutionType: 'ONG',
        institutionDescription: 'Instituicao focada em acompanhamento humanizado.',
      });

    expect(updateProfile.status).toBe(200);
    expect(updateProfile.body).toMatchObject({
      id: institution.id,
      name: 'Instituicao Perfil Atualizada',
      email: 'instituicao-perfil-atualizada@example.com',
      state: 'PE',
      city: 'Olinda',
      locationLabel: 'Olinda, PE',
      institutionType: 'ONG',
      institutionDescription: 'Instituicao focada em acompanhamento humanizado.',
      institutionResponsibleName: 'Ana Lucia Atualizada',
      institutionResponsiblePhone: '(81) 98888-7777',
    });

    const invalidPasswordChange = await request(app.getHttpServer())
      .post('/institution/profile/password')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        currentPassword: 'SenhaErrada123!',
        newPassword: 'NovaSenhaSegura123!',
      });

    expect(invalidPasswordChange.status).toBe(401);

    const validPasswordChange = await request(app.getHttpServer())
      .post('/institution/profile/password')
      .set('Authorization', `Bearer ${institutionToken}`)
      .send({
        currentPassword: password,
        newPassword: 'NovaSenhaSegura123!',
      });

    expect(validPasswordChange.status).toBe(200);

    const relogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'instituicao-perfil-atualizada@example.com',
        password: 'NovaSenhaSegura123!',
      });

    expect(relogin.status).toBe(200);
    expect(relogin.body.user).toMatchObject({
      role: 'instituicao',
      institutionType: 'ONG',
      institutionDescription: 'Instituicao focada em acompanhamento humanizado.',
      institutionResponsibleName: 'Ana Lucia Atualizada',
      institutionResponsiblePhone: '(81) 98888-7777',
      locationLabel: 'Olinda, PE',
    });
  });

  it('accepts HttpOnly access token cookie as auth fallback', async () => {
    const password = 'Secret123!';

    const { login } = await registerVerifyAndLoginPublicUser({
        name: 'Paciente Cookie',
        email: 'patient-cookie@example.com',
        password,
        role: 'paciente',
        city: 'Santos, SP',
      });

    expect(login.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('nd_access_token=')]),
    );

    const cookies = login.headers['set-cookie'];
    const mine = await request(app.getHttpServer())
      .get('/dreams/mine')
      .set('Cookie', cookies);

    expect(mine.status).toBe(200);
    expect(Array.isArray(mine.body)).toBe(true);
  });

  it('clears auth cookies on logout', async () => {
    const password = 'Secret123!';

    const { login } = await registerVerifyAndLoginPublicUser({
        name: 'Paciente Logout',
        email: 'patient-logout@example.com',
        password,
        role: 'paciente',
        city: 'Santos, SP',
      });

    const logout = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', login.headers['set-cookie']);

    expect(logout.status).toBe(204);
    expect(logout.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('nd_access_token=;'),
        expect.stringContaining('nd_refresh_token=;'),
      ]),
    );
  });

  it('rate limits repeated login attempts', async () => {
    let rateLimitedApp: INestApplication | undefined;

    try {
      process.env.LOGIN_THROTTLE_LIMIT = '5';
      process.env.LOGIN_THROTTLE_TTL_MS = '60000';
      const moduleRef = await Test.createTestingModule({
        imports: [appModule],
      }).compile();

      rateLimitedApp = moduleRef.createNestApplication();
      rateLimitedApp.use(cookieParser());
      await rateLimitedApp.init();

      const attempts = [];
      for (let index = 0; index < 6; index += 1) {
        attempts.push(
          await request(rateLimitedApp.getHttpServer())
            .post('/auth/login')
            .send({
              email: 'missing-user@example.com',
              password: 'Secret123!',
            }),
        );
      }

      for (const response of attempts.slice(0, 5)) {
        expect(response.status).toBe(401);
      }
      expect(attempts[5].status).toBe(429);
    } finally {
      process.env.LOGIN_THROTTLE_LIMIT = '1000';
      process.env.LOGIN_THROTTLE_TTL_MS = '60000';
      if (rateLimitedApp) {
        await rateLimitedApp.close();
      }
    }
  });

  it('rejects sentry tunnel requests from untrusted origins', async () => {
    let isolatedApp: INestApplication | undefined;

    try {
      isolatedApp = await createIsolatedApp();

      const response = await request(isolatedApp.getHttpServer())
        .post('/sentry-tunnel')
        .set('Content-Type', 'application/x-sentry-envelope')
        .set('Origin', 'https://evil.example')
        .send('{"dsn":"https://public@example.ingest.sentry.io/123"}\n{}');

      expect(response.status).toBe(403);
    } finally {
      if (isolatedApp) {
        await isolatedApp.close();
      }
    }
  });

  it('rejects sentry tunnel requests without origin when an allowlist is configured', async () => {
    let isolatedApp: INestApplication | undefined;

    try {
      isolatedApp = await createIsolatedApp();

      const response = await request(isolatedApp.getHttpServer())
        .post('/sentry-tunnel')
        .set('Content-Type', 'application/x-sentry-envelope')
        .send('{"dsn":"https://public@example.ingest.sentry.io/123"}\n{}');

      expect(response.status).toBe(403);
    } finally {
      if (isolatedApp) {
        await isolatedApp.close();
      }
    }
  });

  it('rejects unsupported sentry tunnel content types', async () => {
    let isolatedApp: INestApplication | undefined;

    try {
      isolatedApp = await createIsolatedApp();

      const response = await request(isolatedApp.getHttpServer())
        .post('/sentry-tunnel')
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'text/plain')
        .send('not-an-envelope');

      expect(response.status).toBe(415);
    } finally {
      if (isolatedApp) {
        await isolatedApp.close();
      }
    }
  });

  it('rate limits repeated sentry tunnel abuse attempts', async () => {
    let rateLimitedApp: INestApplication | undefined;

    try {
      rateLimitedApp = await createIsolatedApp();

      const attempts = [];

      for (let index = 0; index < 3; index += 1) {
        attempts.push(
          await request(rateLimitedApp.getHttpServer())
            .post('/sentry-tunnel')
            .set('Origin', 'http://localhost:5173')
            .set('Content-Type', 'text/plain')
            .send('not-an-envelope'),
        );
      }

      expect(attempts[0].status).toBe(415);
      expect(attempts[1].status).toBe(415);
      expect(attempts[2].status).toBe(429);
    } finally {
      if (rateLimitedApp) {
        await rateLimitedApp.close();
      }
    }
  });

  it('forbids a supporter without proposal from viewing a dream that is no longer published', async () => {
    const password = 'Secret123!';

    const { accessToken: patientToken } = await registerVerifyAndLoginPublicUser({
        name: 'Paciente Restrito',
        email: 'patient-restricted@example.com',
        password,
        role: 'paciente',
        city: 'Curitiba, PR',
      });

    const { accessToken: supporterToken } = await registerVerifyAndLoginPublicUser({
        name: 'Apoiadora Autorizada',
        email: 'supporter-authorized@example.com',
        password,
        role: 'apoiador',
        city: 'Curitiba, PR',
      });

    const { accessToken: outsiderToken } = await registerVerifyAndLoginPublicUser({
        name: 'Apoiadora Sem Proposta',
        email: 'supporter-outsider@example.com',
        password,
        role: 'apoiador',
        city: 'Curitiba, PR',
      });

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${patientToken}`)
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
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({
        message: 'Posso acompanhar voce nesse passeio.',
        offering: 'Companhia',
        availability: 'Fim de tarde',
        duration: '2 horas',
      });
    expect(createProposal.status).toBe(201);

    const acceptProposal = await request(app.getHttpServer())
      .post(`/proposals/${createProposal.body.id}/accept`)
      .set('Authorization', `Bearer ${patientToken}`);
    expect(acceptProposal.status).toBe(200);

    const outsiderDreamDetail = await request(app.getHttpServer())
      .get(`/dreams/${createDream.body.id}`)
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(outsiderDreamDetail.status).toBe(403);
    expect(outsiderDreamDetail.body.message).toBe('You are not allowed to view this dream');
  });

  it('forbids a different patient from listing proposals for a dream they do not own', async () => {
    const password = 'Secret123!';

    const { accessToken: ownerToken } = await registerVerifyAndLoginPublicUser({
        name: 'Paciente Dona',
        email: 'patient-owner@example.com',
        password,
        role: 'paciente',
        city: 'Maringá, PR',
      });

    const { accessToken: otherPatientToken } = await registerVerifyAndLoginPublicUser({
        name: 'Paciente Visitante',
        email: 'patient-other@example.com',
        password,
        role: 'paciente',
        city: 'Londrina, PR',
      });

    const { accessToken: supporterToken } = await registerVerifyAndLoginPublicUser({
        name: 'Apoiador Proposta',
        email: 'supporter-proposal-list@example.com',
        password,
        role: 'apoiador',
        city: 'Maringá, PR',
      });

    const createDream = await request(app.getHttpServer())
      .post('/dreams')
      .set('Authorization', `Bearer ${ownerToken}`)
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
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({
        message: 'Posso estar com voce nesse encontro.',
        offering: 'Companhia',
        availability: 'Manha',
        duration: '1 hora',
      });
    expect(createProposal.status).toBe(201);

    const foreignPatientProposals = await request(app.getHttpServer())
      .get(`/dreams/${createDream.body.id}/proposals`)
      .set('Authorization', `Bearer ${otherPatientToken}`);

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

  it('blocks financial chat messages in production, preserves the moderation payload, and escalates on the third attempt', async () => {
    enableOpenAiChatModeration();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const fixture = await createAcceptedConversationFixture('financial-moderation');

    const messagesBefore = await request(app.getHttpServer())
      .get(`/conversations/${fixture.conversationId}/messages`)
      .set('Authorization', `Bearer ${fixture.patientToken}`);
    expect(messagesBefore.status).toBe(200);

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const blockedAttempt = await request(app.getHttpServer())
        .post(`/conversations/${fixture.conversationId}/messages`)
        .set('Authorization', `Bearer ${fixture.patientToken}`)
        .send({ body: `Posso mandar um PIX de R$ ${attempt * 10} para ajudar.` });

      expect(blockedAttempt.status).toBe(400);
      expect(blockedAttempt.body).toMatchObject({
        message: expect.stringMatching(/pix|dinheiro|doa/i),
        reason: 'financeiro',
        moderated: true,
      });
    }

    const messagesAfter = await request(app.getHttpServer())
      .get(`/conversations/${fixture.conversationId}/messages`)
      .set('Authorization', `Bearer ${fixture.patientToken}`);
    expect(messagesAfter.status).toBe(200);
    expect(messagesAfter.body).toHaveLength(messagesBefore.body.length);
    expect(fetchSpy).not.toHaveBeenCalled();

    expect(
      await auditLogsRepository.countBy({
        action: 'Chat message blocked: financeiro',
        target: fixture.patientId,
        refId: fixture.conversationId,
      }),
    ).toBe(3);
    expect(
      await reportsRepository.countBy({
        type: 'chat-moderation',
        targetType: 'chat',
        targetId: fixture.conversationId,
      }),
    ).toBe(1);
  });

  it('blocks severe abusive chat messages flagged by OpenAI and opens an admin report immediately', async () => {
    enableOpenAiChatModeration();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'modr-abuse',
          model: 'omni-moderation-latest',
          results: [
            {
              flagged: true,
              categories: {
                harassment: true,
                'harassment/threatening': false,
                hate: false,
                'hate/threatening': false,
                self_harm: false,
                violence: false,
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    const fixture = await createAcceptedConversationFixture('abusive-moderation');

    const blockedAttempt = await request(app.getHttpServer())
      .post(`/conversations/${fixture.conversationId}/messages`)
      .set('Authorization', `Bearer ${fixture.supporterToken}`)
      .send({ body: 'Seu idiota, me chama em abuso@example.com ou (81) 99999-0000.' });

    expect(blockedAttempt.status).toBe(400);
    expect(blockedAttempt.body).toMatchObject({
      message: expect.stringMatching(/ofensiva|respeitosa|desrespeit/i),
      reason: 'ofensa_grave',
      moderated: true,
    });
    expect(await messagesRepository.countBy({ conversationId: fixture.conversationId })).toBe(0);
    expect(fetchSpy).toHaveBeenCalledOnce();

    const [, requestInit] = fetchSpy.mock.calls[0] ?? [];
    const moderationPayload = JSON.parse(String((requestInit as RequestInit | undefined)?.body));
    expect(moderationPayload.input).toContain('Seu idiota');
    expect(moderationPayload.input).not.toContain('abuso@example.com');
    expect(moderationPayload.input).not.toContain('99999-0000');

    expect(
      await auditLogsRepository.countBy({
        action: 'Chat message blocked: ofensa_grave',
        target: fixture.supporterId,
        refId: fixture.conversationId,
      }),
    ).toBe(1);
    expect(
      await reportsRepository.countBy({
        type: 'chat-moderation',
        targetType: 'chat',
        targetId: fixture.conversationId,
      }),
    ).toBe(1);
  });

  it('allows chat messages when OpenAI moderation degrades and records the fallback', async () => {
    enableOpenAiChatModeration();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('OpenAI timeout'));
    const fixture = await createAcceptedConversationFixture('degraded-moderation');

    const sentMessage = await request(app.getHttpServer())
      .post(`/conversations/${fixture.conversationId}/messages`)
      .set('Authorization', `Bearer ${fixture.supporterToken}`)
      .send({ body: 'Posso acompanhar você com calma no sábado.' });

    expect(sentMessage.status).toBe(201);
    expect(sentMessage.body).toMatchObject({
      conversationId: fixture.conversationId,
      moderated: false,
      body: 'Posso acompanhar você com calma no sábado.',
    });
    expect(
      await auditLogsRepository.countBy({
        action: 'Chat moderation degraded',
        refId: fixture.conversationId,
      }),
    ).toBe(1);
    expect(
      await reportsRepository.countBy({
        type: 'chat-moderation',
        targetType: 'chat',
        targetId: fixture.conversationId,
      }),
    ).toBe(0);
  });

  it('supports conversations messaging and admin moderation endpoints', async () => {
    const password = 'Secret123!';

    const { accessToken: patientToken } = await registerVerifyAndLoginPublicUser({
      name: 'Patient Two',
      email: 'patient2@example.com',
      password,
      role: 'paciente',
      city: 'Santos, SP',
    });

    const { login: supporterLogin, accessToken: supporterToken } = await registerVerifyAndLoginPublicUser({
        name: 'Supporter Two',
        email: 'supporter2@example.com',
        password,
        role: 'apoiador',
        city: 'Santos, SP',
      });

    await usersRepository.save(
      usersRepository.create({
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash(password, 10),
        role: 'admin',
        verified: true,
        approved: true,
        approvedAt: new Date(),
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
      .set('Authorization', `Bearer ${patientToken}`)
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
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({
        message: 'Posso acompanhar no sábado pela manhã.',
        offering: 'Companhia',
        availability: 'Sábado',
        duration: '2 horas',
      });
    expect(createProposal.status).toBe(201);

    const patientNotificationsAfterProposal = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(patientNotificationsAfterProposal.status).toBe(200);
    expect(
      patientNotificationsAfterProposal.body.some(
        (item: { type: string }) => item.type === 'proposta',
      ),
    ).toBe(true);

    const acceptProposal = await request(app.getHttpServer())
      .post(`/proposals/${createProposal.body.id}/accept`)
      .set('Authorization', `Bearer ${patientToken}`);
    expect(acceptProposal.status).toBe(200);

    const supporterNotificationsAfterAccept = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${supporterToken}`);
    expect(supporterNotificationsAfterAccept.status).toBe(200);
    expect(
      supporterNotificationsAfterAccept.body.some((item: { type: string }) => item.type === 'aceito'),
    ).toBe(true);

    const conversationId = acceptProposal.body.conversationId as string;
    expect(conversationId).toEqual(expect.any(String));

    const patientConversations = await request(app.getHttpServer())
      .get('/conversations/mine')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(patientConversations.status).toBe(200);
    expect(patientConversations.body.some((item: { id: string }) => item.id === conversationId)).toBe(true);

    const supporterConversations = await request(app.getHttpServer())
      .get('/conversations/mine')
      .set('Authorization', `Bearer ${supporterToken}`);
    expect(supporterConversations.status).toBe(200);
    expect(supporterConversations.body.some((item: { id: string }) => item.id === conversationId)).toBe(true);

    const postPatientMessage = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ body: 'Olá! Obrigado por topar ajudar.' });
    expect(postPatientMessage.status).toBe(201);

    const supporterNotificationsAfterMessage = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${supporterToken}`);
    expect(supporterNotificationsAfterMessage.status).toBe(200);
    expect(
      supporterNotificationsAfterMessage.body.some(
        (item: { type: string }) => item.type === 'mensagem',
      ),
    ).toBe(true);

    const postSupporterMessage = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({ body: 'Combinado, estarei lá no horário.' });
    expect(postSupporterMessage.status).toBe(201);

    const patientNotificationsBeforeAdminMessage = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(patientNotificationsBeforeAdminMessage.status).toBe(200);

    const supporterNotificationsBeforeAdminMessage = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${supporterToken}`);
    expect(supporterNotificationsBeforeAdminMessage.status).toBe(200);

    const patientMessageNotificationsBeforeAdmin = patientNotificationsBeforeAdminMessage.body.filter(
      (item: { type: string }) => item.type === 'mensagem',
    ).length;
    const supporterMessageNotificationsBeforeAdmin = supporterNotificationsBeforeAdminMessage.body.filter(
      (item: { type: string }) => item.type === 'mensagem',
    ).length;

    const postAdminMessage = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ body: 'Mensagem da moderação para os dois lados.' });
    expect(postAdminMessage.status).toBe(201);

    const patientNotificationsAfterAdminMessage = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(patientNotificationsAfterAdminMessage.status).toBe(200);

    const supporterNotificationsAfterAdminMessage = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${supporterToken}`);
    expect(supporterNotificationsAfterAdminMessage.status).toBe(200);

    expect(
      patientNotificationsAfterAdminMessage.body.filter((item: { type: string }) => item.type === 'mensagem').length,
    ).toBe(patientMessageNotificationsBeforeAdmin + 1);
    expect(
      supporterNotificationsAfterAdminMessage.body.filter((item: { type: string }) => item.type === 'mensagem').length,
    ).toBe(supporterMessageNotificationsBeforeAdmin + 1);

    const listMessages = await request(app.getHttpServer())
      .get(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${supporterToken}`);
    expect(listMessages.status).toBe(200);
    expect(listMessages.body).toHaveLength(3);

    const closeConversation = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/close`)
      .set('Authorization', `Bearer ${getAccessTokenFromSetCookie(adminLogin.headers["set-cookie"])}`)
      .send({ reason: 'Encerrado para teste de moderação.' });
    expect(closeConversation.status).toBe(200);
    expect(closeConversation.body.status).toBe('encerrada');

    const postAfterClose = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${patientToken}`)
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
        approved: true,
        approvedAt: new Date(),
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
    expect(inviteAdmin.status).toBe(200);
    expect(inviteAdmin.body.email).toBe('admin-invite@example.com');

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
      .post(`/admin/users/${supporterLogin.body.user.id}/suspend`)
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
      .set('Authorization', `Bearer ${supporterToken}`);
    expect(notificationPreferences.status).toBe(200);
    expect(notificationPreferences.body.emailEnabled).toBe(false);

    const updateNotificationPreferences = await request(app.getHttpServer())
      .post('/notifications/preferences')
      .set('Authorization', `Bearer ${supporterToken}`)
      .send({ emailEnabled: true });
    expect(updateNotificationPreferences.status).toBe(200);
    expect(updateNotificationPreferences.body.emailEnabled).toBe(true);

    const notificationsMine = await request(app.getHttpServer())
      .get('/notifications/mine')
      .set('Authorization', `Bearer ${supporterToken}`);
    expect(notificationsMine.status).toBe(200);
    expect(notificationsMine.body.length).toBeGreaterThan(0);

    const markRead = await request(app.getHttpServer())
      .post(`/notifications/${notificationsMine.body[0].id}/read`)
      .set('Authorization', `Bearer ${supporterToken}`);
    expect(markRead.status).toBe(200);
    expect(markRead.body.read).toBe(true);

    const markAllRead = await request(app.getHttpServer())
      .post('/notifications/read-all')
      .set('Authorization', `Bearer ${supporterToken}`);
    expect(markAllRead.status).toBe(200);
    expect(markAllRead.body.ok).toBe(true);
  });
});
