import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { Resend } from 'resend';

type MailProviderKind = 'test' | 'smtp' | 'resend';

type MailDelivery = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type MailProvider =
  | {
      kind: MailProviderKind;
      from: string;
      send: (message: MailDelivery) => Promise<void>;
    }
  | {
      kind: 'disabled' | 'config-error';
      provider: 'smtp' | 'resend';
      message: string;
    };

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private smtpTransporter: Transporter | null = null;
  private testTransporter: Transporter | null = null;
  private resendClient: Resend | null = null;
  private providerSelectionLogged: string | null = null;

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private sanitizeUrl(value?: string) {
    if (!value) {
      return undefined;
    }

    try {
      const parsed = new URL(value);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return undefined;
      }
      return encodeURI(parsed.toString());
    } catch {
      return undefined;
    }
  }

  private renderEmailTemplate(params: {
    preheader: string;
    title: string;
    greeting: string;
    intro: string;
    bodyLines: string[];
    ctaLabel?: string;
    ctaUrl?: string;
    footer?: string;
  }) {
    const footerRaw = params.footer ?? 'Equipe NextDream';
    const safePreheader = this.escapeHtml(params.preheader);
    const safeTitle = this.escapeHtml(params.title);
    const safeGreeting = this.escapeHtml(params.greeting);
    const safeIntro = this.escapeHtml(params.intro);
    const safeFooter = this.escapeHtml(footerRaw);
    const safeBodyLines = params.bodyLines.map((line) => this.escapeHtml(line));
    const safeCtaLabel = params.ctaLabel ? this.escapeHtml(params.ctaLabel) : undefined;
    const safeCtaUrl = this.sanitizeUrl(params.ctaUrl);

    const bodyHtml = safeBodyLines.map((line) => `<p style="margin:0 0 12px 0;">${line}</p>`).join('');
    const ctaHtml =
      safeCtaLabel && safeCtaUrl
        ? `<div style="margin:16px 0 20px;"><a href="${safeCtaUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">${safeCtaLabel}</a></div>`
        : '';

    const html = [
      '<!doctype html>',
      '<html lang="pt-BR">',
      '<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#111827;">',
      `<span style="display:none;visibility:hidden;opacity:0;height:0;width:0;">${safePreheader}</span>`,
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">',
      '<tr><td align="center">',
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">',
      '<tr><td style="padding:20px 24px;background:#111827;color:#ffffff;font-size:18px;font-weight:700;">NextDream</td></tr>',
      `<tr><td style="padding:24px;"><h1 style="margin:0 0 12px 0;font-size:22px;">${safeTitle}</h1><p style="margin:0 0 12px 0;">${safeGreeting}</p><p style="margin:0 0 16px 0;">${safeIntro}</p>${bodyHtml}${ctaHtml}<p style="margin:12px 0 0 0;">${safeFooter}</p></td></tr>`,
      '</table>',
      '</td></tr>',
      '</table>',
      '</body>',
      '</html>',
    ].join('');

    const text = [
      safeTitle,
      '',
      safeGreeting,
      '',
      safeIntro,
      '',
      ...safeBodyLines,
      '',
      safeCtaLabel && safeCtaUrl ? `${safeCtaLabel}: ${safeCtaUrl}` : '',
      '',
      safeFooter,
    ]
      .filter(Boolean)
      .join('\n');

    return { html, text };
  }

  private getTrimmedEnv(name: string) {
    const value = process.env[name];
    if (!value) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private getSmtpFromAddress() {
    return this.getTrimmedEnv('SMTP_FROM') ?? 'no-reply@nextdream.local';
  }

  private logProviderSelection(provider: MailProviderKind) {
    if (this.providerSelectionLogged === provider) {
      return;
    }

    this.logger.log(`Mail provider selected: ${provider}`);
    this.providerSelectionLogged = provider;
  }

  private getSmtpTransporter() {
    if (this.smtpTransporter) {
      return this.smtpTransporter;
    }

    const host = this.getTrimmedEnv('SMTP_HOST');
    if (!host) {
      return null;
    }

    const port = Number(this.getTrimmedEnv('SMTP_PORT') ?? '1025');
    const secure = port === 465;
    const user = this.getTrimmedEnv('SMTP_USER');
    const pass = this.getTrimmedEnv('SMTP_PASS');

    this.smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    return this.smtpTransporter;
  }

  private getTestTransporter() {
    if (this.testTransporter) {
      return this.testTransporter;
    }

    this.testTransporter = nodemailer.createTransport({ jsonTransport: true });
    return this.testTransporter;
  }

  private getResendClient(apiKey: string) {
    if (this.resendClient) {
      return this.resendClient;
    }

    this.resendClient = new Resend(apiKey);
    return this.resendClient;
  }

  private resolveProvider(): MailProvider {
    if (process.env.NODE_ENV === 'test') {
      this.logProviderSelection('test');
      const transporter = this.getTestTransporter();
      const from = this.getSmtpFromAddress();

      return {
        kind: 'test',
        from,
        send: async (message) => {
          await transporter.sendMail({
            from,
            to: message.to,
            subject: message.subject,
            text: message.text,
            html: message.html,
          });
        },
      };
    }

    const resendApiKey = this.getTrimmedEnv('RESEND_API_KEY');
    const resendFrom = this.getTrimmedEnv('RESEND_FROM_EMAIL');
    const hasAnyResendConfig = Boolean(resendApiKey || resendFrom);

    if (hasAnyResendConfig) {
      if (!resendApiKey) {
        return {
          kind: 'config-error',
          provider: 'resend',
          message: 'Mail provider "resend" is misconfigured: missing RESEND_API_KEY.',
        };
      }

      if (!resendFrom) {
        return {
          kind: 'config-error',
          provider: 'resend',
          message: 'Mail provider "resend" is misconfigured: missing RESEND_FROM_EMAIL.',
        };
      }

      this.logProviderSelection('resend');
      const resendClient = this.getResendClient(resendApiKey);

      return {
        kind: 'resend',
        from: resendFrom,
        send: async (message) => {
          const response = await resendClient.emails.send({
            from: resendFrom,
            to: message.to,
            subject: message.subject,
            text: message.text,
            html: message.html,
          });

          if (response.error) {
            throw new Error(response.error.message);
          }
        },
      };
    }

    if (process.env.NODE_ENV === 'development') {
      const transporter = this.getSmtpTransporter();
      if (!transporter) {
        return {
          kind: 'disabled',
          provider: 'smtp',
          message: 'Mail provider "smtp" is not configured for development: missing SMTP_HOST.',
        };
      }

      this.logProviderSelection('smtp');
      const from = this.getSmtpFromAddress();

      return {
        kind: 'smtp',
        from,
        send: async (message) => {
          await transporter.sendMail({
            from,
            to: message.to,
            subject: message.subject,
            text: message.text,
            html: message.html,
          });
        },
      };
    }

    return {
      kind: 'config-error',
      provider: 'resend',
      message: 'Mail provider "resend" is not configured: set RESEND_API_KEY and RESEND_FROM_EMAIL.',
    };
  }

  private async deliverEmail(params: {
    failureLabel: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
    throwOnFailure: boolean;
  }) {
    const provider = this.resolveProvider();

    if (!('send' in provider)) {
      this.logger.warn(`${params.failureLabel} via ${provider.provider}: ${provider.message}`);

      if (params.throwOnFailure) {
        throw new Error(provider.message);
      }
      return;
    }

    try {
      await provider.send({
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      const failureMessage = `${params.failureLabel} via ${provider.kind}: ${message}`;
      this.logger.warn(failureMessage);

      if (params.throwOnFailure) {
        throw new Error(failureMessage);
      }
    }
  }

  async sendWelcomeEmail(params: { to: string; name: string; role: string }) {
    const subject = 'Bem-vindo ao NextDream';
    const roleLabel = params.role === 'apoiador' ? 'Apoiador' : params.role === 'admin' ? 'Admin' : 'Paciente';
    const appUrl = (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
    const template = this.renderEmailTemplate({
      preheader: 'Sua conta foi criada com sucesso no NextDream',
      title: 'Conta Confirmada',
      greeting: `Olá, ${params.name}!`,
      intro: 'Sua conta no NextDream foi criada com sucesso.',
      bodyLines: [
        `Perfil: ${roleLabel}`,
        'Você já pode acessar a plataforma e continuar seu onboarding.',
      ],
      ctaLabel: 'Acessar plataforma',
      ctaUrl: appUrl,
    });

    await this.deliverEmail({
      failureLabel: `Failed to send welcome email to ${params.to}`,
      to: params.to,
      subject,
      text: template.text,
      html: template.html,
      throwOnFailure: false,
    });
  }

  async sendNotificationEmail(params: { to: string; name: string; title: string; message: string }) {
    const subject = `[NextDream] ${params.title}`;
    const text = [
      `Olá, ${params.name}!`,
      '',
      params.message,
      '',
      'Esta é uma notificação automática da plataforma NextDream.',
    ].join('\n');

    await this.deliverEmail({
      failureLabel: `Failed to send notification email to ${params.to}`,
      to: params.to,
      subject,
      text,
      throwOnFailure: false,
    });
  }

  async sendAdminInviteEmail(params: { to: string; inviteUrl: string; expiresInHours: number }) {
    const subject = 'Convite de administrador - NextDream';
    const template = this.renderEmailTemplate({
      preheader: 'Convite para acessar o painel administrativo do NextDream',
      title: 'Convite de Administrador',
      greeting: 'Olá,',
      intro: 'Você recebeu um convite para acessar o painel administrativo do NextDream.',
      bodyLines: [
        `Este convite expira em ${params.expiresInHours} horas e pode ser usado apenas uma vez.`,
        'Se você não esperava este email, ignore esta mensagem.',
      ],
      ctaLabel: 'Aceitar convite',
      ctaUrl: params.inviteUrl,
    });

    await this.deliverEmail({
      failureLabel: `Failed to send admin invite email to ${params.to}`,
      to: params.to,
      subject,
      text: template.text,
      html: template.html,
      throwOnFailure: true,
    });
  }

  async sendPatientInviteEmail(params: {
    to: string;
    patientName: string;
    institutionName: string;
    inviteUrl: string;
    expiresInHours: number;
  }) {
    const subject = 'Convite para acompanhar seu caso - NextDream';
    const template = this.renderEmailTemplate({
      preheader: 'Convite para acompanhar seu caso no NextDream',
      title: 'Convite para acessar seu caso',
      greeting: `Olá, ${params.patientName}!`,
      intro: `${params.institutionName} criou um acesso para que você acompanhe seu caso no NextDream.`,
      bodyLines: [
        `Este convite expira em ${params.expiresInHours} horas e pode ser usado apenas uma vez.`,
        'Ao concluir o cadastro, você poderá visualizar sonhos, propostas e conversas relacionadas ao seu caso.',
      ],
      ctaLabel: 'Criar meu acesso',
      ctaUrl: params.inviteUrl,
    });

    await this.deliverEmail({
      failureLabel: `Failed to send patient invite email to ${params.to}`,
      to: params.to,
      subject,
      text: template.text,
      html: template.html,
      throwOnFailure: true,
    });
  }

  async sendSmokeTestEmail(params: { to: string; name?: string }) {
    const subject = '[NextDream] Smoke test de email';
    const appUrl = (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
    const template = this.renderEmailTemplate({
      preheader: 'Teste operacional do envio de email do NextDream',
      title: 'Smoke test de email',
      greeting: params.name ? `Olá, ${params.name}!` : 'Olá,',
      intro: 'Este email confirma que o provider configurado para o NextDream está aceitando envios.',
      bodyLines: [
        `Ambiente NODE_ENV: ${process.env.NODE_ENV ?? 'undefined'}`,
        `APP_URL: ${appUrl}`,
        `Emitido em: ${new Date().toISOString()}`,
      ],
      ctaLabel: 'Abrir NextDream',
      ctaUrl: appUrl,
    });

    await this.deliverEmail({
      failureLabel: `Failed to send mail smoke test to ${params.to}`,
      to: params.to,
      subject,
      text: template.text,
      html: template.html,
      throwOnFailure: true,
    });
  }

}
