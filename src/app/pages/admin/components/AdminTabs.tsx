import type { ComponentType, ReactNode } from 'react';

export interface AdminTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  badge?: ReactNode;
}

interface AdminTabsProps<T extends string = string> {
  tabs: AdminTabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export function AdminTabs<T extends string = string>({ tabs, activeTab, onChange }: AdminTabsProps<T>) {
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              active
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            {Icon && <Icon className="size-4" />}
            {tab.label}
            {tab.badge}
          </button>
        );
      })}
    </nav>
  );
}
