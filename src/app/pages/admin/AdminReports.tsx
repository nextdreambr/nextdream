import { useEffect, useState } from 'react';
import { ApiError, AdminReport, adminApi } from '../../lib/api';

export default function AdminReports() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [error, setError] = useState('');

  async function loadReports() {
    try {
      const data = await adminApi.listReports();
      setReports(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível carregar denúncias.');
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  async function resolve(reportId: string) {
    try {
      await adminApi.updateReportStatus(reportId, 'resolvido', 'Resolvido via painel administrativo.');
      await loadReports();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível resolver a denúncia.');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Denúncias</h1>
        <p className="text-sm text-gray-500">Acompanhamento e resolução de reports.</p>
      </div>

      <div className="space-y-2">
        {reports.map((report) => (
          <article key={report.id} className="bg-white border border-pink-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-800">{report.type} • alvo #{report.targetId.slice(0, 8)}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${report.status === 'resolvido' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {report.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">{report.reason}</p>
            {report.status !== 'resolvido' && (
              <button onClick={() => resolve(report.id)} className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs">
                Marcar resolvido
              </button>
            )}
          </article>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
