import { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, MoreVertical, Flag, PhoneOff, Star, CheckCircle } from 'lucide-react';
import { mockConversations, mockMessages, ChatMessage } from '../../data/mockData';
import { useNavigate } from 'react-router';

const BLOCKED_WORDS = ['pix', 'doação', 'doacao', 'transferência', 'transferencia', 'pagamento', 'dinheiro', 'r$', 'vaquinha'];

const quickReplies = [
  'Que dia funciona?',
  'Prefere vídeo ou presencial?',
  'Qual o melhor horário?',
  'Alguma restrição importante?',
  'Tudo combinado! 🎉',
];

export default function PatientChat() {
  const [activeConv, setActiveConv] = useState(mockConversations[0].id);
  const [message, setMessage] = useState('');
  const [warning, setWarning] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages.filter(m => m.conversationId === 'c1'));
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [dreamCompleted, setDreamCompleted] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const conv = mockConversations.find(c => c.id === activeConv);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageChange = (val: string) => {
    const lower = val.toLowerCase();
    if (BLOCKED_WORDS.some(w => lower.includes(w))) {
      setWarning('O NextDream não permite pedidos de dinheiro, PIX ou doações. Ajuste a mensagem. 🚫');
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
      senderId: 'p1',
      senderName: 'Ana S.',
      senderRole: 'paciente',
      text: message,
      timestamp: new Date().toLocaleString('pt-BR'),
    };
    setMessages(prev => [...prev, newMsg]);
    setMessage('');
  };

  const handleCompleteDream = () => {
    setDreamCompleted(true);
    const sysMsg: ChatMessage = {
      id: `sys${Date.now()}`,
      conversationId: activeConv,
      senderId: 'sistema',
      senderName: 'NextDream',
      senderRole: 'sistema',
      text: '🎉 Sonho marcado como Concluído! Parabéns pela conexão.',
      timestamp: new Date().toLocaleString('pt-BR'),
    };
    setMessages(prev => [...prev, sysMsg]);
    // Navigate to completion/celebration page after brief delay
    setTimeout(() => {
      navigate('/paciente/sonhos/d1/concluido');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex bg-white rounded-2xl border border-pink-100 overflow-hidden shadow-sm">
      {/* Sidebar - conversations list */}
      <div className="w-64 border-r border-pink-100 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-pink-100">
          <h2 className="text-gray-800 text-sm">Conversas</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockConversations.filter(c => c.patientId === 'p1').map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-pink-50/50 transition-colors
                ${activeConv === conv.id ? 'bg-pink-50 border-l-2 border-l-pink-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-800">{conv.supporterName}</p>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-pink-600 text-white rounded-full text-xs flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 line-clamp-1">{conv.dreamTitle}</p>
              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{conv.lastMessage}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        {conv && (
          <div className="px-5 py-3.5 border-b border-pink-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                {conv.supporterName[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{conv.supporterName}</p>
                <p className="text-xs text-gray-500">Re: {conv.dreamTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!dreamCompleted && (
                <button
                  onClick={handleCompleteDream}
                  className="flex items-center gap-1.5 text-xs text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Marcar como concluído
                </button>
              )}
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-pink-50 rounded-xl transition-colors">
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
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map(msg => {
            if (msg.senderRole === 'sistema') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-pink-50 border border-pink-100 rounded-xl px-4 py-2 text-xs text-pink-600 max-w-xs text-center">
                    {msg.text}
                  </div>
                </div>
              );
            }
            const isMe = msg.senderId === 'p1';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs sm:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${isMe
                      ? 'bg-pink-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                    {msg.text}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-1">{msg.timestamp.split(' ')[1] || msg.timestamp}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEnd} />
        </div>

        {/* Warning banner */}
        {warning && (
          <div className="mx-5 mb-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">{warning}</p>
          </div>
        )}

        {/* Dream completed banner */}
        {dreamCompleted && (
          <div className="mx-5 mb-2 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700 font-medium">Sonho marcado como concluído! Que momento especial. 🎉</p>
          </div>
        )}

        {/* Quick replies */}
        <div className="px-5 py-2 flex gap-2 overflow-x-auto border-t border-pink-50">
          {quickReplies.map(reply => (
            <button
              key={reply}
              onClick={() => setMessage(reply)}
              className="shrink-0 px-3 py-1.5 bg-pink-50 border border-pink-100 rounded-full text-xs text-pink-700 hover:bg-pink-100 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-pink-100">
          <div className="flex items-end gap-3">
            <div className="flex-1 bg-pink-50 border border-pink-100 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-pink-300 focus-within:border-pink-300">
              <textarea
                value={message}
                onChange={e => handleMessageChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Digite sua mensagem..."
                rows={1}
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!message.trim() || !!warning}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0
                ${message.trim() && !warning ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            🔒 Chat seguro • Sem dinheiro, PIX ou doações
          </p>
        </div>
      </div>

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-gray-800 mb-4">Denunciar conversa</h3>
            <div className="space-y-2 mb-4">
              {['Pedido de dinheiro ou PIX', 'Assédio ou pressão', 'Comportamento suspeito', 'Linguagem ofensiva', 'Outro'].map(reason => (
                <button key={reason} className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors">
                  {reason}
                </button>
              ))}
            </div>
            <button onClick={() => setShowReport(false)} className="w-full border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
