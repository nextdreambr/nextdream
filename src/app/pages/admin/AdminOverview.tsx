import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Activity,
  AlertTriangle,
  Clock3,
  HeartPulse,
  Mail,
  MessageCircleWarning,
  Send,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
} from 'lucide-react';
import { ApiError, AdminOverview as AdminOverviewData, adminApi } from '../../lib/api';
import { formatAdminDateTime } from './components/adminPageUtils';

type IconType = typeof AlertTriangle;

const compactNumber = new Intl.NumberFormat('pt-BR');

function formatCount(value: number) {
  return compactNumber.format(value);
}

function labelForKey(key: string) {
  const labels: Record<string, string> = {
    paciente: 'Pacientes',
    apoiador: 'Apoiadores',
    instituicao: 'Instituições',
    admin: 'Admins',
    rascunho: 'Rascunho',
    publicado: 'Publicado',
    'em-conversa': 'Em conversa',
    realizando: 'Realizando',
    concluido: 'Concluído',
    pausado: 'Pausado',
    cancelado: 'Cancelado',
    enviada: 'Enviada',
    'em-analise': 'Em análise',
    aceita: 'Aceita',
    recusada: 'Recusada',
    expirada: 'Expirada',
  };

  return labels[key] ?? key;
}

function emailStatusLabel(status?: string) {
  switch (status) {
    case 'resend':
      return 'E-mail Resend';
    case 'smtp':
      return 'E-mail SMTP';
    case 'sandbox':
      return 'E-mail sandbox';
    case 'test':
      return 'E-mail teste';
    case 'not-configured':
      return 'E-mail sem provider';
    default:
      return 'E-mail não informado';
  }
}

function getWorkQueues(overview: AdminOverviewData) {
  return overview.workQueues ?? {
    reportsOpen: overview.totalReportsOpen,
    institutionsPendingApproval: 0,
    chatsWithModeration: 0,
    contactMessagesNew: 0,
    dreamsPaused: 0,
    proposalsInReview: 0,
  };
}

function getHealth(overview: AdminOverviewData) {
  return overview.health ?? {
    usersByRole: {},
    dreamsByStatus: {},
    proposalsByStatus: {},
    activeChats: 0,
    closedChats: 0,
    backlog: overview.totalReportsOpen,
  };
}

function getRiskCare(overview: AdminOverviewData) {
  return overview.riskCare ?? {
    moderatedMessages: 0,
    suspendedUsersRecent: 0,
    recurringReportedTargets: [],
  };
}

