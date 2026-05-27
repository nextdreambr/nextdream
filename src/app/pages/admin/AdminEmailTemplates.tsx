import { useEffect, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { ApiError, AdminEmailTemplateMeta, adminApi } from '../../lib/api';

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState<AdminEmailTemplateMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');

      try {
        const data = await adminApi.listEmailTemplates();
        if (mounted) setTemplates(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar os templates de email.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <MailCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontWeight: 700 }}>Templates de e-mail</h1>
            <p className="mt-1 text-sm text-gray-500">
              Catálogo somente leitura dos fluxos reais de e-mail enviados pela aplicação.
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-600">
          Carregando templates de e-mail...
        </div>
      )}

      {!loading && templates.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
          <div className="text-sm font-medium text-slate-900">Nenhum template encontrado.</div>
          <div className="mt-1 text-sm text-slate-500">O catálogo de envio ainda não retornou metadados.</div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {templates.map((template) => (
          <article key={template.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a8544a]">{template.category}</p>
                <h2 className="mt-2 text-base font-semibold text-gray-900">{template.name}</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {template.channel ?? 'email'}
              </span>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Destinatário</dt>
                <dd className="mt-1 text-gray-800">{template.recipient}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Assunto</dt>
                <dd className="mt-1 text-gray-800">{template.subject}</dd>
              </div>
              {Boolean(template.variables?.length) && (
                <div>
                  <dt className="text-xs text-gray-500">Variáveis obrigatórias</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {template.variables?.map((variable) => (
                      <span key={variable} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                        {variable}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
