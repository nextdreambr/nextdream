import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private disabledLogged = false;

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

  private getTransporter(): Transporter | null {
    if (process.env.NODE_ENV === 'test') {
      this.transporter ??= nodemailer.createTransport({ jsonTransport: true });
      return this.transporter;
    }

    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    if (!host) {
      if (!this.disabledLogged) {
        this.logger.warn('SMTP_HOST not configured. Email sending is disabled.');
        this.disabledLogged = true;
      }
      return null;
    }

    const port = Number(process.env.SMTP_PORT ?? 1025);
    const secure = port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    return this.transporter;
  }

  async sendWelcomeEmail(params: { to: string; name: string; role: string }) {
    const transporter = this.getTransporter();
    if (!transporter) {
      return;
    }

    const from = process.env.SMTP_FROM ?? 'no-reply@nextdream.local';
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

    try {
      await transporter.sendMail({
        from,
        to: params.to,
        subject,
        text: template.text,
        html: template.html,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send welcome email to ${params.to}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  async sendNotificationEmail(params: { to: string; name: string; title: string; message: string }) {
    const transporter = this.getTransporter();
    if (!transporter) {
      return;
    }

    const from = process.env.SMTP_FROM ?? 'no-reply@nextdream.local';
    const subject = `[NextDream] ${params.title}`;
    const text = [
      `Olá, ${params.name}!`,
      '',
      params.message,
      '',
      'Esta é uma notificação automática da plataforma NextDream.',
    ].join('\n');

    try {
      await transporter.sendMail({
        from,
        to: params.to,
        subject,
        text,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send notification email to ${params.to}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  async sendAdminInviteEmail(params: { to: string; inviteUrl: string; expiresInHours: number }) {
    const transporter = this.getTransporter();
    if (!transporter) {
      throw new Error('SMTP transporter is unavailable for admin invite email');
    }

    const from = process.env.SMTP_FROM ?? 'no-reply@nextdream.local';
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

    try {
      await transporter.sendMail({
        from,
        to: params.to,
        subject,
        text: template.text,
        html: template.html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(
        `Failed to send admin invite email to ${params.to}: ${message}`,
      );
      throw new Error(`Failed to send admin invite email to ${params.to}: ${message}`);
    }
  }

  async sendPatientInviteEmail(params: {
    to: string;
    patientName: string;
    institutionName: string;
    inviteUrl: string;
    expiresInHours: number;
  }) {
    const transporter = this.getTransporter();
    if (!transporter) {
      throw new Error('SMTP transporter is unavailable for patient invite email');
    }

    const from = process.env.SMTP_FROM ?? 'no-reply@nextdream.local';
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

    try {
      await transporter.sendMail({
        from,
        to: params.to,
        subject,
        text: template.text,
        html: template.html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(
        `Failed to send patient invite email to ${params.to}: ${message}`,
      );
      throw new Error(`Failed to send patient invite email to ${params.to}: ${message}`);
    }
  }

  async sendSmokeTestEmail(params: { to: string; name?: string }) {
    const transporter = this.getTransporter();
    if (!transporter) {
      throw new Error('SMTP transporter is unavailable for smoke test email');
    }

    const from = process.env.SMTP_FROM ?? 'no-reply@nextdream.local';
    const subject = 'Smoke test de email - NextDream';
    const recipientName = params.name?.trim() || 'time NextDream';
    const template = this.renderEmailTemplate({
      preheader: 'Confirmação operacional do envio de emails no NextDream',
      title: 'Smoke test de email',
      greeting: `Olá, ${recipientName}!`,
      intro: 'Este email confirma que o envio configurado para o ambiente atual está operacional.',
      bodyLines: [
        'Use este comando apenas para validações controladas de entrega.',
        'Se você não esperava esta mensagem, desconsidere.',
      ],
    });

    try {
      await transporter.sendMail({
        from,
        to: params.to,
        subject,
        text: template.text,
        html: template.html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(
        `Failed to send smoke test email to ${params.to}: ${message}`,
      );
      throw new Error(`Failed to send smoke test email to ${params.to}: ${message}`);
    }
  }
}
