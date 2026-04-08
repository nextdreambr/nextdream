import { useEffect, useState } from 'react';
import { ApiError, AdminEmailTemplateMeta, adminApi } from '../../lib/api';

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState<AdminEmailTemplateMeta[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await adminApi.listEmailTemplates();
        if (mounted) setTemplates(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar os templates de email.');
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Templates de Email</h1>
        <p className="text-sm text-gray-500">Catálogo de comunicação usado pelos fluxos da plataforma.</p>
      </div>

      <div className="space-y-2">
        {templates.map((template) => (
          <article key={template.id} className="bg-white border border-pink-100 rounded-xl p-4">
            <p className="text-xs text-pink-600">{template.category}</p>
            <h2 className="text-sm text-gray-800">{template.name}</h2>
            <p className="text-xs text-gray-500">Destinatário: {template.recipient}</p>
            <p className="text-sm text-gray-600 mt-2">Assunto: {template.subject}</p>
          </article>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
