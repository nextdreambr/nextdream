import React, { useState, useEffect } from 'react';
import {
  MessageCircle, AlertTriangle, Eye, Lock, Shield, Search,
  Ban, CheckCircle, Flag, X, DollarSign, UserX, AlertCircle,
  ChevronLeft, Clock, Gavel, TriangleAlert, CircleCheck,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { mockReports } from '../../data/mockData';

// ─── Types ───────────────────────────────────────────────────────────────────

type FlagType = 'dinheiro' | 'contato_externo' | 'assedio' | 'fraude' | 'risco';
type FlagSeverity = 'alta' | 'media' | 'baixa';
type FlagSource = 'auto' | 'denuncia';
type ChatStatus = 'ativa' | 'encerrada' | 'suspensa';
type AdminAction = 'nenhuma' | 'advertencia' | 'suspensao' | 'encerrado';

interface ChatFlag {
  type: FlagType;
  severity: FlagSeverity;
  label: string;
  source: FlagSource;
}

interface AdminChat {
  id: string;
  patient: { id: string; name: string };
  supporter: { id: string; name: string };
  dreamTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  status: ChatStatus;
  flags: ChatFlag[];
  messageCount: number;
  startedAt: string;
  adminAction?: AdminAction;
  adminNote?: string;
}

interface AdminMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  role: 'paciente' | 'apoiador' | 'sistema';
  text: string;
  timestamp: string;
  flags?: ChatFlag[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const adminChats: AdminChat[] = [
  {
    id: 'c1',
    patient: { id: 'p1', name: 'Ana Souza' },
    supporter: { id: 's2', name: 'Pedro Rocha' },
    dreamTitle: 'Ver o nascer do sol na praia',
    lastMessage: 'Perfeito! Então combinamos para sábado às 5h30 na Praia do Gonzaga?',
    lastMessageTime: '2026-02-20 14:30',
    status: 'ativa',
    flags: [],
    messageCount: 7,
    startedAt: '2026-02-18',
  },
  {
    id: 'c2',
    patient: { id: 'p3', name: 'Maria Jesus' },
    supporter: { id: 's5', name: 'Carla Oliveira' },
    dreamTitle: 'Ouvir histórias de quem viajou pelo mundo',
    lastMessage: 'Você pode me mandar um pix de R$50 pra cobrir o transporte?',
    lastMessageTime: '2026-02-10 11:20',
    status: 'suspensa',
    flags: [
      { type: 'dinheiro', severity: 'alta', label: 'Pedido de dinheiro / PIX', source: 'auto' },
      { type: 'dinheiro', severity: 'alta', label: 'Denúncia do usuário', source: 'denuncia' },
    ],
    messageCount: 12,
    startedAt: '2026-02-08',
    adminAction: 'suspensao',
    adminNote: 'Apoiador suspenso por 7 dias. Conversa encerrada.',
  },
  {
    id: 'c3',
    patient: { id: 'p1', name: 'Ana Souza' },
    supporter: { id: 's3', name: 'Juliana Costa' },
    dreamTitle: 'Ver o nascer do sol na praia',
    lastMessage: 'Pode me passar seu WhatsApp pessoal? Prefiro combinar por lá.',
    lastMessageTime: '2026-02-15 09:00',
    status: 'ativa',
    flags: [
      { type: 'contato_externo', severity: 'media', label: 'Solicitação de contato externo', source: 'auto' },
      { type: 'contato_externo', severity: 'alta', label: 'Denúncia do usuário', source: 'denuncia' },
    ],
    messageCount: 5,
    startedAt: '2026-02-14',
  },
  {
    id: 'c4',
    patient: { id: 'p2', name: 'Carlos Mendes' },
    supporter: { id: 's2', name: 'Pedro Rocha' },
    dreamTitle: 'Aprender a tocar violão',
    lastMessage: 'Que absurdo você não ter escolhido minha proposta! Vai se arrepender.',
    lastMessageTime: '2026-02-05 16:45',
    status: 'encerrada',
    flags: [
      { type: 'assedio', severity: 'media', label: 'Linguagem agressiva', source: 'denuncia' },
    ],
    messageCount: 8,
    startedAt: '2026-02-03',
    adminAction: 'advertencia',
    adminNote: 'Usuário advertido formalmente. Reincidência = suspensão.',
  },
  {
    id: 'c5',
    patient: { id: 'p3', name: 'Maria Jesus' },
    supporter: { id: 's1', name: 'Fernanda Lima' },
    dreamTitle: 'Ouvir histórias de quem viajou pelo mundo',
    lastMessage: 'Que ótimo! Vou separar as fotos da Islândia, você vai adorar!',
    lastMessageTime: '2026-02-21 10:15',
    status: 'ativa',
    flags: [],
    messageCount: 9,
    startedAt: '2026-02-15',
  },
  {
    id: 'c6',
    patient: { id: 'p4', name: 'Lúcia Ferreira' },
    supporter: { id: 's4', name: 'Bruno Mendes' },
    dreamTitle: 'Fazer um sarau literário virtual',
    lastMessage: 'Posso te indicar outros serviços pagos de companhia que tenho...',
    lastMessageTime: '2026-02-22 17:00',
    status: 'ativa',
    flags: [
      { type: 'fraude', severity: 'alta', label: 'Desvio para serviço pago', source: 'auto' },
    ],
    messageCount: 6,
    startedAt: '2026-02-20',
  },
];

const chatMessages: Record<string, AdminMessage[]> = {
  c1: [
    { id: 'm1', chatId: 'c1', senderId: 'sistema', senderName: 'NextDream', role: 'sistema', text: 'Conversa iniciada! Ana aceitou a proposta de Pedro. Lembrem-se: o NextDream não permite pedidos de dinheiro, PIX ou dados pessoais fora da plataforma.', timestamp: '2026-02-18 09:00' },
    { id: 'm2', chatId: 'c1', senderId: 's2', senderName: 'Pedro Rocha', role: 'apoiador', text: 'Olá Ana! Que alegria ter minha proposta aceita! Fico muito feliz em poder te ajudar. 😊', timestamp: '2026-02-18 09:05' },
    { id: 'm3', chatId: 'c1', senderId: 'p1', senderName: 'Ana Souza', role: 'paciente', text: 'Pedro, obrigada de coração! Faz tanto tempo que sonho com isso. Que dia funciona melhor pra você?', timestamp: '2026-02-18 09:30' },
    { id: 'm4', chatId: 'c1', senderId: 's2', senderName: 'Pedro Rocha', role: 'apoiador', text: 'Posso no próximo sábado de manhã! Qual praia você prefere? Tenho experiência com cadeiras de rodas na Praia do Gonzaga.', timestamp: '2026-02-18 10:00' },
    { id: 'm5', chatId: 'c1', senderId: 'p1', senderName: 'Ana Souza', role: 'paciente', text: 'Gonzaga é perfeito! Lembro de ir lá quando era criança. Tem rampa de acesso?', timestamp: '2026-02-18 10:15' },
    { id: 'm6', chatId: 'c1', senderId: 's2', senderName: 'Pedro Rocha', role: 'apoiador', text: 'Sim, tem acesso para cadeira de rodas próximo ao Aquário! Podemos combinar às 5h30 para pegar o nascer do sol. O que acha?', timestamp: '2026-02-20 14:00' },
    { id: 'm7', chatId: 'c1', senderId: 'p1', senderName: 'Ana Souza', role: 'paciente', text: 'Perfeito! Então combinamos para sábado às 5h30 na Praia do Gonzaga?', timestamp: '2026-02-20 14:30' },
  ],
  c2: [
    { id: 'c2m1', chatId: 'c2', senderId: 'sistema', senderName: 'NextDream', role: 'sistema', text: 'Conversa iniciada! Maria aceitou a proposta de Carla. Lembrem-se: o NextDream não permite pedidos de dinheiro, PIX ou dados pessoais fora da plataforma.', timestamp: '2026-02-08 10:00' },
    { id: 'c2m2', chatId: 'c2', senderId: 's5', senderName: 'Carla Oliveira', role: 'apoiador', text: 'Olá Maria! Que sonho lindo. Tenho várias histórias de viagem para compartilhar com você!', timestamp: '2026-02-08 10:05' },
    { id: 'c2m3', chatId: 'c2', senderId: 'p3', senderName: 'Maria Jesus', role: 'paciente', text: 'Que alegria! Já sei que vai ser especial. Quando você pode?', timestamp: '2026-02-08 10:20' },
    { id: 'c2m4', chatId: 'c2', senderId: 's5', senderName: 'Carla Oliveira', role: 'apoiador', text: 'Posso qualquer tarde de semana. Mas antes, você poderia me mandar um pix de R$50 pra cobrir o transporte até você?', timestamp: '2026-02-09 14:00', flags: [{ type: 'dinheiro', severity: 'alta', label: 'Pedido de dinheiro / PIX', source: 'auto' }] },
    { id: 'c2m5', chatId: 'c2', senderId: 'p3', senderName: 'Maria Jesus', role: 'paciente', text: 'Mas na plataforma diz que não pode pedir dinheiro... Isso é certo?', timestamp: '2026-02-09 14:30' },
    { id: 'c2m6', chatId: 'c2', senderId: 's5', senderName: 'Carla Oliveira', role: 'apoiador', text: 'É só um reembolso, não é nada de mais. R$50 pelo transporte de ida e volta é justo, não acha?', timestamp: '2026-02-09 15:00', flags: [{ type: 'dinheiro', severity: 'alta', label: 'Insistência em pedido financeiro', source: 'auto' }] },
    { id: 'c2m7', chatId: 'c2', senderId: 'sistema', senderName: 'NextDream', role: 'sistema', text: '⚠️ Alerta automático: Foi detectada uma possível solicitação financeira nesta conversa. Lembrete: qualquer pedido de dinheiro, PIX, transferência ou reembolso é proibido pela plataforma.', timestamp: '2026-02-09 15:01' },
    { id: 'c2m8', chatId: 'c2', senderId: 'p3', senderName: 'Maria Jesus', role: 'paciente', text: 'Não me sinto confortável com isso. Vou denunciar esta conversa.', timestamp: '2026-02-10 08:00' },
    { id: 'c2m9', chatId: 'c2', senderId: 'sistema', senderName: 'NextDream', role: 'sistema', text: '🔒 Conversa suspensa por denúncia. Um administrador irá revisar esta conversa.', timestamp: '2026-02-10 11:25' },
  ],
  c3: [
    { id: 'c3m1', chatId: 'c3', senderId: 'sistema', senderName: 'NextDream', role: 'sistema', text: 'Conversa iniciada! Ana aceitou a proposta de Juliana. Lembrem-se: o NextDream não permite pedidos de dinheiro, PIX ou dados pessoais fora da plataforma.', timestamp: '2026-02-14 09:00' },
    { id: 'c3m2', chatId: 'c3', senderId: 's3', senderName: 'Juliana Costa', role: 'apoiador', text: 'Oi Ana! Tô muito animada pra te fotografar na praia! Vai ser lindo.', timestamp: '2026-02-14 09:10' },
    { id: 'c3m3', chatId: 'c3', senderId: 'p1', senderName: 'Ana Souza', role: 'paciente', text: 'Obrigada Juliana! Que dia você tem disponível?', timestamp: '2026-02-14 09:30' },
    { id: 'c3m4', chatId: 'c3', senderId: 's3', senderName: 'Juliana Costa', role: 'apoiador', text: 'Pode me passar seu WhatsApp pessoal? Prefiro combinar por lá, é mais fácil.', timestamp: '2026-02-15 09:00', flags: [{ type: 'contato_externo', severity: 'media', label: 'Solicitação de contato externo', source: 'auto' }] },
    { id: 'c3m5', chatId: 'c3', senderId: 'p1', senderName: 'Ana Souza', role: 'paciente', text: 'Não me sinto segura passando meu número. A plataforma não diz que a gente deve usar só o chat aqui?', timestamp: '2026-02-15 09:15' },
  ],
  c4: [
    { id: 'c4m1', chatId: 'c4', senderId: 'sistema', senderName: 'NextDream', role: 'sistema', text: 'A proposta de Pedro para o sonho de Carlos foi recusada. Esta conversa foi gerada automaticamente para registro.', timestamp: '2026-02-03 14:00' },
    { id: 'c4m2', chatId: 'c4', senderId: 's2', senderName: 'Pedro Rocha', role: 'apoiador', text: 'Carlos, por que você não escolheu minha proposta? Eu me esforcei muito.', timestamp: '2026-02-05 16:00' },
    { id: 'c4m3', chatId: 'c4', senderId: 'p2', senderName: 'Carlos Mendes', role: 'paciente', text: 'Escolhi outra proposta porque se encaixou melhor no meu horário.', timestamp: '2026-02-05 16:20' },
    { id: 'c4m4', chatId: 'c4', senderId: 's2', senderName: 'Pedro Rocha', role: 'apoiador', text: 'Que absurdo você não ter escolhido minha proposta! Vai se arrepender.', timestamp: '2026-02-05 16:45', flags: [{ type: 'assedio', severity: 'media', label: 'Linguagem agressiva / ameaça', source: 'denuncia' }] },
  ],
  c5: [
    { id: 'c5m1', chatId: 'c5', senderId: 'sistema', senderName: 'NextDream', role: 'sistema', text: 'Conversa iniciada! Maria aceitou a proposta de Fernanda. Lembrem-se: o NextDream não permite pedidos de dinheiro, PIX ou dados pessoais fora da plataforma.', timestamp: '2026-02-15 11:00' },
    { id: 'c5m2', chatId: 'c5', senderId: 's1', senderName: 'Fernanda Lima', role: 'apoiador', text: 'Maria! Que felicidade! Já morei em 12 países e tenho mil histórias. Por onde quer começar?', timestamp: '2026-02-15 11:10' },
    { id: 'c5m3', chatId: 'c5', senderId: 'p3', senderName: 'Maria Jesus', role: 'paciente', text: 'Começa pela mais exótica! Eu nunca saí do Brasil...', timestamp: '2026-02-15 11:30' },
    { id: 'c5m4', chatId: 'c5', senderId: 's1', senderName: 'Fernanda Lima', role: 'apoiador', text: 'Então vou te contar da Islândia! Vou separar as fotos da aurora boreal pra você ver.', timestamp: '2026-02-20 09:00' },
    { id: 'c5m5', chatId: 'c5', senderId: 'p3', senderName: 'Maria Jesus', role: 'paciente', text: 'Aurora boreal?! Nunca vi isso nem em foto! Mal posso esperar!', timestamp: '2026-02-20 09:20' },
    { id: 'c5m6', chatId: 'c5', senderId: 's1', senderName: 'Fernanda Lima', role: 'apoiador', text: 'Que ótimo! Vou separar as fotos da Islândia, você vai adorar!', timestamp: '2026-02-21 10:15' },
  ],
  c6: [
    { id: 'c6m1', chatId: 'c6', senderId: 'sistema', senderName: 'NextDream', role: 'sistema', text: 'Conversa iniciada! Lúcia aceitou a proposta de Bruno. Lembrem-se: o NextDream não permite pedidos de dinheiro, PIX ou dados pessoais fora da plataforma.', timestamp: '2026-02-20 14:00' },
    { id: 'c6m2', chatId: 'c6', senderId: 's4', senderName: 'Bruno Mendes', role: 'apoiador', text: 'Professora Lúcia! Que honra. Amo literatura brasileira. Já organizei alguns saraus antes.', timestamp: '2026-02-20 14:10' },
    { id: 'c6m3', chatId: 'c6', senderId: 'p4', senderName: 'Lúcia Ferreira', role: 'paciente', text: 'Que maravilha! Tenho tantas ideias para o sarau. Podemos combinar os poemas?', timestamp: '2026-02-20 15:00' },
    { id: 'c6m4', chatId: 'c6', senderId: 's4', senderName: 'Bruno Mendes', role: 'apoiador', text: 'Claro! E olha, além do sarau, posso te indicar outros serviços pagos de companhia que tenho. Tenho um plano mensal de visitas por R$200...', timestamp: '2026-02-22 17:00', flags: [{ type: 'fraude', severity: 'alta', label: 'Desvio para serviço pago / propaganda', source: 'auto' }] },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const flagColors: Record<FlagType, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  dinheiro: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <DollarSign className="w-3 h-3" /> },
  contato_externo: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: <UserX className="w-3 h-3" /> },
  assedio: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: <AlertCircle className="w-3 h-3" /> },
  fraude: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <Ban className="w-3 h-3" /> },
  risco: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: <TriangleAlert className="w-3 h-3" /> },
};

