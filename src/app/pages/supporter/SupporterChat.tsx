import { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, MoreVertical, Flag, PhoneOff } from 'lucide-react';
import { mockConversations, mockMessages, ChatMessage } from '../../data/mockData';

const BLOCKED = ['pix', 'doação', 'doacao', 'transferência', 'transferencia', 'pagamento', 'dinheiro', 'r$'];
const quickReplies = ['Que dia funciona?', 'Qual horário prefere?', 'Posso ir de carro!', 'Que ótimo! 🎉', 'Alguma dúvida?'];

export default function SupporterChat() {
  const [activeConv, setActiveConv] = useState(mockConversations[0].id);
  const [message, setMessage] = useState('');
  const [warning, setWarning] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages.filter(m => m.conversationId === 'c1'));
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const conv = mockConversations.find(c => c.id === activeConv);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMsgChange = (val: string) => {
    if (BLOCKED.some(w => val.toLowerCase().includes(w))) {
      setWarning('O NextDream não permite pedidos de dinheiro, PIX ou doações. 🚫');
    } else {
      setWarning('');
    }
    setMessage(val);
  };

  const handleSend = () => {
    if (!message.trim() || warning) return;
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      conversationId: activeConv,
      senderId: 's1',
      senderName: 'Fernanda Lima',
      senderRole: 'apoiador',
      text: message,
      timestamp: new Date().toLocaleString('pt-BR'),
    };
    setMessages(prev => [...prev, newMsg]);
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm">
      {/* Conversations list */}
      <div className="w-64 border-r border-teal-100 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-teal-100">
          <h2 className="text-gray-800 text-sm">Conversas</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockConversations.filter(c => c.supporterId === 's1' || c.supporterId === 's2').slice(0, 2).map(c => (
            <button key={c.id} onClick={() => setActiveConv(c.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-teal-50/50 transition-colors
                ${activeConv === c.id ? 'bg-teal-50 border-l-2 border-l-teal-500' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-800">{c.patientName}</p>
              </div>
              <p className="text-xs text-gray-400 line-clamp-1">{c.dreamTitle}</p>
              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{c.lastMessage}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {conv && (
          <div className="px-5 py-3.5 border-b border-teal-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 font-semibold text-sm">
                {conv.patientName[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{conv.patientName}</p>
                <p className="text-xs text-gray-500">Re: {conv.dreamTitle}</p>
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-teal-50 rounded-xl">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden w-44">
                  <button onClick={() => { setShowReport(true); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                    <Flag className="w-4 h-4" /> Denunciar
                  </button>
                  <button className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                    <PhoneOff className="w-4 h-4" /> Encerrar conversa
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map(msg => {
            if (msg.senderRole === 'sistema') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-2 text-xs text-teal-600 max-w-xs text-center">{msg.text}</div>
                </div>
              );
            }
            const isMe = msg.senderId === 's1' || msg.senderId === 's2';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${isMe ? 'bg-teal-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEnd} />
        </div>

        {warning && (
          <div className="mx-5 mb-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">{warning}</p>
          </div>
        )}

        <div className="px-5 py-2 flex gap-2 overflow-x-auto border-t border-teal-50">
          {quickReplies.map(r => (
            <button key={r} onClick={() => setMessage(r)}
              className="shrink-0 px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-full text-xs text-teal-700 hover:bg-teal-100 transition-colors">{r}</button>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-teal-100">
          <div className="flex items-end gap-3">
            <div className="flex-1 bg-teal-50 border border-teal-100 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-teal-300">
              <textarea
                value={message}
                onChange={e => handleMsgChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Digite sua mensagem..."
                rows={1}
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none"
              />
            </div>
            <button onClick={handleSend} disabled={!message.trim() || !!warning}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0
                ${message.trim() && !warning ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">🔒 Chat seguro • Sem dinheiro, PIX ou doações</p>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-gray-800 mb-4">Denunciar</h3>
            <div className="space-y-2 mb-4">
              {['Pedido de dinheiro', 'Assédio', 'Comportamento suspeito', 'Linguagem ofensiva', 'Outro'].map(r => (
                <button key={r} className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors">{r}</button>
              ))}
            </div>
            <button onClick={() => setShowReport(false)} className="w-full border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
