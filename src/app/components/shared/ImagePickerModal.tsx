import { useState, useEffect } from 'react';
import { X, Check, Search, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export interface StockImage {
  id: string;
  url: string;
  alt: string;
  category: string;
}

const STOCK_IMAGES: StockImage[] = [
  // Natureza & Mar
  { id: 'n1', url: 'https://images.unsplash.com/photo-1680321888550-f62f2c20884f?w=600&q=80', alt: 'Nascer do sol na praia',        category: 'Natureza & Mar' },
  { id: 'n2', url: 'https://images.unsplash.com/photo-1771767643930-f3c1d62e9b4d?w=600&q=80', alt: 'Ondas do mar tropical',          category: 'Natureza & Mar' },
  { id: 'n3', url: 'https://images.unsplash.com/photo-1763434182752-ff8d1e28e411?w=600&q=80', alt: 'Cachoeira na floresta',          category: 'Natureza & Mar' },
  { id: 'n4', url: 'https://images.unsplash.com/photo-1677120111814-7d8ca1cfd902?w=600&q=80', alt: 'Céu estrelado à noite',          category: 'Natureza & Mar' },
  // Paisagens
  { id: 'p1', url: 'https://images.unsplash.com/photo-1635351261340-55f437000b21?w=600&q=80', alt: 'Montanhas ao pôr do sol',        category: 'Paisagens' },
  { id: 'p2', url: 'https://images.unsplash.com/photo-1684931627126-ed85d431e7d5?w=600&q=80', alt: 'Trilha na floresta verde',        category: 'Paisagens' },
  { id: 'p3', url: 'https://images.unsplash.com/photo-1564230259732-38be02d788df?w=600&q=80', alt: 'Jardim florido primavera',       category: 'Paisagens' },
  // Música & Arte
  { id: 'm1', url: 'https://images.unsplash.com/photo-1592851090648-b79d585025e6?w=600&q=80', alt: 'Violão acústico',                category: 'Música & Arte' },
  { id: 'm2', url: 'https://images.unsplash.com/photo-1580728010673-a38ee56ca5cb?w=600&q=80', alt: 'Piano ao vivo',                  category: 'Música & Arte' },
  { id: 'm3', url: 'https://images.unsplash.com/photo-1611005747783-fd51a1408e42?w=600&q=80', alt: 'Dança ballet',                   category: 'Música & Arte' },
  { id: 'm4', url: 'https://images.unsplash.com/photo-1752649936104-3d8cf663e30e?w=600&q=80', alt: 'Pintura colorida em tela',       category: 'Música & Arte' },
  { id: 'm5', url: 'https://images.unsplash.com/photo-1758521232708-d738b0eaa94a?w=600&q=80', alt: 'Esboço a lápis criativo',        category: 'Música & Arte' },
  // Família & Pessoas
  { id: 'f1', url: 'https://images.unsplash.com/photo-1766818436630-a0ad200a561d?w=600&q=80', alt: 'Família feliz no parque',        category: 'Família & Pessoas' },
  { id: 'f2', url: 'https://images.unsplash.com/photo-1669042447722-ea8dac27b71d?w=600&q=80', alt: 'Amigos rindo ao ar livre',       category: 'Família & Pessoas' },
  // Viagem & Descoberta
  { id: 'v1', url: 'https://images.unsplash.com/photo-1765424729147-80bf745b18e1?w=600&q=80', alt: 'Cidade colorida na Europa',      category: 'Viagem & Descoberta' },
  { id: 'v2', url: 'https://images.unsplash.com/photo-1760191796857-86d46c52e6a7?w=600&q=80', alt: 'Câmera fotográfica vintage',     category: 'Viagem & Descoberta' },
  // Aprendizado
  { id: 'a1', url: 'https://images.unsplash.com/photo-1763368230669-3a2e97368032?w=600&q=80', alt: 'Livro aberto em biblioteca',     category: 'Aprendizado' },
  // Gastronomia
  { id: 'g1', url: 'https://images.unsplash.com/photo-1766375886788-604dafdb138b?w=600&q=80', alt: 'Prato gastronômico especial',   category: 'Gastronomia' },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1600626336264-60ef2a55bd33?w=600&q=80', alt: 'Cozinhando em casa com amor',   category: 'Gastronomia' },
  // Animais
  { id: 'an1', url: 'https://images.unsplash.com/photo-1741875995514-d82aff66f1fd?w=600&q=80', alt: 'Animais de estimação',         category: 'Animais' },
];

const CATEGORIES = ['Todas', 'Natureza & Mar', 'Paisagens', 'Música & Arte', 'Família & Pessoas', 'Viagem & Descoberta', 'Aprendizado', 'Gastronomia', 'Animais'];

interface Props {
  onSelect: (img: StockImage) => void;
  onClose: () => void;
  currentUrl?: string;
}

export function ImagePickerModal({ onSelect, onClose, currentUrl }: Props) {
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    currentUrl ? (STOCK_IMAGES.find(i => i.url.startsWith(currentUrl.split('?')[0]))?.id ?? null) : null
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = STOCK_IMAGES.filter(img => {
    const matchCat = activeCategory === 'Todas' || img.category === activeCategory;
    const matchSearch = !search || img.alt.toLowerCase().includes(search.toLowerCase()) || img.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const selected = STOCK_IMAGES.find(i => i.id === selectedId);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <p className="text-gray-800" style={{ fontWeight: 700 }}>Banco de imagens</p>
              <p className="text-gray-400 text-xs">{STOCK_IMAGES.length} fotos disponíveis · Unsplash</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por tema..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-5 py-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs transition-all border
                  ${activeCategory === cat
                    ? 'bg-pink-600 text-white border-pink-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-pink-200 hover:text-pink-600'}`}
                style={{ fontWeight: activeCategory === cat ? 600 : 400 }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <ImageIcon className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Nenhuma imagem encontrada</p>
              <button onClick={() => { setSearch(''); setActiveCategory('Todas'); }}
                className="mt-2 text-xs text-pink-600 hover:underline">
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(img => {
                const isSelected = selectedId === img.id;
                const isHovered = hoveredId === img.id;
                return (
                  <button key={img.id}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden transition-all group
                      ${isSelected ? 'ring-3 ring-pink-500 ring-offset-2' : 'hover:ring-2 hover:ring-pink-300 hover:ring-offset-1'}`}
                    onClick={() => setSelectedId(img.id)}
                    onMouseEnter={() => setHoveredId(img.id)}
                    onMouseLeave={() => setHoveredId(null)}>
                    <ImageWithFallback
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Overlay on hover / selected */}
                    <div className={`absolute inset-0 transition-opacity duration-200
                      ${isSelected ? 'bg-pink-600/30' : isHovered ? 'bg-black/20' : 'bg-transparent'}`} />
                    {/* Check icon */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    {/* Alt text on hover */}
                    <div className={`absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-200
                      ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}`}>
                      <p className="text-white text-xs truncate">{img.alt}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          {/* Preview */}
          <div className="flex-1 min-w-0">
            {selected ? (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                  <ImageWithFallback src={selected.url} alt={selected.alt} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-700 text-xs truncate" style={{ fontWeight: 600 }}>{selected.alt}</p>
                  <p className="text-gray-400 text-xs">{selected.category}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Selecione uma imagem acima</p>
            )}
          </div>
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shrink-0"
            style={{ fontWeight: 500 }}>
            Cancelar
          </button>
          <button
            onClick={() => { if (selected) { onSelect(selected); onClose(); } }}
            disabled={!selected}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl transition-colors shrink-0
              ${selected ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            style={{ fontWeight: 600 }}>
            Usar esta foto <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
