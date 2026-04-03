export type DreamStatus = 'rascunho' | 'publicado' | 'em-conversa' | 'realizando' | 'concluido' | 'pausado' | 'cancelado';
export type ProposalStatus = 'enviada' | 'em-analise' | 'aceita' | 'recusada' | 'expirada';
export type UrgencyLevel = 'baixa' | 'media' | 'alta';
export type DreamFormat = 'remoto' | 'presencial' | 'ambos';

export interface Dream {
  id: string;
  title: string;
  description: string;
  category: string;
  format: DreamFormat;
  urgency: UrgencyLevel;
  status: DreamStatus;
  patientId: string;
  patientName: string;
  patientCity?: string;
  tags: string[];
  proposalsCount: number;
  createdAt: string;
  updatedAt: string;
  restrictions?: string;
  language?: string;
  privacy: 'publico' | 'verificados' | 'anonimo';
}

export interface Proposal {
  id: string;
  dreamId: string;
  dreamTitle: string;
  supporterId: string;
  supporterName: string;
  supporterAvatar?: string;
  message: string;
  offering: string;
  availability: string;
  duration: string;
  status: ProposalStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'paciente' | 'apoiador' | 'sistema';
  text: string;
  timestamp: string;
  blocked?: boolean;
}

export interface Conversation {
  id: string;
  dreamId: string;
  dreamTitle: string;
  patientId: string;
  patientName: string;
  supporterId: string;
  supporterName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'ativa' | 'encerrada';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'paciente' | 'apoiador' | 'admin';
  city?: string;
  verified: boolean;
  status: 'ativo' | 'suspenso' | 'banido';
  createdAt: string;
  dreamsCount?: number;
  proposalsCount?: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId?: string;
  reportedUserName?: string;
  type: 'dinheiro' | 'assedio' | 'fraude' | 'linguagem' | 'risco' | 'outro';
  description: string;
  status: 'nova' | 'em-analise' | 'acao-tomada' | 'resolvida';
  priority: 'alta' | 'media' | 'baixa';
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
  // Origem da denúncia
  refType: 'chat' | 'sonho' | 'proposta' | 'usuario';
  refId: string;
  refLabel: string;
}

