import { Link } from 'react-router';
import { Users, Star, Send, MessageCircle, AlertTriangle, TrendingUp, CheckCircle, ChevronRight, Shield } from 'lucide-react';
import { mockAdminStats, mockReports, mockUsers } from '../../data/mockData';
import { ReportStatusBadge } from '../../components/shared/StatusBadge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { mes: 'Out', sonhos: 18, conexoes: 7 },
  { mes: 'Nov', sonhos: 32, conexoes: 14 },
  { mes: 'Dez', sonhos: 45, conexoes: 21 },
  { mes: 'Jan', sonhos: 67, conexoes: 35 },
  { mes: 'Fev', sonhos: 85, conexoes: 21 },
];

export default function AdminOverview() {
  const openReports = mockReports.filter(r => r.status === 'nova' || r.status === 'em-analise');
  const recentUsers = mockUsers.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Visão Geral</h1>
          <p className="text-gray-500 text-sm">NextDream • Painel Administrativo</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Sistema operacional
        </div>
      </div>

      {/* Alerts */}
      {openReports.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">{openReports.length} denúncia{openReports.length > 1 ? 's' : ''} aberta{openReports.length > 1 ? 's' : ''}</p>
              <p className="text-xs text-red-600">Requerem atenção imediata</p>
            </div>
          </div>
          <Link to="/admin/denuncias" className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-xl transition-colors">
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total de sonhos', value: mockAdminStats.totalDreams, sub: `${mockAdminStats.publishedDreams} publicados`, icon: Star, color: 'bg-pink-100 text-pink-600', link: '/admin/sonhos' },
          { label: 'Total de propostas', value: mockAdminStats.totalProposals, sub: 'Desde o início', icon: Send, color: 'bg-blue-100 text-blue-600', link: '/admin/propostas' },
          { label: 'Conexões realizadas', value: mockAdminStats.completedConnections, sub: 'Sonhos concluídos', icon: CheckCircle, color: 'bg-green-100 text-green-600', link: '/admin/sonhos' },
          { label: 'Chats ativos', value: mockAdminStats.activeChats, sub: 'Em andamento', icon: MessageCircle, color: 'bg-teal-100 text-teal-600', link: '/admin/chats' },
        ].map((kpi, i) => (
          <Link key={i} to={kpi.link} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all group">
            <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center mb-3`}>
              <kpi.icon className="w-4 h-4" />
            </div>
            <p className="text-gray-800 mb-0.5" style={{ fontWeight: 700, fontSize: '1.5rem' }}>{kpi.value}</p>
            <p className="text-sm text-gray-600">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { label: 'Usuários totais', value: mockAdminStats.totalPatients + mockAdminStats.totalSupporters, sub: `${mockAdminStats.totalPatients} pacientes • ${mockAdminStats.totalSupporters} apoiadores`, icon: Users, color: 'bg-orange-100 text-orange-600', link: '/admin/usuarios' },
          { label: 'Novos esta semana', value: mockAdminStats.newUsersThisWeek, sub: 'Novos cadastros', icon: TrendingUp, color: 'bg-pink-100 text-pink-600', link: '/admin/usuarios' },
        ].map((kpi, i) => (
          <Link key={i} to={kpi.link} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${kpi.color} flex items-center justify-center shrink-0`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-800 mb-0.5" style={{ fontWeight: 700, fontSize: '1.75rem' }}>{kpi.value}</p>
              <p className="text-sm text-gray-600">{kpi.label}</p>
              <p className="text-xs text-gray-400">{kpi.sub}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </Link>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-800 text-sm">Crescimento da plataforma</h2>
          <span className="text-xs text-gray-400">Últimos 5 meses</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} id="growth-chart">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area key="sonhos" type="monotone" dataKey="sonhos" stroke="#D91B8C" fill="#FCE4F2" strokeWidth={2} name="Sonhos" isAnimationActive={false} />
              <Area key="conexoes" type="monotone" dataKey="conexoes" stroke="#0d9488" fill="#ccfbf1" strokeWidth={2} name="Conexões" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Recent reports */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-gray-800 text-sm">Denúncias recentes</h2>
            <Link to="/admin/denuncias" className="text-orange-600 text-xs hover:text-orange-700 flex items-center gap-1">
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {mockReports.slice(0, 3).map(report => (
              <Link key={report.id} to="/admin/denuncias" className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${report.priority === 'alta' ? 'bg-red-500' : report.priority === 'media' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">{report.reporterName} → {report.reportedUserName || 'Conteúdo'}</p>
                  <p className="text-xs text-gray-400 capitalize">{report.type}</p>
                </div>
                <ReportStatusBadge status={report.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-gray-800 text-sm">Usuários recentes</h2>
            <Link to="/admin/usuarios" className="text-orange-600 text-xs hover:text-orange-700 flex items-center gap-1">
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold
                  ${user.role === 'paciente' ? 'bg-pink-100 text-pink-700' : 'bg-teal-100 text-teal-700'}`}>
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role} • {user.city || 'Sem cidade'}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {user.verified && <Shield className="w-3 h-3 text-green-500" />}
                  <span className={`w-2 h-2 rounded-full ${user.status === 'ativo' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
