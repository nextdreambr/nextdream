import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { PencilLine, Plus, Search, Star } from 'lucide-react';
import { ApiError, dreamsApi, type PublicDream } from '../../lib/api';
import { DreamStatusBadge } from '../../components/shared/StatusBadge';
import { EntityPagination } from '../../components/shared/EntityPagination';

const PAGE_SIZE = 6;

const statusOptions: Array<{ value: PublicDream['status'] | ''; label: string }> = [
  { value: '', label: 'Todos os status' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'em-conversa', label: 'Em conversa' },
  { value: 'realizando', label: 'Realizando' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'pausado', label: 'Pausado' },
];

export default function InstitutionDreams() {
  const [dreams, setDreams] = useState<PublicDream[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PublicDream['status'] | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await dreamsApi.listMinePage({
          page,
          pageSize: PAGE_SIZE,
          query,
          status,
        });
        if (!mounted) return;
        setDreams(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar os sonhos da instituição.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [page, query, status]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Sonhos acompanhados</h1>
          <p className="text-sm text-gray-500">
            {total} sonho{total === 1 ? '' : 's'} operado{total === 1 ? '' : 's'} pela instituição
          </p>
        </div>
        <Link to="/instituicao/sonhos/criar" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" />
          Novo sonho
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar sonhos"
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as PublicDream['status'] | '');
            setPage(1);
          }}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {statusOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white border border-indigo-100 rounded-2xl p-6 text-sm text-gray-500">
          Carregando sonhos...
        </div>
      ) : dreams.length === 0 ? (
        <div className="bg-white border border-indigo-100 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
            <Star className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-sm text-gray-800">Nenhum sonho encontrado</p>
          <p className="text-xs text-gray-500">Ajuste os filtros ou publique um novo sonho para a instituição.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dreams.map((dream) => (
            <Link
              key={dream.id}
              to={`/instituicao/sonhos/editar/${dream.id}`}
              className="block bg-white border border-indigo-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <DreamStatusBadge status={dream.status} />
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">{dream.category}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                      Beneficiário: {dream.patientName ?? 'Paciente acompanhado'}
                    </span>
                  </div>
                  <p className="text-lg text-gray-800" style={{ fontWeight: 700 }}>{dream.title}</p>
                  <p className="text-sm text-gray-500">
                    {dream.patientName} {dream.patientCity ? `• ${dream.patientCity}` : ''}
                  </p>
                  {dream.patientContext && (
                    <p className="text-sm text-indigo-700 bg-indigo-50 rounded-2xl px-3 py-2">
                      {dream.patientContext}
                    </p>
                  )}
                  {dream.institutionName && (
                    <p className="text-xs text-indigo-600">Paciente beneficiário operado por {dream.institutionName}</p>
                  )}
                  <p className="text-sm text-gray-600">{dream.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    aria-label={`Editar sonho ${dream.title}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600"
                  >
                    <PencilLine className="w-4 h-4" />
                    Editar sonho
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <EntityPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
