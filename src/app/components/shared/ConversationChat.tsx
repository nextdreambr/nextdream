import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { MessageCircle, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiError, ChatMessage, Conversation, conversationsApi } from '../../lib/api';

interface ConversationChatProps {
  emptyActionTo: string;
  emptyActionLabel: string;
}

export function ConversationChat({ emptyActionTo, emptyActionLabel }: ConversationChatProps) {
  const { currentUser } = useApp();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [sending, setSending] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  useEffect(() => {
    const fromState = (location.state as { conversationId?: string } | null)?.conversationId;
    const fromQuery = new URLSearchParams(location.search).get('conversationId');
    const preferredId = fromState ?? fromQuery;

    let mounted = true;
    async function loadConversations() {
      setLoadingConversations(true);
      setError('');
      try {
        const data = await conversationsApi.listMine();
        if (!mounted) return;
        setConversations(data);
        if (preferredId && data.some((conversation) => conversation.id === preferredId)) {
          setSelectedId(preferredId);
        } else if (data.length > 0) {
          setSelectedId((prev) => prev ?? data[0].id);
        } else {
          setSelectedId(null);
        }
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar suas conversas.');
      } finally {
        if (mounted) setLoadingConversations(false);
      }
    }

    void loadConversations();
    return () => {
      mounted = false;
    };
  }, [location.search, location.state]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    const conversationId = selectedId;

    let mounted = true;

    async function loadMessages() {
      try {
        const data = await conversationsApi.listMessages(conversationId);
        if (mounted) setMessages(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar as mensagens.');
      }
    }

    void loadMessages();

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadMessages();
      }
    }, 5000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [selectedId]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!selectedId || !draft.trim() || sending || selectedConversation?.status === 'encerrada') return;

    setSending(true);
    setError('');
    try {
      const sent = await conversationsApi.sendMessage(selectedId, draft.trim());
      setMessages((current) => [...current, sent]);
      setDraft('');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  }

  if (loadingConversations) {
    return <div className="py-8 text-sm text-gray-500">Carregando conversas...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white border border-pink-100 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto bg-pink-50 rounded-2xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-pink-600" />
        </div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Nenhuma conversa ainda</h1>
        <p className="text-sm text-gray-500">Assim que uma proposta for aceita, o chat aparecerá aqui.</p>
        <Link to={emptyActionTo} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm">
          {emptyActionLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] gap-4">
      <aside className="bg-white border border-pink-100 rounded-2xl p-3 space-y-2 max-h-[70vh] overflow-auto">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => setSelectedId(conversation.id)}
            className={`w-full text-left rounded-xl px-3 py-2.5 border transition-colors ${
              conversation.id === selectedId
                ? 'border-pink-300 bg-pink-50'
                : 'border-transparent hover:border-pink-100 hover:bg-pink-50/50'
            }`}
          >
            <p className="text-xs text-gray-500">Conversa #{conversation.id.slice(0, 8)}</p>
            <p className="text-sm text-gray-700">Sonho #{conversation.dreamId.slice(0, 8)}</p>
            <p className={`text-xs mt-1 ${conversation.status === 'encerrada' ? 'text-gray-500' : 'text-green-700'}`}>
              {conversation.status === 'encerrada' ? 'Encerrada' : 'Ativa'}
            </p>
          </button>
        ))}
      </aside>

      <section className="bg-white border border-pink-100 rounded-2xl flex flex-col min-h-[70vh]">
        <header className="px-4 py-3 border-b border-pink-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Conversa</p>
            <h1 className="text-sm text-gray-800">{selectedConversation ? `#${selectedConversation.id.slice(0, 8)}` : 'Selecione uma conversa'}</h1>
          </div>
          {selectedConversation && (
            <span className={`text-xs px-2 py-1 rounded-full ${selectedConversation.status === 'encerrada' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
              {selectedConversation.status}
            </span>
          )}
        </header>

        <div className="flex-1 p-4 space-y-3 overflow-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">Sem mensagens ainda.</p>
          ) : (
            messages.map((message) => {
              const mine = message.senderId === currentUser?.id;
              return (
                <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    <p>{message.body}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'text-pink-100' : 'text-gray-400'}`}>
                      {new Date(message.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-pink-100 flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!selectedConversation || selectedConversation.status === 'encerrada'}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
            placeholder={selectedConversation?.status === 'encerrada' ? 'Conversa encerrada' : 'Digite sua mensagem'}
          />
          <button
            type="submit"
            disabled={sending || !selectedConversation || selectedConversation.status === 'encerrada' || !draft.trim()}
            className="px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white text-sm inline-flex items-center gap-1"
          >
            <Send className="w-4 h-4" /> Enviar
          </button>
        </form>
      </section>

      {error && (
        <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
