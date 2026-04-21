import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSource } from 'typeorm';
import { ManagedPatient } from '../src/entities/managed-patient.entity';
import { PatientInvite } from '../src/entities/patient-invite.entity';
import { User } from '../src/entities/user.entity';
import { MailService } from '../src/modules/mail/mail.service';
import { AuthService } from '../src/modules/auth/auth.service';

describe('AuthService.acceptPatientInvite', () => {
  const usersRepository = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const adminInvitesRepository = {
    findOne: vi.fn(),
    save: vi.fn(),
  };
  const patientInvitesRepository = {
    findOne: vi.fn(),
    save: vi.fn(),
  };
  const managedPatientsRepository = {
    findOne: vi.fn(),
    save: vi.fn(),
  };
  const jwtService = {
    signAsync: vi.fn(),
  };
  const mailService = {
    sendWelcomeEmail: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  it('commits all invite activation writes in one transaction and sends email after commit', async () => {
    const events: string[] = [];
    const invite = {
      id: 'invite-1',
      email: 'patient@example.com',
      tokenHash: await bcrypt.hash('InviteToken123!', 1),
      institutionId: 'institution-1',
      managedPatientId: 'managed-patient-1',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      usedAt: null,
    } as unknown as PatientInvite;
    const managedPatient = {
      id: 'managed-patient-1',
      institutionId: 'institution-1',
      name: 'Paciente Vinculado',
      state: 'PE',
      city: 'Recife',
      linkedUserId: undefined,
    } as ManagedPatient;
    const createdUser = {
      id: 'user-1',
      name: 'Paciente Vinculado',
      email: 'patient@example.com',
      role: 'paciente',
      state: 'PE',
      city: 'Recife',
      verified: true,
      approved: true,
    } as User;

    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockReturnValue(createdUser);
    usersRepository.save.mockResolvedValue(createdUser);
    patientInvitesRepository.findOne.mockResolvedValue(invite);
    managedPatientsRepository.findOne.mockResolvedValue(managedPatient);
    jwtService.signAsync.mockResolvedValue('signed-token');
    mailService.sendWelcomeEmail.mockImplementation(async () => {
      events.push('send-email');
    });

    const txUsersRepository = {
      save: vi.fn(async (user: User) => {
        events.push('save-user');
        return user;
      }),
    };
    const txManagedPatientsRepository = {
      save: vi.fn(async (patient: ManagedPatient) => {
        events.push('save-managed-patient');
        return patient;
      }),
    };
    const txPatientInvitesRepository = {
      save: vi.fn(async (patientInvite: PatientInvite) => {
        events.push('save-patient-invite');
        return patientInvite;
      }),
    };
    const dataSource = {
      transaction: vi.fn(async (callback: (manager: {
        getRepository: (entity: unknown) => unknown;
      }) => Promise<unknown>) => {
        const manager = {
          getRepository: (entity: unknown) => {
            if (entity === User) return txUsersRepository;
            if (entity === ManagedPatient) return txManagedPatientsRepository;
            if (entity === PatientInvite) return txPatientInvitesRepository;
            throw new Error(`Unexpected repository request: ${String(entity)}`);
          },
        };

        const result = await callback(manager);
        events.push('commit');
        return result;
      }),
    } as unknown as DataSource;

    const service = new (AuthService as any)(
      usersRepository,
      adminInvitesRepository,
      patientInvitesRepository,
      managedPatientsRepository,
      jwtService as unknown as JwtService,
      mailService as unknown as MailService,
      dataSource,
    );

    const result = await service.acceptPatientInvite({
      email: 'patient@example.com',
      token: 'InviteToken123!',
      name: 'Paciente Vinculado',
      password: 'Secret123!',
    });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(txUsersRepository.save).toHaveBeenCalledWith(createdUser);
    expect(txManagedPatientsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ linkedUserId: 'user-1' }),
    );
    expect(txPatientInvitesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ usedAt: expect.any(Date) }),
    );
    expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith({
      to: 'patient@example.com',
      name: 'Paciente Vinculado',
      role: 'paciente',
    });
    expect(events).toEqual([
      'save-user',
      'save-managed-patient',
      'save-patient-invite',
      'commit',
      'send-email',
    ]);
    expect(result.user.id).toBe('user-1');
  });
});
