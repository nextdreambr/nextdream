import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { getSandboxSessionTtlMs } from '../config/env';
import {
  SandboxConversation,
  SandboxDream,
  SandboxManagedPatient,
  SandboxMessage,
  SandboxNotification,
  SandboxPersona,
  SandboxProposal,
  SandboxSessionState,
  SandboxUser,
} from './sandbox-types';

const BASE_TIME = new Date('2026-04-21T12:00:00.000Z');

function at(minutes: number) {
  return new Date(BASE_TIME.getTime() + minutes * 60_000);
}

function createUser(input: Partial<SandboxUser> & Pick<SandboxUser, 'id' | 'name' | 'email' | 'role'>): SandboxUser {
  return {
    passwordHash: 'Sandbox123!',
    verified: true,
    approved: input.role === 'instituicao' ? true : true,
    approvedAt: at(-180),
    suspended: false,
    emailNotificationsEnabled: false,
    sessionVersion: 0,
    createdAt: at(-240),
    updatedAt: at(-30),
    ...input,
  };
}

function createManagedPatient(
  input: Partial<SandboxManagedPatient> & Pick<SandboxManagedPatient, 'id' | 'institutionId' | 'name'>,
): SandboxManagedPatient {
  return {
    state: 'PE',
    city: 'Recife',
    createdAt: at(-120),
    updatedAt: at(-45),
    ...input,
  };
}

function createDream(input: Partial<SandboxDream> & Pick<SandboxDream, 'id' | 'title' | 'description' | 'category' | 'patientId'>): SandboxDream {
  return {
    format: 'presencial',
    urgency: 'media',
    privacy: 'publico',
    status: 'publicado',
    createdAt: at(-150),
    updatedAt: at(-45),
    ...input,
  };
}

function createProposal(
  input: Partial<SandboxProposal> & Pick<SandboxProposal, 'id' | 'dreamId' | 'supporterId' | 'message' | 'offering' | 'availability' | 'duration'>,
): SandboxProposal {
  return {
    status: 'enviada',
    createdAt: at(-80),
    ...input,
  };
}

function createConversation(
  input: Partial<SandboxConversation> & Pick<SandboxConversation, 'id' | 'dreamId' | 'patientId' | 'supporterId'>,
): SandboxConversation {
  return {
    status: 'ativa',
    createdAt: at(-70),
    ...input,
  };
}

function createMessage(
  input: Partial<SandboxMessage> & Pick<SandboxMessage, 'id' | 'conversationId' | 'senderId' | 'body'>,
): SandboxMessage {
  return {
    moderated: false,
    createdAt: at(-65),
    ...input,
  };
}

function createNotification(
  input: Partial<SandboxNotification> & Pick<SandboxNotification, 'id' | 'userId' | 'type' | 'title' | 'message'>,
): SandboxNotification {
  return {
    read: false,
    createdAt: at(-40),
    ...input,
  };
}

