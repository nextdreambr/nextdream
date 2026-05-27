import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Eye } from 'lucide-react';
import { AdminContactMessage, AdminContactMessageSummary, ApiError, adminApi } from '../../lib/api';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilters,
  AdminListToolbar,
  AdminLoadingState,
  AdminPagination,
  AdminSearchInput,
} from './components';
import { AdminStatusBadge, formatAdminDateTime } from './components/adminPageUtils';

export default function AdminMessages() {
  const navigate = useNavigate();
  const { messageId: routeMessageId } = useParams<{ messageId?: string }>();
  const [items, setItems] = useState<AdminContactMessageSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AdminContactMessageSummary['status'] | ''>('');
  const [email, setEmail] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [detail, setDetail] = useState<AdminContactMessage | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const hasFilters = Boolean(query.trim() || status || email.trim() || dateFrom || dateTo);

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      setLoading(true);
      setError('');

      try {
        const response = await adminApi.listMessages({
          page,
          pageSize,
          query,
          status,
          email,
          dateFrom,
          dateTo,
        });
        if (mounted) {
          setItems(response.items);
          setTotal(response.total);
          setTotalPages(response.totalPages);
        }
      } catch (err) {
        if (mounted) {
          setItems([]);
          setTotal(0);
          setTotalPages(1);
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar mensagens de contato.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadMessages();

    return () => {
      mounted = false;
    };
  }, [page, pageSize, query, status, email, dateFrom, dateTo, reloadKey]);

  useEffect(() => {
    if (!routeMessageId) {
      setDetail(null);
      setDetailError('');
      return;
    }

    void loadMessageDetail(routeMessageId);
  }, [routeMessageId]);

  async function loadMessageDetail(messageId: string) {
    setDetailLoading(true);
    setDetailError('');

    try {
      const response = await adminApi.getMessageDetail(messageId);
      setDetail(response);
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : 'Não foi possível carregar a mensagem.');
    } finally {
      setDetailLoading(false);
    }
  }

  function updateFilter(update: () => void) {
    setPage(1);
    update();
  }

  function openDetail(messageId: string) {
    navigate(`/admin/mensagens/${messageId}`);
  }

  const filterFields = [
    {
      id: 'status',
      label: 'Status',
      value: status,
      type: 'select' as const,
      onChange: (value: string) => updateFilter(() => setStatus(value as AdminContactMessageSummary['status'] | '')),
      options: [
        { value: '', label: 'Todos' },
        { value: 'novo', label: 'Novo' },
        { value: 'em-analise', label: 'Em análise' },
        { value: 'respondido', label: 'Respondido' },
      ],
    },
    {
      id: 'email',
      label: 'E-mail',
      value: email,
      placeholder: 'remetente@exemplo.org',
      onChange: (value: string) => updateFilter(() => setEmail(value)),
    },
    {
      id: 'dateFrom',
      label: 'De',
      value: dateFrom,
      type: 'date' as const,
      onChange: (value: string) => updateFilter(() => setDateFrom(value)),
    },
    {
      id: 'dateTo',
      label: 'Até',
      value: dateTo,
      type: 'date' as const,
      onChange: (value: string) => updateFilter(() => setDateTo(value)),
    },
  ];

  function renderList() {
    if (loading) {
      return <AdminLoadingState title="Carregando mensagens" description="Buscando mensagens com paginação e filtros atuais." />;
    }

    if (error) {
      return (
        <AdminErrorState
          title="Não foi possível carregar mensagens"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => {
            setPage(1);
            setReloadKey((current) => current + 1);
          }}
        />
      );
    }

    if (items.length === 0) {
      return (
        <AdminEmptyState
          title={hasFilters ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem de contato'}
          description={hasFilters ? 'Ajuste busca, filtros ou período para ampliar a consulta.' : 'Mensagens enviadas pelo formulário de contato aparecerão aqui.'}
        />
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {items.map((message) => {
            const selected = routeMessageId === message.id;

            return (
              <article key={message.id} className={`grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] ${selected ? 'bg-pink-50/70' : ''}`}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-950">{message.subject}</h2>
                    <AdminStatusBadge status={message.status}>{message.status}</AdminStatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{message.name} • {message.email}</p>
                  <p className="mt-2 text-xs text-slate-500">Recebida em {formatAdminDateTime(message.createdAt)}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Abrir mensagem ${message.subject}`}
                  onClick={() => openDetail(message.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Eye className="size-4" />
                  Abrir
                </button>
              </article>
            );
          })}
        </div>
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPage(1);
            setPageSize(nextPageSize);
          }}
          disabled={loading}
        />
      </div>
    );
  }

  function renderDetail() {
    if (!routeMessageId && !detailLoading && !detailError && !detail) {
      return (
        <AdminEmptyState
          title="Nenhuma mensagem selecionada"
          description="Abra uma mensagem da lista para ler o conteúdo sem sair do contexto da inbox."
        />
      );
    }

    if (detailLoading) {
      return <AdminLoadingState title="Carregando mensagem" description="Buscando conteúdo completo e metadados do contato." />;
    }

    if (detailError) {
      return <AdminErrorState title="Não foi possível carregar a mensagem" description={detailError} />;
    }

    if (!detail) {
      return <AdminEmptyState title="Mensagem não carregada" description="Selecione outra mensagem ou atualize a listagem." />;
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-950">{detail.subject}</h2>
              <AdminStatusBadge status={detail.status}>{detail.status}</AdminStatusBadge>
            </div>
            <p className="mt-1 text-sm text-slate-600">{detail.name} • {detail.email}</p>
            <p className="mt-1 text-xs text-slate-500">Recebida em {formatAdminDateTime(detail.createdAt)}</p>
          </div>
          <Link
            to="/admin/mensagens"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Fechar leitura
          </Link>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{detail.body}</div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Mensagens</h1>
        <p className="mt-1 text-sm text-slate-500">Inbox administrativo com paginação real, filtros e leitura persistente ao lado da lista.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] xl:items-start">
        <section className="space-y-4">
          <AdminListToolbar
            title="Inbox de contato"
            description="Busque por assunto, remetente, e-mail ou conteúdo e preserve os filtros durante a paginação."
            totalLabel={`${total} mensagens`}
            search={
              <AdminSearchInput
                value={query}
                onChange={(value) => updateFilter(() => setQuery(value))}
                placeholder="Assunto, remetente ou conteúdo"
                label="Buscar mensagens"
              />
            }
            filters={<AdminFilters fields={filterFields} />}
          />

          {renderList()}
        </section>

        <aside className="xl:sticky xl:top-4">
          {renderDetail()}
        </aside>
      </div>
    </div>
  );
}
