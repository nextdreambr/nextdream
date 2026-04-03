import React from 'react';
import { Bell, CheckCheck, Send, MessageCircle, Star, Shield, ChevronRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

interface SupporterNotif {
  id: string;
  type: 'proposta_aceita' | 'mensagem' | 'proposta_recusada' | 'seguranca' | 'dica';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionPath?: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  proposta_aceita: <Star className="w-4 h-4 text-amber-500" />,
  mensagem: <MessageCircle className="w-4 h-4 text-teal-500" />,
  proposta_recusada: <Send className="w-4 h-4 text-gray-400" />,
  seguranca: <Shield className="w-4 h-4 text-red-500" />,
  dica: <Heart className="w-4 h-4 text-pink-500" />,
};

const typeBg: Record<string, string> = {
  proposta_aceita: 'bg-amber-50',
  mensagem: 'bg-teal-50',
  proposta_recusada: 'bg-gray-50',
  seguranca: 'bg-red-50',
  dica: 'bg-pink-50',
};

const mockNotifications: SupporterNotif[] = [
  {
    id: 'sn1',
    type: 'proposta_aceita',
    title: 'Proposta aceita! 🎉',
    message: 'Ana Souza aceitou sua proposta para "Ver o nascer do sol na praia uma última vez". O chat foi liberado!',
    read: false,
    createdAt: '2026-02-20 14:30',
    actionPath: '/apoiador/chat',
  },
  {
    id: 'sn2',
    type: 'mensagem',
    title: 'Nova mensagem',
    message: 'Ana Souza enviou uma mensagem no chat de "Ver o nascer do sol na praia".',
    read: false,
    createdAt: '2026-02-20 15:00',
    actionPath: '/apoiador/chat',
  },
  {
    id: 'sn3',
    type: 'dica',
    title: 'Dica da comunidade',
    message: 'Lembre-se: combine todos os detalhes pelo chat antes do encontro. Confirme local, horário e necessidades especiais.',
    read: true,
    createdAt: '2026-02-19 10:00',
  },
  {
    id: 'sn4',
    type: 'proposta_recusada',
    title: 'Proposta não selecionada',
    message: 'Maria Jesus escolheu outro apoiador para "Ouvir histórias de quem viajou pelo mundo". Continue explorando outros sonhos!',
    read: true,
    createdAt: '2026-02-18 08:30',
    actionPath: '/apoiador/explorar',
  },
  {
    id: 'sn5',
    type: 'seguranca',
    title: 'Lembrete de segurança',
    message: 'Nunca solicite informações pessoais como endereço completo, CPF ou dados financeiros fora da plataforma.',
    read: true,
    createdAt: '2026-02-15 09:00',
  },
];

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

export default function SupporterNotifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<SupporterNotif[]>(mockNotifications);

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClick = (notif: SupporterNotif) => {
    markRead(notif.id);
    if (notif.actionPath) navigate(notif.actionPath);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Notificações</h1>
          <p className="text-gray-500 text-sm">
            {unread > 0 ? `${unread} nova${unread > 1 ? 's' : ''}` : 'Tudo em dia!'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-teal-400" />
          </div>
          <h3 className="text-gray-800 mb-2">Nenhuma notificação</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Quando alguém aceitar uma proposta ou enviar uma mensagem, você verá aqui.
          </p>
        </div>
      )}

      {/* Notification list */}
      {notifs.length > 0 && (
        <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden divide-y divide-gray-50">
          {notifs.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`flex items-start gap-4 p-4 transition-colors cursor-pointer hover:bg-gray-50
                ${!notif.read ? 'bg-teal-50/40' : ''}`}
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeBg[notif.type]}`}>
                {typeIcon[notif.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-teal-500 rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-400">{timeAgo(notif.createdAt)}</span>
                  {notif.actionPath && (
                    <span className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                      Ver <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info card */}
      <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 flex items-start gap-3">
        <Shield className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
        <p className="text-xs text-pink-700 leading-relaxed">
          Nunca compartilhe dados pessoais, endereço completo ou informações financeiras fora da plataforma. Em caso de problema, use o botão de denúncia no chat.
        </p>
      </div>
    </div>
  );
}