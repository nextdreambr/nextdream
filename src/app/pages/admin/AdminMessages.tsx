import { useState } from 'react';
import { Search, Mail, Briefcase, Check, Archive, ChevronRight, X, Reply } from 'lucide-react';
import { mockContacts, type ContactMessage } from '../../data/mockData';

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([...mockContacts]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todas' | 'contato' | 'parceria'>('todas');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'nova' | 'lida' | 'respondida' | 'arquivada'>('todas');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = messages.filter(m => {
    if (typeFilter !== 'todas' && m.type !== typeFilter) return false;
    if (statusFilter !== 'todas' && m.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q) ||
        (m.company && m.company.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const selectedMsg = messages.find(m => m.id === selectedId);

  const updateStatus = (id: string, newStatus: ContactMessage['status']) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
  };

  const StatusBadge = ({ status }: { status: ContactMessage['status'] }) => {
    const styles = {
      'nova': 'bg-blue-100 text-blue-700 border-blue-200',
      'lida': 'bg-gray-100 text-gray-700 border-gray-200',
      'respondida': 'bg-green-100 text-green-700 border-green-200',
      'arquivada': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    
    const labels = {
      'nova': 'Nova',
      'lida': 'Lida',
      'respondida': 'Respondida',
      'arquivada': 'Arquivada',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex h-[calc(100vh-120px)] gap-4">
      {/* Left side: List */}
      <div className={`flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${selectedId ? 'w-1/3 hidden md:flex' : 'w-full'}`}>
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-4">
          <div>
            <h1 className="text-gray-800 font-bold text-lg">Caixa de Entrada</h1>
            <p className="text-gray-500 text-xs mt-0.5">Gerencie contatos e parcerias</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar mensagens..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-pink-300"
            >
              <option value="todas">Todos Tipos</option>
              <option value="contato">Contatos</option>
              <option value="parceria">Parcerias</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-pink-300"
            >
              <option value="todas">Status</option>
              <option value="nova">Novas</option>
              <option value="lida">Lidas</option>
              <option value="respondida">Respondidas</option>
              <option value="arquivada">Arquivadas</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Nenhuma mensagem encontrada.
            </div>
          ) : (
            filtered.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedId(m.id);
                  if (m.status === 'nova') updateStatus(m.id, 'lida');
                }}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${selectedId === m.id ? 'bg-pink-50/50 hover:bg-pink-50/80 border-l-2 border-pink-500' : 'border-l-2 border-transparent'}`}
              >
                <div className={`mt-1 p-2 rounded-lg shrink-0 ${m.type === 'parceria' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  {m.type === 'parceria' ? <Briefcase className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm truncate pr-2 ${m.status === 'nova' ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {m.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate mb-1.5 ${m.status === 'nova' ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                    {m.subject}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400 truncate max-w-[80%]">
                      {m.message}
                    </p>
                    {m.status === 'nova' && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right side: Detail view */}
      {selectedId && selectedMsg ? (
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedId(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="flex gap-2">
                {selectedMsg.status !== 'respondida' && (
                  <button 
                    onClick={() => updateStatus(selectedMsg.id, 'respondida')}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Marcar Respondida
                  </button>
                )}
                {selectedMsg.status !== 'arquivada' && (
                  <button 
                    onClick={() => {
                      updateStatus(selectedMsg.id, 'arquivada');
                      setSelectedId(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" /> Arquivar
                  </button>
                )}
              </div>
            </div>
            <button 
              onClick={() => setSelectedId(null)}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <StatusBadge status={selectedMsg.status} />
                <span className="text-xs text-gray-400">
                  {new Date(selectedMsg.createdAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{selectedMsg.subject}</h2>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{selectedMsg.name}</span>
                    <span className="text-sm text-gray-500">&lt;{selectedMsg.email}&gt;</span>
                  </div>
                  {selectedMsg.company && (
                    <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      {selectedMsg.company}
                    </p>
                  )}
                  {selectedMsg.phone && (
                    <p className="text-sm text-gray-600 mt-1">
                      Telefone: {selectedMsg.phone}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2 uppercase tracking-wide font-medium">
                    Tipo: {selectedMsg.type === 'parceria' ? 'Proposta de Parceria' : 'Contato de Suporte'}
                  </p>
                </div>
                <a 
                  href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`}
                  className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Responder
                </a>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700">
                <p className="whitespace-pre-wrap leading-relaxed">{selectedMsg.message}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 bg-gray-50/50 border border-gray-200 rounded-2xl items-center justify-center border-dashed">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-500 font-medium">Nenhuma mensagem selecionada</h3>
            <p className="text-gray-400 text-sm mt-1">Selecione uma mensagem ao lado para ler os detalhes</p>
          </div>
        </div>
      )}
    </div>
  );
}