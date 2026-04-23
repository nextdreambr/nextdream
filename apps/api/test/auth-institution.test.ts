import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import cookieParser from 'cookie-parser';
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

describe('Institution auth', () => {
  let app: INestApplication;
  let appModule: (typeof import('../src/app.module'))['AppModule'];
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAppUrl = process.env.APP_URL;
  const originalCorsOrigin = process.env.CORS_ORIGIN;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.APP_URL = 'http://localhost:5173';
    process.env.CORS_ORIGIN = 'http://localhost:5173';
    ({ AppModule: appModule } = await import('../src/app.module'));

    const moduleRef = await Test.createTestingModule({
      imports: [appModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();

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

  it('registers and logs in an institution account', async () => {
    const password = 'Secret123!';
    const sendEmailVerificationEmail = vi
      .spyOn(MailService.prototype, 'sendEmailVerificationEmail')
      .mockResolvedValue();
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Casa Esperanca',
        email: 'casa-esperanca@example.com',
        password,
        role: 'instituicao',
        institutionResponsibleName: 'Ana Souza',
        institutionResponsiblePhone: '(81) 99999-0000',
        institutionType: 'ONG',
        institutionDescription: 'Acolhimento humanizado e apoio social.',
        city: 'Recife',
      });

    expect(register.status).toBe(201);
    expect(register.body).toEqual({
      success: true,
      email: 'casa-esperanca@example.com',
      role: 'instituicao',
      requiresEmailVerification: true,
      requiresApproval: true,
    });
    expect(register.headers['set-cookie']).toBeUndefined();

    const verifyUrl = sendEmailVerificationEmail.mock.calls[0]?.[0]?.verifyUrl;
    expect(verifyUrl).toEqual(expect.any(String));

    const token = new URL(verifyUrl as string).searchParams.get('token');
    expect(token).toEqual(expect.any(String));

    const verifyEmail = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token });

    expect(verifyEmail.status).toBe(200);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'casa-esperanca@example.com',
        password,
      });

    expect(login.status).toBe(200);
    expect(login.body.user.role).toBe('instituicao');
    expect(getAccessTokenFromSetCookie(login.headers['set-cookie'])).toEqual(expect.any(String));
  });
});
