import { useState, ElementType, useEffect } from 'react';
import {
  Search, AlertTriangle, Pause, Play, Trash2, Flag,
  CheckCircle, X, User, Check, MapPin, Tag, ChevronRight,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { mockDreams, mockReports, type Dream, type DreamStatus } from '../../data/mockData';
import { DreamStatusBadge, UrgencyBadge } from '../../components/shared/StatusBadge';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  'Experiência ao ar livre': '🌅',
  'Arte e Música':           '🎵',
  'Culinária':               '🍳',
  'Literatura e Cultura':    '📚',
  'Conversa e Companhia':    '💬',
  'Esporte e Lazer':         '⚽',
};
const catEmoji = (c: string) => CATEGORY_EMOJI[c] ?? '✨';

const FORMAT_LABEL: Record<string, string> = {
  remoto: 'Remoto', presencial: 'Presencial', ambos: 'Remoto / Presencial',
};
const PRIVACY_LABEL: Record<string, string> = {
  publico: 'Público', verificados: 'Verificados', anonimo: 'Anônimo',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Action map per status ────────────────────────────────────────────────────

interface DreamAction {
  key: string;
  label: string;
  icon: ElementType;
  color: string;
  nextStatus?: DreamStatus;
}

const DREAM_ACTIONS: Record<DreamStatus, DreamAction[]> = {
  rascunho:     [
    { key: 'aprovar',  label: 'Aprovar e publicar',       icon: CheckCircle, color: 'bg-green-50  text-green-700  border-green-200  hover:bg-green-100',  nextStatus: 'publicado' },
    { key: 'pausar',   label: 'Pausar',                   icon: Pause,       color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100', nextStatus: 'pausado'   },
  ],
  publicado:    [
    { key: 'pausar',   label: 'Pausar publicação',        icon: Pause,       color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100', nextStatus: 'pausado'   },
    { key: 'cancelar', label: 'Cancelar sonho',           icon: X,           color: 'bg-red-50    text-red-700    border-red-200    hover:bg-red-100',    nextStatus: 'cancelado' },
  ],
  'em-conversa':[
    { key: 'pausar',   label: 'Pausar',                   icon: Pause,       color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100', nextStatus: 'pausado'   },
    { key: 'cancelar', label: 'Cancelar sonho',           icon: X,           color: 'bg-red-50    text-red-700    border-red-200    hover:bg-red-100',    nextStatus: 'cancelado' },
  ],
  realizando:   [
    { key: 'concluir', label: 'Marcar como concluído',    icon: CheckCircle, color: 'bg-green-50  text-green-700  border-green-200  hover:bg-green-100',  nextStatus: 'concluido' },
    { key: 'pausar',   label: 'Pausar',                   icon: Pause,       color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100', nextStatus: 'pausado'   },
    { key: 'cancelar', label: 'Cancelar sonho',           icon: X,           color: 'bg-red-50    text-red-700    border-red-200    hover:bg-red-100',    nextStatus: 'cancelado' },
  ],
  concluido:    [
    { key: 'reativar', label: 'Reativar como publicado',  icon: Play,        color: 'bg-blue-50   text-blue-700   border-blue-200   hover:bg-blue-100',   nextStatus: 'publicado' },
  ],
  pausado:      [
    { key: 'reativar', label: 'Reativar publicação',      icon: Play,        color: 'bg-green-50  text-green-700  border-green-200  hover:bg-green-100',  nextStatus: 'publicado' },
    { key: 'cancelar', label: 'Cancelar sonho',           icon: X,           color: 'bg-red-50    text-red-700    border-red-200    hover:bg-red-100',    nextStatus: 'cancelado' },
  ],
  cancelado:    [
    { key: 'reativar', label: 'Reativar como publicado',  icon: Play,        color: 'bg-green-50  text-green-700  border-green-200  hover:bg-green-100',  nextStatus: 'publicado' },
  ],
};

const STATUS_FILTERS: { key: 'todos' | DreamStatus; label: string }[] = [
  { key: 'todos',        label: 'Todos'        },
  { key: 'publicado',    label: 'Publicado'    },
  { key: 'em-conversa',  label: 'Em conversa'  },
  { key: 'realizando',   label: 'Realizando'   },
  { key: 'concluido',    label: 'Concluído'    },
  { key: 'pausado',      label: 'Pausado'      },
  { key: 'cancelado',    label: 'Cancelado'    },
];

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  label, dream, danger, onConfirm, onClose,
}: {
  label: string; dream: Dream; danger?: boolean;
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
              "{dream.title}" · {dream.patientName}
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

// ─── Dream Modal ──────────────────────────────────────────────────────────────

function DreamModal({
  dream,
  onClose,
  onStatusChange,
  onRemove,
}: {
  dream: Dream;
  onClose: () => void;
  onStatusChange: (id: string, s: DreamStatus) => void;
  onRemove: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [pending, setPending] = useState<{ key: string; label: string; danger?: boolean; nextStatus?: DreamStatus } | null>(null);
  const [toast, setToast] = useState('');
  const [flagged, setFlagged] = useState(false);

  const actions = DREAM_ACTIONS[dream.status] ?? [];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const confirm = () => {
    if (!pending) return;
    if (pending.key === 'remover') {
      onRemove(dream.id);
      onClose();
    } else if (pending.key === 'sinalizar') {
      setFlagged(true);
      showToast('Sonho sinalizado para revisão.');
    } else if (pending.nextStatus) {
      onStatusChange(dream.id, pending.nextStatus);
      showToast('Status atualizado.');
    }
    setPending(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      {/* Backdrop click closes */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
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
            dream={dream}
            danger={pending.danger}
            onConfirm={confirm}
            onClose={() => setPending(null)}
          />
        )}

        {/* ── Header ── */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl shrink-0">
            {catEmoji(dream.category)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-gray-800 leading-snug" style={{ fontWeight: 700 }}>{dream.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{dream.category}</p>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <DreamStatusBadge status={dream.status} size="sm" />
              <UrgencyBadge urgency={dream.urgency} />
              <span className="text-xs text-gray-400">Criado em {fmt(dream.createdAt)}</span>
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

            {/* Patient */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 shrink-0" style={{ fontWeight: 700 }}>
                {dream.patientName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{dream.patientName}</p>
                {dream.patientCity && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">{dream.patientCity}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => { onClose(); navigate('/admin/usuarios'); }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-600 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors shrink-0"
              >
                <User className="w-3 h-3" /> Ver perfil
              </button>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>Descrição</p>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">{dream.description}</p>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Formato',     value: FORMAT_LABEL[dream.format]    },
                { label: 'Privacidade', value: PRIVACY_LABEL[dream.privacy]  },
                { label: 'Propostas',   value: `${dream.proposalsCount} recebida${dream.proposalsCount !== 1 ? 's' : ''}` },
                { label: 'Idioma',      value: dream.language ?? 'Português' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm text-gray-700 mt-0.5" style={{ fontWeight: 500 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            {dream.tags.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {dream.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg text-xs">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Restrictions */}
            {dream.restrictions && (
              <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-orange-600 mb-0.5" style={{ fontWeight: 600 }}>Restrições</p>
                  <p className="text-sm text-orange-700">{dream.restrictions}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">

            {/* Status actions */}
            {actions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  onClick={() => setPending({ key: action.key, label: action.label, nextStatus: action.nextStatus })}
                  className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-sm transition-colors ${action.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              );
            })}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Flag */}
            <button
              onClick={() => setPending({ key: 'sinalizar', label: 'Sinalizar para revisão' })}
              disabled={flagged}
              className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-sm transition-colors
                ${flagged
                  ? 'bg-orange-50 text-orange-400 border-orange-200 cursor-default'
                  : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'}`}
            >
              <Flag className="w-3.5 h-3.5" />
              {flagged ? 'Sinalizado ✓' : 'Sinalizar'}
            </button>

            {/* Linked reports */}
            {(() => {
              const linked = mockReports.filter(r => r.refType === 'sonho' && r.refId === dream.id);
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

            {/* Remove */}
            <button
              onClick={() => setPending({ key: 'remover', label: 'Remover sonho', danger: true })}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-red-200 text-red-600 bg-white rounded-xl text-sm hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminDreams() {
  const [dreams, setDreams] = useState([...mockDreams]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | DreamStatus>('todos');
  const [openId, setOpenId] = useState<string | null>(null);
  const location = useLocation();

  // Auto-open item when navigating from AdminReports
  useEffect(() => {
    const incoming = (location.state as { openId?: string } | null)?.openId;
    if (incoming) {
      setStatusFilter('todos');
      setOpenId(incoming);
    }
  }, []);

  const filtered = dreams.filter(d => {
    if (statusFilter !== 'todos' && d.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.patientName.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    }
    return true;
  });

  const openDream = dreams.find(d => d.id === openId) ?? null;

  const handleStatusChange = (id: string, status: DreamStatus) => {
    setDreams(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const handleRemove = (id: string) => {
    setDreams(prev => prev.filter(d => d.id !== id));
    setOpenId(null);
  };

  const counts: Record<string, number> = {
    todos:         dreams.length,
    publicado:     dreams.filter(d => d.status === 'publicado').length,
    'em-conversa': dreams.filter(d => d.status === 'em-conversa').length,
    realizando:    dreams.filter(d => d.status === 'realizando').length,
    concluido:     dreams.filter(d => d.status === 'concluido').length,
    pausado:       dreams.filter(d => d.status === 'pausado').length,
    cancelado:     dreams.filter(d => d.status === 'cancelado').length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Modal */}
      {openDream && (
        <DreamModal
          dream={openDream}
          onClose={() => setOpenId(null)}
          onStatusChange={handleStatusChange}
          onRemove={handleRemove}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Moderação de Sonhos</h1>
        <p className="text-gray-500 text-sm">{dreams.length} sonhos no sistema</p>
      </div>

      {/* Alert */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
        <p className="text-sm text-orange-700"><strong>3 sonhos</strong> aguardam revisão manual por conteúdo sensível detectado.</p>
        <button className="ml-auto text-xs text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-xl transition-colors shrink-0" style={{ fontWeight: 500 }}>
          Revisar agora
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, paciente ou categoria..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
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
                {['Sonho', 'Paciente', 'Status', 'Urgência', 'Propostas', 'Data', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs text-gray-500" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    Nenhum sonho encontrado.
                  </td>
                </tr>
              ) : filtered.map(dream => (
                <tr
                  key={dream.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => setOpenId(dream.id)}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg shrink-0">{catEmoji(dream.category)}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-gray-800 max-w-52 truncate" style={{ fontWeight: 500 }}>{dream.title}</p>
                          {mockReports.some(r => r.refType === 'sonho' && r.refId === dream.id) && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 shrink-0">
                              <Flag className="w-2.5 h-2.5" />
                              {mockReports.filter(r => r.refType === 'sonho' && r.refId === dream.id).length}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-52">{dream.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-700">{dream.patientName}</p>
                    {dream.patientCity && <p className="text-xs text-gray-400">{dream.patientCity}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <DreamStatusBadge status={dream.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <UrgencyBadge urgency={dream.urgency} />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 text-center">
                    {dream.proposalsCount}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {fmt(dream.createdAt)}
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
            {filtered.length} de {dreams.length} sonhos
          </div>
        )}
      </div>
    </div>
  );
}