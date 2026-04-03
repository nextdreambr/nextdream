import { useState, useEffect } from 'react';
import {
  AlertTriangle, CheckCircle, Clock, Shield, X,
  MessageCircle, Star, FileText, User, ExternalLink,
  Check, Flag, ChevronRight,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { mockReports, type Report } from '../../data/mockData';
import { ReportStatusBadge } from '../../components/shared/StatusBadge';

// ─── Config ───────────────────────────────────────────────────────────────────

const COLUMNS: { key: Report['status']; label: string; accent: string; header: string }[] = [
  { key: 'nova',        label: 'Nova',        accent: 'border-red-200    bg-red-50',    header: 'bg-red-500'    },
  { key: 'em-analise',  label: 'Em análise',  accent: 'border-yellow-200 bg-yellow-50', header: 'bg-yellow-500' },
  { key: 'acao-tomada', label: 'Ação tomada', accent: 'border-orange-200 bg-orange-50', header: 'bg-orange-500' },
  { key: 'resolvida',   label: 'Resolvida',   accent: 'border-green-200  bg-green-50',  header: 'bg-green-500'  },
];

const TYPE_CONFIG: Record<string, { label: string; emoji: string }> = {
  dinheiro:  { label: 'Pedido de dinheiro',   emoji: '💰' },
  assedio:   { label: 'Assédio',              emoji: '⚠️' },
  fraude:    { label: 'Fraude / Perfil falso', emoji: '🕵️' },
  linguagem: { label: 'Linguagem ofensiva',   emoji: '🔤' },
  risco:     { label: 'Risco / Segurança',    emoji: '🚨' },
  outro:     { label: 'Outro',                emoji: '❓' },
};

const PRIORITY_STYLE: Record<string, string> = {
  alta:  'bg-red-100    text-red-700',
  media: 'bg-yellow-100 text-yellow-700',
  baixa: 'bg-green-100  text-green-700',
};

const PRIORITY_LABEL: Record<string, string> = {
  alta: 'Alta', media: 'Média', baixa: 'Baixa',
};

// Ref-type config: icon, label, route
const REF_CONFIG: Record<string, { Icon: typeof MessageCircle; label: string; route: string; style: string }> = {
  chat:     { Icon: MessageCircle, label: 'Chat',     route: '/admin/chats',    style: 'bg-blue-50   text-blue-700   border-blue-200'   },
  sonho:    { Icon: Star,          label: 'Sonho',    route: '/admin/sonhos',   style: 'bg-pink-50   text-pink-700   border-pink-200'   },
  proposta: { Icon: FileText,      label: 'Proposta', route: '/admin/propostas',style: 'bg-teal-50   text-teal-700   border-teal-200'   },
  usuario:  { Icon: User,          label: 'Usuário',  route: '/admin/usuarios', style: 'bg-purple-50 text-purple-700 border-purple-200' },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ─── Origin chip (used in both card and modal) ────────────────────────────────

function OriginChip({ report, onClick }: { report: Report; onClick?: () => void }) {
  const cfg = REF_CONFIG[report.refType];
  const Icon = cfg.Icon;
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`flex items-start gap-1.5 w-full text-left px-2.5 py-2 rounded-xl border text-xs leading-snug transition-colors
        ${cfg.style}
        ${onClick ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span className="line-clamp-2">{report.refLabel}</span>
      {onClick && <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 ml-auto opacity-60" />}
    </button>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function ReportModal({
  report,
  onClose,
  onMove,
}: {
  report: Report;
  onClose: () => void;
  onMove: (id: string, status: Report['status'], note: string) => void;
}) {
  const navigate = useNavigate();
  const [note, setNote] = useState(report.adminNote ?? '');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const move = (status: Report['status']) => {
    onMove(report.id, status, note);
    showToast('Status atualizado.');
    setTimeout(onClose, 800);
  };

  const cfg = REF_CONFIG[report.refType];
  const typeInfo = TYPE_CONFIG[report.type];

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

        {/* ── Header ── */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-2xl shrink-0">
            {typeInfo.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-gray-800 leading-snug" style={{ fontWeight: 700 }}>{typeInfo.label}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Denúncia #{report.id} · {fmt(report.createdAt)}</p>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <ReportStatusBadge status={report.status} />
              <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLE[report.priority]}`} style={{ fontWeight: 500 }}>
                Prioridade {PRIORITY_LABEL[report.priority]}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">

            {/* ── Origem ── */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                Origem da denúncia
              </p>
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${cfg.style}`}>
                <div className="flex items-center gap-2 shrink-0">
                  <cfg.Icon className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wide" style={{ fontWeight: 700 }}>{cfg.label}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug" style={{ fontWeight: 500 }}>{report.refLabel}</p>
                  <p className="text-xs opacity-70 mt-0.5">ID: {report.refId}</p>
                </div>
                <button
                  onClick={() => { onClose(); navigate(cfg.route, { state: { openId: report.refId } }); }}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-current opacity-70 hover:opacity-100 transition-opacity shrink-0"
                >
                  Abrir <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* ── Partes ── */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>Partes envolvidas</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Denunciante</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 text-xs shrink-0" style={{ fontWeight: 700 }}>
                      {report.reporterName[0]}
                    </div>
                    <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{report.reporterName}</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Denunciado</p>
                  {report.reportedUserName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-xs shrink-0" style={{ fontWeight: 700 }}>
                        {report.reportedUserName[0]}
                      </div>
                      <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{report.reportedUserName}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Conteúdo da plataforma</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Description ── */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>Descrição do ocorrido</p>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>
              </div>
            </div>

            {/* ── Previous admin note ── */}
            {report.adminNote && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-600 mb-1" style={{ fontWeight: 600 }}>Nota anterior do admin</p>
                <p className="text-sm text-blue-700 leading-relaxed">{report.adminNote}</p>
              </div>
            )}

            {/* ── Resolved at ── */}
            {report.resolvedAt && (
              <p className="text-xs text-gray-400">Resolvida em: <span className="text-gray-600">{fmt(report.resolvedAt)}</span></p>
            )}

            {/* ── Admin note input ── */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide block" style={{ fontWeight: 600 }}>
                {report.adminNote ? 'Atualizar nota' : 'Nota do admin (opcional)'}
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Registre a decisão, ação tomada ou observações relevantes..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">

            {report.status !== 'em-analise' && (
              <button onClick={() => move('em-analise')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl text-sm hover:bg-yellow-100 transition-colors">
                <Clock className="w-3.5 h-3.5" /> Analisar
              </button>
            )}
            {report.status !== 'acao-tomada' && (
              <button onClick={() => move('acao-tomada')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-sm hover:bg-orange-100 transition-colors">
                <Shield className="w-3.5 h-3.5" /> Ação tomada
              </button>
            )}
            {report.status !== 'resolvida' && (
              <button onClick={() => move('resolvida')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm hover:bg-green-100 transition-colors">
                <CheckCircle className="w-3.5 h-3.5" /> Marcar como resolvida
              </button>
            )}
            {report.status === 'resolvida' && (
              <button onClick={() => move('em-analise')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl text-sm hover:bg-yellow-100 transition-colors">
                <Clock className="w-3.5 h-3.5" /> Reabrir
              </button>
            )}

            <div className="flex-1" />

            <button
              onClick={() => { onClose(); navigate(cfg.route, { state: { openId: report.refId } }); }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              <cfg.Icon className="w-3.5 h-3.5" />
              Ir para {cfg.label.toLowerCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function ReportCard({ report, onClick }: { report: Report; onClick: () => void }) {
  const typeInfo = TYPE_CONFIG[report.type];
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-gray-100 p-3.5 hover:shadow-md hover:border-gray-200 transition-all group space-y-2.5"
    >
      {/* Top row: priority + type */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{typeInfo.emoji}</span>
          <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>{typeInfo.label}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_STYLE[report.priority]}`} style={{ fontWeight: 500 }}>
          {PRIORITY_LABEL[report.priority]}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{report.description}</p>

      {/* ── Origin chip ── */}
      <OriginChip report={report} />

      {/* Footer: reporter + date */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-0.5">
        <span>{report.reporterName}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Ver detalhes</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
        <span>{fmt(report.createdAt)}</span>
      </div>
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminReports() {
  const [reports, setReports] = useState([...mockReports]);
  const [selected, setSelected] = useState<Report | null>(null);
  const location = useLocation();

  // Auto-open report when navigating from another admin page
  useEffect(() => {
    const incoming = (location.state as { openId?: string } | null)?.openId;
    if (incoming) {
      const found = mockReports.find(r => r.id === incoming);
      if (found) setSelected(found);
    }
  }, []);

  const getByStatus = (status: Report['status']) => reports.filter(r => r.status === status);

  const handleMove = (id: string, status: Report['status'], note: string) => {
    setReports(prev => prev.map(r =>
      r.id === id
        ? { ...r, status, adminNote: note || r.adminNote, resolvedAt: status === 'resolvida' ? new Date().toISOString() : r.resolvedAt }
        : r
    ));
  };

  const novas = reports.filter(r => r.status === 'nova').length;
  const emAnalise = reports.filter(r => r.status === 'em-analise').length;

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Modal */}
      {selected && (
        <ReportModal
          report={selected}
          onClose={() => setSelected(null)}
          onMove={handleMove}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Denúncias & Moderação</h1>
          <p className="text-gray-500 text-sm">{novas} novas · {emAnalise} em análise</p>
        </div>
        {novas > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-xl text-xs text-red-700">
            <AlertTriangle className="w-4 h-4" />
            {novas} {novas === 1 ? 'requer' : 'requerem'} atenção imediata
          </div>
        )}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(col => (
          <div key={col.key} className="flex flex-col">
            <div className={`${col.header} rounded-t-2xl px-4 py-2.5 flex items-center justify-between`}>
              <span className="text-white text-sm" style={{ fontWeight: 500 }}>{col.label}</span>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {getByStatus(col.key).length}
              </span>
            </div>
            <div className={`flex-1 rounded-b-2xl border ${col.accent} p-3 space-y-3 min-h-48`}>
              {getByStatus(col.key).map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => setSelected(report)}
                />
              ))}
              {getByStatus(col.key).length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-xs text-gray-400 gap-2">
                  <Flag className="w-5 h-5 opacity-30" />
                  Nenhuma denúncia
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}