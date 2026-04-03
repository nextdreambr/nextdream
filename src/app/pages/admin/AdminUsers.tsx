import { useState, useEffect, useRef } from 'react';
import { Search, Shield, ShieldOff, UserX, MoreVertical, CheckCircle, Flag } from 'lucide-react';
import { mockUsers, mockReports } from '../../data/mockData';
import { useLocation, useNavigate } from 'react-router';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | 'paciente' | 'apoiador'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'suspenso' | 'banido'>('todos');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLTableRowElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-highlight user when navigating from AdminReports
  useEffect(() => {
    const incoming = (location.state as { openId?: string } | null)?.openId;
    if (incoming) {
      // Reset filters so the user is visible
      setSearch('');
      setRoleFilter('todos');
      setStatusFilter('todos');
      setHighlightId(incoming);
    }
  }, []);

  // Scroll to highlighted row
  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => setHighlightId(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [highlightId, highlightRef.current]);

  const filtered = mockUsers.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'todos' && u.role !== roleFilter) return false;
    if (statusFilter !== 'todos' && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Usuários</h1>
          <p className="text-gray-500 text-sm">{mockUsers.length} usuários cadastrados</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div className="flex gap-2">
          {['todos', 'paciente', 'apoiador'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r as any)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors
                ${roleFilter === r ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-200'}`}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['todos', 'ativo', 'suspenso'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s as any)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors
                ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Usuário', 'Papel', 'Localização', 'Status', 'Verificado', 'Cadastro', 'Ações'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr key={user.id}
                  ref={user.id === highlightId ? highlightRef : null}
                  className={`transition-colors ${user.id === highlightId ? 'bg-orange-50 shadow-[inset_0_0_0_2px_theme(colors.orange.400)]' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold
                        ${user.role === 'paciente' ? 'bg-pink-100 text-pink-700' : 'bg-teal-100 text-teal-700'}`}>
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      {mockReports.some(r => r.refType === 'usuario' && r.refId === user.id) && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            const rep = mockReports.filter(r => r.refType === 'usuario' && r.refId === user.id);
                            navigate('/admin/denuncias', { state: { openId: rep[0].id } });
                          }}
                          className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 transition-colors shrink-0"
                          title="Ver denúncia vinculada"
                        >
                          <Flag className="w-2.5 h-2.5" />
                          {mockReports.filter(r => r.refType === 'usuario' && r.refId === user.id).length}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${user.role === 'paciente' ? 'bg-pink-100 text-pink-700' : 'bg-teal-100 text-teal-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{user.city || '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${user.status === 'ativo' ? 'bg-green-100 text-green-700' : user.status === 'suspenso' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ativo' ? 'bg-green-500' : user.status === 'suspenso' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {user.verified
                      ? <span className="flex items-center gap-1 text-xs text-green-600"><Shield className="w-3.5 h-3.5" /> Verificado</span>
                      : <span className="flex items-center gap-1 text-xs text-gray-400"><ShieldOff className="w-3.5 h-3.5" /> Pendente</span>
                    }
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="relative">
                      <button onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {actionMenu === user.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-44 overflow-hidden">
                          <button className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Verificar conta
                          </button>
                          <button className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                            <ShieldOff className="w-3.5 h-3.5 text-yellow-500" /> Suspender
                          </button>
                          <button className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-red-600 hover:bg-red-50">
                            <UserX className="w-3.5 h-3.5" /> Banir usuário
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Mostrando {filtered.length} de {mockUsers.length}</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">← Anterior</button>
            <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">Próximo →</button>
          </div>
        </div>
      </div>
    </div>
  );
}