const severityDot: Record<FlagSeverity, string> = {
  alta: 'bg-red-500',
  media: 'bg-orange-400',
  baixa: 'bg-yellow-400',
};

const statusBadge: Record<ChatStatus, { label: string; color: string }> = {
  ativa: { label: 'Ativa', color: 'bg-green-100 text-green-700' },
  encerrada: { label: 'Encerrada', color: 'bg-gray-100 text-gray-600' },
  suspensa: { label: 'Suspensa', color: 'bg-red-100 text-red-700' },
};

const actionBadge: Record<AdminAction, { label: string; color: string; icon: React.ReactNode }> = {
  nenhuma: { label: 'Sem ação', color: 'text-gray-500', icon: <Clock className="w-3 h-3" /> },
  advertencia: { label: 'Advertência emitida', color: 'text-orange-600', icon: <Gavel className="w-3 h-3" /> },
  suspensao: { label: 'Usuário suspenso', color: 'text-red-600', icon: <Ban className="w-3 h-3" /> },
  encerrado: { label: 'Chat encerrado', color: 'text-gray-600', icon: <X className="w-3 h-3" /> },
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date('2026-02-25');
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return dateStr.split(' ')[0];
}

// ─── Main Component ──────────────────────────────────────────────────────────

type FilterTab = 'todos' | 'alertas' | 'denuncia' | 'limpos';
type ModalType = 'advertir' | 'suspender' | 'encerrar' | null;

