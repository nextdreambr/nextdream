import { Link, useNavigate } from 'react-router';
import { Plus, Star, Search, SlidersHorizontal, X, Edit, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DreamStatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { DREAM_CATEGORIES } from '../../data/dreamCategories';
import { ApiError, PublicDream, dreamsApi } from '../../lib/api';

type DreamStatus = PublicDream['status'];

const statusOptions: { value: DreamStatus; label: string }[] = [
  { value: 'publicado', label: 'Publicado' },
  { value: 'em-conversa', label: 'Em conversa' },
  { value: 'realizando', label: 'Realizando' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'pausado', label: 'Pausado' },
];

const categoryTheme: Record<string, { img: string; accent: string; tagColor: string }> = {
  'Experiência ao ar livre': { img: 'https://images.unsplash.com/photo-1480882194365-f8653456ca74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGUlMjBob3BlfGVufDF8fHx8MTc3MjgyMTE2OHww&ixlib=rb-4.1.0&q=80&w=1080', accent: 'from-green-800/70', tagColor: 'bg-green-100 text-green-700' },
  'Arte e Música': { img: 'https://images.unsplash.com/photo-1741463562795-8d32ad942d31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBhbmQlMjBwYWludGluZ3xlbnwxfHx8fDE3NzI4MjExNjh8MA&ixlib=rb-4.1.0&q=80&w=1080', accent: 'from-purple-700/70', tagColor: 'bg-purple-100 text-purple-700' },
  'Conversa e Companhia': { img: 'https://images.unsplash.com/photo-1758525226705-3061215c7445?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB0YWxraW5nJTIwc2hhcmluZyUyMGNvZmZlZXxlbnwxfHx8fDE3NzI4MjExNjh8MA&ixlib=rb-4.1.0&q=80&w=1080', accent: 'from-blue-700/70', tagColor: 'bg-blue-100 text-blue-700' },
  'Culinária': { img: 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwYXQlMjBob21lfGVufDF8fHx8MTc3MjgyMTE2OHww&ixlib=rb-4.1.0&q=80&w=1080', accent: 'from-orange-600/70', tagColor: 'bg-orange-100 text-orange-700' },
  'Literatura e Cultura': { img: 'https://images.unsplash.com/photo-1744912739625-1c188aa85c7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', accent: 'from-indigo-700/70', tagColor: 'bg-indigo-100 text-indigo-700' },
  'Esporte e Lazer': { img: 'https://images.unsplash.com/photo-1607756196359-bfe2f3a335b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', accent: 'from-teal-700/70', tagColor: 'bg-teal-100 text-teal-700' },
  'Outro': { img: 'https://images.unsplash.com/photo-1646148327698-614edde70c94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', accent: 'from-pink-700/70', tagColor: 'bg-pink-100 text-pink-700' },
};

export default function MyDreams() {
  const navigate = useNavigate();
  const [myDreams, setMyDreams] = useState<PublicDream[]>([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '' as DreamStatus | '',
    category: '',
    format: '',
  });

  useEffect(() => {
    let mounted = true;
    async function loadDreams() {
      try {
        const dreams = await dreamsApi.listMine();
        if (mounted) setMyDreams(dreams);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar seus sonhos.');
      }
    }
    void loadDreams();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = myDreams.filter(d => {
    if (query && !d.title.toLowerCase().includes(query.toLowerCase()) && !d.description.toLowerCase().includes(query.toLowerCase())) return false;
    if (filters.status && d.status !== filters.status) return false;
    if (filters.category && d.category !== filters.category) return false;
    if (filters.format && d.format !== filters.format && d.format !== 'ambos') return false;
    return true;
  });

  const clearFilters = () => setFilters({ status: '', category: '', format: '' });
  const hasFilters = !!(filters.status || filters.category || filters.format);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Meus Sonhos</h1>
          <p className="text-gray-500 text-sm">{myDreams.length} {myDreams.length === 1 ? 'sonho' : 'sonhos'} no total</p>
        </div>
        <Link to="/paciente/sonhos/criar"
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Novo sonho
        </Link>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por título, descrição..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors
            ${showFilters || hasFilters ? 'bg-pink-600 text-white border-pink-600' : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300'}`}
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
                  onClick={() => setFilters(f => ({ ...f, status: f.status === s.value ? '' : s.value }))}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                    ${filters.status === s.value ? 'bg-pink-600 text-white border-pink-600' : 'border-gray-200 text-gray-600 hover:border-pink-200'}`}
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
                  onClick={() => setFilters(f => ({ ...f, category: f.category === cat ? '' : cat }))}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                    ${filters.category === cat ? 'bg-pink-600 text-white border-pink-600' : 'border-gray-200 text-gray-600 hover:border-pink-200'}`}
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
              {[
                { val: 'remoto', label: '💻 Online' },
                { val: 'presencial', label: '📍 Presencial' },
                { val: 'ambos', label: '🤝 Ambos' },
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setFilters(fm => ({ ...fm, format: fm.format === f.val ? '' : f.val }))}
                  className={`flex-1 py-2 rounded-xl text-xs border font-medium transition-all
                    ${filters.format === f.val ? 'bg-pink-600 text-white border-pink-600' : 'border-gray-200 text-gray-600 hover:border-pink-200'}`}
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
              <button onClick={() => setFilters(f => ({ ...f, status: '' }))}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.category && (
            <span className="flex items-center gap-1.5 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs">
              {filters.category}
              <button onClick={() => setFilters(f => ({ ...f, category: '' }))}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.format && (
            <span className="flex items-center gap-1.5 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs">
              {filters.format === 'remoto' ? '💻 Online' : filters.format === 'presencial' ? '📍 Presencial' : '🤝 Ambos'}
              <button onClick={() => setFilters(f => ({ ...f, format: '' }))}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Dreams list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Nenhum sonho encontrado"
          description={hasFilters || query
            ? 'Tente remover alguns filtros ou mudar a busca.'
            : 'Você ainda não publicou nenhum sonho. Compartilhe o que você deseja e encontre alguém para ajudar.'}
          actionLabel={hasFilters || query ? 'Limpar filtros' : 'Compartilhar um sonho'}
          onAction={hasFilters || query ? () => { clearFilters(); setQuery(''); } : () => navigate('/paciente/sonhos/criar')}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          {filtered.map(dream => {
            const theme = categoryTheme[dream.category] || categoryTheme['Outro'];
            return (
              <div
                key={dream.id}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
              >
                <Link to={`/paciente/sonhos/${dream.id}`} className="block flex-1 flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={theme.img}
                      alt={dream.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${theme.accent} to-transparent opacity-80`} />
                    <div className="absolute top-4 left-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${theme.tagColor} bg-opacity-90 backdrop-blur-sm shadow-sm`}>
                        {dream.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 text-gray-700 shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {dream.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-3">
                      <DreamStatusBadge status={dream.status} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-pink-600 transition-colors line-clamp-2">
                      {dream.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3 mb-6">
                      {dream.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                        {dream.format === 'remoto' ? '💻 Online' : dream.format === 'presencial' ? '📍 Presencial' : '🤝 Ambos'}
                      </span>
                      <span className="text-pink-600 text-xs font-bold hover:text-pink-700">Ver detalhes →</span>
                    </div>
                  </div>
                </Link>
                {/* Botão de Edição Flutuante */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/paciente/sonhos/editar/${dream.id}`);
                  }}
                  className="absolute bottom-6 right-6 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 shadow-sm transition-all z-10"
                  title="Editar sonho"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