export const mockDreams: Dream[] = [
  {
    id: 'd1',
    title: 'Ver o nascer do sol na praia uma última vez',
    description: 'Faz 3 anos que não consigo sair de casa por conta do tratamento. Meu maior sonho é sentir a areia nos pés e ver o sol nascer no mar de novo. Preciso de alguém que me acompanhe e tenha um carro adaptado ou paciência com cadeira de rodas.',
    category: 'Experiência ao ar livre',
    format: 'presencial',
    urgency: 'alta',
    status: 'publicado',
    patientId: 'p1',
    patientName: 'Ana S.',
    patientCity: 'Santos, SP',
    tags: ['companhia', 'acessibilidade', 'natureza', 'mobilidade-reduzida'],
    proposalsCount: 3,
    createdAt: '2026-01-15',
    updatedAt: '2026-01-20',
    restrictions: 'Mobilidade reduzida, uso de cadeira de rodas',
    language: 'Português',
    privacy: 'publico',
  },
  {
    id: 'd2',
    title: 'Aprender a tocar violão',
    description: 'Sempre sonhei em aprender violão, mas nunca tive a oportunidade. Agora, durante meu tratamento, seria um momento de alegria e distração. Não precisa ser aulas formais — só quero aprender algumas músicas que gosto.',
    category: 'Arte e Música',
    format: 'ambos',
    urgency: 'media',
    status: 'em-conversa',
    patientId: 'p2',
    patientName: 'Carlos M.',
    patientCity: 'São Paulo, SP',
    tags: ['aprendizado', 'musica', 'video-ou-presencial'],
    proposalsCount: 2,
    createdAt: '2026-01-20',
    updatedAt: '2026-01-25',
    privacy: 'publico',
  },
  {
    id: 'd3',
    title: 'Ouvir histórias de alguém que viajou pelo mundo',
    description: 'Sempre quis viajar, mas a saúde nunca me permitiu. Adoraria passar uma tarde conversando com alguém que já viajou muito e possa me contar histórias, mostrar fotos, me fazer "viajar" sem sair do quarto.',
    category: 'Conversa e Companhia',
    format: 'remoto',
    urgency: 'baixa',
    status: 'publicado',
    patientId: 'p3',
    patientName: 'Maria J.',
    patientCity: 'Belo Horizonte, MG',
    tags: ['conversa', 'historias', 'video-chamada', 'companhia'],
    proposalsCount: 5,
    createdAt: '2026-01-22',
    updatedAt: '2026-01-22',
    privacy: 'publico',
  },
  {
    id: 'd4',
    title: 'Receber uma aula de culinária em casa',
    description: 'Sou apaixonada por cozinhar, mas não consigo mais ficar muito tempo de pé. Gostaria que alguém viesse até minha casa e me ensinasse uma receita especial que eu possa fazer sentada. Seria muito significativo.',
    category: 'Culinária',
    format: 'presencial',
    urgency: 'media',
    status: 'realizando',
    patientId: 'p1',
    patientName: 'Ana S.',
    patientCity: 'Santos, SP',
    tags: ['culinaria', 'aprendizado', 'casa', 'mobilidade-reduzida'],
    proposalsCount: 1,
    createdAt: '2026-01-10',
    updatedAt: '2026-02-01',
    privacy: 'verificados',
  },
  {
    id: 'd5',
    title: 'Fazer um sarau literário virtual',
    description: 'Sou professora de literatura aposentada, mas o tratamento me isola muito. Quero organizar um pequeno sarau virtual com pessoas que amam livros, poesia e boa conversa. Mesmo que seja só uma tarde.',
    category: 'Literatura e Cultura',
    format: 'remoto',
    urgency: 'baixa',
    status: 'publicado',
    patientId: 'p4',
    patientName: 'Lúcia F.',
    patientCity: 'Curitiba, PR',
    tags: ['literatura', 'poesia', 'conversa', 'cultura', 'video-chamada'],
    proposalsCount: 4,
    createdAt: '2026-01-28',
    updatedAt: '2026-01-28',
    privacy: 'publico',
  },
  {
    id: 'd6',
    title: 'Assistir ao jogo do meu time com companhia',
    description: 'Meu filho está cadastrando em meu nome. Meu pai é apaixonado por futebol mas não tem mais condições de ir ao estádio. Queríamos que alguém assistisse o jogo com ele — seja em casa ou transmissão — e tornasse esse momento especial.',
    category: 'Esporte e Lazer',
    format: 'ambos',
    urgency: 'alta',
    status: 'publicado',
    patientId: 'p5',
    patientName: 'Roberto A.',
    patientCity: 'Porto Alegre, RS',
    tags: ['futebol', 'companhia', 'lazer', 'idoso'],
    proposalsCount: 2,
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
    restrictions: 'Restrições médicas, oxigênio em uso contínuo',
    privacy: 'publico',
  },
  {
    id: 'd7',
    title: 'Aprender a pintar aquarelas',
    description: 'Durante a quimioterapia descobri que quero tentar pintar. Nunca tive nenhuma habilidade artística mas quero aprender o básico de aquarela. Pode ser online ou presencial, se a pessoa tiver paciência comigo!',
    category: 'Arte e Música',
    format: 'ambos',
    urgency: 'media',
    status: 'concluido',
    patientId: 'p2',
    patientName: 'Carlos M.',
    patientCity: 'São Paulo, SP',
    tags: ['arte', 'aquarela', 'aprendizado', 'quimioterapia'],
    proposalsCount: 3,
    createdAt: '2025-12-01',
    updatedAt: '2026-01-15',
    privacy: 'publico',
  },
];

