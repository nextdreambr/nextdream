import { useEffect, useState } from 'react';
import { ApiError, PublicDream, adminApi } from '../../lib/api';

const NEXT_STATUS: Array<PublicDream['status']> = ['publicado', 'pausado', 'em-conversa'];

export default function AdminDreams() {
  const [dreams, setDreams] = useState<Array<{ id: string; title: string; category: string; status: PublicDream['status']; patientName?: string; createdAt: string }>>([]);
  const [error, setError] = useState('');

  async function loadDreams() {
    try {
      const data = await adminApi.listDreams();
      setDreams(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível carregar sonhos.');
    }
  }

  useEffect(() => {
    void loadDreams();
  }, []);

  async function cycleStatus(dreamId: string, current: PublicDream['status']) {
    const next = NEXT_STATUS[(NEXT_STATUS.indexOf(current) + 1) % NEXT_STATUS.length] ?? 'publicado';
    try {
      await adminApi.updateDreamStatus(dreamId, next, 'Ajuste operacional via painel admin.');
      await loadDreams();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível atualizar status do sonho.');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Sonhos</h1>
        <p className="text-sm text-gray-500">Moderação de status e visibilidade.</p>
      </div>

      <div className="space-y-2">
        {dreams.map((dream) => (
          <div key={dream.id} className="bg-white border border-pink-100 rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-800">{dream.title}</p>
              <p className="text-xs text-gray-500">{dream.category} • {dream.patientName ?? 'Paciente'}</p>
            </div>
            <button onClick={() => cycleStatus(dream.id, dream.status)} className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs">
              {dream.status}
            </button>
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
