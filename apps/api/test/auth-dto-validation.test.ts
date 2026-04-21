import { describe, expect, it } from 'vitest';
import { validateSync } from 'class-validator';
import { AcceptAdminInviteDto } from '../src/modules/auth/dto/accept-admin-invite.dto';
import { AcceptPatientInviteDto } from '../src/modules/auth/dto/accept-patient-invite.dto';
import { RegisterDto } from '../src/modules/auth/dto/register.dto';

describe('auth dto validation', () => {
  it('rejects whitespace-only names for register and invite acceptance flows', () => {
    const registerDto = Object.assign(new RegisterDto(), {
      name: '   ',
      email: 'patient@example.com',
      password: 'Secret123!',
      role: 'paciente',
    });
    const acceptAdminInviteDto = Object.assign(new AcceptAdminInviteDto(), {
      name: '   ',
      email: 'admin@example.com',
      token: 'InviteToken123!',
      password: 'Secret123!',
    });
    const acceptPatientInviteDto = Object.assign(new AcceptPatientInviteDto(), {
      name: '   ',
      email: 'patient@example.com',
      token: 'InviteToken123!',
      password: 'Secret123!',
    });

    const registerErrors = validateSync(registerDto);
    const acceptAdminInviteErrors = validateSync(acceptAdminInviteDto);
    const acceptPatientInviteErrors = validateSync(acceptPatientInviteDto);

    expect(registerErrors.some((error) => error.property === 'name')).toBe(true);
    expect(acceptAdminInviteErrors.some((error) => error.property === 'name')).toBe(true);
    expect(acceptPatientInviteErrors.some((error) => error.property === 'name')).toBe(true);
  });

  it('requires institution-specific fields when registering an institution', () => {
    const registerDto = Object.assign(new RegisterDto(), {
      name: 'Casa Esperanca',
      email: 'institution@example.com',
      password: 'Secret123!',
      role: 'instituicao',
    });

    const registerErrors = validateSync(registerDto);

    expect(registerErrors.some((error) => error.property === 'institutionResponsibleName')).toBe(true);
    expect(registerErrors.some((error) => error.property === 'institutionType')).toBe(true);
    expect(registerErrors.some((error) => error.property === 'institutionResponsiblePhone')).toBe(true);
  });
});
