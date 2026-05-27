import { Link, useNavigate } from 'react-router';
import { Plus, Star, Search, SlidersHorizontal, X, Edit, CheckCircle, HeartHandshake } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DreamStatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { EntityPagination } from '../../components/shared/EntityPagination';
import { DREAM_CATEGORIES } from '../../data/dreamCategories';
import { ApiError, PublicDream, dreamsApi } from '../../lib/api';
import { ProductHero, ProductPageShell, SensitiveNotice } from '../../components/shared/VisualSystem';
import { getSafeDreamVisual, SafeDreamArtwork } from '../../components/shared/SafeDreamVisual';

type DreamStatus = PublicDream['status'];

const statusOptions: { value: DreamStatus; label: string }[] = [
  { value: 'publicado', label: 'Publicado' },
  { value: 'em-conversa', label: 'Em conversa' },
  { value: 'realizando', label: 'Realizando' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'pausado', label: 'Pausado' },
];

const formatOptions: Array<{ val: PublicDream['format']; label: string }> = [
  { val: 'remoto', label: 'Online' },
  { val: 'presencial', label: 'Presencial' },
  { val: 'ambos', label: 'Ambos' },
];

const PAGE_SIZE = 6;

export default function MyDreams() {
  const navigate = useNavigate();
  const [myDreams, setMyDreams] = useState<PublicDream[]>([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '' as DreamStatus | '',
    category: '',
    format: '' as PublicDream['format'] | '',
  });

  useEffect(() => {
    let mounted = true;
    async function loadDreams() {
      try {
        setError('');
        const response = await dreamsApi.listMinePage({
          page,
          pageSize: PAGE_SIZE,
          query,
          status: filters.status,
          category: filters.category,
          format: filters.format,
        });
        if (!mounted) return;
        setMyDreams(response.items);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar seus sonhos.');
      }
    }
    void loadDreams();
    return () => {
      mounted = false;
    };
  }, [filters.category, filters.format, filters.status, page, query]);

  const clearFilters = () => {
    setFilters({ status: '', category: '', format: '' });
    setPage(1);
  };
  const hasFilters = !!(filters.status || filters.category || filters.format);

  return (
    <ProductPageShell tone="care" width="content">
      <ProductHero
        tone="care"
        icon={HeartHandshake}
        eyebrow="Suas histórias"
        title="Meus sonhos"
        description={`${total} ${total === 1 ? 'sonho cuidado' : 'sonhos cuidados'} no total. Edite, revise privacidade e acompanhe propostas sem expor mais do que deseja.`}
        action={(
        <Link to="/paciente/sonhos/criar"
          className="inline-flex items-center gap-2 rounded-full bg-[#a8544a] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#8b3d44]">
          <Plus className="w-4 h-4" /> Novo sonho
        </Link>
        )}
        aside={(
          <SensitiveNotice tone="care" title="Controle sempre visível">
            Você pode ajustar título, texto, imagem e privacidade. Dados de contato continuam protegidos até o aceite de uma proposta.
          </SensitiveNotice>
        )}
      />

      {/* Search + filter toggle */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por título, descrição..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#eadfd2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbbd] focus:border-[#a8544a]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors
            ${showFilters || hasFilters ? 'bg-[#a8544a] text-white border-[#a8544a]' : 'bg-white border-[#eadfd2] text-[#5c4b52] hover:border-[#ecd8c8]'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasFilters && <span className="w-2 h-2 bg-white rounded-full" />}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-[#eadfd2] rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                <X className="w-3 h-3" /> Limpar filtros
              </button>
            )}
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(s => (
                <button
                  key={s.value}
                  onClick={() => {
                    setFilters(f => ({ ...f, status: f.status === s.value ? '' : s.value }));
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                    ${filters.status === s.value ? 'bg-[#a8544a] text-white border-[#a8544a]' : 'border-[#eadfd2] text-[#5c4b52] hover:border-[#ecd8c8]'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Categoria</p>
            <div className="flex flex-wrap gap-2">
              {DREAM_CATEGORIES.slice(0, 8).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilters(f => ({ ...f, category: f.category === cat ? '' : cat }));
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                    ${filters.category === cat ? 'bg-[#a8544a] text-white border-[#a8544a]' : 'border-[#eadfd2] text-[#5c4b52] hover:border-[#ecd8c8]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Formato</p>
            <div className="flex gap-2">
              {formatOptions.map(f => (
                <button
                  key={f.val}
                  onClick={() => {
                    setFilters(fm => ({ ...fm, format: fm.format === f.val ? '' : f.val }));
                    setPage(1);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs border font-medium transition-all
                    ${filters.format === f.val ? 'bg-[#a8544a] text-white border-[#a8544a]' : 'border-[#eadfd2] text-[#5c4b52] hover:border-[#ecd8c8]'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <span className="flex items-center gap-1.5 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs">
              {statusOptions.find(s => s.value === filters.status)?.label}
              <button onClick={() => {
                setFilters(f => ({ ...f, status: '' }));
                setPage(1);
              }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.category && (
            <span className="flex items-center gap-1.5 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs">
              {filters.category}
              <button onClick={() => {
                setFilters(f => ({ ...f, category: '' }));
                setPage(1);
              }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.format && (
            <span className="flex items-center gap-1.5 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs">
              {filters.format === 'remoto' ? 'Online' : filters.format === 'presencial' ? 'Presencial' : 'Ambos'}
              <button onClick={() => {
                setFilters(f => ({ ...f, format: '' }));
                setPage(1);
              }}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Dreams list */}
      {myDreams.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Nenhum sonho encontrado"
          description={hasFilters || query
              ? 'Tente remover alguns filtros ou mudar a busca.'
            : 'Você ainda não publicou nenhum sonho. Compartilhe uma cena possível, com privacidade e cuidado desde o início.'}
          actionLabel={hasFilters || query ? 'Limpar filtros' : 'Compartilhar um sonho'}
          onAction={hasFilters || query ? () => { clearFilters(); setQuery(''); } : () => navigate('/paciente/sonhos/criar')}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          {myDreams.map(dream => {
            const visual = getSafeDreamVisual(dream.category);
            const dreamLink = dream.canEdit === false ? `/paciente/sonhos/${dream.id}` : `/paciente/sonhos/editar/${dream.id}`;
            return (
              <div
                key={dream.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#eadfd2] shadow-[0_16px_44px_rgba(92,62,51,0.06)] hover:shadow-[0_22px_60px_rgba(92,62,51,0.1)] transition-all duration-300 flex flex-col h-full relative"
              >
                <Link to={dreamLink} className="block flex-1 flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <SafeDreamArtwork scene={visual.scene} alt={visual.alt} className="transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241b24]/48 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-[#fff4d8]/94 px-3 py-1.5 text-xs font-extrabold text-[#8b3d44] shadow-sm backdrop-blur-sm">
                        {dream.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 text-[#5c4b52] shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {dream.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-3">
                      <DreamStatusBadge status={dream.status} />
                    </div>
                    {dream.managedByInstitution && dream.institutionName && (
                      <p className="text-xs text-indigo-600 mb-2">
                        Caso acompanhado por {dream.institutionName}
                      </p>
                    )}
                    <h3 className="text-lg font-extrabold text-[#241b24] mb-2 leading-snug group-hover:text-[#8b3d44] transition-colors line-clamp-2">
                      {dream.title}
                    </h3>
                    <p className="text-[#5c4b52] text-sm leading-relaxed flex-1 line-clamp-3 mb-6">
                      {dream.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-[#eadfd2] mt-auto">
                      <span className="inline-flex items-center gap-1.5 text-[#66585e] text-xs font-bold">
                        {dream.format === 'remoto' ? 'Online' : dream.format === 'presencial' ? 'Presencial' : 'Ambos'}
                      </span>
                      <span className="text-[#a8544a] text-xs font-extrabold hover:text-[#8b3d44]">
                        {dream.canEdit === false ? 'Ver história' : 'Ajustar com cuidado'}
                      </span>
                    </div>
                  </div>
                </Link>
                {dream.canEdit !== false && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/paciente/sonhos/editar/${dream.id}`);
                    }}
                    className="absolute bottom-6 right-6 w-10 h-10 bg-white border border-[#eadfd2] rounded-full flex items-center justify-center text-[#66585e] hover:text-[#a8544a] hover:border-[#ecd8c8] hover:bg-[#fff8ef] shadow-sm transition-all z-10"
                    title="Editar sonho"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <EntityPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </ProductPageShell>
  );
}
