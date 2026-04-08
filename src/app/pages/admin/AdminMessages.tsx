import { useEffect, useState } from 'react';
import { ApiError, AdminContactMessage, adminApi } from '../../lib/api';

export default function AdminMessages() {
  const [messages, setMessages] = useState<AdminContactMessage[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await adminApi.listMessages();
        if (mounted) setMessages(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar mensagens de contato.');
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Mensagens de Contato</h1>
        <p className="text-sm text-gray-500">Inbox administrativo com dados reais.</p>
      </div>

      <div className="space-y-2">
        {messages.map((message) => (
          <article key={message.id} className="bg-white border border-pink-100 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <p className="text-sm text-gray-800">{message.subject}</p>
                <p className="text-xs text-gray-500">{message.name} • {message.email}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-700">{message.status}</span>
            </div>
            <p className="text-sm text-gray-600">{message.body}</p>
          </article>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
