import {
  Search, Download, User, Star, MessageCircle,
  AlertTriangle, Settings, Send, ExternalLink, ChevronDown,
  ChevronUp, Clock, Check, X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

// ─── Types ────────────────────────────────────────────────────────────────────

type LogType = 'usuario' | 'denuncia' | 'sonho' | 'chat' | 'proposta' | 'config';
type LogSeverity = 'alta' | 'media' | 'baixa';
type LogOutcome = 'ok' | 'warn' | 'danger';

interface AuditLog {
  id: string;
  action: string;
  by: string;
  target: string;
  type: LogType;
  severity: LogSeverity;
  outcome: LogOutcome;
  date: string;
  details: string;
  // Origin navigation
  refPath: string;
  refId?: string;           // ID to pass as state.openId to the destination page
  refLabel: string;         // human-readable label for what will open
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const auditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'Conta suspensa',
    by: 'Admin NextDream',
    target: 'Carla Oliveira',
    type: 'usuario',
    severity: 'alta',
    outcome: 'danger',
    date: '2026-02-20 14:30',
    details: 'Conta bloqueada por 7 dias após confirmação de solicitação de pagamento (PIX) dentro do chat com Maria Jesus.',
    refPath: '/admin/usuarios',
    refId: 's5',
    refLabel: 'Perfil: Carla Oliveira',
  },
  {
    id: '2',
    action: 'Denúncia resolvida',
    by: 'Admin NextDream',
    target: 'Denúncia #r5',
    type: 'denuncia',
    severity: 'media',
    outcome: 'ok',
    date: '2026-02-20 14:25',
    details: 'Dados médicos sensíveis removidos do sonho de Roberto Alves em conjunto com o paciente. Denúncia encerrada.',
    refPath: '/admin/denuncias',
    refId: 'r5',
    refLabel: 'Denúncia #r5',
  },
  {
    id: '3',
    action: 'Sonho removido',
    by: 'Admin NextDream',
    target: '"Preciso de R$500 para…"',
    type: 'sonho',
    severity: 'alta',
    outcome: 'danger',
    date: '2026-02-19 11:00',
    details: 'Sonho com conteúdo financeiro explícito (pedido de dinheiro) removido permanentemente após revisão de moderação.',
    refPath: '/admin/sonhos',
    refLabel: 'Lista de sonhos',
  },
  {
    id: '4',
    action: 'Conta verificada',
    by: 'Admin NextDream',
    target: 'Ana Souza',
    type: 'usuario',
    severity: 'baixa',
    outcome: 'ok',
    date: '2026-02-18 09:00',
    details: 'Documentos enviados por Ana Souza foram validados manualmente. Conta marcada com badge de verificado.',
    refPath: '/admin/usuarios',
    refId: 'p1',
    refLabel: 'Perfil: Ana Souza',
  },
  {
    id: '5',
    action: 'Denúncia aberta para análise',
    by: 'Admin NextDream',
    target: 'Denúncia #r2',
    type: 'denuncia',
    severity: 'alta',
    outcome: 'warn',
    date: '2026-02-17 16:45',
    details: 'Denúncia de Ana Souza contra Juliana Costa movida para em-análise. Proposta pr3 sinalizada para revisão.',
    refPath: '/admin/denuncias',
    refId: 'r2',
    refLabel: 'Denúncia #r2',
  },
  {
    id: '6',
    action: 'Advertência emitida',
    by: 'Admin NextDream',
    target: 'Pedro Rocha',
    type: 'usuario',
    severity: 'media',
    outcome: 'warn',
    date: '2026-02-15 10:20',
    details: 'Advertência formal emitida após linguagem agressiva detectada no chat c4 com Carlos Mendes. Registro adicionado ao histórico.',
    refPath: '/admin/usuarios',
    refId: 's2',
    refLabel: 'Perfil: Pedro Rocha',
  },
  {
    id: '7',
    action: 'Sonho aprovado manualmente',
    by: 'Admin NextDream',
    target: '"Ver o nascer do sol na praia"',
    type: 'sonho',
    severity: 'baixa',
    outcome: 'ok',
    date: '2026-02-15 14:00',
    details: 'Revisão manual aprovada após flag automático de privacidade. Conteúdo considerado seguro para publicação.',
    refPath: '/admin/sonhos',
    refId: 'd1',
    refLabel: 'Sonho d1: Ver o nascer do sol',
  },
  {
    id: '8',
    action: 'Chat suspenso',
    by: 'Admin NextDream',
    target: 'Maria Jesus ↔ Carla Oliveira',
    type: 'chat',
    severity: 'alta',
    outcome: 'danger',
    date: '2026-02-14 11:00',
    details: 'Monitoramento ativado após denúncia r1. Palavra-chave de alerta financeiro detectada. Chat suspenso preventivamente.',
    refPath: '/admin/chats',
    refId: 'c2',
    refLabel: 'Chat c2: Maria Jesus ↔ Carla Oliveira',
  },
  {
    id: '9',
    action: 'Proposta sinalizada',
    by: 'Admin NextDream',
    target: 'Proposta de Juliana Costa',
    type: 'proposta',
    severity: 'alta',
    outcome: 'warn',
    date: '2026-02-14 09:30',
    details: 'Proposta pr3 de Juliana Costa para o sonho d1 sinalizada para revisão por solicitação de dados pessoais.',
    refPath: '/admin/propostas',
    refId: 'pr3',
    refLabel: 'Proposta pr3: Juliana Costa',
  },
  {
    id: '10',
    action: 'Sonho sinalizado',
    by: 'Sistema automático',
    target: '"Assistir ao jogo do meu time"',
    type: 'sonho',
    severity: 'media',
    outcome: 'warn',
    date: '2026-02-13 16:00',
    details: 'Flag automático disparado por dados médicos sensíveis detectados na descrição pública do sonho d6 de Roberto Alves.',
    refPath: '/admin/sonhos',
    refId: 'd6',
    refLabel: 'Sonho d6: Assistir ao jogo',
  },
  {
    id: '11',
    action: 'Chat encerrado',
    by: 'Admin NextDream',
    target: 'Carlos Mendes ↔ Pedro Rocha',
    type: 'chat',
    severity: 'media',
    outcome: 'danger',
    date: '2026-02-12 15:45',
    details: 'Conversa encerrada administrativamente após confirmação de linguagem inapropriada referenciada na denúncia r4.',
    refPath: '/admin/chats',
    refId: 'c4',
    refLabel: 'Chat c4: Carlos Mendes ↔ Pedro Rocha',
  },
  {
    id: '12',
    action: 'Denúncia recebida',
    by: 'Sistema automático',
    target: 'Denúncia #r6',
    type: 'denuncia',
    severity: 'alta',
    outcome: 'warn',
    date: '2026-02-11 13:00',
    details: 'Nova denúncia registrada por Lúcia Ferreira contra Bruno Mendes por risco de serviços pagos externos.',
    refPath: '/admin/denuncias',
    refId: 'r6',
    refLabel: 'Denúncia #r6',
  },
  {
    id: '13',
    action: 'Usuário advertido',
    by: 'Admin NextDream',
    target: 'Roberto Alves',
    type: 'usuario',
    severity: 'media',
    outcome: 'warn',
    date: '2026-02-10 10:30',
    details: 'Advertência enviada a Roberto Alves (p5) por exposição de dados médicos sensíveis em perfil público.',
    refPath: '/admin/usuarios',
    refId: 'p5',
    refLabel: 'Perfil: Roberto Alves',
  },
  {
    id: '14',
    action: 'Proposta aprovada',
    by: 'Sistema automático',
    target: 'Proposta de Pedro Rocha',
    type: 'proposta',
    severity: 'baixa',
    outcome: 'ok',
    date: '2026-02-09 08:00',
    details: 'Proposta pr2 de Pedro Rocha para o sonho d1 aceita por Ana Souza. Chat c1 liberado automaticamente.',
    refPath: '/admin/propostas',
    refId: 'pr2',
    refLabel: 'Proposta pr2: Pedro Rocha',
  },
  {
    id: '15',
    action: 'Configuração alterada',
    by: 'Admin NextDream',
    target: 'Palavras bloqueadas',
    type: 'config',
    severity: 'baixa',
    outcome: 'ok',
    date: '2026-02-08 10:30',
    details: 'Adicionadas as palavras "arrecadação", "transferência" e "conta bancária" à lista de palavras bloqueadas automaticamente.',
    refPath: '/admin/configuracoes',
    refLabel: 'Configurações do sistema',
  },
];

