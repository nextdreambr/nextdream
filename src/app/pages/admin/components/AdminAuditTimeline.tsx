import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Clock3, ExternalLink } from 'lucide-react';

import { AdminEmptyState } from './AdminStates';

export interface AdminAuditTimelineEvent {
  id: string;
  title: string;
  description?: ReactNode;
  actor?: string;
  date?: string;
  status?: ReactNode;
  href?: string;
}

interface AdminAuditTimelineProps {
  events: AdminAuditTimelineEvent[];
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function AdminAuditTimeline({
  events,
  title = 'Histórico administrativo',
  emptyTitle = 'Nenhum evento registrado',
  emptyDescription = 'Quando houver ações administrativas, elas aparecerão aqui.',
}: AdminAuditTimelineProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      {events.length === 0 ? (
        <div className="mt-4">
          <AdminEmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <article key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-950">{event.title}</div>
                  {event.description && <div className="mt-1 text-sm leading-5 text-slate-600">{event.description}</div>}
                </div>
                {event.status}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {event.actor && <span>{event.actor}</span>}
                {event.date && (
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3.5" />
                    {event.date}
                  </span>
                )}
                {event.href && (
                  <Link to={event.href} className="inline-flex items-center gap-1 font-semibold text-pink-700 hover:text-pink-800">
                    Abrir origem
                    <ExternalLink className="size-3.5" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