function buildPatientTemplate(): SandboxSessionState {
  const patient = createUser({
    id: 'patient-demo',
    name: 'Ana Demo',
    email: 'paciente.demo@nextdream.local',
    role: 'paciente',
    city: 'Recife',
    state: 'PE',
  });
  const supporter = createUser({
    id: 'supporter-demo',
    name: 'Lucas Demo',
    email: 'apoiador.demo@nextdream.local',
    role: 'apoiador',
    city: 'Olinda',
    state: 'PE',
  });

  const dreams: SandboxDream[] = [
    createDream({
      id: 'dream-patient-public',
      title: 'Ver o mar outra vez',
      description: 'Quero uma tarde tranquila para sentir a brisa e ouvir o oceano.',
      category: 'Experiencia',
      patientId: patient.id,
      status: 'publicado',
      updatedAt: at(-18),
    }),
    createDream({
      id: 'dream-patient-chat',
      title: 'Receber uma serenata em casa',
      description: 'Sonho com um momento musical simples e cheio de afeto.',
      category: 'Musica',
      patientId: patient.id,
      status: 'em-conversa',
      updatedAt: at(-10),
    }),
  ];

  const proposals: SandboxProposal[] = [
    createProposal({
      id: 'proposal-patient-public-pending',
      dreamId: 'dream-patient-public',
      supporterId: supporter.id,
      message: 'Posso acompanhar a visita com transporte adaptado.',
      offering: 'Companhia e transporte',
      availability: 'Sabado de manha',
      duration: '3 horas',
      status: 'enviada',
      createdAt: at(-20),
    }),
    createProposal({
      id: 'proposal-patient-chat-accepted',
      dreamId: 'dream-patient-chat',
      supporterId: supporter.id,
      message: 'Levo voz e violao para um momento especial.',
      offering: 'Serenata intimista',
      availability: 'Sexta a noite',
      duration: '1 hora',
      status: 'aceita',
      createdAt: at(-55),
    }),
  ];

  const conversations: SandboxConversation[] = [
    createConversation({
      id: 'conversation-patient-chat',
      dreamId: 'dream-patient-chat',
      patientId: patient.id,
      supporterId: supporter.id,
      createdAt: at(-54),
    }),
  ];

  const messages: SandboxMessage[] = [
    createMessage({
      id: 'message-patient-1',
      conversationId: 'conversation-patient-chat',
      senderId: supporter.id,
      body: 'Oi, Ana. Posso levar a serenata no fim da tarde desta sexta.',
      createdAt: at(-53),
    }),
    createMessage({
      id: 'message-patient-2',
      conversationId: 'conversation-patient-chat',
      senderId: patient.id,
      body: 'Perfeito. Vai ser um momento muito especial aqui em casa.',
      createdAt: at(-50),
    }),
  ];

  const notifications: SandboxNotification[] = [
    createNotification({
      id: 'notification-patient-1',
      userId: patient.id,
      type: 'proposta',
      title: 'Nova proposta recebida',
      message: 'Lucas Demo enviou uma proposta para "Ver o mar outra vez".',
      actionPath: '/paciente/propostas',
      createdAt: at(-19),
    }),
    createNotification({
      id: 'notification-patient-2',
      userId: patient.id,
      type: 'mensagem',
      title: 'Nova mensagem no chat',
      message: 'Voce recebeu uma nova mensagem em uma conversa ativa.',
      actionPath: '/paciente/chat?conversationId=conversation-patient-chat',
      createdAt: at(-49),
    }),
  ];

  return {
    id: 'template-patient',
    persona: 'paciente',
    currentUserId: patient.id,
    users: [patient, supporter],
    managedPatients: [],
    dreams,
    proposals,
    conversations,
    messages,
    notifications,
    createdAt: at(-5),
    updatedAt: at(0),
  };
}

