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
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4
        ${variant === 'success' ? 'bg-green-100' : 'bg-pink-100'}`}>
        <Icon className={`w-8 h-8 ${variant === 'success' ? 'text-green-500' : 'text-pink-500'}`} />
      </div>
      <h3 className="text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}