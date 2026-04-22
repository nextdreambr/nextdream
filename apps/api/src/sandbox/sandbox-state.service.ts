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
  const secondSupporter = createUser({
    id: 'supporter-demo-2',
    name: 'Joana Demo',
    email: 'joana.demo@nextdream.local',
    role: 'apoiador',
    city: 'Jaboatao',
    state: 'PE',
  });
  const thirdSupporter = createUser({
    id: 'supporter-demo-3',
    name: 'Felipe Demo',
    email: 'felipe.demo@nextdream.local',
    role: 'apoiador',
    city: 'Paulista',
    state: 'PE',
  });

  const dreams: SandboxDream[] = [
    createDream({
      id: 'dream-patient-public',
      title: 'Ver o mar outra vez',
      description: 'Quero uma tarde tranquila para sentir a brisa e ouvir o oceano.',
      category: 'Experiência ao ar livre',
      patientId: patient.id,
      status: 'publicado',
      urgency: 'alta',
      updatedAt: at(-18),
    }),
    createDream({
      id: 'dream-patient-chat',
      title: 'Receber uma serenata em casa',
      description: 'Sonho com um momento musical simples e cheio de afeto.',
      category: 'Arte e Música',
      patientId: patient.id,
      status: 'em-conversa',
      updatedAt: at(-10),
    }),
    createDream({
      id: 'dream-patient-jardim',
      title: 'Passear em um jardim botânico',
      description: 'Gostaria de uma caminhada leve com pausas e sombra.',
      category: 'Experiência ao ar livre',
      patientId: patient.id,
      status: 'publicado',
      format: 'presencial',
      updatedAt: at(-22),
    }),
    createDream({
      id: 'dream-patient-video',
      title: 'Conversar com uma escritora por videochamada',
      description: 'Tenho vontade de trocar ideias sobre leitura e memórias.',
      category: 'Literatura e Cultura',
      patientId: patient.id,
      status: 'publicado',
      format: 'remoto',
      updatedAt: at(-28),
    }),
    createDream({
      id: 'dream-patient-cook',
      title: 'Cozinhar a receita da minha mãe',
      description: 'Quero preparar um prato afetivo com alguém que goste de cozinhar.',
      category: 'Culinária',
      patientId: patient.id,
      status: 'realizando',
      updatedAt: at(-35),
    }),
    createDream({
      id: 'dream-patient-family',
      title: 'Organizar um álbum de família',
      description: 'Preciso de ajuda para reunir fotos e gravar pequenas legendas.',
      category: 'Família e Memórias',
      patientId: patient.id,
      status: 'concluido',
      format: 'remoto',
      updatedAt: at(-44),
    }),
    createDream({
      id: 'dream-patient-tech',
      title: 'Aprender a usar videochamada no celular',
      description: 'Quero falar com minha neta sem depender de outras pessoas.',
      category: 'Tecnologia',
      patientId: patient.id,
      status: 'publicado',
      format: 'remoto',
      updatedAt: at(-31),
    }),
    createDream({
      id: 'dream-patient-pause',
      title: 'Voltar a ouvir histórias ao vivo',
      description: 'Este sonho foi pausado até eu me sentir melhor fisicamente.',
      category: 'Conversa e Companhia',
      patientId: patient.id,
      status: 'pausado',
      updatedAt: at(-60),
    }),
    createDream({
      id: 'dream-patient-draft',
      title: 'Fazer uma pequena horta na varanda',
      description: 'Ainda estou juntando ideias e preferências para esse sonho.',
      category: 'Saúde e Bem-estar',
      patientId: patient.id,
      status: 'rascunho',
      updatedAt: at(-14),
    }),
    createDream({
      id: 'dream-patient-reading',
      title: 'Clube de leitura com poemas curtos',
      description: 'Quero encontros delicados, com leitura em voz alta e conversa.',
      category: 'Literatura e Cultura',
      patientId: patient.id,
      status: 'publicado',
      format: 'remoto',
      updatedAt: at(-26),
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
    createProposal({
      id: 'proposal-patient-video-review',
      dreamId: 'dream-patient-video',
      supporterId: secondSupporter.id,
      message: 'Posso organizar a videochamada e mediar a conversa.',
      offering: 'Mediação e acolhimento',
      availability: 'Quarta à tarde',
      duration: '1 hora',
      status: 'em-analise',
      createdAt: at(-27),
    }),
    createProposal({
      id: 'proposal-patient-cook-accepted',
      dreamId: 'dream-patient-cook',
      supporterId: secondSupporter.id,
      message: 'Levo ingredientes e preparo tudo com calma ao seu lado.',
      offering: 'Cozinha afetiva',
      availability: 'Domingo no almoço',
      duration: '3 horas',
      status: 'aceita',
      createdAt: at(-40),
    }),
    createProposal({
      id: 'proposal-patient-family-accepted',
      dreamId: 'dream-patient-family',
      supporterId: thirdSupporter.id,
      message: 'Posso digitalizar fotos e montar um arquivo simples com você.',
      offering: 'Digitalização e organização',
      availability: 'Segunda à noite',
      duration: '2 horas',
      status: 'aceita',
      createdAt: at(-48),
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
    createConversation({
      id: 'conversation-patient-cook',
      dreamId: 'dream-patient-cook',
      patientId: patient.id,
      supporterId: secondSupporter.id,
      createdAt: at(-39),
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
    createMessage({
      id: 'message-patient-3',
      conversationId: 'conversation-patient-chat',
      senderId: supporter.id,
      body: 'Mensagem retida pela moderação do sandbox por mencionar dinheiro.',
      moderated: true,
      moderationReason: 'financeiro',
      createdAt: at(-49),
    }),
    createMessage({
      id: 'message-patient-cook-1',
      conversationId: 'conversation-patient-cook',
      senderId: secondSupporter.id,
      body: 'Posso chegar cedo para montar tudo sem correria.',
      createdAt: at(-38),
    }),
    createMessage({
      id: 'message-patient-cook-2',
      conversationId: 'conversation-patient-cook',
      senderId: patient.id,
      body: 'Ótimo. Quero deixar a mesa pronta para minha irmã participar.',
      createdAt: at(-36),
    }),
    createMessage({
      id: 'message-patient-cook-3',
      conversationId: 'conversation-patient-cook',
      senderId: secondSupporter.id,
      body: 'Mensagem retida pela moderação do sandbox por mencionar dinheiro.',
      moderated: true,
      moderationReason: 'financeiro',
      createdAt: at(-34),
    }),
  ];

  const notifications: SandboxNotification[] = [
    createNotification({
      id: 'notification-patient-1',
      userId: patient.id,
      type: 'proposta',
      title: 'Nova proposta recebida',
      message: 'Joana Demo enviou uma proposta para "Ver o mar outra vez".',
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
    createNotification({
      id: 'notification-patient-3',
      userId: patient.id,
      type: 'aceito',
      title: 'Sonho em realização',
      message: 'Sua proposta para "Cozinhar a receita da minha mãe" já está sendo combinada.',
      actionPath: '/paciente/chat?conversationId=conversation-patient-cook',
      createdAt: at(-37),
    }),
  ];

  return {
    id: 'template-patient',
    persona: 'paciente',
    currentUserId: patient.id,
    users: [patient, supporter, secondSupporter, thirdSupporter],
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
  const secondPatient = createUser({
    id: 'patient-demo-2',
    name: 'Dona Celina',
    email: 'celina.demo@nextdream.local',
    role: 'paciente',
    city: 'Recife',
    state: 'PE',
  });
  const secondSupporter = createUser({
    id: 'supporter-demo-2',
    name: 'Joana Demo',
    email: 'joana.demo@nextdream.local',
    role: 'apoiador',
    city: 'Recife',
    state: 'PE',
  });
  const thirdSupporter = createUser({
    id: 'supporter-demo-3',
    name: 'Felipe Demo',
    email: 'felipe.demo@nextdream.local',
    role: 'apoiador',
    city: 'Paulista',
    state: 'PE',
  });
  const managedPatient = createManagedPatient({
    id: 'managed-patient-1',
    institutionId: institution.id,
    name: 'Miguel Assistido',
    caseSummary: 'Precisa de atividades curtas e com previsibilidade de horário.',
    supportContext: 'A equipe acompanha a logística e a família participa aos domingos.',
    careFocus: 'Passeios leves, música e pintura com poucos estímulos.',
  });

  const dreams: SandboxDream[] = [
    createDream({
      id: 'dream-patient-public',
      title: 'Ver o mar outra vez',
      description: 'Quero uma tarde tranquila para sentir a brisa e ouvir o oceano.',
      category: 'Experiência ao ar livre',
      patientId: patient.id,
      status: 'publicado',
      urgency: 'alta',
      updatedAt: at(-18),
    }),
    createDream({
      id: 'dream-patient-chat',
      title: 'Receber uma serenata em casa',
      description: 'Sonho com um momento musical simples e cheio de afeto.',
      category: 'Arte e Música',
      patientId: patient.id,
      status: 'em-conversa',
      updatedAt: at(-10),
    }),
    createDream({
      id: 'dream-institution-public',
      title: 'Dia de oficinas de pintura',
      description: 'Uma atividade leve e colorida para um paciente atendido pela instituicao.',
      category: 'Arte e Música',
      patientId: institution.id,
      managedPatientId: managedPatient.id,
      status: 'publicado',
      updatedAt: at(-16),
    }),
    createDream({
      id: 'dream-patient-learning',
      title: 'Aprender a usar chamadas de vídeo',
      description: 'Preciso de apoio paciente para falar com minha neta pelo celular.',
      category: 'Tecnologia',
      patientId: secondPatient.id,
      status: 'em-conversa',
      format: 'remoto',
      updatedAt: at(-24),
    }),
    createDream({
      id: 'dream-supporter-community',
      title: 'Montar uma roda de histórias com poesias curtas',
      description: 'Encontros breves com leitura e conversa acolhedora.',
      category: 'Literatura e Cultura',
      patientId: institution.id,
      managedPatientId: managedPatient.id,
      status: 'publicado',
      format: 'ambos',
      updatedAt: at(-20),
    }),
    createDream({
      id: 'dream-supporter-family',
      title: 'Registrar memórias em áudio para a família',
      description: 'Gostaria de gravar histórias simples e carinhosas.',
      category: 'Família e Memórias',
      patientId: secondPatient.id,
      status: 'publicado',
      format: 'remoto',
      updatedAt: at(-30),
    }),
  ];

  const proposals: SandboxProposal[] = [
    createProposal({
      id: 'proposal-patient-public-pending',
      dreamId: 'dream-patient-public',
      supporterId: secondSupporter.id,
      message: 'Posso acompanhar a visita com cuidado e sem pressa.',
      offering: 'Companhia e deslocamento',
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
      id: 'proposal-supporter-learning-accepted',
      dreamId: 'dream-patient-learning',
      supporterId: supporter.id,
      message: 'Posso ensinar o básico em duas conversas curtas e registrar o passo a passo.',
      offering: 'Apoio com tecnologia',
      availability: 'Quinta à noite',
      duration: '1 hora',
      status: 'aceita',
      createdAt: at(-23),
    }),
    createProposal({
      id: 'proposal-supporter-community-accepted',
      dreamId: 'dream-supporter-community',
      supporterId: thirdSupporter.id,
      message: 'Posso conduzir a roda de histórias com leitura em voz alta.',
      offering: 'Mediação cultural',
      availability: 'Terça à tarde',
      duration: '2 horas',
      status: 'aceita',
      createdAt: at(-21),
    }),
    createProposal({
      id: 'proposal-supporter-family-rejected',
      dreamId: 'dream-supporter-family',
      supporterId: supporter.id,
      message: 'Posso gravar os áudios e editar tudo depois.',
      offering: 'Captação e edição simples',
      availability: 'Segunda de manhã',
      duration: '2 horas',
      status: 'recusada',
      createdAt: at(-29),
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
    createConversation({
      id: 'conversation-supporter-community',
      dreamId: 'dream-supporter-community',
      patientId: institution.id,
      managedPatientId: managedPatient.id,
      supporterId: thirdSupporter.id,
      createdAt: at(-20),
    }),
    createConversation({
      id: 'conversation-supporter-learning',
      dreamId: 'dream-patient-learning',
      patientId: secondPatient.id,
      supporterId: supporter.id,
      createdAt: at(-22),
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
    createMessage({
      id: 'message-supporter-3',
      conversationId: 'conversation-supporter-community',
      senderId: institution.id,
      body: 'Vamos alinhar uma oficina breve, com no máximo 6 participantes.',
      createdAt: at(-19),
    }),
    createMessage({
      id: 'message-supporter-4',
      conversationId: 'conversation-supporter-community',
      senderId: thirdSupporter.id,
      body: 'Mensagem retida pela moderação do sandbox por mencionar dinheiro.',
      moderated: true,
      moderationReason: 'financeiro',
      createdAt: at(-18),
    }),
    createMessage({
      id: 'message-supporter-5',
      conversationId: 'conversation-supporter-learning',
      senderId: secondPatient.id,
      body: 'Obrigada por topar me ensinar com calma. Tenho mais disponibilidade à noite.',
      createdAt: at(-21),
    }),
    createMessage({
      id: 'message-supporter-6',
      conversationId: 'conversation-supporter-learning',
      senderId: supporter.id,
      body: 'Perfeito. Posso começar com uma chamada curta para testar câmera e áudio.',
      createdAt: at(-20),
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
    createNotification({
      id: 'notification-supporter-2',
      userId: supporter.id,
      type: 'recusada',
      title: 'Proposta recusada',
      message: 'A proposta para "Registrar memórias em áudio para a família" não avançou desta vez.',
      actionPath: '/apoiador/propostas',
      createdAt: at(-28),
    }),
    createNotification({
      id: 'notification-supporter-3',
      userId: supporter.id,
      type: 'aceito',
      title: 'Proposta aceita',
      message: 'Sua proposta para "Aprender a usar chamadas de vídeo" foi aceita.',
      actionPath: '/apoiador/chat?conversationId=conversation-supporter-learning',
      createdAt: at(-22),
    }),
  ];

  return {
    id: 'template-supporter',
    persona: 'apoiador',
    currentUserId: supporter.id,
    users: [supporter, secondSupporter, thirdSupporter, patient, secondPatient, institution],
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
  const secondSupporter = createUser({
    id: 'supporter-demo-2',
    name: 'Joana Demo',
    email: 'joana.demo@nextdream.local',
    role: 'apoiador',
    city: 'Recife',
    state: 'PE',
  });
  const thirdSupporter = createUser({
    id: 'supporter-demo-3',
    name: 'Felipe Demo',
    email: 'felipe.demo@nextdream.local',
    role: 'apoiador',
    city: 'Paulista',
    state: 'PE',
  });
  const managedPatients: SandboxManagedPatient[] = [
    createManagedPatient({
      id: 'managed-patient-1',
      institutionId: institution.id,
      name: 'Miguel Assistido',
      city: 'Recife',
      caseSummary: 'Rotina marcada por fadiga no fim do dia e preferência por ambientes calmos.',
      supportContext: 'A família acompanha aos fins de semana, mas a equipe assume a logística da semana.',
      careFocus: 'Atividades curtas, acolhedoras e com poucos estímulos.',
      createdAt: at(-160),
      updatedAt: at(-18),
    }),
    createManagedPatient({
      id: 'managed-patient-2',
      institutionId: institution.id,
      name: 'Helena Siqueira',
      city: 'Olinda',
      caseSummary: 'Prefere visitas em pequenos grupos e com pausas para descanso.',
      supportContext: 'A beneficiária responde melhor a experiências musicais e conversas breves.',
      careFocus: 'Música ao vivo, leitura e encontros de afeto.',
      createdAt: at(-158),
    }),
    createManagedPatient({
      id: 'managed-patient-3',
      institutionId: institution.id,
      name: 'José Ramalho',
      city: 'Jaboatao',
      caseSummary: 'Precisa de transporte organizado com antecedência.',
      supportContext: 'O caso pede comunicação clara com a equipe de apoio antes de cada saída.',
      careFocus: 'Passeios externos e oficinas práticas.',
      createdAt: at(-156),
    }),
    createManagedPatient({
      id: 'managed-patient-4',
      institutionId: institution.id,
      name: 'Lucia Andrade',
      city: 'Paulista',
      caseSummary: 'Se conecta melhor com atividades criativas e presenciais.',
      supportContext: 'A instituição prioriza encontros de até 90 minutos.',
      careFocus: 'Pintura, artesanato e rodas de conversa.',
      createdAt: at(-154),
    }),
    createManagedPatient({
      id: 'managed-patient-5',
      institutionId: institution.id,
      name: 'Carlos Vieira',
      city: 'Recife',
      caseSummary: 'Quer recuperar contato com a família usando tecnologia simples.',
      supportContext: 'A equipe precisa de apoiadores pacientes para ensino passo a passo.',
      careFocus: 'Videochamada, celular e memórias em áudio.',
      createdAt: at(-152),
    }),
    createManagedPatient({
      id: 'managed-patient-6',
      institutionId: institution.id,
      name: 'Márcia Nunes',
      city: 'Olinda',
      caseSummary: 'Tem preferência por experiências gastronômicas sem deslocamentos longos.',
      supportContext: 'A instituição organiza o espaço e o apoiador leva a condução da atividade.',
      careFocus: 'Culinária afetiva e encontros na unidade.',
      createdAt: at(-150),
    }),
    createManagedPatient({
      id: 'managed-patient-7',
      institutionId: institution.id,
      name: 'Seu Arnaldo',
      city: 'Camaragibe',
      caseSummary: 'Se anima com encontros sobre futebol e histórias de juventude.',
      supportContext: 'Precisa de horários previsíveis e linguagem simples.',
      careFocus: 'Esporte e memória afetiva.',
      createdAt: at(-148),
    }),
    createManagedPatient({
      id: 'managed-patient-8',
      institutionId: institution.id,
      name: 'Rita Campos',
      city: 'Recife',
      caseSummary: 'Busca atividades contemplativas e com grupo reduzido.',
      supportContext: 'A equipe evita agendas muito longas por conta do cansaço.',
      careFocus: 'Natureza, meditação e espiritualidade.',
      createdAt: at(-146),
    }),
    createManagedPatient({
      id: 'managed-patient-9',
      institutionId: institution.id,
      name: 'Paulo Freitas',
      city: 'Olinda',
      caseSummary: 'Quer revisitar hobbies antigos em encontros remotos.',
      supportContext: 'A instituição já montou um espaço silencioso para videochamadas.',
      careFocus: 'Tecnologia, leitura e ensino.',
      createdAt: at(-144),
    }),
    createManagedPatient({
      id: 'managed-patient-10',
      institutionId: institution.id,
      name: 'Clarice Moura',
      city: 'Recife',
      caseSummary: 'Tem boa resposta a oficinas leves com música e pintura.',
      supportContext: 'A família acompanha o início das atividades, depois a equipe segue a mediação.',
      careFocus: 'Arte, cor e encontros curtos.',
      createdAt: at(-142),
    }),
  ];

  const dreams: SandboxDream[] = [
    createDream({
      id: 'dream-institution-public',
      title: 'Dia de oficinas de pintura',
      description: 'Uma atividade leve e colorida para um paciente atendido pela instituicao.',
      category: 'Arte e Música',
      patientId: institution.id,
      managedPatientId: 'managed-patient-1',
      status: 'publicado',
      updatedAt: at(-16),
    }),
    createDream({
      id: 'dream-institution-chat',
      title: 'Visita ao zoologico com apoio adaptado',
      description: 'Um passeio curto, com acessibilidade e acompanhamento responsavel.',
      category: 'Experiência ao ar livre',
      patientId: institution.id,
      managedPatientId: 'managed-patient-1',
      status: 'em-conversa',
      updatedAt: at(-11),
      urgency: 'alta',
    }),
    createDream({
      id: 'dream-institution-reading',
      title: 'Roda de leitura com poemas curtos',
      description: 'Encontro em grupo pequeno, com leitura em voz alta e conversa.',
      category: 'Literatura e Cultura',
      patientId: institution.id,
      managedPatientId: 'managed-patient-2',
      status: 'publicado',
      format: 'ambos',
      updatedAt: at(-13),
    }),
    createDream({
      id: 'dream-institution-museum',
      title: 'Passeio guiado em museu acessível',
      description: 'Saída breve com foco em conforto e mediação acolhedora.',
      category: 'Literatura e Cultura',
      patientId: institution.id,
      managedPatientId: 'managed-patient-3',
      status: 'realizando',
      updatedAt: at(-25),
    }),
    createDream({
      id: 'dream-institution-culinary',
      title: 'Tarde de culinária afetiva na unidade',
      description: 'Preparar receitas simples com cheiros e sabores familiares.',
      category: 'Culinária',
      patientId: institution.id,
      managedPatientId: 'managed-patient-6',
      status: 'publicado',
      updatedAt: at(-21),
    }),
    createDream({
      id: 'dream-institution-football',
      title: 'Conversa sobre futebol com álbum de figurinhas',
      description: 'Encontro leve para revisitar memórias esportivas.',
      category: 'Esporte e Lazer',
      patientId: institution.id,
      managedPatientId: 'managed-patient-7',
      status: 'publicado',
      updatedAt: at(-19),
    }),
    createDream({
      id: 'dream-institution-meditation',
      title: 'Caminhada contemplativa no jardim interno',
      description: 'Atividade breve com foco em respiração e conversa tranquila.',
      category: 'Saúde e Bem-estar',
      patientId: institution.id,
      managedPatientId: 'managed-patient-8',
      status: 'pausado',
      updatedAt: at(-45),
    }),
    createDream({
      id: 'dream-institution-video',
      title: 'Aula de celular para videochamadas',
      description: 'Sessões curtas para reconectar familiares por tecnologia.',
      category: 'Tecnologia',
      patientId: institution.id,
      managedPatientId: 'managed-patient-5',
      status: 'publicado',
      format: 'remoto',
      updatedAt: at(-17),
    }),
    createDream({
      id: 'dream-institution-memory',
      title: 'Gravar histórias de vida em áudio',
      description: 'Registrar lembranças com escuta ativa e organização simples.',
      category: 'Família e Memórias',
      patientId: institution.id,
      managedPatientId: 'managed-patient-9',
      status: 'publicado',
      format: 'remoto',
      updatedAt: at(-20),
    }),
    createDream({
      id: 'dream-institution-art',
      title: 'Ateliê de colagem com músicas tranquilas',
      description: 'Oficina delicada para estimular memória afetiva e expressão.',
      category: 'Arte e Música',
      patientId: institution.id,
      managedPatientId: 'managed-patient-10',
      status: 'concluido',
      updatedAt: at(-52),
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
    createProposal({
      id: 'proposal-institution-reading-accepted',
      dreamId: 'dream-institution-reading',
      supporterId: secondSupporter.id,
      message: 'Posso conduzir leituras breves e acolher o grupo.',
      offering: 'Mediação de leitura',
      availability: 'Terça à tarde',
      duration: '90 minutos',
      status: 'aceita',
      createdAt: at(-24),
    }),
    createProposal({
      id: 'proposal-institution-culinary-review',
      dreamId: 'dream-institution-culinary',
      supporterId: thirdSupporter.id,
      message: 'Posso cozinhar junto e adaptar a atividade ao ritmo do grupo.',
      offering: 'Culinária afetiva',
      availability: 'Sexta de manhã',
      duration: '2 horas',
      status: 'em-analise',
      createdAt: at(-22),
    }),
    createProposal({
      id: 'proposal-institution-video-pending',
      dreamId: 'dream-institution-video',
      supporterId: supporter.id,
      message: 'Posso ensinar o básico das videochamadas em encontros remotos.',
      offering: 'Apoio com tecnologia',
      availability: 'Segunda à tarde',
      duration: '1 hora',
      status: 'enviada',
      createdAt: at(-18),
    }),
    createProposal({
      id: 'proposal-institution-memory-accepted',
      dreamId: 'dream-institution-memory',
      supporterId: secondSupporter.id,
      message: 'Posso gravar, editar e organizar os áudios com bastante calma.',
      offering: 'Registro de memórias',
      availability: 'Quinta à noite',
      duration: '2 horas',
      status: 'aceita',
      createdAt: at(-26),
    }),
  ];

  const conversations: SandboxConversation[] = [
    createConversation({
      id: 'conversation-institution-chat',
      dreamId: 'dream-institution-chat',
      patientId: institution.id,
      managedPatientId: 'managed-patient-1',
      supporterId: supporter.id,
      createdAt: at(-57),
    }),
    createConversation({
      id: 'conversation-institution-reading',
      dreamId: 'dream-institution-reading',
      patientId: institution.id,
      managedPatientId: 'managed-patient-2',
      supporterId: secondSupporter.id,
      createdAt: at(-23),
    }),
    createConversation({
      id: 'conversation-institution-memory',
      dreamId: 'dream-institution-memory',
      patientId: institution.id,
      managedPatientId: 'managed-patient-9',
      supporterId: secondSupporter.id,
      createdAt: at(-25),
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
    createMessage({
      id: 'message-institution-3',
      conversationId: 'conversation-institution-reading',
      senderId: institution.id,
      body: 'A beneficiária prefere grupo pequeno e leitura com pausas.',
      createdAt: at(-22),
    }),
    createMessage({
      id: 'message-institution-4',
      conversationId: 'conversation-institution-reading',
      senderId: secondSupporter.id,
      body: 'Perfeito. Posso preparar textos curtos e músicas suaves para o começo.',
      createdAt: at(-21),
    }),
    createMessage({
      id: 'message-institution-5',
      conversationId: 'conversation-institution-memory',
      senderId: secondSupporter.id,
      body: 'Mensagem retida pela moderação do sandbox por mencionar dinheiro.',
      moderated: true,
      moderationReason: 'financeiro',
      createdAt: at(-24),
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
    createNotification({
      id: 'notification-institution-3',
      userId: institution.id,
      type: 'aceito',
      title: 'Conexão aceita',
      message: 'A roda de leitura já está com apoiadora confirmada.',
      actionPath: '/instituicao/chat?conversationId=conversation-institution-reading',
      createdAt: at(-22),
    }),
  ];

  return {
    id: 'template-institution',
    persona: 'instituicao',
    currentUserId: institution.id,
    users: [institution, supporter, secondSupporter, thirdSupporter],
    managedPatients,
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
