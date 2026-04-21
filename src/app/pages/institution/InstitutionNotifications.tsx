import React from 'react';
import { Bell, Building2, CheckCheck, ChevronRight, Inbox, MessageCircle, PartyPopper, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';

const typeIcon: Record<string, React.ReactNode> = {
  proposta: <Inbox className="w-4 h-4 text-indigo-500" />,
  mensagem: <MessageCircle className="w-4 h-4 text-teal-500" />,
  aceito: <PartyPopper className="w-4 h-4 text-amber-500" />,
  concluido: <Star className="w-4 h-4 text-green-500" />,
  seguranca: <Shield className="w-4 h-4 text-red-500" />,
};

const typeBg: Record<string, string> = {
  proposta: 'bg-indigo-50',
  mensagem: 'bg-teal-50',
  aceito: 'bg-amber-50',
  concluido: 'bg-green-50',
  seguranca: 'bg-red-50',
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return date.toLocaleDateString('pt-BR');
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return date.toLocaleDateString('pt-BR');
}

export default function InstitutionNotifications() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const unread = notifications.filter((notification) => !notification.read).length;

  const handleClick = (notification: { id: string; actionPath?: string }) => {
    markNotificationRead(notification.id);
    if (notification.actionPath) {
      navigate(notification.actionPath);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
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
            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-gray-800 mb-2">Nenhuma notificação</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Alertas de propostas, conversas e aprovações da operação institucional aparecerão aqui.
          </p>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-indigo-100 overflow-hidden divide-y divide-gray-50">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`flex w-full items-start gap-4 border-0 bg-transparent p-4 text-left transition-colors cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50/40' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeBg[notification.type] ?? 'bg-gray-50'}`}>
                {typeIcon[notification.type] ?? <Bell className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                    {notification.title}
                  </p>
                  {!notification.read && <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-400">{timeAgo(notification.createdAt)}</span>
                  {notification.actionPath && (
                    <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                      Ver <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <Building2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-700 leading-relaxed">
          Centralize o contato com apoiadores dentro da plataforma. Isso mantém histórico, moderação e rastreabilidade da atuação institucional.
        </p>
      </div>
    </div>
  );
}
