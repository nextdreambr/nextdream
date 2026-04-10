import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private disabledLogged = false;

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

    const text = [
      `Olá, ${params.name}!`,
      '',
      'Sua conta no NextDream foi criada com sucesso.',
      `Perfil: ${roleLabel}`,
      '',
      'Você já pode acessar a plataforma e continuar seu onboarding.',
      '',
      'Equipe NextDream',
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
}
