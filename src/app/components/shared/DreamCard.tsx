import { MapPin, Users, Video, MapPinned, ChevronRight } from 'lucide-react';
import { Dream } from '../../data/mockData';
import { DreamStatusBadge, UrgencyBadge } from './StatusBadge';

const categoryEmoji: Record<string, string> = {
  'Experiência ao ar livre': '🌅',
  'Arte e Música': '🎵',
  'Conversa e Companhia': '💬',
  'Culinária': '🍳',
  'Literatura e Cultura': '📚',
  'Esporte e Lazer': '⚽',
  'Aprendizado e Educação': '🎓',
  'Tecnologia': '💻',
  'Espiritualidade': '🕊️',
  'Família e Memórias': '❤️',
  'Saúde e Bem-estar': '🌿',
  'Outro': '✨',
};

interface DreamCardProps {
  dream: Dream;
  onClick?: () => void;
  variant?: 'supporter' | 'patient';
  showStatus?: boolean;
}

export function DreamCard({ dream, onClick, showStatus = false }: DreamCardProps) {
  const emoji = categoryEmoji[dream.category] || '✨';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-pink-100 p-5 hover:shadow-md hover:border-pink-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-xl shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-gray-800 group-hover:text-pink-700 transition-colors line-clamp-2 text-sm leading-snug">{dream.title}</h3>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pink-500 shrink-0 mt-0.5 transition-colors" />
          </div>
          <p className="text-xs text-pink-600 mt-0.5">{dream.category}</p>
        </div>
      </div>

      <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">{dream.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {dream.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full text-xs">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {dream.patientCity && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {dream.patientCity}
            </span>
          )}
          <span className="flex items-center gap-1">
            {dream.format === 'remoto' ? <Video className="w-3 h-3" /> : dream.format === 'presencial' ? <MapPinned className="w-3 h-3" /> : <Users className="w-3 h-3" />}
            {dream.format === 'remoto' ? 'Online' : dream.format === 'presencial' ? 'Presencial' : 'Ambos'}
          </span>
          {dream.proposalsCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {dream.proposalsCount} {dream.proposalsCount === 1 ? 'proposta' : 'propostas'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {dream.urgency === 'alta' && <UrgencyBadge urgency={dream.urgency} />}
          {showStatus && <DreamStatusBadge status={dream.status} />}
        </div>
      </div>
    </div>
  );
}