function buildSupporterTemplate(): SandboxSessionState {
  const supporter = createUser({
    id: 'supporter-demo',
    name: 'Lucas Demo',
    email: 'apoiador.demo@nextdream.local',
    role: 'apoiador',
    city: 'Olinda',
    state: 'PE',
  });
  const patient = createUser({
    id: 'patient-demo',
    name: 'Ana Demo',
    email: 'paciente.demo@nextdream.local',
    role: 'paciente',
    city: 'Recife',
    state: 'PE',
  });
  const institution = createUser({
    id: 'institution-demo',
    name: 'Casa Sol',
    email: 'instituicao.demo@nextdream.local',
    role: 'instituicao',
    city: 'Recife',
    state: 'PE',
    institutionType: 'ONG',
    institutionResponsibleName: 'Mariana Costa',
    institutionResponsiblePhone: '(81) 99999-0000',
    institutionDescription: 'Instituicao demo para apresentar fluxos assistidos.',
  });
  const managedPatient = createManagedPatient({
    id: 'managed-patient-1',
    institutionId: institution.id,
    name: 'Miguel Assistido',
  });

  const dreams: SandboxDream[] = [
    createDream({
      id: 'dream-patient-public',
      title: 'Ver o mar outra vez',
      description: 'Quero uma tarde tranquila para sentir a brisa e ouvir o oceano.',
      category: 'Experiencia',
      patientId: patient.id,
      status: 'publicado',
      updatedAt: at(-18),
    }),
    createDream({
      id: 'dream-patient-chat',
      title: 'Receber uma serenata em casa',
      description: 'Sonho com um momento musical simples e cheio de afeto.',
      category: 'Musica',
      patientId: patient.id,
      status: 'em-conversa',
      updatedAt: at(-10),
    }),
    createDream({
      id: 'dream-institution-public',
      title: 'Dia de oficinas de pintura',
      description: 'Uma atividade leve e colorida para um paciente atendido pela instituicao.',
      category: 'Arte',
      patientId: institution.id,
      managedPatientId: managedPatient.id,
      status: 'publicado',
      updatedAt: at(-16),
    }),
  ];

  const proposals: SandboxProposal[] = [
    createProposal({
      id: 'proposal-patient-chat-accepted',
      dreamId: 'dream-patient-chat',
      supporterId: supporter.id,
      message: 'Levo voz e violao para um momento especial.',
      offering: 'Serenata intimista',
      availability: 'Sexta a noite',
      duration: '1 hora',
      status: 'aceita',
      createdAt: at(-55),
    }),
    createProposal({
      id: 'proposal-institution-public-pending',
      dreamId: 'dream-institution-public',
      supporterId: supporter.id,
      message: 'Posso facilitar a oficina com materiais e apoio.',
      offering: 'Conducao da atividade',
      availability: 'Quarta a tarde',
      duration: '2 horas',
      status: 'enviada',
      createdAt: at(-14),
    }),
  ];

  const conversations: SandboxConversation[] = [
    createConversation({
      id: 'conversation-patient-chat',
      dreamId: 'dream-patient-chat',
      patientId: patient.id,
      supporterId: supporter.id,
      createdAt: at(-54),
    }),
  ];

  const messages: SandboxMessage[] = [
    createMessage({
      id: 'message-supporter-1',
      conversationId: 'conversation-patient-chat',
      senderId: patient.id,
      body: 'Obrigada por topar a serenata. Minha familia ficou animada.',
      createdAt: at(-52),
    }),
    createMessage({
      id: 'message-supporter-2',
      conversationId: 'conversation-patient-chat',
      senderId: supporter.id,
      body: 'Vai ser um prazer organizar esse momento com cuidado.',
      createdAt: at(-48),
    }),
  ];

  const notifications: SandboxNotification[] = [
    createNotification({
      id: 'notification-supporter-1',
      userId: supporter.id,
      type: 'aceito',
      title: 'Proposta aceita',
      message: 'Sua proposta para "Receber uma serenata em casa" foi aceita.',
      actionPath: '/apoiador/chat?conversationId=conversation-patient-chat',
      createdAt: at(-54),
    }),
  ];

  return {
    id: 'template-supporter',
    persona: 'apoiador',
    currentUserId: supporter.id,
    users: [supporter, patient, institution],
    managedPatients: [managedPatient],
    dreams,
    proposals,
    conversations,
    messages,
    notifications,
    createdAt: at(-5),
    updatedAt: at(0),
  };
}