interface ModalState {
  type: ModalType;
  chatId: string | null;
  target: 'paciente' | 'apoiador' | 'ambos';
  duration: '7' | '30' | 'permanente';
  note: string;
}

const INITIAL_MODAL: ModalState = { type: null, chatId: null, target: 'apoiador', duration: '7', note: '' };

export default function AdminChats() {
  const [chats, setChats] = useState<AdminChat[]>(adminChats);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('todos');
  const [query, setQuery] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [modal, setModal] = useState<ModalState>(INITIAL_MODAL);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-open chat when navigating from AdminReports
  useEffect(() => {
    const incoming = (location.state as { openId?: string } | null)?.openId;
    if (incoming) {
      setSelectedId(incoming);
      setShowDetail(true);
    }
  }, []);

  const showToast = (msg: string, color = 'bg-green-600') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3500);
  };

  const openModal = (type: ModalType, chatId: string) => setModal({ ...INITIAL_MODAL, type, chatId });
  const closeModal = () => setModal(INITIAL_MODAL);

  const applyAction = () => {
    if (!modal.chatId || !modal.type) return;
    setChats(prev => prev.map(c => {
      if (c.id !== modal.chatId) return c;
      if (modal.type === 'advertir') {
        return { ...c, adminAction: 'advertencia' as AdminAction, adminNote: modal.note || `Advertência emitida ao ${modal.target === 'ambos' ? 'paciente e apoiador' : modal.target}.` };
      }
      if (modal.type === 'suspender') {
        const dur = modal.duration === 'permanente' ? 'permanentemente' : `por ${modal.duration} dias`;
        const who = modal.target === 'ambos' ? 'Ambos os usuários suspensos' : modal.target === 'apoiador' ? 'Apoiador suspenso' : 'Paciente suspenso';
        return { ...c, status: 'suspensa' as ChatStatus, adminAction: 'suspensao' as AdminAction, adminNote: modal.note || `${who} ${dur}.` };
      }
      if (modal.type === 'encerrar') {
        return { ...c, status: 'encerrada' as ChatStatus, adminAction: 'encerrado' as AdminAction, adminNote: modal.note || 'Chat encerrado pelo administrador.' };
      }
      return c;
    }));
    const msgs: Record<string, string> = { advertir: '✅ Advertência registrada e notificação enviada.', suspender: '🚫 Usuário suspenso com sucesso.', encerrar: '🔒 Chat encerrado com sucesso.' };
    const colors: Record<string, string> = { advertir: 'bg-orange-600', suspender: 'bg-red-600', encerrar: 'bg-gray-700' };
    showToast(msgs[modal.type!], colors[modal.type!]);
    closeModal();
  };

  const modalConfig = {
    advertir: { title: 'Emitir Advertência', desc: 'Uma notificação formal será enviada ao usuário selecionado com o aviso registrado no histórico.', confirmLabel: 'Emitir advertência', confirmColor: 'bg-orange-500 hover:bg-orange-600' },
    suspender: { title: 'Suspender Usuário', desc: 'O usuário perderá acesso à plataforma pelo período selecionado. O chat será marcado como suspenso.', confirmLabel: 'Confirmar suspensão', confirmColor: 'bg-red-600 hover:bg-red-700' },
    encerrar: { title: 'Encerrar Chat', desc: 'O chat será encerrado permanentemente. Os participantes não poderão mais enviar mensagens nesta conversa.', confirmLabel: 'Encerrar conversa', confirmColor: 'bg-gray-700 hover:bg-gray-800' },
  };
  const cfg = modal.type ? modalConfig[modal.type] : null;
  const modalChat = chats.find(c => c.id === modal.chatId);

  const flaggedCount = chats.filter(c => c.flags.length > 0).length;
  const denunciaCount = chats.filter(c => c.flags.some(f => f.source === 'denuncia')).length;
  const cleanCount = chats.filter(c => c.flags.length === 0).length;

  const filtered = chats.filter(c => {
    if (filter === 'alertas' && c.flags.length === 0) return false;
    if (filter === 'denuncia' && !c.flags.some(f => f.source === 'denuncia')) return false;
    if (filter === 'limpos' && c.flags.length > 0) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!c.patient.name.toLowerCase().includes(q) &&
          !c.supporter.name.toLowerCase().includes(q) &&
          !c.dreamTitle.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selected = chats.find(c => c.id === selectedId) ?? null;
  const messages = selectedId ? (chatMessages[selectedId] ?? []) : [];

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: chats.length },
    { key: 'alertas', label: 'Com alerta', count: flaggedCount },
    { key: 'denuncia', label: 'Denúncias', count: denunciaCount },
    { key: 'limpos', label: 'Sem ocorrência', count: cleanCount },
  ];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowDetail(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 ${toast.color} text-white text-sm px-4 py-3 rounded-2xl shadow-lg transition-all`}>
          {toast.msg}
        </div>
      )}

      {/* Action Modal */}
      {modal.type && cfg && modalChat && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {modal.type === 'advertir' && <Gavel className="w-4 h-4 text-orange-500" />}
                {modal.type === 'suspender' && <Ban className="w-4 h-4 text-red-600" />}
                {modal.type === 'encerrar' && <X className="w-4 h-4 text-gray-600" />}
                <h3 className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{cfg.title}</h3>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Chat reference */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Conversa selecionada</p>
                <p className="text-sm text-gray-800 mt-0.5" style={{ fontWeight: 500 }}>{modalChat.patient.name} ↔ {modalChat.supporter.name}</p>
                <p className="text-xs text-gray-500 truncate">{modalChat.dreamTitle}</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{cfg.desc}</p>
              {/* Target */}
              {modal.type !== 'encerrar' && (
                <div>
                  <label className="text-xs text-gray-600 mb-1.5 block" style={{ fontWeight: 500 }}>Aplicar a</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['apoiador', 'paciente', 'ambos'] as const).map(t => (
                      <button key={t} onClick={() => setModal(m => ({ ...m, target: t }))}
                        className={`py-2 rounded-xl border text-xs transition-all ${modal.target === t ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {t === 'ambos' ? 'Ambos' : t === 'apoiador' ? 'Apoiador' : 'Paciente'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Duration */}
              {modal.type === 'suspender' && (
                <div>
                  <label className="text-xs text-gray-600 mb-1.5 block" style={{ fontWeight: 500 }}>Duração da suspensão</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([{ v: '7', l: '7 dias' }, { v: '30', l: '30 dias' }, { v: 'permanente', l: 'Permanente' }] as const).map(d => (
                      <button key={d.v} onClick={() => setModal(m => ({ ...m, duration: d.v }))}
                        className={`py-2 rounded-xl border text-xs transition-all ${modal.duration === d.v ? (d.v === 'permanente' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-800 text-white border-gray-800') : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {d.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Note */}
              <div>
                <label className="text-xs text-gray-600 mb-1.5 block" style={{ fontWeight: 500 }}>
                  Nota interna <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={modal.note}
                  onChange={e => setModal(m => ({ ...m, note: e.target.value }))}
                  placeholder={modal.type === 'advertir' ? 'Ex: PIX solicitado na mensagem de 09/02...' : modal.type === 'suspender' ? 'Ex: Reincidência em pedido de dinheiro...' : 'Ex: Conversa encerrada por violação das diretrizes...'}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
              <button onClick={applyAction} className={`px-5 py-2 text-sm text-white rounded-xl transition-colors ${cfg.confirmColor}`}>{cfg.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Monitoramento de Chats</h1>
          <p className="text-gray-500 text-sm">{chats.length} conversas no sistema</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total de chats', value: chats.length, color: 'bg-blue-50 text-blue-700', icon: <MessageCircle className="w-4 h-4" /> },
          { label: 'Com alerta', value: flaggedCount, color: 'bg-red-50 text-red-700', icon: <AlertTriangle className="w-4 h-4" /> },
          { label: 'Com denúncia', value: denunciaCount, color: 'bg-orange-50 text-orange-700', icon: <Flag className="w-4 h-4" /> },
          { label: 'Suspensos', value: chats.filter(c => c.status === 'suspensa').length, color: 'bg-purple-50 text-purple-700', icon: <Ban className="w-4 h-4" /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl text-gray-800" style={{ fontWeight: 700 }}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <span style={{ fontWeight: 600 }}>Privacidade por padrão.</span> O conteúdo das mensagens só é visível para administradores em chats com alerta automático, denúncia ativa ou suspensão em curso. Chats sem ocorrência exibem apenas metadados.
        </p>
      </div>

      {/* Split panel */}
      <div className="flex gap-4 min-h-[600px]">
        {/* Left: list */}
        <div className={`${showDetail && selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 shrink-0 space-y-3`}>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar participante ou sonho..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all
                  ${filter === t.key ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {t.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Chat list */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-50 flex-1">
            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">Nenhuma conversa encontrada.</div>
            )}
            {filtered.map(chat => (
              <button
                key={chat.id}
                onClick={() => handleSelect(chat.id)}
                className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors border-l-2
                  ${selectedId === chat.id
                    ? 'bg-violet-50 border-violet-500'
                    : chat.flags.length > 0 ? 'border-red-400' : 'border-transparent'}`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {chat.flags.length > 0 && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${severityDot[chat.flags[0].severity]}`} />
                    )}
                    <p className="text-sm text-gray-800 truncate" style={{ fontWeight: chat.flags.length > 0 ? 600 : 400 }}>
                      {chat.patient.name} ↔ {chat.supporter.name}
                    </p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${statusBadge[chat.status].color}`}>
                    {statusBadge[chat.status].label}
                  </span>
                </div>
                {/* Dream */}
                <p className="text-xs text-gray-500 truncate mt-0.5 ml-3.5">{chat.dreamTitle}</p>
                {/* Last message */}
                <p className="text-xs text-gray-400 truncate mt-1 ml-3.5">{chat.lastMessage}</p>
                {/* Flags */}
                {chat.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 ml-3.5">
                    {chat.flags.map((f, i) => {
                      const c = flagColors[f.type];
                      return (
                        <span key={i} className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                          {c.icon}
                          {f.source === 'denuncia' ? '🚩' : '🤖'} {f.label}
                        </span>
                      );
                    })}
                  </div>
                )}
                {/* Linked reports from mockReports */}
                {(() => {
                  const linked = mockReports.filter(r => r.refType === 'chat' && r.refId === chat.id);
                  if (linked.length === 0) return null;
                  return (
                    <div className="flex items-center gap-1 mt-1.5 ml-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                        <Flag className="w-2.5 h-2.5" />
                        {linked.length} {linked.length === 1 ? 'denúncia registrada' : 'denúncias registradas'}
                      </span>
                    </div>
                  );
                })()}
                <p className="text-[10px] text-gray-400 mt-1.5 ml-3.5">{timeAgo(chat.lastMessageTime)} · {chat.messageCount} mensagens</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: detail */}
        {selected ? (
          <div className={`${showDetail ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden`}>
            {/* Detail header */}
            <div className={`px-5 py-4 border-b flex items-start justify-between gap-3
              ${selected.flags.length > 0 ? 'border-red-100 bg-red-50/40' : 'border-gray-100'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    className="md:hidden p-1 rounded-lg hover:bg-gray-100 mr-1"
                    onClick={() => { setShowDetail(false); }}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
                    {selected.patient.name} ↔ {selected.supporter.name}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[selected.status].color}`}>
                    {statusBadge[selected.status].label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selected.dreamTitle} · iniciado em {selected.startedAt}
                </p>
                {selected.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selected.flags.map((f, i) => {
                      const c = flagColors[f.type];
                      return (
                        <span key={i} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                          {c.icon}
                          {f.source === 'denuncia' ? '🚩 Denúncia:' : '🤖 Auto:'} {f.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Admin actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {/* Linked reports badge */}
                {(() => {
                  const linked = mockReports.filter(r => r.refType === 'chat' && r.refId === selected.id);
                  if (linked.length === 0) return null;
                  return (
                    <button
                      onClick={() => navigate('/admin/denuncias', { state: { openId: linked[0].id } })}
                      className="flex items-center gap-1.5 text-xs bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      {linked.length} {linked.length === 1 ? 'denúncia' : 'denúncias'} vinculada{linked.length > 1 ? 's' : ''}
                    </button>
                  );
                })()}
                {selected.status !== 'encerrada' ? (
                  <>
                    <button
                      onClick={() => openModal('advertir', selected.id)}
                      className="flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Gavel className="w-3.5 h-3.5" /> Advertir
                    </button>
                    {selected.status !== 'suspensa' && (
                      <button
                        onClick={() => openModal('suspender', selected.id)}
                        className="flex items-center gap-1.5 text-xs bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" /> Suspender
                      </button>
                    )}
                    <button
                      onClick={() => openModal('encerrar', selected.id)}
                      className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <CircleCheck className="w-3.5 h-3.5" /> Encerrar
                    </button>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                    <CheckCircle className="w-3.5 h-3.5" /> Chat encerrado
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && selected.flags.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600" style={{ fontWeight: 500 }}>Nenhuma infração detectada</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">Esta conversa não possui denúncias ou alertas. O conteúdo está protegido por privacidade.</p>
                </div>
              )}
              {messages.map(msg => {
                const isSistema = msg.role === 'sistema';
                const isPatient = msg.role === 'paciente';
                const hasFlagMsg = msg.flags && msg.flags.length > 0;

                if (isSistema) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className={`max-w-sm text-center px-4 py-2 rounded-2xl text-xs leading-relaxed
                        ${hasFlagMsg ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-500'}`}>
                        {msg.text}
                        <p className="text-[10px] mt-1 opacity-60">{msg.timestamp}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${isPatient ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-[10px] text-gray-400">{msg.senderName} · {msg.timestamp}</p>
                    </div>
                    <div className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${hasFlagMsg
                        ? 'bg-red-50 border-2 border-red-300 text-gray-800'
                        : isPatient
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-violet-600 text-white'
                      }`}>
                      {msg.text}
                    </div>
                    {hasFlagMsg && msg.flags && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {msg.flags.map((f, i) => {
                          const c = flagColors[f.type];
                          return (
                            <span key={i} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {f.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Admin note / action taken */}
            {selected.adminAction && selected.adminAction !== 'nenhuma' && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-start gap-3">
                <div className={`flex items-center gap-1.5 text-xs ${actionBadge[selected.adminAction].color}`}>
                  {actionBadge[selected.adminAction].icon}
                  <span style={{ fontWeight: 600 }}>{actionBadge[selected.adminAction].label}</span>
                </div>
                {selected.adminNote && (
                  <p className="text-xs text-gray-500 flex-1">{selected.adminNote}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:flex flex-1 bg-white rounded-2xl border border-gray-200 items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Eye className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Selecione uma conversa para revisar</p>
              <p className="text-xs text-gray-400 mt-1">Chats com alertas têm acesso completo ao conteúdo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}