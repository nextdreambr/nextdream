import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Repository } from 'typeorm';
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

describe('Admin settings', () => {
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
    };
  }

  async function createAdmin(app: INestApplication, usersRepository: Repository<User>) {
    const password = 'AdminSecret123!';
    const admin = await usersRepository.save(
      usersRepository.create({
        name: 'Admin Settings',
        email: 'admin-settings@example.com',
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

    return getAccessTokenFromSetCookie(login.headers['set-cookie']);
  }

  afterEach(async () => {
    if (currentApp) {
      await currentApp.close();
      currentApp = null;
    }
  });

  it('loads default settings, persists updates and returns the saved values on the next read', async () => {
    const { app, usersRepository } = await createApp();
    currentApp = app;

    const adminToken = await createAdmin(app, usersRepository);

    const initialSettings = await request(app.getHttpServer())
      .get('/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(initialSettings.status).toBe(200);
    expect(initialSettings.body.blockedWords).toEqual(expect.arrayContaining(['pix']));
    expect(initialSettings.body.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'r1', enabled: true }),
      ]),
    );
    expect(initialSettings.body.categories.length).toBeGreaterThan(0);
    expect(initialSettings.body.institutionalTexts.length).toBeGreaterThan(0);

    const updatedSettings = await request(app.getHttpServer())
      .put('/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        blockedWords: ['pix', 'doacao', 'campanha'],
        rules: [
          {
            id: 'r1',
            label: 'Bloqueio em tempo real no chat',
            description: 'Impede o envio de mensagens com termos financeiros.',
            enabled: true,
          },
          {
            id: 'r2',
            label: 'Validação ao criar sonho',
            description: 'Escaneia título e descrição do sonho antes de publicar.',
            enabled: false,
          },
        ],
        categories: [
          { id: 'cat-saude', name: 'Saúde integral' },
          { id: 'cat-convivencia', name: 'Convivência' },
        ],
        institutionalTexts: [
          {
            id: 'text-warning',
            label: 'Aviso anti-dinheiro',
            text: 'Pedidos financeiros continuam proibidos em toda a plataforma.',
          },
          {
            id: 'text-welcome',
            label: 'Mensagem de boas-vindas',
            text: 'Conte com cuidado humano, sem promessas financeiras.',
          },
        ],
      });

    expect(updatedSettings.status).toBe(200);
    expect(updatedSettings.body).toMatchObject({
      blockedWords: ['pix', 'doacao', 'campanha'],
      categories: [
        { id: 'cat-saude', name: 'Saúde integral' },
        { id: 'cat-convivencia', name: 'Convivência' },
      ],
    });
    expect(updatedSettings.body.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'r2', enabled: false }),
      ]),
    );
    expect(updatedSettings.body.institutionalTexts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'text-warning' }),
      ]),
    );

    const persistedSettings = await request(app.getHttpServer())
      .get('/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(persistedSettings.status).toBe(200);
    expect(persistedSettings.body).toMatchObject({
      blockedWords: ['pix', 'doacao', 'campanha'],
    });
    expect(persistedSettings.body.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'r2', enabled: false }),
      ]),
    );
    expect(persistedSettings.body.categories).toEqual([
      { id: 'cat-saude', name: 'Saúde integral' },
      { id: 'cat-convivencia', name: 'Convivência' },
    ]);
    expect(persistedSettings.body.institutionalTexts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'text-welcome',
          text: 'Conte com cuidado humano, sem promessas financeiras.',
        }),
      ]),
    );
  });
});
