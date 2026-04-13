import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private disabledLogged = false;

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
    const footer = params.footer ?? 'Equipe NextDream';
    const bodyHtml = params.bodyLines.map((line) => `<p style="margin:0 0 12px 0;">${line}</p>`).join('');
    const ctaHtml =
      params.ctaLabel && params.ctaUrl
        ? `<div style="margin:16px 0 20px;"><a href="${params.ctaUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">${params.ctaLabel}</a></div>`
        : '';

    const html = [
      '<!doctype html>',
      '<html lang="pt-BR">',
      '<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#111827;">',
      `<span style="display:none;visibility:hidden;opacity:0;height:0;width:0;">${params.preheader}</span>`,
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">',
      '<tr><td align="center">',
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">',
      '<tr><td style="padding:20px 24px;background:#111827;color:#ffffff;font-size:18px;font-weight:700;">NextDream</td></tr>',
      `<tr><td style="padding:24px;"><h1 style="margin:0 0 12px 0;font-size:22px;">${params.title}</h1><p style="margin:0 0 12px 0;">${params.greeting}</p><p style="margin:0 0 16px 0;">${params.intro}</p>${bodyHtml}${ctaHtml}<p style="margin:12px 0 0 0;">${footer}</p></td></tr>`,
      '</table>',
      '</td></tr>',
      '</table>',
      '</body>',
      '</html>',
    ].join('');

    const text = [
      params.title,
      '',
      params.greeting,
      '',
      params.intro,
      '',
      ...params.bodyLines,
      '',
      params.ctaLabel && params.ctaUrl ? `${params.ctaLabel}: ${params.ctaUrl}` : '',
      '',
      footer,
    ]
      .filter(Boolean)
      .join('\n');

    return { html, text };
  }

  private getTransporter(): Transporter | null {
    if (process.env.NODE_ENV === 'test') {
      return null;
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
      return;
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
      this.logger.warn(
        `Failed to send admin invite email to ${params.to}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }
}
