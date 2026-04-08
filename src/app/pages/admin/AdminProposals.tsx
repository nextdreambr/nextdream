import { useEffect, useState } from 'react';
import { ApiError, Proposal, adminApi } from '../../lib/api';

const NEXT_STATUS: Array<Proposal['status']> = ['em-analise', 'aceita', 'recusada'];

export default function AdminProposals() {
  const [proposals, setProposals] = useState<Array<{ id: string; dreamTitle?: string; supporterName?: string; status: Proposal['status']; createdAt: string }>>([]);
  const [error, setError] = useState('');

  async function loadProposals() {
    try {
      const data = await adminApi.listProposals();
      setProposals(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível carregar propostas.');
    }
  }

  useEffect(() => {
    void loadProposals();
  }, []);

  async function cycleStatus(proposalId: string, current: Proposal['status']) {
    const next = NEXT_STATUS[(NEXT_STATUS.indexOf(current) + 1) % NEXT_STATUS.length] ?? 'em-analise';
    try {
      await adminApi.updateProposalStatus(proposalId, next, 'Revisão operacional via painel admin.');
      await loadProposals();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível atualizar status da proposta.');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Propostas</h1>
        <p className="text-sm text-gray-500">Fila de moderação e revisão.</p>
      </div>

      <div className="space-y-2">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="bg-white border border-pink-100 rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-800">{proposal.dreamTitle ?? 'Sonho sem título'}</p>
              <p className="text-xs text-gray-500">{proposal.supporterName ?? 'Apoiador'} • {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <button onClick={() => cycleStatus(proposal.id, proposal.status)} className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs">
              {proposal.status}
            </button>
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
