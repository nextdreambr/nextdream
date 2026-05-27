import 'reflect-metadata';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { AdminContactMessage } from '../entities/admin-contact-message.entity';
import { AdminInvite } from '../entities/admin-invite.entity';
import { AdminReport } from '../entities/admin-report.entity';
import { AdminSettings } from '../entities/admin-settings.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Conversation } from '../entities/conversation.entity';
import { Dream } from '../entities/dream.entity';
import { ManagedPatient } from '../entities/managed-patient.entity';
import { Message } from '../entities/message.entity';
import { Notification } from '../entities/notification.entity';
import { PasswordResetRequest } from '../entities/password-reset-request.entity';
import { PatientInvite } from '../entities/patient-invite.entity';
import { Proposal } from '../entities/proposal.entity';
import { User } from '../entities/user.entity';

function loadLocalEnv() {
  const candidateRoots = [
    process.cwd(),
    resolve(process.cwd(), '..'),
    resolve(process.cwd(), '..', '..'),
    resolve(process.cwd(), '..', '..', '..'),
    resolve(process.cwd(), '..', '..', '..', '..'),
  ];
  const envFiles = candidateRoots.flatMap((root) =>
    ['.env.local', '.env'].map((name) => resolve(root, name)),
  );

  for (const file of envFiles) {
    if (!existsSync(file)) continue;

    const raw = readFileSync(file, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index <= 0) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run local seed.');
}

const dataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [
    User,
    Dream,
    Proposal,
    Conversation,
    ManagedPatient,
    Message,
    Notification,
    PatientInvite,
    AdminInvite,
    AdminContactMessage,
    AdminReport,
    AdminSettings,
    AuditLog,
    PasswordResetRequest,
  ],
  synchronize: false,
});

const baseNow = new Date();

function hoursAgo(hours: number) {
  return new Date(baseNow.getTime() - hours * 60 * 60 * 1000);
}

function daysFromNow(days: number) {
  return new Date(baseNow.getTime() + days * 24 * 60 * 60 * 1000);
}

function cycleValue<T>(values: readonly T[], index: number) {
  return values[index % values.length];
}

const generatedDreamTemplates = [
  {
    title: 'Sessão de cinema comentado',
    description: 'Quero assistir a um filme marcante e conversar sobre as emoções da história.',
    category: 'Literatura e Cultura',
  },
  {
    title: 'Oficina leve de fotografia',
    description: 'Gostaria de aprender a fotografar melhor com o celular, sem pressa e com acolhimento.',
    category: 'Tecnologia',
  },
  {
    title: 'Tarde de jogos cooperativos',
    description: 'Busco uma atividade divertida com jogos simples para conversar e relaxar.',
    category: 'Conversa e Companhia',
  },
  {
    title: 'Encontro para receitas afetivas',
    description: 'Quero cozinhar uma receita especial enquanto escuto histórias e compartilho memórias.',
    category: 'Culinária',
  },
  {
    title: 'Passeio curto para ver o pôr do sol',
    description: 'Desejo companhia para um momento ao ar livre com calma e apoio no deslocamento.',
    category: 'Experiência ao ar livre',
  },
  {
    title: 'Planejar rotina de estudos',
    description: 'Preciso de ajuda para organizar materiais, prioridades e pequenos objetivos de aprendizado.',
    category: 'Aprendizado e Educação',
  },
  {
    title: 'Alongamento e respiração guiada',
    description: 'Busco uma prática leve de autocuidado com apoio e presença humana.',
    category: 'Saúde e Bem-estar',
  },
  {
    title: 'Roda de memórias com fotografias',
    description: 'Quero separar fotos importantes e registrar as histórias por trás de cada uma.',
    category: 'Família e Memórias',
  },
  {
    title: 'Leitura devocional com escuta',
    description: 'Gostaria de um encontro tranquilo com espaço para espiritualidade e acolhimento.',
    category: 'Espiritualidade',
  },
  {
    title: 'Mini apresentação musical',
    description: 'Sonho em ouvir música ao vivo em um ambiente pequeno, afetivo e confortável.',
    category: 'Arte e Música',
  },
  {
    title: 'Passeio para conhecer uma feira local',
    description: 'Quero companhia para um passeio curto, observando a cidade e conversando.',
    category: 'Esporte e Lazer',
  },
  {
    title: 'Aula remota de artesanato',
    description: 'Procuro uma experiência criativa por videochamada para aprender algo novo com leveza.',
    category: 'Outro',
  },
];

