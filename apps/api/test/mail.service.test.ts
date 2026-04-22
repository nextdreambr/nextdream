import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createTransportMock,
  smtpSendMailMock,
  testSendMailMock,
  resendConstructorMock,
  resendSendMock,
} = vi.hoisted(() => ({
  createTransportMock: vi.fn(),
  smtpSendMailMock: vi.fn(),
  testSendMailMock: vi.fn(),
  resendConstructorMock: vi.fn(),
  resendSendMock: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: createTransportMock,
  },
  createTransport: createTransportMock,
}));

vi.mock('resend', () => ({
  Resend: resendConstructorMock,
}));

import { MailService } from '../src/modules/mail/mail.service';

describe('MailService', () => {
  const originalEnv = {
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    process.env.APP_URL = 'http://localhost:5173';

    createTransportMock.mockImplementation((config?: { jsonTransport?: boolean }) => {
      if (config?.jsonTransport) {
        return {
          sendMail: testSendMailMock,
        };
      }

      return {
        sendMail: smtpSendMailMock,
      };
    });

    resendConstructorMock.mockImplementation(() => ({
      emails: {
        send: resendSendMock,
      },
    }));
    resendSendMock.mockResolvedValue({
      data: { id: 'email-1' },
      error: null,
      headers: null,
    });
  });

  it('uses Resend when RESEND_API_KEY and RESEND_FROM_EMAIL are configured', async () => {
    process.env.NODE_ENV = 'production';
    process.env.RESEND_API_KEY = 're_test_123';
    process.env.RESEND_FROM_EMAIL = 'NextDream <no-reply@nextdream.ong.br>';

    const service = new MailService();

    await service.sendPatientInviteEmail({
      to: 'patient@example.com',
      patientName: 'Paciente',
      institutionName: 'Casa Esperanca',
      inviteUrl: 'https://nextdream.ong.br/aceitar-convite-paciente?token=abc',
      expiresInHours: 72,
    });

    expect(resendConstructorMock).toHaveBeenCalledWith('re_test_123');
    expect(createTransportMock).not.toHaveBeenCalled();
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'NextDream <no-reply@nextdream.ong.br>',
        to: 'patient@example.com',
        subject: 'Convite para acompanhar seu caso - NextDream',
        text: expect.stringContaining('Este convite expira em 72 horas'),
        html: expect.stringContaining('Criar meu acesso'),
      }),
    );
  });

  it('uses the local test transport when NODE_ENV=test even if Resend is configured', async () => {
    process.env.NODE_ENV = 'test';
    process.env.RESEND_API_KEY = 're_test_123';
    process.env.RESEND_FROM_EMAIL = 'NextDream <no-reply@nextdream.ong.br>';

    const service = new MailService();

    await service.sendPatientInviteEmail({
      to: 'patient@example.com',
      patientName: 'Paciente',
      institutionName: 'Casa Esperanca',
      inviteUrl: 'http://localhost:5173/aceitar-convite-paciente?token=abc',
      expiresInHours: 72,
    });

    expect(createTransportMock).toHaveBeenCalledWith({ jsonTransport: true });
    expect(testSendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'patient@example.com',
        subject: 'Convite para acompanhar seu caso - NextDream',
        text: expect.stringContaining('Casa Esperanca criou um acesso'),
        html: expect.stringContaining('Criar meu acesso'),
      }),
    );
    expect(resendConstructorMock).not.toHaveBeenCalled();
  });

  it('uses local SMTP during development when Resend is not configured', async () => {
    process.env.NODE_ENV = 'development';
    process.env.SMTP_HOST = 'localhost';
    process.env.SMTP_PORT = '1025';
    process.env.SMTP_FROM = 'no-reply@nextdream.local';

    const service = new MailService();

    await service.sendAdminInviteEmail({
      to: 'admin@example.com',
      inviteUrl: 'http://localhost:5173/aceitar-convite-admin?token=abc',
      expiresInHours: 48,
    });

    expect(createTransportMock).toHaveBeenCalledWith({
      host: 'localhost',
      port: 1025,
      secure: false,
      auth: undefined,
    });
    expect(smtpSendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'no-reply@nextdream.local',
        to: 'admin@example.com',
        subject: 'Convite de administrador - NextDream',
      }),
    );
    expect(resendConstructorMock).not.toHaveBeenCalled();
  });

  it('fails with a clear error when Resend configuration is incomplete', async () => {
    process.env.NODE_ENV = 'production';
    process.env.RESEND_API_KEY = 're_test_123';
    delete process.env.RESEND_FROM_EMAIL;

    const service = new MailService();

    await expect(
      service.sendPatientInviteEmail({
        to: 'patient@example.com',
        patientName: 'Paciente',
        institutionName: 'Casa Esperanca',
        inviteUrl: 'https://nextdream.ong.br/aceitar-convite-paciente?token=abc',
        expiresInHours: 72,
      }),
    ).rejects.toThrow('Mail provider "resend" is misconfigured: missing RESEND_FROM_EMAIL.');
  });

  it('logs and rethrows Resend API failures with provider context', async () => {
    process.env.NODE_ENV = 'production';
    process.env.RESEND_API_KEY = 're_test_123';
    process.env.RESEND_FROM_EMAIL = 'NextDream <no-reply@nextdream.ong.br>';
    resendSendMock.mockRejectedValue(new Error('resend down'));

    const service = new MailService();
    const warn = vi.spyOn((service as unknown as { logger: { warn: (message: string) => void } }).logger, 'warn')
      .mockImplementation(() => {});

    await expect(
      service.sendPatientInviteEmail({
        to: 'patient@example.com',
        patientName: 'Paciente',
        institutionName: 'Casa Esperanca',
        inviteUrl: 'https://nextdream.ong.br/aceitar-convite-paciente?token=abc',
        expiresInHours: 72,
      }),
    ).rejects.toThrow('Failed to send patient invite email to patient@example.com via resend: resend down');

    expect(warn).toHaveBeenCalledWith(
      'Failed to send patient invite email to patient@example.com via resend: resend down',
    );
  });
});
