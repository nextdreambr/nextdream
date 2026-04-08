import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X, MapPin, Video, Users } from 'lucide-react';
import { DreamCard } from '../../components/shared/DreamCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { useNavigate } from 'react-router';
import { DREAM_CATEGORIES } from '../../data/dreamCategories';
import { ApiError, PublicDream, dreamsApi } from '../../lib/api';

export default function ExploreDreams() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [dreams, setDreams] = useState<PublicDream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    format: '',
    urgency: '',
    verifiedOnly: false,
    shortDuration: false,
  });

  useEffect(() => {
    let mounted = true;

    async function loadDreams() {
      setLoading(true);
      setError('');
      try {
        const data = await dreamsApi.listPublic();
        if (mounted) setDreams(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Não foi possível carregar os sonhos no momento.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadDreams();

    return () => {
      mounted = false;
    };
  }, []);

  const publishedDreams = dreams.filter(d => d.status === 'publicado' || d.status === 'em-conversa');

  const filtered = publishedDreams.filter(d => {
    if (query && !d.title.toLowerCase().includes(query.toLowerCase()) && !d.description.toLowerCase().includes(query.toLowerCase())) return false;
    if (filters.category && d.category !== filters.category) return false;
    if (filters.format && d.format !== filters.format && d.format !== 'ambos') return false;
    if (filters.urgency && d.urgency !== filters.urgency) return false;
    return true;
  });

  const clearFilters = () => setFilters({ category: '', format: '', urgency: '', verifiedOnly: false, shortDuration: false });
  const hasFilters = filters.category || filters.format || filters.urgency || filters.verifiedOnly;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Explorar Sonhos</h1>
        <p className="text-gray-500 text-sm">
          {loading ? 'Carregando sonhos...' : `${filtered.length} sonhos aguardando um apoiador como você`}
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por título, descrição..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors
            ${showFilters || hasFilters ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasFilters && <span className="w-2 h-2 bg-white rounded-full" />}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700">
                <X className="w-3 h-3" /> Limpar filtros
              </button>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Categoria</p>
            <div className="flex flex-wrap gap-2">
              {DREAM_CATEGORIES.slice(0, 8).map(cat => (
                <button key={cat} onClick={() => setFilters(f => ({ ...f, category: f.category === cat ? '' : cat }))}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                    ${filters.category === cat ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600 hover:border-teal-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Formato</p>
            <div className="flex gap-2">
              {[
                { val: 'remoto', label: '💻 Online', icon: Video },
                { val: 'presencial', label: '📍 Presencial', icon: MapPin },
                { val: 'ambos', label: '🤝 Ambos', icon: Users },
              ].map(f => (
                <button key={f.val} onClick={() => setFilters(fm => ({ ...fm, format: fm.format === f.val ? '' : f.val }))}
                  className={`flex-1 py-2 rounded-xl text-xs border font-medium transition-all
                    ${filters.format === f.val ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600 hover:border-teal-200'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Urgência</p>
            <div className="flex gap-2">
              {[
                { val: 'alta', label: '🔴 Alta' },
                { val: 'media', label: '🟡 Média' },
                { val: 'baixa', label: '🟢 Baixa' },
              ].map(u => (
                <button key={u.val} onClick={() => setFilters(f => ({ ...f, urgency: f.urgency === u.val ? '' : u.val }))}
                  className={`flex-1 py-2 rounded-xl text-xs border font-medium transition-all
                    ${filters.urgency === u.val ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600 hover:border-teal-200'}`}>
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-700">Apenas verificados</p>
              <p className="text-xs text-gray-400">Mostrar apenas pacientes verificados</p>
            </div>
            <button
              onClick={() => setFilters(f => ({ ...f, verifiedOnly: !f.verifiedOnly }))}
              className={`w-10 h-5.5 rounded-full transition-colors ${filters.verifiedOnly ? 'bg-teal-600' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.verifiedOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <span className="flex items-center gap-1.5 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs">
              {filters.category}
              <button onClick={() => setFilters(f => ({ ...f, category: '' }))}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.format && (
            <span className="flex items-center gap-1.5 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs">
              {filters.format}
              <button onClick={() => setFilters(f => ({ ...f, format: '' }))}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.urgency && (
            <span className="flex items-center gap-1.5 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs">
              Urgência: {filters.urgency}
              <button onClick={() => setFilters(f => ({ ...f, urgency: '' }))}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Dreams grid */}
      {error ? (
        <EmptyState
          icon={Search}
          title="Não foi possível carregar os sonhos"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => window.location.reload()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum sonho encontrado"
          description="Tente remover alguns filtros ou mudar a busca."
          actionLabel="Limpar filtros"
          onAction={clearFilters}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(dream => (
            <DreamCard
              key={dream.id}
              dream={{
                ...dream,
                tags: [dream.category, dream.format, dream.urgency],
                proposalsCount: 0,
              }}
              onClick={() => navigate(`/apoiador/sonhos/${dream.id}`)}
              variant="supporter"
            />
          ))}
        </div>
      )}
    </div>
  );
}