async function run() {
  await dataSource.initialize();
  const manager = dataSource.manager;

  await manager.transaction(async (tx) => {
    await tx.query(
      'TRUNCATE TABLE notifications, messages, password_reset_requests, patient_invites, admin_invites, conversations, proposals, dreams, managed_patients, admin_reports, admin_contact_messages, admin_settings, audit_logs, users RESTART IDENTITY CASCADE',
    );

    const passwordHash = await bcrypt.hash('Seed123!', 10);
    const approvedAt = new Date();
    const extraUsers: Array<Partial<User>> = [
      {
        id: 'u-paciente-3',
        name: 'Clara Nascimento',
        email: 'paciente3@nextdream.local',
        role: 'paciente',
        state: 'PE',
        city: 'Recife',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-paciente-4',
        name: 'João Victor Lima',
        email: 'paciente4@nextdream.local',
        role: 'paciente',
        state: 'CE',
        city: 'Fortaleza',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: false,
        passwordHash,
      },
      {
        id: 'u-paciente-5',
        name: 'Helena Moura',
        email: 'paciente5@nextdream.local',
        role: 'paciente',
        state: 'MG',
        city: 'Belo Horizonte',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-paciente-6',
        name: 'Carlos Henrique Alves',
        email: 'paciente6@nextdream.local',
        role: 'paciente',
        state: 'BA',
        city: 'Salvador',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-paciente-7',
        name: 'Elisa Campos',
        email: 'paciente7@nextdream.local',
        role: 'paciente',
        state: 'PR',
        city: 'Curitiba',
        verified: false,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: false,
        passwordHash,
      },
      {
        id: 'u-paciente-inst-2',
        name: 'Luiza Beneficiária',
        email: 'paciente-instituicao-2@nextdream.local',
        role: 'paciente',
        state: 'BA',
        city: 'Salvador',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-apoiador-3',
        name: 'Beatriz Ramos',
        email: 'apoiador3@nextdream.local',
        role: 'apoiador',
        state: 'RJ',
        city: 'Niterói',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-apoiador-4',
        name: 'Marcos Tavares',
        email: 'apoiador4@nextdream.local',
        role: 'apoiador',
        state: 'PE',
        city: 'Olinda',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-apoiador-5',
        name: 'Renata Guimarães',
        email: 'apoiador5@nextdream.local',
        role: 'apoiador',
        state: 'RS',
        city: 'Porto Alegre',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: false,
        passwordHash,
      },
      {
        id: 'u-apoiador-6',
        name: 'Thiago Lins',
        email: 'apoiador6@nextdream.local',
        role: 'apoiador',
        state: 'DF',
        city: 'Brasília',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-apoiador-7',
        name: 'Juliana Prado',
        email: 'apoiador7@nextdream.local',
        role: 'apoiador',
        state: 'AM',
        city: 'Manaus',
        verified: false,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: false,
        passwordHash,
      },
      {
        id: 'u-apoiador-8',
        name: 'Sérgio Nunes',
        email: 'apoiador8@nextdream.local',
        role: 'apoiador',
        state: 'SC',
        city: 'Florianópolis',
        verified: true,
        approved: true,
        approvedAt,
        suspended: true,
        suspendedAt: hoursAgo(72),
        suspensionReason: 'Uso indevido do chat em revisão local.',
        emailNotificationsEnabled: false,
        passwordHash,
      },
      {
        id: 'u-instituicao-2',
        name: 'Instituto Aurora',
        email: 'instituicao2@nextdream.local',
        role: 'instituicao',
        state: 'BA',
        city: 'Salvador',
        institutionType: 'Hospital filantrópico',
        institutionResponsibleName: 'Marta Oliveira',
        institutionResponsiblePhone: '(71) 98888-2200',
        institutionDescription: 'Equipe multidisciplinar com foco em acolhimento, atividades e mediação de sonhos.',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-instituicao-3',
        name: 'Rede Cuidar Norte',
        email: 'instituicao3@nextdream.local',
        role: 'instituicao',
        state: 'AM',
        city: 'Manaus',
        institutionType: 'ONG',
        institutionResponsibleName: 'Patrícia Sampaio',
        institutionResponsiblePhone: '(92) 97777-3300',
        institutionDescription: 'Instituição em fase de análise documental para entrada na plataforma.',
        verified: false,
        approved: false,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-instituicao-4',
        name: 'Casa Horizonte',
        email: 'instituicao4@nextdream.local',
        role: 'instituicao',
        state: 'RJ',
        city: 'Petrópolis',
        institutionType: 'Casa de apoio',
        institutionResponsibleName: 'Rodrigo Ferraz',
        institutionResponsiblePhone: '(24) 98888-4400',
        institutionDescription: 'Conta suspensa no seed para validar filtros operacionais e revisão administrativa.',
        verified: true,
        approved: true,
        approvedAt,
        suspended: true,
        suspendedAt: hoursAgo(96),
        suspensionReason: 'Conta em revisão administrativa.',
        emailNotificationsEnabled: false,
        passwordHash,
      },
      {
        id: 'u-instituicao-5',
        name: 'Projeto Acolher Sul',
        email: 'instituicao5@nextdream.local',
        role: 'instituicao',
        state: 'RS',
        city: 'Porto Alegre',
        institutionType: 'ONG',
        institutionResponsibleName: 'Fernanda Luz',
        institutionResponsiblePhone: '(51) 98888-5500',
        institutionDescription: 'Projeto local com foco em experiências culturais, apoio presencial e mediação familiar.',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-admin-2',
        name: 'Admin Operações',
        email: 'admin2@nextdream.local',
        role: 'admin',
        state: 'SP',
        city: 'São Paulo',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
        passwordHash,
      },
      {
        id: 'u-admin-3',
        name: 'Admin Compliance',
        email: 'admin3@nextdream.local',
        role: 'admin',
        state: 'RJ',
        city: 'Rio de Janeiro',
        verified: true,
        approved: true,
        approvedAt,
        suspended: true,
        suspendedAt: hoursAgo(120),
        suspensionReason: 'Bloqueio operacional de demonstração.',
        emailNotificationsEnabled: false,
        passwordHash,
      },
    ];

    const extraManagedPatients: Array<Partial<ManagedPatient>> = [
      {
        id: '55555555-5555-4555-8555-555555555555',
        institutionId: 'u-instituicao-2',
        linkedUserId: 'u-paciente-inst-2',
        name: 'Beatriz Nogueira',
        state: 'BA',
        city: 'Salvador',
      },
      {
        id: '66666666-6666-4666-8666-666666666666',
        institutionId: 'u-instituicao-2',
        name: 'Rafael Menezes',
        state: 'BA',
        city: 'Lauro de Freitas',
      },
      {
        id: '77777777-7777-4777-8777-777777777777',
        institutionId: 'u-instituicao-2',
        name: 'Tereza Carvalho',
        state: 'BA',
        city: 'Camaçari',
      },
      {
        id: '88888888-8888-4888-8888-888888888888',
        institutionId: 'u-instituicao-3',
        name: 'André Valente',
        state: 'AM',
        city: 'Manaus',
      },
      {
        id: '99999999-9999-4999-8999-999999999999',
        institutionId: 'u-instituicao-4',
        name: 'Mônica Freire',
        state: 'RJ',
        city: 'Petrópolis',
      },
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        institutionId: 'u-instituicao-1',
        name: 'Roberto Nascimento',
        state: 'PE',
        city: 'Recife',
      },
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        institutionId: 'u-instituicao-1',
        name: 'Lia Moreira',
        state: 'PE',
        city: 'Recife',
      },
      {
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        institutionId: 'u-instituicao-5',
        name: 'Paulo Esteves',
        state: 'RS',
        city: 'Porto Alegre',
      },
      {
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        institutionId: 'u-instituicao-5',
        name: 'Silvia Rocha',
        state: 'RS',
        city: 'Canoas',
      },
    ];

    await tx.insert(User, [
      {
        id: 'u-paciente-1',
        name: 'Paciente Demo 1',
        email: 'paciente1@nextdream.local',
        passwordHash,
        role: 'paciente',
        state: 'SP',
        city: 'São Paulo',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
      },
      {
        id: 'u-paciente-2',
        name: 'Paciente Demo 2',
        email: 'paciente2@nextdream.local',
        passwordHash,
        role: 'paciente',
        state: 'SP',
        city: 'Campinas',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: false,
      },
      {
        id: 'u-apoiador-1',
        name: 'Apoiador Demo 1',
        email: 'apoiador1@nextdream.local',
        passwordHash,
        role: 'apoiador',
        state: 'SP',
        city: 'São Paulo',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
      },
      {
        id: 'u-apoiador-2',
        name: 'Apoiador Demo 2',
        email: 'apoiador2@nextdream.local',
        passwordHash,
        role: 'apoiador',
        state: 'SP',
        city: 'Santos',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: false,
      },
      {
        id: 'u-paciente-inst-1',
        name: 'Paciente Vinculado Demo',
        email: 'paciente-instituicao@nextdream.local',
        passwordHash,
        role: 'paciente',
        state: 'PE',
        city: 'Paulista',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
      },
      {
        id: 'u-admin-1',
        name: 'Admin Demo',
        email: 'admin@nextdream.local',
        passwordHash,
        role: 'admin',
        state: 'SP',
        city: 'São Paulo',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
      },
      {
        id: 'u-instituicao-1',
        name: 'Casa Esperanca Demo',
        email: 'instituicao1@nextdream.local',
        passwordHash,
        role: 'instituicao',
        state: 'PE',
        city: 'Recife',
        institutionType: 'ONG',
        institutionResponsibleName: 'Ana Souza Demo',
        institutionResponsiblePhone: '(81) 99999-0000',
        institutionDescription: 'Instituicao demo dedicada a intermediar sonhos com acompanhamento humanizado.',
        verified: true,
        approved: true,
        approvedAt,
        suspended: false,
        emailNotificationsEnabled: true,
      },
    ]);
    await tx.insert(User, extraUsers);

    await tx.insert(ManagedPatient, [
      {
        id: '11111111-1111-4111-8111-111111111111',
        institutionId: 'u-instituicao-1',
        name: 'Maria das Dores Demo',
        state: 'PE',
        city: 'Olinda',
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        institutionId: 'u-instituicao-1',
        name: 'Jose Carlos Demo',
        state: 'PE',
        city: 'Jaboatão dos Guararapes',
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        institutionId: 'u-instituicao-1',
        linkedUserId: 'u-paciente-inst-1',
        name: 'Ana Lucia Demo',
        state: 'PE',
        city: 'Paulista',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        institutionId: 'u-instituicao-1',
        name: 'Raimunda Alves Demo',
        state: 'PE',
        city: 'Camaragibe',
      },
    ]);
    await tx.insert(ManagedPatient, extraManagedPatients);

    const extraPatientInvites: Array<Partial<PatientInvite>> = [
      {
        id: 'pi-demo-2',
        email: 'convite-recife@nextdream.local',
        tokenHash: await bcrypt.hash('ConviteRecife123', 10),
        managedPatientId: '66666666-6666-4666-8666-666666666666',
        institutionId: 'u-instituicao-2',
        expiresAt: daysFromNow(5),
      },
      {
        id: 'pi-demo-3',
        email: 'convite-usado@nextdream.local',
        tokenHash: await bcrypt.hash('ConviteUsado123', 10),
        managedPatientId: '77777777-7777-4777-8777-777777777777',
        institutionId: 'u-instituicao-2',
        expiresAt: daysFromNow(2),
        usedAt: hoursAgo(18),
      },
      {
        id: 'pi-demo-4',
        email: 'convite-expirado@nextdream.local',
        tokenHash: await bcrypt.hash('ConviteExpirado123', 10),
        managedPatientId: '88888888-8888-4888-8888-888888888888',
        institutionId: 'u-instituicao-3',
        expiresAt: hoursAgo(6),
      },
    ];

    const adminInvites: Array<Partial<AdminInvite>> = [
      {
        id: 'ai-demo-1',
        email: 'admin-convite-1@nextdream.local',
        tokenHash: await bcrypt.hash('AdminConvite123', 10),
        invitedByUserId: 'u-admin-1',
        expiresAt: daysFromNow(3),
      },
      {
        id: 'ai-demo-2',
        email: 'admin-convite-2@nextdream.local',
        tokenHash: await bcrypt.hash('AdminConvite456', 10),
        invitedByUserId: 'u-admin-2',
        expiresAt: daysFromNow(4),
      },
      {
        id: 'ai-demo-3',
        email: 'admin-convite-usado@nextdream.local',
        tokenHash: await bcrypt.hash('AdminConvite789', 10),
        invitedByUserId: 'u-admin-1',
        expiresAt: daysFromNow(1),
        usedAt: hoursAgo(10),
      },
    ];

    const passwordResetRequests: Array<Partial<PasswordResetRequest>> = [
      {
        id: 'prr-demo-1',
        userId: 'u-apoiador-3',
        requestedByAdminId: 'u-admin-1',
        tokenHash: await bcrypt.hash('ResetApoiador123', 10),
        expiresAt: daysFromNow(1),
      },
      {
        id: 'prr-demo-2',
        userId: 'u-paciente-2',
        requestedByAdminId: 'u-admin-2',
        tokenHash: await bcrypt.hash('ResetPaciente123', 10),
        expiresAt: daysFromNow(1),
        usedAt: hoursAgo(4),
      },
      {
        id: 'prr-demo-3',
        userId: 'u-instituicao-2',
        requestedByAdminId: 'u-admin-1',
        tokenHash: await bcrypt.hash('ResetInstituicao123', 10),
        expiresAt: hoursAgo(2),
      },
    ];

    const activeDreamOwnerSlots = [
      { patientId: 'u-paciente-1' },
      { patientId: 'u-paciente-2' },
      { patientId: 'u-paciente-3' },
      { patientId: 'u-paciente-4' },
      { patientId: 'u-paciente-5' },
      { patientId: 'u-paciente-6' },
      { patientId: 'u-paciente-7' },
      { patientId: 'u-instituicao-1', managedPatientId: '11111111-1111-4111-8111-111111111111' },
      { patientId: 'u-instituicao-1', managedPatientId: '44444444-4444-4444-8444-444444444444' },
      { patientId: 'u-instituicao-2', managedPatientId: '55555555-5555-4555-8555-555555555555' },
      { patientId: 'u-instituicao-2', managedPatientId: '66666666-6666-4666-8666-666666666666' },
      { patientId: 'u-instituicao-5', managedPatientId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' },
    ];
    const dreamStatusCycle = [
      'publicado',
      'publicado',
      'publicado',
      'publicado',
      'em-conversa',
      'realizando',
      'concluido',
      'pausado',
      'publicado',
      'publicado',
      'cancelado',
      'rascunho',
    ] as const;
    const dreamFormatCycle = ['presencial', 'remoto', 'ambos'] as const;
    const dreamUrgencyCycle = ['baixa', 'media', 'alta'] as const;
    const dreamPrivacyCycle = ['publico', 'verificados', 'anonimo', 'publico'] as const;
    const extraDreams: Array<Partial<Dream>> = Array.from({ length: 24 }, (_, index) => {
      const template = cycleValue(generatedDreamTemplates, index);
      const owner = cycleValue(activeDreamOwnerSlots, index);
      const edition = Math.floor(index / generatedDreamTemplates.length) + 1;
      const status = cycleValue(dreamStatusCycle, index);

      return {
        id: `d-volume-${index + 1}`,
        title: `${template.title} ${edition > 1 ? `Edição ${edition}` : 'Local'}`,
        description: template.description,
        category: template.category,
        format: cycleValue(dreamFormatCycle, index),
        urgency: cycleValue(dreamUrgencyCycle, index),
        status,
        privacy: cycleValue(dreamPrivacyCycle, index),
        patientId: owner.patientId,
        managedPatientId: owner.managedPatientId,
        createdAt: hoursAgo(240 - index * 5),
        updatedAt: hoursAgo(238 - index * 5),
      };
    });

    const proposalSupporters = [
      'u-apoiador-1',
      'u-apoiador-2',
      'u-apoiador-3',
      'u-apoiador-4',
      'u-apoiador-5',
      'u-apoiador-6',
      'u-apoiador-7',
    ];
    const proposalStatuses = ['enviada', 'em-analise', 'aceita', 'recusada', 'expirada'] as const;
    const proposalCandidateDreamIds = [
      'd-demo-1',
      'd-demo-2',
      'd-demo-3',
      'd-demo-4',
      'd-demo-5',
      'd-demo-6',
      'd-demo-7',
      'd-demo-8',
      'd-demo-9',
      'd-demo-10',
      'd-demo-11',
      'd-demo-12',
      'd-demo-inst-1',
      'd-demo-inst-2',
      'd-demo-inst-3',
      ...extraDreams
        .filter(
          (dream): dream is Partial<Dream> & { id: string; status: string } =>
            typeof dream.id === 'string' &&
            typeof dream.status === 'string' &&
            !['rascunho', 'cancelado'].includes(dream.status),
        )
        .map((dream) => dream.id)
        .slice(0, 18),
    ];
    const extraProposals: Array<Partial<Proposal>> = proposalCandidateDreamIds.flatMap((dreamId, dreamIndex) =>
      [0, 1].map((slot) => {
        const proposalIndex = dreamIndex * 2 + slot;
        const supporterId = cycleValue(proposalSupporters, proposalIndex);
        const status = cycleValue(proposalStatuses, proposalIndex);

        return {
          id: `pr-volume-${proposalIndex + 1}`,
          dreamId,
          supporterId,
          message: `Posso ajudar no sonho ${dreamId} com presença, organização e escuta ativa.`,
          offering: cycleValue(
            [
              'Companhia presencial',
              'Videochamada acolhedora',
              'Apoio logístico leve',
              'Atividade cultural guiada',
              'Escuta e planejamento',
            ],
            proposalIndex,
          ),
          availability: cycleValue(
            [
              'Segundas à noite',
              'Quartas pela manhã',
              'Sextas à tarde',
              'Sábados de manhã',
              'Domingos no fim da tarde',
            ],
            proposalIndex,
          ),
          duration: cycleValue(['45 minutos', '1 hora', '90 minutos', '2 horas'], proposalIndex),
          status,
          createdAt: hoursAgo(180 - proposalIndex * 2),
        };
      }),
    );

    await tx.insert(PatientInvite, [
      {
        id: 'pi-demo-1',
        email: 'convite-paciente@nextdream.local',
        tokenHash: await bcrypt.hash('ConviteDemo123', 10),
        managedPatientId: '44444444-4444-4444-8444-444444444444',
        institutionId: 'u-instituicao-1',
        expiresAt: daysFromNow(2),
      },
    ]);
    await tx.insert(PatientInvite, extraPatientInvites);
    await tx.insert(AdminInvite, adminInvites);
    await tx.insert(PasswordResetRequest, passwordResetRequests);
    await tx.insert(AdminSettings, {
      id: 'global',
      blockedWords: ['pix', 'transferência', 'vaquinha', 'depósito', 'dinheiro', 'campanha'],
      rules: [
        {
          id: 'rule-chat-live',
          label: 'Bloqueio em tempo real no chat',
          description: 'Impede termos financeiros e registra tentativas para moderação.',
          enabled: true,
        },
        {
          id: 'rule-dream-review',
          label: 'Varredura ao publicar sonho',
          description: 'Analisa títulos, descrições e privacidade antes da publicação.',
          enabled: true,
        },
        {
          id: 'rule-proposal-review',
          label: 'Varredura em propostas',
          description: 'Sinaliza offering e mensagem para revisão administrativa quando necessário.',
          enabled: true,
        },
      ],
      categories: [
        { id: 'cat-0', name: 'Experiência ao ar livre' },
        { id: 'cat-1', name: 'Arte e Música' },
        { id: 'cat-2', name: 'Conversa e Companhia' },
        { id: 'cat-3', name: 'Culinária' },
        { id: 'cat-4', name: 'Literatura e Cultura' },
        { id: 'cat-5', name: 'Esporte e Lazer' },
        { id: 'cat-6', name: 'Aprendizado e Educação' },
        { id: 'cat-7', name: 'Tecnologia' },
        { id: 'cat-8', name: 'Espiritualidade' },
        { id: 'cat-9', name: 'Família e Memórias' },
        { id: 'cat-10', name: 'Saúde e Bem-estar' },
        { id: 'cat-11', name: 'Outro' },
      ],
      institutionalTexts: [
        {
          id: 'txt-chat-warning',
          label: 'Aviso anti-dinheiro',
          text: 'O NextDream não permite pedidos financeiros. Reescreva sua mensagem sem PIX, doações ou vaquinhas.',
        },
        {
          id: 'txt-dream-review',
          label: 'Orientação para sonhos',
          text: 'Sonhos devem focar em tempo, cuidado, companhia e experiências humanas.',
        },
        {
          id: 'txt-onboarding',
          label: 'Texto institucional de onboarding',
          text: 'Cadastros institucionais aprovados podem operar sonhos próprios e casos mediados por pacientes vinculados.',
        },
      ],
    });

    await tx.insert(Dream, [
      {
        id: 'd-demo-1',
        title: 'Passeio ao parque',
        description: 'Desejo companhia para uma manhã de passeio leve ao ar livre.',
        category: 'Experiência ao ar livre',
        format: 'presencial',
        urgency: 'media',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-2',
        title: 'Sessão de leitura em videochamada',
        description: 'Desejo uma conversa remota com leitura de trechos de livros.',
        category: 'Conversa e Companhia',
        format: 'remoto',
        urgency: 'baixa',
        status: 'em-conversa',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-3',
        title: 'Tocar violão em uma tarde tranquila',
        description: 'Quero dividir um momento musical simples e acolhedor.',
        category: 'Arte e Música',
        format: 'presencial',
        urgency: 'alta',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-4',
        title: 'Aprender uma receita de família por chamada',
        description: 'Preciso de ajuda para cozinhar uma receita afetiva à distância.',
        category: 'Culinária',
        format: 'remoto',
        urgency: 'alta',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-5',
        title: 'Configurar meu computador novo',
        description: 'Gostaria de apoio para instalar programas e deixar tudo pronto.',
        category: 'Tecnologia',
        format: 'ambos',
        urgency: 'media',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-6',
        title: 'Visitar uma biblioteca de bairro',
        description: 'Desejo companhia para escolher livros e conversar sobre leituras.',
        category: 'Literatura e Cultura',
        format: 'presencial',
        urgency: 'baixa',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-7',
        title: 'Montar uma rotina leve de autocuidado',
        description: 'Procuro alguém para me ajudar a organizar pequenos hábitos de bem-estar.',
        category: 'Saúde e Bem-estar',
        format: 'remoto',
        urgency: 'media',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-8',
        title: 'Organizar álbum de memórias da família',
        description: 'Quero apoio para separar fotos e registrar histórias importantes.',
        category: 'Família e Memórias',
        format: 'ambos',
        urgency: 'baixa',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-9',
        title: 'Revisar currículo e praticar entrevista',
        description: 'Preciso de alguém para simular entrevistas e dar feedback.',
        category: 'Aprendizado e Educação',
        format: 'remoto',
        urgency: 'alta',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-10',
        title: 'Caminhada curta no fim da tarde',
        description: 'Gostaria de companhia para retomar atividade física leve.',
        category: 'Esporte e Lazer',
        format: 'presencial',
        urgency: 'media',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-11',
        title: 'Momento de oração e escuta',
        description: 'Busco uma conversa tranquila com espaço para espiritualidade.',
        category: 'Espiritualidade',
        format: 'remoto',
        urgency: 'baixa',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-1',
      },
      {
        id: 'd-demo-12',
        title: 'Passeio para fotografar a cidade',
        description: 'Quero explorar um hobby novo com companhia e incentivo.',
        category: 'Outro',
        format: 'ambos',
        urgency: 'alta',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-paciente-2',
      },
      {
        id: 'd-demo-inst-1',
        title: 'Tarde de musica para paciente acompanhada',
        description: 'A instituicao busca uma pessoa para compartilhar um momento musical leve com uma paciente acompanhada.',
        category: 'Arte e Música',
        format: 'presencial',
        urgency: 'media',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-instituicao-1',
        managedPatientId: '11111111-1111-4111-8111-111111111111',
      },
      {
        id: 'd-demo-inst-2',
        title: 'Passeio guiado ao jardim da instituicao',
        description: 'A equipe deseja companhia para um passeio leve com beneficiaria acompanhada.',
        category: 'Experiência ao ar livre',
        format: 'presencial',
        urgency: 'baixa',
        status: 'publicado',
        privacy: 'publico',
        patientId: 'u-instituicao-1',
        managedPatientId: '22222222-2222-4222-8222-222222222222',
      },
      {
        id: 'd-demo-inst-3',
        title: 'Leitura remota com roda de conversa',
        description: 'Sonho institucional já em conversa com apoiador para encontros remotos.',
        category: 'Literatura e Cultura',
        format: 'remoto',
        urgency: 'media',
        status: 'em-conversa',
        privacy: 'publico',
        patientId: 'u-instituicao-1',
        managedPatientId: '33333333-3333-4333-8333-333333333333',
      },
    ]);
    await tx.insert(Dream, extraDreams);

    await tx.insert(Proposal, [
      {
        id: 'pr-demo-1',
        dreamId: 'd-demo-1',
        supporterId: 'u-apoiador-1',
        message: 'Posso acompanhar no sábado de manhã.',
        offering: 'Companhia e suporte no deslocamento',
        availability: 'Sábados, manhã',
        duration: '2 horas',
        status: 'enviada',
      },
      {
        id: 'pr-demo-2',
        dreamId: 'd-demo-2',
        supporterId: 'u-apoiador-2',
        message: 'Posso fazer uma sessão remota com leitura e conversa.',
        offering: 'Companhia por videochamada',
        availability: 'Noites durante a semana',
        duration: '1 hora',
        status: 'aceita',
      },
      {
        id: 'pr-demo-inst-1',
        dreamId: 'd-demo-inst-1',
        supporterId: 'u-apoiador-1',
        message: 'Posso conduzir uma tarde musical com repertorio leve.',
        offering: 'Companhia musical presencial',
        availability: 'Quartas à tarde',
        duration: '90 minutos',
        status: 'enviada',
      },
      {
        id: 'pr-demo-inst-2',
        dreamId: 'd-demo-inst-2',
        supporterId: 'u-apoiador-2',
        message: 'Posso acompanhar o passeio e apoiar no deslocamento.',
        offering: 'Companhia para passeio',
        availability: 'Sextas pela manhã',
        duration: '2 horas',
        status: 'recusada',
      },
      {
        id: 'pr-demo-inst-3',
        dreamId: 'd-demo-inst-3',
        supporterId: 'u-apoiador-1',
        message: 'Posso facilitar leituras curtas com conversa acolhedora.',
        offering: 'Leitura mediada por videochamada',
        availability: 'Terças à noite',
        duration: '1 hora',
        status: 'aceita',
      },
    ]);
    await tx.insert(Proposal, extraProposals);

    const extraConversationDreams = extraDreams
      .filter(
        (
          dream,
        ): dream is Partial<Dream> & {
          id: string;
          status: string;
          patientId: string;
          managedPatientId?: string;
        } =>
          typeof dream.id === 'string' &&
          typeof dream.patientId === 'string' &&
          typeof dream.status === 'string' &&
          ['publicado', 'em-conversa', 'realizando', 'concluido'].includes(dream.status),
      )
      .slice(0, 12);
    const extraConversations: Array<Partial<Conversation>> = extraConversationDreams.map((dream, index) => {
      const acceptedProposal =
        extraProposals.find((proposal) => proposal.dreamId === dream.id && proposal.status === 'aceita') ??
        extraProposals.find((proposal) => proposal.dreamId === dream.id);

      return {
        id: `c-volume-${index + 1}`,
        dreamId: dream.id,
        patientId: dream.patientId,
        managedPatientId: dream.managedPatientId,
        supporterId: acceptedProposal?.supporterId ?? cycleValue(proposalSupporters, index),
        status: index % 4 === 0 ? 'encerrada' : 'ativa',
        createdAt: hoursAgo(96 - index * 3),
      };
    });
    const extraMessages: Array<Partial<Message>> = extraConversations.flatMap((conversation, index) => {
      const hasModerationSignal = index % 3 === 0;

      return [
        {
          id: `m-volume-${index + 1}-1`,
          conversationId: conversation.id,
          senderId: conversation.patientId,
          body: 'Obrigada por topar conversar sobre esse sonho. Já me sinto mais segura com a ajuda.',
          moderated: false,
          createdAt: hoursAgo(90 - index * 3),
        },
        {
          id: `m-volume-${index + 1}-2`,
          conversationId: conversation.id,
          senderId: conversation.supporterId,
          body: 'Conte comigo. Posso ajustar horário, formato e ritmo para ficar confortável para você.',
          moderated: false,
          createdAt: hoursAgo(89 - index * 3),
        },
        {
          id: `m-volume-${index + 1}-3`,
          conversationId: conversation.id,
          senderId: conversation.supporterId,
          body: hasModerationSignal
            ? 'Consigo ajudar, mas antes preciso confirmar que não vai envolver pix ou transferência.'
            : 'Posso levar materiais simples e alinhar tudo com calma antes do encontro.',
          moderated: hasModerationSignal,
          createdAt: hoursAgo(88 - index * 3),
        },
        {
          id: `m-volume-${index + 1}-4`,
          conversationId: conversation.id,
          senderId: conversation.patientId,
          body: 'Perfeito, vamos seguir só com companhia e organização da experiência.',
          moderated: false,
          createdAt: hoursAgo(87 - index * 3),
        },
      ];
    });

    await tx.insert(Conversation, [
      {
        id: 'c-demo-1',
        dreamId: 'd-demo-2',
        patientId: 'u-paciente-2',
        supporterId: 'u-apoiador-2',
        status: 'ativa',
      },
      {
        id: 'c-demo-inst-1',
        dreamId: 'd-demo-inst-3',
        patientId: 'u-instituicao-1',
        managedPatientId: '33333333-3333-4333-8333-333333333333',
        supporterId: 'u-apoiador-1',
        status: 'ativa',
      },
    ]);
    await tx.insert(Conversation, extraConversations);

    await tx.insert(Message, [
      {
        id: 'm-demo-1',
        conversationId: 'c-demo-1',
        senderId: 'u-paciente-2',
        body: 'Olá! Obrigado por aceitar ajudar.',
        moderated: false,
      },
      {
        id: 'm-demo-2',
        conversationId: 'c-demo-1',
        senderId: 'u-apoiador-2',
        body: 'Combinado, podemos começar amanhã às 20h.',
        moderated: false,
      },
      {
        id: 'm-demo-inst-1',
        conversationId: 'c-demo-inst-1',
        senderId: 'u-instituicao-1',
        body: 'Nossa equipe já separou a beneficiaria e o material da atividade.',
        moderated: false,
      },
      {
        id: 'm-demo-inst-2',
        conversationId: 'c-demo-inst-1',
        senderId: 'u-apoiador-1',
        body: 'Perfeito, posso iniciar a videochamada às 19h.',
        moderated: false,
      },
    ]);
    await tx.insert(Message, extraMessages);

    const extraContactMessages: Array<Partial<AdminContactMessage>> = Array.from({ length: 14 }, (_, index) => ({
      id: `cm-volume-${index + 1}`,
      name: cycleValue(
        [
          'Helena da ONG Aurora',
          'Carlos da Casa Horizonte',
          'Viviane Santos',
          'Paulo Esteves',
          'Marina Ribeiro',
        ],
        index,
      ),
      email: `contato+${index + 1}@nextdream.local`,
      subject: cycleValue(
        [
          'Dúvida sobre aprovação institucional',
          'Problema para entrar no chat',
          'Sugestão de parceria corporativa',
          'Pedido de apoio para onboarding',
          'Erro ao aceitar convite de paciente',
        ],
        index,
      ),
      body: `Mensagem operacional ${index + 1} com contexto suficiente para popular filtros, paginação e modal de detalhe administrativo.`,
      status: cycleValue(['novo', 'em-analise', 'respondido'] as const, index),
      createdAt: hoursAgo(70 - index * 2),
    }));

    await tx.insert(AdminContactMessage, [
      {
        id: 'cm-demo-1',
        name: 'Contato Demo',
        email: 'contato@nextdream.local',
        subject: 'Dúvida sobre cadastro',
        body: 'Quais documentos são necessários para validação de perfil?',
        status: 'novo',
      },
    ]);
    await tx.insert(AdminContactMessage, extraContactMessages);

    const extraReports: Array<Partial<AdminReport>> = [
      ...extraConversations
        .filter((_, index) => index % 3 === 0)
        .map((conversation, index) => ({
          id: `r-volume-chat-${index + 1}`,
          type: 'linguagem',
          targetType: 'chat',
          targetId: conversation.id,
          reason: 'Chat sinalizado por possível linguagem financeira durante a negociação.',
          status: cycleValue(['aberto', 'em-analise', 'resolvido'] as const, index),
          resolution: index % 3 === 2 ? 'Chat revisado e encerrado pela equipe.' : undefined,
          resolvedAt: index % 3 === 2 ? hoursAgo(18 - index) : undefined,
          createdAt: hoursAgo(48 - index * 2),
        })),
      ...extraMessages
        .filter((message) => message.moderated)
        .slice(0, 4)
        .map((message, index) => ({
          id: `r-volume-message-${index + 1}`,
          type: 'mensagem-moderada',
          targetType: 'message',
          targetId: message.id,
          reason: 'Mensagem individual enviada para revisão após moderação automática.',
          status: cycleValue(['aberto', 'em-analise'] as const, index),
          createdAt: hoursAgo(36 - index),
        })),
      ...extraDreams.slice(0, 3).map((dream, index) => ({
        id: `r-volume-dream-${index + 1}`,
        type: 'conteudo',
        targetType: 'dream',
        targetId: dream.id,
        reason: 'Sonho revisado por necessidade de adequação operacional e linguagem mais clara.',
        status: cycleValue(['aberto', 'resolvido'] as const, index),
        resolution: index % 2 === 1 ? 'Descrição ajustada em ambiente local.' : undefined,
        resolvedAt: index % 2 === 1 ? hoursAgo(12) : undefined,
        createdAt: hoursAgo(30 - index),
      })),
      ...extraProposals
        .filter((proposal) => proposal.status === 'recusada')
        .slice(0, 3)
        .map((proposal, index) => ({
          id: `r-volume-proposal-${index + 1}`,
          type: 'proposta',
          targetType: 'proposal',
          targetId: proposal.id,
          reason: 'Proposta enviada com offering incompatível com o sonho solicitado.',
          status: cycleValue(['em-analise', 'resolvido'] as const, index),
          resolution: index % 2 === 1 ? 'Feedback enviado para o apoiador no seed local.' : undefined,
          resolvedAt: index % 2 === 1 ? hoursAgo(10) : undefined,
          createdAt: hoursAgo(24 - index),
        })),
    ];

    await tx.insert(AdminReport, [
      {
        id: 'r-demo-1',
        type: 'linguagem',
        targetType: 'chat',
        targetId: 'c-demo-1',
        reason: 'Mensagem sinalizada para revisão de moderação.',
        status: 'aberto',
      },
    ]);
    await tx.insert(AdminReport, extraReports);

    const extraAuditLogs: Array<Partial<AuditLog>> = [
      {
        id: 'a-demo-2',
        action: 'Admin atualizado',
        by: 'Admin Demo',
        target: 'Admin Operações (u-admin-2)',
        type: 'admin',
        severity: 'media',
        outcome: 'ok',
        details: 'Perfil operacional atualizado para cobrir suporte diário do painel.',
        refPath: '/admin/admins',
        refId: 'u-admin-2',
        createdAt: hoursAgo(26),
      },
      {
        id: 'a-demo-3',
        action: 'Senha resetada por admin',
        by: 'Admin Demo',
        target: 'Beatriz Ramos (u-apoiador-3)',
        type: 'usuario',
        severity: 'alta',
        outcome: 'ok',
        details: 'Link de redefinição emitido pelo admin para fluxo operacional local.',
        refPath: '/admin/usuarios',
        refId: 'u-apoiador-3',
        createdAt: hoursAgo(22),
      },
      {
        id: 'a-demo-4',
        action: 'Conta suspensa',
        by: 'Admin Operações',
        target: 'Casa Horizonte (u-instituicao-4)',
        type: 'usuario',
        severity: 'alta',
        outcome: 'warn',
        details: 'Conta suspensa para revisão de compliance no seed local.',
        refPath: '/admin/usuarios',
        refId: 'u-instituicao-4',
        createdAt: hoursAgo(20),
      },
      {
        id: 'a-demo-5',
        action: 'Convite de admin enviado',
        by: 'Admin Demo',
        target: 'admin-convite-1@nextdream.local',
        type: 'admin',
        severity: 'media',
        outcome: 'ok',
        details: 'Convite pendente para reforço de cobertura operacional.',
        refPath: '/admin/admins',
        refId: 'ai-demo-1',
        createdAt: hoursAgo(18),
      },
      {
        id: 'a-demo-6',
        action: 'Configurações atualizadas',
        by: 'Admin Operações',
        target: 'Configurações administrativas',
        type: 'configuracao',
        severity: 'media',
        outcome: 'ok',
        details: 'Categorias, textos e regras persistidos no seed local.',
        refPath: '/admin/configuracoes',
        refId: 'global',
        createdAt: hoursAgo(16),
      },
      {
        id: 'a-demo-7',
        action: 'Admin atualizado',
        by: 'Admin Demo',
        target: 'Admin Compliance (u-admin-3)',
        type: 'admin',
        severity: 'alta',
        outcome: 'warn',
        details: 'Conta administrativa suspensa para validação de guardas operacionais.',
        refPath: '/admin/admins',
        refId: 'u-admin-3',
        createdAt: hoursAgo(12),
      },
    ];

    await tx.insert(AuditLog, [
      {
        id: 'a-demo-1',
        action: 'Seed local executado',
        by: 'Sistema',
        target: 'Base local',
        type: 'sistema',
        severity: 'baixa',
        outcome: 'ok',
        details: 'Dados de validação de fluxo inseridos para ambiente local.',
        refPath: '/admin/overview',
      },
    ]);
    await tx.insert(AuditLog, extraAuditLogs);

    const notificationUsers = [
      'u-paciente-1',
      'u-paciente-2',
      'u-paciente-3',
      'u-paciente-4',
      'u-paciente-inst-1',
      'u-paciente-inst-2',
      'u-apoiador-1',
      'u-apoiador-2',
      'u-apoiador-3',
      'u-apoiador-4',
      'u-apoiador-5',
      'u-apoiador-6',
      'u-instituicao-1',
      'u-instituicao-2',
      'u-instituicao-5',
    ];
    const extraNotifications: Array<Partial<Notification>> = notificationUsers.flatMap((userId, index) =>
      [0, 1].map((slot) => ({
        id: `n-volume-${index * 2 + slot + 1}`,
        userId,
        type: slot === 0 ? 'proposta' : 'mensagem',
        title: slot === 0 ? 'Atualização operacional de proposta' : 'Nova atividade em conversa',
        message:
          slot === 0
            ? 'Uma proposta do seed local mudou de estado e precisa de acompanhamento.'
            : 'Uma conversa do seed local recebeu nova mensagem ou sinal de moderação.',
        actionPath:
          slot === 0
            ? userId.startsWith('u-instituicao')
              ? '/instituicao/propostas'
              : '/paciente/propostas'
            : userId.startsWith('u-apoiador')
              ? '/apoiador/chat'
              : '/paciente/chat',
        read: slot === 1 && index % 2 === 0,
        createdAt: hoursAgo(14 - index),
      })),
    );

    await tx.insert(Notification, [
      {
        id: 'n-demo-1',
        userId: 'u-paciente-1',
        type: 'proposta',
        title: 'Nova proposta recebida',
        message: 'Uma nova proposta foi enviada para um dos seus sonhos.',
        actionPath: '/paciente/propostas',
        read: false,
      },
      {
        id: 'n-demo-2',
        userId: 'u-apoiador-2',
        type: 'mensagem',
        title: 'Nova mensagem no chat',
        message: 'Você recebeu uma nova mensagem em uma conversa ativa.',
        actionPath: '/apoiador/chat?conversationId=c-demo-1',
        read: false,
      },
      {
        id: 'n-demo-3',
        userId: 'u-instituicao-1',
        type: 'proposta',
        title: 'Nova proposta institucional',
        message: 'Uma nova proposta foi recebida para um sonho mediado pela instituição.',
        actionPath: '/instituicao/propostas',
        read: false,
      },
      {
        id: 'n-demo-4',
        userId: 'u-apoiador-1',
        type: 'mensagem',
        title: 'Conversa institucional em andamento',
        message: 'Você recebeu nova mensagem em uma conversa com a instituição.',
        actionPath: '/apoiador/chat?conversationId=c-demo-inst-1',
        read: false,
      },
      {
        id: 'n-demo-5',
        userId: 'u-paciente-inst-1',
        type: 'mensagem',
        title: 'Sua instituição segue um caso ativo',
        message: 'Você já pode acompanhar o caso institucional vinculado ao seu perfil.',
        actionPath: '/paciente/chat?conversationId=c-demo-inst-1',
        read: false,
      },
    ]);
    await tx.insert(Notification, extraNotifications);
  });

  return {
    users: await manager.count(User),
    managedPatients: await manager.count(ManagedPatient),
    patientInvites: await manager.count(PatientInvite),
    adminInvites: await manager.count(AdminInvite),
    passwordResetRequests: await manager.count(PasswordResetRequest),
    dreams: await manager.count(Dream),
    proposals: await manager.count(Proposal),
    conversations: await manager.count(Conversation),
    messages: await manager.count(Message),
    contactMessages: await manager.count(AdminContactMessage),
    reports: await manager.count(AdminReport),
    notifications: await manager.count(Notification),
    auditLogs: await manager.count(AuditLog),
  };
}

run()
  .then(async (summary) => {
    await dataSource.destroy();
    process.stdout.write(
      `Local seed completed successfully.\nUsers: ${summary.users} | Managed patients: ${summary.managedPatients} | Dreams: ${summary.dreams} | Proposals: ${summary.proposals} | Conversations: ${summary.conversations} | Messages: ${summary.messages} | Reports: ${summary.reports}\n`,
    );
  })
  .catch(async (error) => {
    process.stderr.write(
      `Local seed failed: ${error instanceof Error ? error.message : 'unknown error'}\n`,
    );
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exitCode = 1;
  });