function QueueTile({
  icon: Icon,
  label,
  description,
  value,
  to,
  action,
  tone,
}: {
  icon: IconType;
  label: string;
  description: string;
  value: number;
  to: string;
  action: string;
  tone: string;
}) {
  return (
    <article className={`rounded-xl border bg-white p-4 shadow-sm ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{formatCount(value)}</p>
          <p className="mt-2 text-sm leading-5 text-slate-600">{description}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <Link to={to} className="mt-4 inline-flex text-sm font-semibold text-slate-900 underline-offset-4 hover:underline">
        {action}
      </Link>
    </article>
  );
}

function DistributionList({ title, rows }: { title: string; rows: Record<string, number | undefined> }) {
  const entries = Object.entries(rows).filter(([, value]) => Number(value) > 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-2">
        {entries.length === 0 && <p className="text-sm text-slate-500">Sem sinais nesta categoria.</p>}
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-600">{labelForKey(key)}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-900">
              {formatCount(Number(value))} itens
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LoadingOverview() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-4 w-36 rounded bg-slate-100" />
        <div className="mt-4 h-8 w-64 rounded bg-slate-100" />
        <p className="mt-4 text-sm text-slate-500">Carregando filas administrativas...</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {['reports', 'institutions', 'moderation'].map((item) => (
          <div key={item} className="h-40 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-4 w-28 rounded bg-slate-100" />
            <div className="mt-6 h-8 w-16 rounded bg-slate-100" />
            <div className="mt-4 h-4 w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async (showBlockingLoading: boolean) => {
    if (showBlockingLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError('');

    try {
      const data = await adminApi.overview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar métricas administrativas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview(true);

    function handleRefresh() {
      void loadOverview(false);
    }

    window.addEventListener('nextdream:admin-overview-refresh', handleRefresh);
    return () => {
      window.removeEventListener('nextdream:admin-overview-refresh', handleRefresh);
    };
  }, [loadOverview]);

  if (loading && !overview) {
    return <LoadingOverview />;
  }

  if (!overview) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error || 'Não foi possível carregar métricas administrativas.'}
      </div>
    );
  }

  const queues = getWorkQueues(overview);
  const health = getHealth(overview);
  const riskCare = getRiskCare(overview);
  const recent = overview.recent;

  const queueTiles = [
    {
      label: 'Denúncias abertas',
      value: queues.reportsOpen,
      description: 'Casos aguardando triagem ou resolução formal.',
      to: '/admin/denuncias',
      action: 'Abrir denúncias',
      icon: AlertTriangle,
      tone: 'border-rose-200',
    },
    {
      label: 'Instituições pendentes',
      value: queues.institutionsPendingApproval,
      description: 'Contas institucionais aguardando validação de segurança.',
      to: '/admin/usuarios',
      action: 'Abrir usuários',
      icon: UserCheck,
      tone: 'border-blue-200',
    },
    {
      label: 'Chats com moderação',
      value: queues.chatsWithModeration,
      description: 'Conversas com bloqueio financeiro ou relato vinculado.',
      to: '/admin/chats',
      action: 'Abrir chats',
      icon: MessageCircleWarning,
      tone: 'border-amber-200',
    },
    {
      label: 'Mensagens novas',
      value: queues.contactMessagesNew,
      description: 'Solicitações recebidas pelo canal de contato público.',
      to: '/admin/mensagens',
      action: 'Abrir mensagens',
      icon: Mail,
      tone: 'border-emerald-200',
    },
    {
      label: 'Sonhos pausados',
      value: queues.dreamsPaused,
      description: 'Sonhos fora de circulação que podem exigir revisão.',
      to: '/admin/sonhos',
      action: 'Abrir sonhos',
      icon: Star,
      tone: 'border-violet-200',
    },
    {
      label: 'Propostas em análise',
      value: queues.proposalsInReview,
      description: 'Propostas na etapa operacional de triagem.',
      to: '/admin/propostas',
      action: 'Abrir propostas',
      icon: Send,
      tone: 'border-cyan-200',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a8544a]">Operação e cuidado</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">Operação Admin</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Filas, risco e saúde da plataforma em uma visão acionável para priorizar cuidado, moderação e segurança.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">API online</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
              {emailStatusLabel(overview.systemStatus?.email)}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-800">
              {overview.systemStatus?.dataMode === 'sandbox' ? 'Sandbox' : 'Banco ativo'}
            </span>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full border border-rose-200 px-3 py-1.5">{queues.reportsOpen} denúncias abertas</span>
          <span className="rounded-full border border-blue-200 px-3 py-1.5">{queues.institutionsPendingApproval} inst. pendentes</span>
          <span className="rounded-full border border-amber-200 px-3 py-1.5">{queues.chatsWithModeration} chats moderados</span>
          <span className="rounded-full border border-violet-200 px-3 py-1.5">{queues.dreamsPaused} sonhos pausados</span>
          {overview.generatedAt && (
            <span className="rounded-full border border-slate-200 px-3 py-1.5">
              Atualizado em {formatAdminDateTime(overview.generatedAt)}
            </span>
          )}
          {refreshing && <span className="rounded-full border border-slate-200 px-3 py-1.5">Atualizando...</span>}
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-[#a8544a]" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Filas de trabalho</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {queueTiles.map((item) => (
            <QueueTile key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <DistributionList title="Usuários ativos por perfil" rows={health.usersByRole} />
        <DistributionList title="Sonhos por status" rows={health.dreamsByStatus} />
        <DistributionList title="Propostas por status" rows={health.proposalsByStatus} />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <HeartPulse className="h-4 w-4 text-rose-700" />
            Risco e cuidado
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-600">Conteúdo financeiro bloqueado</span>
              <span className="font-semibold text-slate-950">{formatCount(riskCare.moderatedMessages)}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-600">Usuários suspensos recentemente</span>
              <span className="font-semibold text-slate-950">{formatCount(riskCare.suspendedUsersRecent)} nos últimos 7 dias</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-600">Backlog operacional</span>
              <span className="font-semibold text-slate-950">{formatCount(health.backlog)}</span>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Activity className="h-4 w-4 text-amber-700" />
            Alvos recorrentes
          </div>
          <div className="mt-4 space-y-3">
            {riskCare.recurringReportedTargets.length === 0 && (
              <p className="text-sm text-slate-500">Nenhum alvo com múltiplos relatos.</p>
            )}
            {riskCare.recurringReportedTargets.map((target) => (
              <div key={`${target.targetType}-${target.targetId}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="font-medium text-slate-900">{target.targetType} · {target.targetId}</div>
                <div className="mt-1 text-slate-600">{target.count} relatos vinculados</div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            Saúde da plataforma
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-slate-500">Usuários</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{formatCount(overview.totalUsers)}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-slate-500">Sonhos</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{formatCount(overview.totalDreams)}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-slate-500">Chats ativos</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{formatCount(health.activeChats)}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-slate-500">Chats encerrados</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{formatCount(health.closedChats)}</div>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <AlertTriangle className="h-4 w-4 text-rose-700" />
            Últimas denúncias
          </div>
          <div className="mt-4 space-y-3">
            {(!recent?.reports.length) && <p className="text-sm text-slate-500">Nenhuma denúncia recente.</p>}
            {recent?.reports.slice(0, 3).map((report) => (
              <Link key={report.id} to="/admin/denuncias" className="block rounded-lg bg-slate-50 p-3 text-sm hover:bg-slate-100">
                <div className="font-medium text-slate-900">{report.type}</div>
                <div className="mt-1 line-clamp-2 text-slate-600">{report.reason}</div>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MessageCircleWarning className="h-4 w-4 text-amber-700" />
            Últimos chats sinalizados
          </div>
          <div className="mt-4 space-y-3">
            {(!recent?.moderatedChats.length) && <p className="text-sm text-slate-500">Nenhum chat sinalizado recentemente.</p>}
            {recent?.moderatedChats.slice(0, 3).map((chat) => (
              <Link key={chat.id} to="/admin/chats" className="block rounded-lg bg-slate-50 p-3 text-sm hover:bg-slate-100">
                <div className="font-medium text-slate-900">{chat.dreamTitle ?? chat.id}</div>
                <div className="mt-1 text-slate-600">{chat.patientName ?? 'Paciente'} · {chat.supporterName ?? 'Apoiador'}</div>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Users className="h-4 w-4 text-blue-700" />
            Atividade recente
          </div>
          <div className="mt-4 space-y-3">
            {(!recent?.auditLogs.length && !recent?.adminInvites.length) && (
              <p className="text-sm text-slate-500">Sem atividade administrativa recente.</p>
            )}
            {recent?.auditLogs.slice(0, 2).map((log) => (
              <Link key={log.id} to={log.refPath} className="block rounded-lg bg-slate-50 p-3 text-sm hover:bg-slate-100">
                <div className="font-medium text-slate-900">{log.action}</div>
                <div className="mt-1 text-slate-600">{log.by} · {formatAdminDateTime(log.date)}</div>
              </Link>
            ))}
            {recent?.adminInvites.slice(0, 2).map((invite) => (
              <Link key={invite.id} to="/admin/admins" className="block rounded-lg bg-slate-50 p-3 text-sm hover:bg-slate-100">
                <div className="font-medium text-slate-900">Convite admin</div>
                <div className="mt-1 text-slate-600">{invite.email}</div>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