export const mockProposals: Proposal[] = [
  {
    id: 'pr1',
    dreamId: 'd1',
    dreamTitle: 'Ver o nascer do sol na praia uma última vez',
    supporterId: 's1',
    supporterName: 'Fernanda Lima',
    message: 'Olá, Ana! Li seu sonho e fiquei muito emocionada. Sou moradora de Santos e tenho um carro adaptado para cadeira de rodas. Seria uma honra te acompanhar na praia. Posso ir em qualquer manhã de fim de semana.',
    offering: 'Transporte adaptado, companhia e presença',
    availability: 'Fins de semana, manhãs',
    duration: '3 a 4 horas',
    status: 'em-analise',
    createdAt: '2026-01-22',
  },
  {
    id: 'pr2',
    dreamId: 'd1',
    dreamTitle: 'Ver o nascer do sol na praia uma última vez',
    supporterId: 's2',
    supporterName: 'Pedro Rocha',
    message: 'Oi Ana! Trabalho como técnico de enfermagem e tenho experiência com pacientes com mobilidade reduzida. Adoraria te ajudar a realizar esse sonho lindo. Moro pertinho da Praia do Gonzaga.',
    offering: 'Companhia, cuidado e suporte médico básico',
    availability: 'Sábados e domingos',
    duration: '2 a 4 horas',
    status: 'aceita',
    createdAt: '2026-01-23',
  },
  {
    id: 'pr3',
    dreamId: 'd1',
    dreamTitle: 'Ver o nascer do sol na praia uma última vez',
    supporterId: 's3',
    supporterName: 'Juliana Costa',
    message: 'Ana, que sonho lindo! Sou fotógrafa e adoraria eternizar esse momento especial pra você. Tenho experiência em acessibilidade e podemos tornar isso inesquecível.',
    offering: 'Companhia, fotografia profissional do momento',
    availability: 'Flexível, fim de semana',
    duration: '3 horas',
    status: 'enviada',
    createdAt: '2026-01-25',
  },
  {
    id: 'pr4',
    dreamId: 'd3',
    dreamTitle: 'Ouvir histórias de alguém que viajou pelo mundo',
    supporterId: 's1',
    supporterName: 'Fernanda Lima',
    message: 'Maria! Já morei em 12 países e tenho mil histórias pra contar. Tenho fotos, vídeos e objetos de cada lugar. Seria incrível passar uma tarde contigo compartilhando essas aventuras!',
    offering: 'Histórias, fotos, experiências de viagem',
    availability: 'Tardes de semana',
    duration: '2 horas',
    status: 'aceita',
    createdAt: '2026-01-24',
  },
  {
    id: 'pr5',
    dreamId: 'd5',
    dreamTitle: 'Fazer um sarau literário virtual',
    supporterId: 's4',
    supporterName: 'Bruno Mendes',
    message: 'Professora Lúcia! Sou poeta amador e adoro literatura brasileira. Tenho um grupo de leitura online que adoraria participar do seu sarau. Podemos organizar algo realmente especial!',
    offering: 'Participação, leitura, organização do sarau',
    availability: 'Fins de semana, tardes',
    duration: '2 a 3 horas',
    status: 'em-analise',
    createdAt: '2026-01-30',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    dreamId: 'd1',
    dreamTitle: 'Ver o nascer do sol na praia',
    patientId: 'p1',
    patientName: 'Ana S.',
    supporterId: 's2',
    supporterName: 'Pedro Rocha',
    lastMessage: 'Perfeito! Então combinamos para sábado às 5h30 na Praia do Gonzaga?',
    lastMessageTime: '2026-02-20 14:30',
    unreadCount: 2,
    status: 'ativa',
  },
  {
    id: 'c2',
    dreamId: 'd3',
    dreamTitle: 'Ouvir histórias de quem viajou pelo mundo',
    patientId: 'p3',
    patientName: 'Maria J.',
    supporterId: 's1',
    supporterName: 'Fernanda Lima',
    lastMessage: 'Que ótimo! Vou separar as fotos da Islândia, você vai adorar!',
    lastMessageTime: '2026-02-21 10:15',
    unreadCount: 0,
    status: 'ativa',
  },
];