function buildInstitutionTemplate(): SandboxSessionState {
  const institution = createUser({
    id: 'institution-demo',
    name: 'Casa Sol',
    email: 'instituicao.demo@nextdream.local',
    role: 'instituicao',
    city: 'Recife',
    state: 'PE',
    institutionType: 'ONG',
    institutionResponsibleName: 'Mariana Costa',
    institutionResponsiblePhone: '(81) 99999-0000',
    institutionDescription: 'Instituicao demo para apresentar fluxos assistidos.',
  });
  const supporter = createUser({
    id: 'supporter-demo',
    name: 'Lucas Demo',
    email: 'apoiador.demo@nextdream.local',
    role: 'apoiador',
    city: 'Olinda',
    state: 'PE',
  });
  const managedPatient = createManagedPatient({
    id: 'managed-patient-1',
    institutionId: institution.id,
    name: 'Miguel Assistido',
  });

  const dreams: SandboxDream[] = [
    createDream({
      id: 'dream-institution-public',
      title: 'Dia de oficinas de pintura',
      description: 'Uma atividade leve e colorida para um paciente atendido pela instituicao.',
      category: 'Arte',
      patientId: institution.id,
      managedPatientId: managedPatient.id,
      status: 'publicado',
      updatedAt: at(-16),
    }),
    createDream({
      id: 'dream-institution-chat',
      title: 'Visita ao zoologico com apoio adaptado',
      description: 'Um passeio curto, com acessibilidade e acompanhamento responsavel.',
      category: 'Passeio',
      patientId: institution.id,
      managedPatientId: managedPatient.id,
      status: 'em-conversa',
      updatedAt: at(-11),
    }),
  ];

  const proposals: SandboxProposal[] = [
    createProposal({
      id: 'proposal-institution-public-pending',
      dreamId: 'dream-institution-public',
      supporterId: supporter.id,
      message: 'Posso facilitar a oficina com materiais e apoio.',
      offering: 'Conducao da atividade',
      availability: 'Quarta a tarde',
      duration: '2 horas',
      status: 'enviada',
      createdAt: at(-14),
    }),
    createProposal({
      id: 'proposal-institution-chat-accepted',
      dreamId: 'dream-institution-chat',
      supporterId: supporter.id,
      message: 'Tenho experiencia com passeios inclusivos e posso acompanhar.',
      offering: 'Acompanhamento adaptado',
      availability: 'Domingo pela manha',
      duration: '4 horas',
      status: 'aceita',
      createdAt: at(-58),
    }),
  ];

  const conversations: SandboxConversation[] = [
    createConversation({
      id: 'conversation-institution-chat',
      dreamId: 'dream-institution-chat',
      patientId: institution.id,
      managedPatientId: managedPatient.id,
      supporterId: supporter.id,
      createdAt: at(-57),
    }),
  ];

  const messages: SandboxMessage[] = [
    createMessage({
      id: 'message-institution-1',
      conversationId: 'conversation-institution-chat',
      senderId: supporter.id,
      body: 'Posso alinhar o roteiro com a equipe da Casa Sol.',
      createdAt: at(-56),
    }),
    createMessage({
      id: 'message-institution-2',
      conversationId: 'conversation-institution-chat',
      senderId: institution.id,
      body: 'Otimo. Vou compartilhar as restricoes de horario do paciente.',
      createdAt: at(-54),
    }),
  ];

  const notifications: SandboxNotification[] = [
    createNotification({
      id: 'notification-institution-1',
      userId: institution.id,
      type: 'proposta',
      title: 'Nova proposta recebida',
      message: 'Lucas Demo enviou uma proposta para "Dia de oficinas de pintura".',
      actionPath: '/instituicao/propostas',
      createdAt: at(-13),
    }),
    createNotification({
      id: 'notification-institution-2',
      userId: institution.id,
      type: 'mensagem',
      title: 'Nova mensagem no chat',
      message: 'Voce recebeu uma nova mensagem em uma conversa ativa.',
      actionPath: '/instituicao/chat?conversationId=conversation-institution-chat',
      createdAt: at(-53),
    }),
  ];

  return {
    id: 'template-institution',
    persona: 'instituicao',
    currentUserId: institution.id,
    users: [institution, supporter],
    managedPatients: [managedPatient],
    dreams,
    proposals,
    conversations,
    messages,
    notifications,
    createdAt: at(-5),
    updatedAt: at(0),
  };
}

function buildSandboxTemplate(persona: SandboxPersona) {
  if (persona === 'paciente') {
    return buildPatientTemplate();
  }
  if (persona === 'apoiador') {
    return buildSupporterTemplate();
  }
  return buildInstitutionTemplate();
}

@Injectable()
export class SandboxStateService {
  private readonly sessions = new Map<string, SandboxSessionState>();
  private readonly sessionTtlMs = getSandboxSessionTtlMs();

  createSession(persona: SandboxPersona) {
    this.cleanupExpiredSessions();
    const session = structuredClone(buildSandboxTemplate(persona));
    const now = new Date();
    session.id = randomUUID();
    session.createdAt = now;
    session.updatedAt = now;
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string) {
    this.cleanupExpiredSessions();
    const session = this.sessions.get(sessionId) ?? null;
    if (session) {
      session.updatedAt = new Date();
    }
    return session;
  }

  getSessionOrThrow(sessionId?: string) {
    if (!sessionId) {
      throw new UnauthorizedException('Sandbox session missing. Start a new demo session.');
    }

    const session = this.getSession(sessionId);
    if (!session) {
      throw new UnauthorizedException('Sandbox session expired. Start a new demo session.');
    }

    return session;
  }

  getPublicCatalog() {
    return structuredClone(buildSupporterTemplate());
  }

  private cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.updatedAt.getTime() > this.sessionTtlMs) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