// ─── Visual config ────────────────────────────────────────────────────────────

const typeConfig: Record<LogType, { icon: React.ElementType; color: string; label: string; dot: string }> = {
  usuario:  { icon: User,          color: 'bg-pink-100 text-pink-600',    label: 'Usuário',      dot: 'bg-pink-400'   },
  denuncia: { icon: AlertTriangle, color: 'bg-red-100 text-red-600',      label: 'Denúncia',     dot: 'bg-red-500'    },
  sonho:    { icon: Star,          color: 'bg-amber-100 text-amber-600',  label: 'Sonho',        dot: 'bg-amber-400'  },
  chat:     { icon: MessageCircle, color: 'bg-teal-100 text-teal-600',    label: 'Chat',         dot: 'bg-teal-500'   },
  proposta: { icon: Send,          color: 'bg-blue-100 text-blue-600',    label: 'Proposta',     dot: 'bg-blue-400'   },
  config:   { icon: Settings,      color: 'bg-orange-100 text-orange-600',label: 'Config',       dot: 'bg-orange-400' },
};

const severityConfig: Record<LogSeverity, { color: string; label: string }> = {
  alta:  { color: 'bg-red-100 text-red-700',    label: 'Alta'  },
  media: { color: 'bg-yellow-100 text-yellow-700', label: 'Média' },
  baixa: { color: 'bg-green-100 text-green-700', label: 'Baixa' },
};