export const mockMessages: ChatMessage[] = [
  {
    id: 'm1',
    conversationId: 'c1',
    senderId: 'sistema',
    senderName: 'NextDream',
    senderRole: 'sistema',
    text: 'Conversa iniciada! Ana aceitou sua proposta. Lembrem-se: o NextDream não permite pedidos de dinheiro, PIX ou doações.',
    timestamp: '2026-02-18 09:00',
  },
  {
    id: 'm2',
    conversationId: 'c1',
    senderId: 's2',
    senderName: 'Pedro Rocha',
    senderRole: 'apoiador',
    text: 'Olá Ana! Que alegria ter minha proposta aceita! Fico muito feliz em poder te ajudar nesse momento especial. 😊',
    timestamp: '2026-02-18 09:05',
  },
  {
    id: 'm3',
    conversationId: 'c1',
    senderId: 'p1',
    senderName: 'Ana S.',
    senderRole: 'paciente',
    text: 'Pedro, obrigada de coração! Faz tanto tempo que sonho com isso. Que dia funciona melhor pra você?',
    timestamp: '2026-02-18 09:30',
  },
  {
    id: 'm4',
    conversationId: 'c1',
    senderId: 's2',
    senderName: 'Pedro Rocha',
    senderRole: 'apoiador',
    text: 'Posso no próximo sábado de manhã! Qual praia você prefere? Tenho experiência com cadeiras de rodas na Praia do Gonzaga.',
    timestamp: '2026-02-18 10:00',
  },
  {
    id: 'm5',
    conversationId: 'c1',
    senderId: 'p1',
    senderName: 'Ana S.',
    senderRole: 'paciente',
    text: 'Gonzaga é perfeito! Lembro de ir lá quando era criança. Tem rampa de acesso?',
    timestamp: '2026-02-18 10:15',
  },
  {
    id: 'm6',
    conversationId: 'c1',
    senderId: 's2',
    senderName: 'Pedro Rocha',
    senderRole: 'apoiador',
    text: 'Sim, tem acesso para cadeira de rodas próximo ao Aquário! Podemos combinar às 5h30 para pegar o nascer do sol. O que acha?',
    timestamp: '2026-02-20 14:00',
  },
  {
    id: 'm7',
    conversationId: 'c1',
    senderId: 'p1',
    senderName: 'Ana S.',
    senderRole: 'paciente',
    text: 'Perfeito! Então combinamos para sábado às 5h30 na Praia do Gonzaga?',
    timestamp: '2026-02-20 14:30',
  },
];

