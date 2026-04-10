import React from 'react';
import { Bell, CheckCheck, Inbox, MessageCircle, Star, Shield, ChevronRight, Heart, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';

const typeIcon: Record<string, React.ReactNode> = {
  proposta: <Inbox className="w-4 h-4 text-pink-500" />,
  mensagem: <MessageCircle className="w-4 h-4 text-teal-500" />,
  aceito: <PartyPopper className="w-4 h-4 text-amber-500" />,
  concluido: <Star className="w-4 h-4 text-green-500" />,
  seguranca: <Shield className="w-4 h-4 text-red-500" />,
  dica: <Heart className="w-4 h-4 text-pink-400" />,
};

const typeBg: Record<string, string> = {
  proposta: 'bg-pink-50',
  mensagem: 'bg-teal-50',
  aceito: 'bg-amber-50',
  concluido: 'bg-green-50',
  seguranca: 'bg-red-50',
  dica: 'bg-pink-50',
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

export default function PatientNotifications() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const notifs = notifications;

  const unread = notifs.filter(n => !n.read).length;

  const handleClick = (notif: { id: string; actionPath?: string }) => {
    markNotificationRead(notif.id);
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
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-pink-400" />
          </div>
          <h3 className="text-gray-800 mb-2">Nenhuma notificação</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Quando alguém enviar uma proposta ou você receber uma mensagem, você verá aqui.
          </p>
        </div>
      )}

      {/* Notification list */}
      {notifs.length > 0 && (
        <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden divide-y divide-gray-50">
          {notifs.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`flex items-start gap-4 p-4 transition-colors cursor-pointer hover:bg-gray-50
                ${!notif.read ? 'bg-pink-50/40' : ''}`}
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeBg[notif.type] ?? 'bg-gray-50'}`}>
                {typeIcon[notif.type] ?? <Bell className="w-4 h-4 text-gray-400" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-pink-500 rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-400">{timeAgo(notif.createdAt)}</span>
                  {notif.actionPath && (
                    <span className="flex items-center gap-1 text-xs text-pink-600 font-medium">
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