const outcomeConfig: Record<LogOutcome, { icon: React.ElementType; color: string; label: string }> = {
  ok:     { icon: Check, color: 'text-green-500', label: 'Concluído'  },
  warn:   { icon: Clock, color: 'text-yellow-500', label: 'Em revisão' },
  danger: { icon: X,     color: 'text-red-500',   label: 'Ação grave' },
};

const filterTypes: { key: 'todos' | LogType; label: string }[] = [
  { key: 'todos',    label: 'Todos'         },
  { key: 'usuario',  label: 'Usuários'      },
  { key: 'denuncia', label: 'Denúncias'     },
  { key: 'sonho',    label: 'Sonhos'        },
  { key: 'chat',     label: 'Chats'         },
  { key: 'proposta', label: 'Propostas'     },
  { key: 'config',   label: 'Configurações' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminAudit() {
  const navigate = useNavigate();
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | LogType>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = auditLogs.filter(log => {
    if (typeFilter !== 'todos' && log.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.by.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const goToOrigin = (log: AuditLog, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(log.refPath, log.refId ? { state: { openId: log.refId } } : {});
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Auditoria & Logs</h1>
          <p className="text-gray-500 text-sm">
            {auditLogs.length} registros · Clique em qualquer evento para expandir e navegar até a origem
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Search + filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por ação, usuário, detalhes..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {filterTypes.map(ft => {
            const tc = ft.key !== 'todos' ? typeConfig[ft.key as LogType] : null;
            const Icon = tc?.icon;
            const count = ft.key === 'todos' ? auditLogs.length : auditLogs.filter(l => l.type === ft.key).length;
            return (
              <button
                key={ft.key}
                onClick={() => setTypeFilter(ft.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all
                  ${typeFilter === ft.key
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {ft.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${typeFilter === ft.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Log list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">Nenhum registro encontrado.</div>
          )}

          {filtered.map(log => {
            const tc  = typeConfig[log.type];
            const sc  = severityConfig[log.severity];
            const oc  = outcomeConfig[log.outcome];
            const TypeIcon    = tc.icon;
            const OutcomeIcon = oc.icon;
            const isExpanded  = expandedId === log.id;

            return (
              <div key={log.id}>

                {/* ── Row ── */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className={`w-full text-left flex items-start gap-4 px-5 py-4 transition-colors group
                    ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50/70'}`}
                >
                  {/* Severity stripe */}
                  <div className={`absolute left-0 w-0.5 self-stretch rounded-r ${
                    log.severity === 'alta' ? 'bg-red-400' :
                    log.severity === 'media' ? 'bg-yellow-400' : 'bg-green-400'
                  } opacity-0`} />

                  {/* Type icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${tc.color}`}>
                    <TypeIcon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{log.action}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sc.color}`} style={{ fontWeight: 500 }}>{sc.label}</span>
                          <OutcomeIcon className={`w-3.5 h-3.5 ${oc.color}`} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Alvo: <span className="text-gray-700">{log.target}</span>
                          <span className="text-gray-300 mx-2">·</span>
                          Por: <span className="text-gray-700">{log.by}</span>
                        </p>
                      </div>

                      {/* Date + expand */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{log.date.split(' ')[0]}</p>
                          <p className="text-xs text-gray-400">{log.date.split(' ')[1]}</p>
                        </div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors
                          ${isExpanded ? 'bg-orange-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                          {isExpanded
                            ? <ChevronUp className="w-3.5 h-3.5 text-orange-600" />
                            : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Destination preview (always visible) */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${tc.color} border-current/20`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
                        {tc.label}
                      </span>
                      {log.refId && (
                        <span className="text-[10px] text-gray-400">
                          → <span className="text-gray-600">{log.refLabel}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* ── Expanded detail ── */}
                {isExpanded && (
                  <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-start gap-4 pt-4">
                      <div className="flex-1 space-y-3">
                        {/* Details */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5" style={{ fontWeight: 600 }}>
                            Detalhes do evento
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed">{log.details}</p>
                        </div>

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>Tipo</p>
                            <div className="flex items-center gap-1.5">
                              <TypeIcon className={`w-3.5 h-3.5 ${tc.color.split(' ')[1]}`} />
                              <span className="text-xs text-gray-700">{tc.label}</span>
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>Severidade</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>Resultado</p>
                            <div className="flex items-center gap-1.5">
                              <OutcomeIcon className={`w-3.5 h-3.5 ${oc.color}`} />
                              <span className="text-xs text-gray-700">{oc.label}</span>
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>Executado por</p>
                            <span className="text-xs text-gray-700 truncate block">{log.by}</span>
                          </div>
                        </div>
                      </div>

                      {/* ── Navigate to origin ── */}
                      <div className="shrink-0 w-52">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>
                              Origem do evento
                            </p>
                            <div className={`flex items-center gap-2 p-2 rounded-lg ${tc.color.split(' ')[0]}`}>
                              <TypeIcon className={`w-3.5 h-3.5 shrink-0 ${tc.color.split(' ')[1]}`} />
                              <span className="text-xs leading-snug" style={{ fontWeight: 500, color: 'inherit' }}>
                                {log.refLabel}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={e => goToOrigin(log, e)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ir para origem
                          </button>

                          {log.refId && (
                            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                              Abre diretamente<br />
                              <span className="text-gray-600">"{log.refLabel}"</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Mostrando <strong className="text-gray-700">{filtered.length}</strong> de <strong className="text-gray-700">{auditLogs.length}</strong> registros</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">← Anterior</button>
            <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">Próximo →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