export const mockUsers: User[] = [
  {
    id: 'p1',
    name: 'Ana Souza',
    email: 'ana@email.com',
    role: 'paciente',
    city: 'Santos, SP',
    verified: true,
    status: 'ativo',
    createdAt: '2025-12-10',
    dreamsCount: 3,
  },
  {
    id: 'p2',
    name: 'Carlos Mendes',
    email: 'carlos@email.com',
    role: 'paciente',
    city: 'São Paulo, SP',
    verified: true,
    status: 'ativo',
    createdAt: '2026-01-05',
    dreamsCount: 2,
  },
  {
    id: 'p3',
    name: 'Maria Jesus',
    email: 'maria@email.com',
    role: 'paciente',
    city: 'Belo Horizonte, MG',
    verified: false,
    status: 'ativo',
    createdAt: '2026-01-18',
    dreamsCount: 1,
  },
  {
    id: 'p4',
    name: 'Lúcia Ferreira',
    email: 'lucia@email.com',
    role: 'paciente',
    city: 'Curitiba, PR',
    verified: true,
    status: 'ativo',
    createdAt: '2026-01-22',
    dreamsCount: 1,
  },
  {
    id: 'p5',
    name: 'Roberto Alves (cadastrado pelo filho)',
    email: 'roberto.filho@email.com',
    role: 'paciente',
    city: 'Porto Alegre, RS',
    verified: false,
    status: 'ativo',
    createdAt: '2026-02-01',
    dreamsCount: 1,
  },
  {
    id: 's1',
    name: 'Fernanda Lima',
    email: 'fernanda@email.com',
    role: 'apoiador',
    city: 'Santos, SP',
    verified: true,
    status: 'ativo',
    createdAt: '2025-11-20',
    proposalsCount: 5,
  },
  {
    id: 's2',
    name: 'Pedro Rocha',
    email: 'pedro@email.com',
    role: 'apoiador',
    city: 'Santos, SP',
    verified: true,
    status: 'ativo',
    createdAt: '2025-12-01',
    proposalsCount: 3,
  },
  {
    id: 's3',
    name: 'Juliana Costa',
    email: 'juliana@email.com',
    role: 'apoiador',
    city: 'Santos, SP',
    verified: false,
    status: 'ativo',
    createdAt: '2026-01-10',
    proposalsCount: 2,
  },
  {
    id: 's4',
    name: 'Bruno Mendes',
    email: 'bruno@email.com',
    role: 'apoiador',
    city: 'Curitiba, PR',
    verified: true,
    status: 'ativo',
    createdAt: '2026-01-15',
    proposalsCount: 4,
  },
  {
    id: 's5',
    name: 'Carla Oliveira',
    email: 'carla@email.com',
    role: 'apoiador',
    city: 'São Paulo, SP',
    verified: false,
    status: 'suspenso',
    createdAt: '2026-01-25',
    proposalsCount: 1,
  },
];

export const mockReports: Report[] = [
  {
    id: 'r1',
    reporterId: 'p3',
    reporterName: 'Maria Jesus',
    reportedUserId: 's5',
    reportedUserName: 'Carla Oliveira',
    type: 'dinheiro',
    description: 'O apoiador pediu que eu fizesse um PIX para "cobrir os custos de transporte". Isso vai contra as diretrizes da plataforma.',
    status: 'em-analise',
    priority: 'alta',
    createdAt: '2026-02-10',
    refType: 'chat',
    refId: 'c2',
    refLabel: 'Chat: Maria Jesus ↔ Carla Oliveira — Sonho "Ouvir histórias de quem viajou"',
  },
  {
    id: 'r2',
    reporterId: 'p1',
    reporterName: 'Ana Souza',
    reportedUserId: 's3',
    reportedUserName: 'Juliana Costa',
    type: 'assedio',
    description: 'O apoiador me enviou mensagens pedindo meu número de celular pessoal e endereço completo antes da aceitação da proposta.',
    status: 'nova',
    priority: 'alta',
    createdAt: '2026-02-15',
    refType: 'proposta',
    refId: 'pr3',
    refLabel: 'Proposta de Juliana Costa para "Ver o nascer do sol na praia"',
  },
  {
    id: 'r3',
    reporterId: 's1',
    reporterName: 'Fernanda Lima',
    reportedUserId: 'p5',
    reportedUserName: 'Roberto Alves',
    type: 'fraude',
    description: 'Acredito que esse perfil não seja real. As informações são inconsistentes e a pessoa não responde.',
    status: 'nova',
    priority: 'media',
    createdAt: '2026-02-18',
    refType: 'usuario',
    refId: 'p5',
    refLabel: 'Perfil de Roberto Alves (paciente)',
  },
  {
    id: 'r4',
    reporterId: 'p2',
    reporterName: 'Carlos Mendes',
    reportedUserId: 's2',
    reportedUserName: 'Pedro Rocha',
    type: 'linguagem',
    description: 'Após a recusa da proposta, o apoiador enviou mensagens com linguagem agressiva.',
    status: 'acao-tomada',
    priority: 'media',
    createdAt: '2026-02-05',
    adminNote: 'Usuário notificado e advertido. Reincidência resultará em suspensão.',
    refType: 'chat',
    refId: 'c4',
    refLabel: 'Chat: Carlos Mendes ↔ Pedro Rocha — Sonho "Aprender a tocar violão"',
  },
  {
    id: 'r5',
    reporterId: 's4',
    reporterName: 'Bruno Mendes',
    type: 'outro',
    description: 'Encontrei um sonho publicado com informações médicas muito sensíveis que o paciente não deveria ter tornado público.',
    status: 'resolvida',
    priority: 'baixa',
    createdAt: '2026-01-30',
    resolvedAt: '2026-02-02',
    adminNote: 'Conteúdo revisado e editado em conjunto com o paciente para remover dados sensíveis.',
    refType: 'sonho',
    refId: 'd6',
    refLabel: 'Sonho "Assistir ao jogo do meu time com companhia" — Roberto Alves',
  },
  {
    id: 'r6',
    reporterId: 'p4',
    reporterName: 'Lúcia Ferreira',
    reportedUserId: 's4',
    reportedUserName: 'Bruno Mendes',
    type: 'risco',
    description: 'O apoiador tentou me desviar para serviços pagos externos e fez comentários inapropriados sobre minha condição de saúde.',
    status: 'nova',
    priority: 'alta',
    createdAt: '2026-02-22',
    refType: 'chat',
    refId: 'c6',
    refLabel: 'Chat: Lúcia Ferreira ↔ Bruno Mendes — Sonho "Fazer um sarau literário virtual"',
  },
];

