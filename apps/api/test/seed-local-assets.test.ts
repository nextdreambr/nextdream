import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');

function readRepoFile(path: string) {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('local seed assets', () => {
  it('keeps schema sync aware of managed patients', () => {
    const syncSchemaScript = readRepoFile('apps/api/src/scripts/sync-schema.ts');

    expect(syncSchemaScript).toContain('function loadLocalEnv()');
    expect(syncSchemaScript).toContain('const candidateRoots = [');
    expect(syncSchemaScript).toContain("resolve(process.cwd(), '..', '..', '..', '..')");
    expect(syncSchemaScript).toContain("import { ManagedPatient } from '../entities/managed-patient.entity';");
    expect(syncSchemaScript).toContain("import { PatientInvite } from '../entities/patient-invite.entity';");
    expect(syncSchemaScript).toMatch(/entities:\s*\[[\s\S]*ManagedPatient[\s\S]*\]/);
    expect(syncSchemaScript).toMatch(/entities:\s*\[[\s\S]*PatientInvite[\s\S]*\]/);
  });

  it('provisions an approved institution with several managed patients, dreams, proposals and profile metadata', () => {
    const seedScript = readRepoFile('apps/api/src/scripts/seed-local.ts');

    expect(seedScript).toContain("import { ManagedPatient } from '../entities/managed-patient.entity';");
    expect(seedScript).toContain("import { PatientInvite } from '../entities/patient-invite.entity';");
    expect(seedScript).toContain('const candidateRoots = [');
    expect(seedScript).toContain("resolve(process.cwd(), '..', '..', '..', '..')");
    expect(seedScript).toContain('managed_patients');
    expect(seedScript).toContain("id: 'u-instituicao-1'");
    expect(seedScript).toContain("email: 'instituicao1@nextdream.local'");
    expect(seedScript).toContain("role: 'instituicao'");
    expect(seedScript).toContain('approved: true');
    expect(seedScript).toContain("institutionType: 'ONG'");
    expect(seedScript).toContain("institutionResponsibleName: 'Ana Souza Demo'");
    expect(seedScript).toContain("institutionResponsiblePhone: '(81) 99999-0000'");
    expect(seedScript).toContain('institutionDescription:');
    expect(seedScript).toContain("id: '11111111-1111-4111-8111-111111111111'");
    expect(seedScript).toContain("id: '22222222-2222-4222-8222-222222222222'");
    expect(seedScript).toContain("id: '33333333-3333-4333-8333-333333333333'");
    expect(seedScript).toContain("id: '44444444-4444-4444-8444-444444444444'");
    expect(seedScript).toContain("institutionId: 'u-instituicao-1'");
    expect(seedScript).toContain("linkedUserId: 'u-paciente-inst-1'");
    expect(seedScript).toContain("id: 'u-paciente-inst-1'");
    expect(seedScript).toContain("email: 'paciente-instituicao@nextdream.local'");
    expect(seedScript).toContain("id: 'pi-demo-1'");
    expect(seedScript).toContain("email: 'convite-paciente@nextdream.local'");
    expect(seedScript).toContain("id: 'd-demo-inst-1'");
    expect(seedScript).toContain("id: 'd-demo-inst-2'");
    expect(seedScript).toContain("id: 'd-demo-inst-3'");
    expect(seedScript).toContain("patientId: 'u-instituicao-1'");
    expect(seedScript).toContain("managedPatientId: '11111111-1111-4111-8111-111111111111'");
    expect(seedScript).toContain("id: 'pr-demo-inst-1'");
    expect(seedScript).toContain("id: 'pr-demo-inst-2'");
    expect(seedScript).toContain("id: 'pr-demo-inst-3'");
    expect(seedScript).toContain("status: 'recusada'");
    expect(seedScript).toContain("id: 'c-demo-inst-1'");
    expect(seedScript).toContain("id: 'n-demo-5'");
  });
});
