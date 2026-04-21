import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MailService } from '../src/modules/mail/mail.service';

describe('MailService.sendPatientInviteEmail', () => {
  let service: MailService;

  beforeEach(() => {
    service = new MailService();
    vi.restoreAllMocks();
  });

  it('throws when no transporter is available', async () => {
    vi.spyOn(service as any, 'getTransporter').mockReturnValue(null);

    await expect(
      service.sendPatientInviteEmail({
        to: 'patient@example.com',
        patientName: 'Paciente',
        institutionName: 'Instituicao',
        inviteUrl: 'http://localhost:5173/aceitar-convite-paciente?token=abc',
        expiresInHours: 72,
      }),
    ).rejects.toThrow('SMTP transporter is unavailable for patient invite email');
  });

  it('logs and rethrows when transporter.sendMail fails', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('smtp down'));
    vi.spyOn(service as any, 'getTransporter').mockReturnValue({ sendMail });
    const warn = vi.spyOn((service as any).logger, 'warn').mockImplementation(() => {});

    await expect(
      service.sendPatientInviteEmail({
        to: 'patient@example.com',
        patientName: 'Paciente',
        institutionName: 'Instituicao',
        inviteUrl: 'http://localhost:5173/aceitar-convite-paciente?token=abc',
        expiresInHours: 72,
      }),
    ).rejects.toThrow('Failed to send patient invite email to patient@example.com: smtp down');

    expect(warn).toHaveBeenCalledWith(
      'Failed to send patient invite email to patient@example.com: smtp down',
    );
  });
});
