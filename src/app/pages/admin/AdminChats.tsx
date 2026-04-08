import { useEffect, useState } from 'react';
import { ApiError, AdminChat, adminApi } from '../../lib/api';

export default function AdminChats() {
  const [chats, setChats] = useState<AdminChat[]>([]);
  const [error, setError] = useState('');
  const [closingId, setClosingId] = useState<string | null>(null);

  async function loadChats() {
    try {
      const data = await adminApi.listChats();
      setChats(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível carregar os chats.');
    }
  }

  useEffect(() => {
    void loadChats();
  }, []);

  async function closeChat(chatId: string) {
    setClosingId(chatId);
    try {
      await adminApi.closeChat(chatId, 'Encerrado por moderação administrativa.');
      await loadChats();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível encerrar o chat.');
    } finally {
      setClosingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Chats</h1>
        <p className="text-sm text-gray-500">Auditoria operacional de conversas.</p>
      </div>

      <div className="space-y-2">
        {chats.map((chat) => (
          <div key={chat.id} className="bg-white border border-pink-100 rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-800">Chat #{chat.id.slice(0, 8)}</p>
              <p className="text-xs text-gray-500">{chat.messageCount} mensagens • sonho #{chat.dreamId.slice(0, 8)}</p>
            </div>
            {chat.status === 'ativa' ? (
              <button
                onClick={() => closeChat(chat.id)}
                disabled={closingId === chat.id}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs"
              >
                Encerrar
              </button>
            ) : (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Encerrada</span>
            )}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
