import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSource } from 'typeorm';
import { EmailVerificationToken } from '../src/entities/email-verification-token.entity';
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
    update: vi.fn(),
  };
  const adminInvitesRepository = {
    findOne: vi.fn(),
    save: vi.fn(),
  };
  const patientInvitesRepository = {
    findOne: vi.fn(),
    save: vi.fn(),
  };
  const emailVerificationTokensRepository = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };
  const passwordResetTokensRepository = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };
  const managedPatientsRepository = {
    findOne: vi.fn(),
    save: vi.fn(),
  };
  const jwtService = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };
  const mailService = {
    sendWelcomeEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    sendEmailVerificationEmail: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  it('rejects numeric-only JWT TTL values that omit a time unit', () => {
    process.env.JWT_REFRESH_EXPIRES_IN = '3600';

    expect(() => new (AuthService as any)(
      usersRepository,
      adminInvitesRepository,
      patientInvitesRepository,
      emailVerificationTokensRepository,
      passwordResetTokensRepository,
      managedPatientsRepository,
      jwtService as unknown as JwtService,
      mailService as unknown as MailService,
      {} as DataSource,
    )).toThrowError(
      new InternalServerErrorException(
        'Invalid JWT TTL value for JWT_REFRESH_EXPIRES_IN: "3600". Add a time unit suffix such as "1h" or "3600s".',
      ),
    );
  });

  it('creates a pending account and sends the email verification instead of logging in immediately', async () => {
    const savedUser = {
      id: 'user-1',
      name: 'Paciente Demo',
      email: 'patient@example.com',
      role: 'paciente',
      verified: false,
      approved: true,
      sessionVersion: 0,
    } as User;

    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockReturnValue(savedUser);
    usersRepository.save.mockResolvedValue(savedUser);
    const dataSource = {
      transaction: vi.fn(async (callback: (manager: {
        getRepository: (entity: unknown) => unknown;
      }) => Promise<unknown>) => {
        const manager = {
          getRepository: (entity: unknown) => {
            if (entity === EmailVerificationToken) return emailVerificationTokensRepository;
            throw new Error(`Unexpected repository request: ${String(entity)}`);
          },
        };

        return callback(manager);
      }),
    } as unknown as DataSource;

    const service = new (AuthService as any)(
      usersRepository,
      adminInvitesRepository,
      patientInvitesRepository,
      emailVerificationTokensRepository,
      passwordResetTokensRepository,
      managedPatientsRepository,
      jwtService as unknown as JwtService,
      mailService as unknown as MailService,
      dataSource,
    );

    const result = await service.register({
      name: 'Paciente Demo',
      email: 'Patient@Example.com',
      password: 'Secret123!',
      role: 'paciente',
      city: 'Recife',
    });

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'patient@example.com' },
    });
    expect(emailVerificationTokensRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
      }),
      { usedAt: expect.any(Date) },
    );
    expect(mailService.sendEmailVerificationEmail).toHaveBeenCalledWith({
      to: 'patient@example.com',
      name: 'Paciente Demo',
      verifyUrl: expect.any(String),
      expiresInHours: expect.any(Number),
    });
    expect(mailService.sendWelcomeEmail).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      email: 'patient@example.com',
      role: 'paciente',
      requiresEmailVerification: true,
      requiresApproval: false,
    });
  });

  it('rotates refresh session version before issuing a new token pair', async () => {
    const user = {
      id: 'user-1',
      name: 'Paciente Vinculado',
      email: 'patient@example.com',
      role: 'paciente',
      sessionVersion: 4,
      verified: true,
      approved: true,
      suspended: false,
    } as User;

    usersRepository.findOne.mockResolvedValue(user);
    usersRepository.update.mockResolvedValue({ affected: 1 });
    jwtService.verifyAsync = vi.fn().mockResolvedValue({
      sub: 'user-1',
      role: 'paciente',
      sessionVersion: 4,
    });
    jwtService.signAsync.mockResolvedValueOnce('new-access-token').mockResolvedValueOnce('new-refresh-token');

    const service = new (AuthService as any)(
      usersRepository,
      adminInvitesRepository,
      patientInvitesRepository,
      emailVerificationTokensRepository,
      passwordResetTokensRepository,
      managedPatientsRepository,
      jwtService as unknown as JwtService,
      mailService as unknown as MailService,
      {} as DataSource,
    );

    const result = await service.refresh('refresh-token');

    expect(usersRepository.update).toHaveBeenCalledWith(
      { id: 'user-1', sessionVersion: 4 },
      { sessionVersion: 5 },
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        sub: 'user-1',
        role: 'paciente',
        sessionVersion: 5,
      }),
      expect.any(Object),
    );
    expect(result.refreshToken).toBe('new-refresh-token');
  });

  it('rejects refresh when the stored session version no longer matches the token', async () => {
    const user = {
      id: 'user-1',
      name: 'Paciente Vinculado',
      email: 'patient@example.com',
      role: 'paciente',
      sessionVersion: 4,
      verified: true,
      approved: true,
      suspended: false,
    } as User;

    usersRepository.findOne.mockResolvedValue(user);
    usersRepository.update.mockResolvedValue({ affected: 0 });
    jwtService.verifyAsync = vi.fn().mockResolvedValue({
      sub: 'user-1',
      role: 'paciente',
      sessionVersion: 4,
    });

    const service = new (AuthService as any)(
      usersRepository,
      adminInvitesRepository,
      patientInvitesRepository,
      emailVerificationTokensRepository,
      passwordResetTokensRepository,
      managedPatientsRepository,
      jwtService as unknown as JwtService,
      mailService as unknown as MailService,
      {} as DataSource,
    );

    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('revalidates invite state inside one transaction, marks it atomically and sends email after commit', async () => {
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
      findOne: vi.fn(async () => {
        events.push('read-user');
        return null;
      }),
      save: vi.fn(async (user: User) => {
        events.push('save-user');
        return user;
      }),
    };
    const txManagedPatientsRepository = {
      findOne: vi.fn(async () => {
        events.push('read-managed-patient');
        return managedPatient;
      }),
      update: vi.fn(async () => {
        events.push('link-managed-patient');
        return { affected: 1 };
      }),
    };
    const txPatientInvitesRepository = {
      findOne: vi.fn(async () => {
        events.push('read-invite');
        return invite;
      }),
      update: vi.fn(async () => {
        events.push('mark-invite-used');
        return { affected: 1 };
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
      emailVerificationTokensRepository,
      passwordResetTokensRepository,
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
    expect(txPatientInvitesRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'invite-1', email: 'patient@example.com' },
    });
    expect(txManagedPatientsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'managed-patient-1', institutionId: 'institution-1' },
    });
    expect(txUsersRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'patient@example.com' },
    });
    expect(txUsersRepository.save).toHaveBeenCalledWith(createdUser);
    expect(txPatientInvitesRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'invite-1' }),
      expect.objectContaining({ usedAt: expect.any(Date) }),
    );
    expect(txManagedPatientsRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'managed-patient-1',
        institutionId: 'institution-1',
      }),
      { linkedUserId: 'user-1' },
    );
    expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith({
      to: 'patient@example.com',
      name: 'Paciente Vinculado',
      role: 'paciente',
    });
    expect(events).toEqual([
      'read-invite',
      'read-managed-patient',
      'read-user',
      'mark-invite-used',
      'save-user',
      'link-managed-patient',
      'commit',
      'send-email',
    ]);
    expect(result.user.id).toBe('user-1');
  });

  it('returns a controlled conflict when the managed patient is linked by a concurrent acceptance', async () => {
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
      linkedUserId: 'existing-user',
    } as ManagedPatient;

    usersRepository.findOne.mockResolvedValue(null);
    patientInvitesRepository.findOne.mockResolvedValue(invite);
    managedPatientsRepository.findOne.mockResolvedValue({
      ...managedPatient,
      linkedUserId: undefined,
    });

    const txUsersRepository = {
      findOne: vi.fn(async () => null),
      save: vi.fn(),
    };
    const txManagedPatientsRepository = {
      findOne: vi.fn(async () => managedPatient),
      update: vi.fn(),
    };
    const txPatientInvitesRepository = {
      findOne: vi.fn(async () => invite),
      update: vi.fn(),
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

        return callback(manager);
      }),
    } as unknown as DataSource;

    const service = new (AuthService as any)(
      usersRepository,
      adminInvitesRepository,
      patientInvitesRepository,
      emailVerificationTokensRepository,
      passwordResetTokensRepository,
      managedPatientsRepository,
      jwtService as unknown as JwtService,
      mailService as unknown as MailService,
      dataSource,
    );

    await expect(
      service.acceptPatientInvite({
        email: 'patient@example.com',
        token: 'InviteToken123!',
        name: 'Paciente Vinculado',
        password: 'Secret123!',
      }),
    ).rejects.toThrow(new ConflictException('Patient access has already been activated'));

    expect(txUsersRepository.save).not.toHaveBeenCalled();
    expect(txPatientInvitesRepository.update).not.toHaveBeenCalled();
    expect(txManagedPatientsRepository.update).not.toHaveBeenCalled();
    expect(mailService.sendWelcomeEmail).not.toHaveBeenCalled();
  });
});