export interface ContactMessage {
  id: string;
  type: 'contato' | 'parceria';
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'nova' | 'lida' | 'respondida' | 'arquivada';
  createdAt: string;
  company?: string;
  phone?: string;
}

export const mockContacts: ContactMessage[] = [
  {
    id: 'msg1',
    type: 'parceria',
    name: 'Roberto Silva',
    email: 'roberto@clinicaexemplo.com.br',
    company: 'Clínica Exemplo',
    phone: '(11) 99999-9999',
    subject: 'Parceria com clínica oncológica',
    message: 'Olá, somos uma clínica oncológica e gostaríamos de apresentar o NextDream aos nossos pacientes. Podemos agendar uma reunião?',
    status: 'nova',
    createdAt: '2026-03-05T10:30:00Z'
  },
  {
    id: 'msg2',
    type: 'contato',
    name: 'Juliana Costa',
    email: 'juliana.c@email.com',
    subject: 'Dúvida sobre cadastro de paciente',
    message: 'Minha mãe não tem e-mail. Posso fazer o cadastro dela usando o meu e-mail e administrar a conta por ela?',
    status: 'respondida',
    createdAt: '2026-03-04T15:45:00Z'
  },
  {
    id: 'msg3',
    type: 'parceria',
    name: 'Amanda Torres',
    email: 'amanda@ongsantos.org',
    company: 'ONG Sorriso Solidário',
    subject: 'Apoio com transporte voluntário',
    message: 'Temos uma rede de motoristas voluntários que poderiam ajudar os apoiadores e pacientes em seus deslocamentos. Como podemos formalizar essa parceria?',
    status: 'lida',
    createdAt: '2026-03-02T09:15:00Z'
  }
];

export const mockAdminStats = {
  totalDreams: 247,
  publishedDreams: 134,
  totalProposals: 589,
  activeChats: 42,
  completedConnections: 98,
  openReports: 7,
  pendingReviews: 12,
  newUsersThisWeek: 23,
  totalPatients: 156,
  totalSupporters: 201,
};

export const dreamCategories = [
  'Experiência ao ar livre',
  'Arte e Música',
  'Conversa e Companhia',
  'Culinária',
  'Literatura e Cultura',
  'Esporte e Lazer',
  'Aprendizado e Educação',
  'Tecnologia',
  'Espiritualidade',
  'Família e Memórias',
  'Saúde e Bem-estar',
  'Outro',
];