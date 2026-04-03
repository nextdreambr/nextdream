import { useState, ElementType, useEffect } from 'react';
import {
  Search, Star, Clock, CheckCircle, XCircle, Trash2,
  ExternalLink, User, Calendar, Gift, Timer,
  AlertTriangle, Check, X, ChevronRight, Flag,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { mockProposals, mockDreams, mockReports, type Proposal, type ProposalStatus } from '../../data/mockData';
import { ProposalStatusBadge, DreamStatusBadge } from '../../components/shared/StatusBadge';

// ─── Action map per status ────────────────────────────────────────────────────

interface StatusAction {
  status: ProposalStatus;
  label: string;
  icon: ElementType;
  color: string;
}

const STATUS_ACTIONS: Record<ProposalStatus, StatusAction[]> = {
  enviada: [
    { status: 'em-analise', label: 'Marcar em análise',  icon: Clock,       color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
    { status: 'aceita',     label: 'Aceitar proposta',   icon: CheckCircle, color: 'bg-green-50  text-green-700  border-green-200  hover:bg-green-100'  },
    { status: 'recusada',   label: 'Recusar proposta',   icon: XCircle,     color: 'bg-red-50    text-red-700    border-red-200    hover:bg-red-100'    },
  ],
  'em-analise': [
    { status: 'aceita',   label: 'Aceitar proposta',     icon: CheckCircle, color: 'bg-green-50  text-green-700  border-green-200  hover:bg-green-100'  },
    { status: 'recusada', label: 'Recusar proposta',     icon: XCircle,     color: 'bg-red-50    text-red-700    border-red-200    hover:bg-red-100'    },
    { status: 'expirada', label: 'Marcar como expirada', icon: Timer,       color: 'bg-gray-50   text-gray-600   border-gray-200   hover:bg-gray-100'   },
  ],
  aceita: [
    { status: 'recusada', label: 'Revogar aceitação',    icon: XCircle,     color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  ],
  recusada: [
    { status: 'em-analise', label: 'Reabrir para análise', icon: Clock,     color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
  ],
  expirada: [
    { status: 'em-analise', label: 'Reabrir para análise', icon: Clock,     color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
  ],
};

const STATUS_FILTERS: { key: 'todas' | ProposalStatus; label: string }[] = [
  { key: 'todas',       label: 'Todas'      },
  { key: 'enviada',     label: 'Enviada'    },
  { key: 'em-analise',  label: 'Em análise' },
  { key: 'aceita',      label: 'Aceita'     },
  { key: 'recusada',    label: 'Recusada'   },
  { key: 'expirada',    label: 'Expirada'   },
];

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  label, proposal, danger, onConfirm, onClose,
}: {
  label: string; proposal: Proposal; danger?: boolean;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-100' : 'bg-orange-100'}`}>
            {danger ? <Trash2 className="w-4 h-4 text-red-600" /> : <AlertTriangle className="w-4 h-4 text-orange-600" />}
          </div>
          <div>
            <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{label}?</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              {proposal.supporterName} → "{proposal.dreamTitle}"
            </p>
          </div>
        </div>
        {danger && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            Esta ação não pode ser desfeita.
          </p>
        )}
        <div className="flex gap-2">
          <button onClick={onConfirm}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm transition-colors
              ${danger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
            <Check className="w-4 h-4" /> Confirmar
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Proposal Modal ───────────────────────────────────────────────────────────

function ProposalModal({
  proposal,
  onClose,
  onStatusChange,
  onRemove,
}: {
  proposal: Proposal;
  onClose: () => void;
  onStatusChange: (id: string, s: ProposalStatus) => void;
  onRemove: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [pending, setPending] = useState<{ label: string; danger?: boolean; targetStatus?: ProposalStatus } | null>(null);
  const [toast, setToast] = useState('');

  const dream   = mockDreams.find(d => d.id === proposal.dreamId);
  const actions = STATUS_ACTIONS[proposal.status] ?? [];

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const confirm = () => {
    if (!pending) return;
    if (pending.danger) {
      onRemove(proposal.id);
      onClose();
    } else if (pending.targetStatus) {
      onStatusChange(proposal.id, pending.targetStatus);
      showToast('Status atualizado.');
    }
    setPending(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Toast */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-green-600 text-white text-xs px-4 py-2 rounded-xl shadow-lg pointer-events-none whitespace-nowrap">
            <Check className="w-3.5 h-3.5" /> {toast}
          </div>
        )}

        {/* Confirm sub-modal */}
        {pending && (
          <ConfirmModal
            label={pending.label}
            proposal={proposal}
            danger={pending.danger}
            onConfirm={confirm}
            onClose={() => setPending(null)}
          />
        )}

        {/* ── Header ── */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0" style={{ fontWeight: 700 }}>
            {proposal.supporterName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-gray-800 leading-snug" style={{ fontWeight: 700 }}>{proposal.supporterName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Apoiador · Enviada em {fmt(proposal.createdAt)}</p>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <ProposalStatusBadge status={proposal.status} size="sm" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">

            {/* Linked dream */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>Sonho vinculado</p>
              <button
                onClick={() => { onClose(); navigate('/admin/sonhos'); }}
                className="w-full flex items-center gap-3 p-3 bg-pink-50 border border-pink-200 rounded-xl hover:bg-pink-100 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-200 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-pink-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-pink-800 truncate" style={{ fontWeight: 500 }}>{proposal.dreamTitle}</p>
                  {dream && (
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-pink-600">{dream.patientName}</span>
                      <span className="text-pink-300">·</span>
                      <DreamStatusBadge status={dream.status} size="sm" />
                    </div>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-pink-400 group-hover:text-pink-600 transition-colors shrink-0" />
              </button>
            </div>

            {/* Message */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>Mensagem</p>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">{proposal.message}</p>
            </div>

            {/* Details grid */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>Detalhes</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Gift className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">O que oferece</p>
                    <p className="text-sm text-gray-700 mt-0.5">{proposal.offering}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Disponibilidade</p>
                    <p className="text-sm text-gray-700 mt-0.5">{proposal.availability}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Timer className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Duração</p>
                    <p className="text-sm text-gray-700 mt-0.5">{proposal.duration}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supporter */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>Apoiador</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0" style={{ fontWeight: 700 }}>
                  {proposal.supporterName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{proposal.supporterName}</p>
                  <p className="text-xs text-gray-400">ID: {proposal.supporterId}</p>
                </div>
                <button
                  onClick={() => { onClose(); navigate('/admin/usuarios'); }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-600 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors shrink-0"
                >
                  <User className="w-3 h-3" /> Ver perfil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">

            {actions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.status}
                  onClick={() => setPending({ label: action.label, targetStatus: action.status })}
                  className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-sm transition-colors ${action.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              );
            })}

            <div className="flex-1" />

            <button
              onClick={() => setPending({ label: 'Remover proposta', danger: true })}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-red-200 text-red-600 bg-white rounded-xl text-sm hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </button>

            {/* Linked reports */}
            {(() => {
              const linked = mockReports.filter(r => r.refType === 'proposta' && r.refId === proposal.id);
              if (linked.length === 0) return null;
              return (
                <button
                  onClick={() => { onClose(); navigate('/admin/denuncias', { state: { openId: linked[0].id } }); }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm hover:bg-red-100 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  {linked.length} {linked.length === 1 ? 'denúncia' : 'denúncias'} vinculada{linked.length > 1 ? 's' : ''}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminProposals() {
  const [proposals, setProposals] = useState([...mockProposals]);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | ProposalStatus>('todas');
  const [openId, setOpenId]       = useState<string | null>(null);
  const location = useLocation();

  // Auto-open item when navigating from AdminReports
  useEffect(() => {
    const incoming = (location.state as { openId?: string } | null)?.openId;
    if (incoming) {
      setStatusFilter('todas');
      setOpenId(incoming);
    }
  }, []);

  const filtered = proposals.filter(p => {
    if (statusFilter !== 'todas' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.dreamTitle.toLowerCase().includes(q) ||
        p.supporterName.toLowerCase().includes(q) ||
        p.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openProposal = proposals.find(p => p.id === openId) ?? null;

  const handleStatusChange = (id: string, status: ProposalStatus) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleRemove = (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
    setOpenId(null);
  };

  const counts: Record<string, number> = {
    todas:        proposals.length,
    enviada:      proposals.filter(p => p.status === 'enviada').length,
    'em-analise': proposals.filter(p => p.status === 'em-analise').length,
    aceita:       proposals.filter(p => p.status === 'aceita').length,
    recusada:     proposals.filter(p => p.status === 'recusada').length,
    expirada:     proposals.filter(p => p.status === 'expirada').length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Modal */}
      {openProposal && (
        <ProposalModal
          proposal={openProposal}
          onClose={() => setOpenId(null)}
          onStatusChange={handleStatusChange}
          onRemove={handleRemove}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Propostas</h1>
        <p className="text-gray-500 text-sm">{proposals.length} propostas no sistema</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por sonho, apoiador ou mensagem..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Status chips */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all
              ${statusFilter === f.key
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            {f.label}
            <span className={`rounded-full px-1.5 py-0.5 ${statusFilter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Apoiador', 'Sonho', 'O que oferece', 'Status', 'Data', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs text-gray-500" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    Nenhuma proposta encontrada.
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => setOpenId(p.id)}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 text-sm shrink-0" style={{ fontWeight: 700 }}>
                        {p.supporterName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{p.supporterName}</p>
                          {mockReports.some(r => r.refType === 'proposta' && r.refId === p.id) && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 shrink-0">
                              <Flag className="w-2.5 h-2.5" />
                              {mockReports.filter(r => r.refType === 'proposta' && r.refId === p.id).length}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-40">{p.dreamTitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-pink-400 shrink-0" />
                      <p className="text-sm text-gray-600 max-w-44 truncate">{p.dreamTitle}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-500 max-w-36 truncate">{p.offering}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <ProposalStatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {fmt(p.createdAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-gray-400">Ver detalhes</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            {filtered.length} de {proposals.length} propostas
          </div>
        )}
      </div>
    </div>
  );
}