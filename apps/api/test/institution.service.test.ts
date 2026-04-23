import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MailService } from '../src/modules/mail/mail.service';
import { InstitutionService } from '../src/modules/institution/institution.service';

describe('InstitutionService.createPatientAccessInvite', () => {
  const originalAppUrl = process.env.APP_URL;
  const managedPatientsRepository = {};
  const existingInviteQuery = {
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    getOne: vi.fn(),
  };
  const patientInvitesRepository = {
    createQueryBuilder: vi.fn(() => existingInviteQuery),
    delete: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const usersRepository = {
    findOne: vi.fn(),
  };
  const mailService = {
    sendPatientInviteEmail: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_URL = 'http://localhost:5173';
    existingInviteQuery.getOne.mockResolvedValue(null);
    usersRepository.findOne.mockResolvedValue(null);
    patientInvitesRepository.create.mockImplementation((invite) => invite);
    patientInvitesRepository.save.mockImplementation(async (invite) => ({
      id: 'invite-1',
      ...invite,
    }));
  });

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.APP_URL;
      return;
    }

    process.env.APP_URL = originalAppUrl;
  });

  it('propagates the mail delivery error after persisting the invite', async () => {
    mailService.sendPatientInviteEmail.mockRejectedValue(new Error('resend down'));

    const service = new (InstitutionService as any)(
      managedPatientsRepository,
      patientInvitesRepository,
      usersRepository,
      {},
      {},
      {},
      mailService as unknown as MailService,
    );

    vi.spyOn(service as any, 'requireApprovedInstitution').mockResolvedValue({
      id: 'institution-1',
      name: 'Casa Esperanca',
    });
    vi.spyOn(service as any, 'ensureManagedPatientForInstitution').mockResolvedValue({
      id: 'managed-patient-1',
      name: 'Paciente Demo',
      linkedUserId: undefined,
    });
    vi.spyOn(service as any, 'buildPatientInviteUrl').mockReturnValue(
      'http://localhost:5173/aceitar-convite-paciente?email=patient%40example.com&token=abc',
    );

    await expect(
      service.createPatientAccessInvite(
        { sub: 'institution-1' },
        'managed-patient-1',
        { email: 'patient@example.com' },
      ),
    ).rejects.toThrow('resend down');

    expect(patientInvitesRepository.save).toHaveBeenCalledTimes(1);
    expect(mailService.sendPatientInviteEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'patient@example.com',
        patientName: 'Paciente Demo',
        institutionName: 'Casa Esperanca',
      }),
    );
  });
});
