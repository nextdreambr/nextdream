import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'success';
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, variant = 'default' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#eadfd2] bg-white/78 py-14 px-6 text-center">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4
        ${variant === 'success' ? 'bg-[#e5f4ee]' : 'bg-[#fff4d8]'}`}>
        <Icon className={`w-7 h-7 ${variant === 'success' ? 'text-[#245b53]' : 'text-[#a8544a]'}`} />
      </div>
      <h3 className="text-[#241b24] mb-2 font-extrabold">{title}</h3>
      <p className="text-[#5c4b52] text-sm max-w-sm leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[#a8544a] hover:bg-[#8b3d44] text-white px-5 py-2.5 rounded-full font-extrabold transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
