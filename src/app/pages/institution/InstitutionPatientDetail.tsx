import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Inbox, Link2, Mail, MapPin, MessageCircle, Star, Users } from 'lucide-react';
import { ApiError, institutionApi, type ManagedPatientDetail } from '../../lib/api';
import { BRAZIL_STATES } from '../../data/brazilCities';
import { getCitiesForState } from '../../lib/location';

function accessStatusLabel(status?: string) {
  if (status === 'ativo') return 'Acesso ativo';
  if (status === 'convite-pendente') return 'Convite pendente';
  return 'Sem acesso';
}

export default function InstitutionPatientDetail() {
  const { managedPatientId = '' } = useParams();
  const [detail, setDetail] = useState<ManagedPatientDetail | null>(null);
  const [patientForm, setPatientForm] = useState({
    name: '',
    state: '',
    city: '',
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingPatient, setSavingPatient] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patientSuccess, setPatientSuccess] = useState('');

  const cities = getCitiesForState(patientForm.state);

  async function load() {
    if (!managedPatientId) return;
    setLoading(true);
    setError('');
    try {
      const data = await institutionApi.getPatient(managedPatientId);
      setDetail(data);
      setPatientForm({
        name: data.patient.name,
        state: data.patient.state ?? '',
        city: data.patient.city ?? '',
      });
      setInviteEmail(data.patient.pendingInviteEmail ?? data.patient.linkedUserEmail ?? '');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível carregar a visão do caso.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePatientSubmit(event: FormEvent) {
    event.preventDefault();
    if (!managedPatientId || !patientForm.name.trim()) return;

    setSavingPatient(true);
    setError('');
    setPatientSuccess('');
    try {
      const updatedPatient = await institutionApi.updatePatient(managedPatientId, {
        name: patientForm.name.trim(),
        state: patientForm.state || undefined,
        city: patientForm.city || undefined,
      });

      setDetail((current) => {
        if (!current) return current;
        return {
          ...current,
          patient: {
            ...current.patient,
            ...updatedPatient,
          },
        };
      });
      setPatientForm({
        name: updatedPatient.name,
        state: updatedPatient.state ?? '',
        city: updatedPatient.city ?? '',
      });
      setPatientSuccess('Dados do paciente atualizados com sucesso.');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível atualizar os dados do paciente.');
    } finally {
      setSavingPatient(false);
    }
  }

  useEffect(() => {
    void load();
  }, [managedPatientId]);

  async function handleInviteSubmit(event: FormEvent) {
    event.preventDefault();
    if (!managedPatientId || !inviteEmail.trim()) return;

    setSendingInvite(true);
    setError('');
    setSuccess('');
    try {
      const invite = await institutionApi.createPatientAccessInvite(managedPatientId, {
        email: inviteEmail.trim(),
      });
      setInviteUrl(invite.inviteUrl);
      setSuccess('Convite enviado e pronto para ativação.');
      await load();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível criar o acesso do paciente.');
    } finally {
      setSendingInvite(false);
    }
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto py-8 text-sm text-gray-500">Carregando visão do caso...</div>;
  }

  if (!detail) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-4">
        <Link to="/instituicao/pacientes" className="inline-flex items-center gap-2 text-sm text-indigo-600">
          <ArrowLeft className="w-4 h-4" />
          Voltar para pacientes
        </Link>
        {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>}
      </div>
    );
  }

  const patient = detail.patient;
  const timeline = detail.timeline ?? [];
  const dreams = detail.dreams ?? [];
  const proposals = detail.proposals ?? [];
  const conversations = detail.conversations ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <Link to="/instituicao/pacientes" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="w-4 h-4" />
          Voltar para pacientes
        </Link>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-gray-800" style={{ fontWeight: 700 }}>{patient.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {patient.locationLabel || 'Localização não informada'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs">
                <Link2 className="w-3.5 h-3.5" />
                {accessStatusLabel(patient.accessStatus)}
              </span>
            </div>
          </div>
          <Link
            to="/instituicao/sonhos/criar"
            state={{ managedPatientId: patient.id }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm"
          >
            <Star className="w-4 h-4" />
            Publicar sonho para este paciente
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Sonhos do caso', value: detail.summary.dreams, icon: Star },
          { label: 'Propostas do caso', value: detail.summary.proposals, icon: Inbox },
          { label: 'Conversas ativas', value: detail.summary.activeConversations, icon: MessageCircle },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-indigo-100 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl text-gray-800" style={{ fontWeight: 700 }}>{item.value}</p>
            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.15fr)_380px] gap-6">
        <div className="space-y-6">
          <section className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Visão do caso</h2>
              <p className="text-xs text-gray-500 mt-1">O beneficiário continua identificado como paciente, enquanto a instituição opera o fluxo com apoiadores.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-indigo-500 text-xs mb-1">Resumo operacional</p>
                <p className="text-gray-700">{patient.caseSummary ?? 'Contexto do caso em construção.'}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-gray-400 text-xs mb-1">Contexto de apoio</p>
                <p className="text-gray-700">{patient.supportContext ?? 'Sem detalhes adicionais informados.'}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-gray-400 text-xs mb-1">Foco de cuidado</p>
                <p className="text-gray-700">{patient.careFocus ?? 'A definir com a equipe.'}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-gray-400 text-xs mb-1">Conta vinculada</p>
                <p className="text-gray-700">{patient.linkedUserEmail ?? 'Ainda não ativada'}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 md:col-span-2">
                <p className="text-gray-400 text-xs mb-1">Convite pendente</p>
                <p className="text-gray-700">{patient.pendingInviteEmail ?? 'Nenhum convite pendente'}</p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-indigo-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-indigo-100">
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Linha do tempo do caso</h2>
              <p className="text-xs text-gray-500 mt-1">Um resumo dos sonhos, propostas, conversas e marcos da sessão.</p>
            </div>
            <div className="divide-y divide-indigo-50">
              {timeline.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500">Ainda não há eventos registrados para este caso.</div>
              ) : (
                timeline.map((entry) => (
                  <div key={entry.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{entry.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                      </div>
                      <span className="whitespace-nowrap text-xs text-gray-400">
                        {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white border border-indigo-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-indigo-100">
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Sonhos relacionados</h2>
            </div>
            <div className="divide-y divide-indigo-50">
              {dreams.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500">Nenhum sonho publicado para este paciente ainda.</div>
              ) : (
                dreams.map((dream) => (
                  <Link
                    key={dream.id}
                    to={`/instituicao/sonhos/editar/${dream.id}`}
                    className="block px-5 py-4 hover:bg-indigo-50/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{dream.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{dream.category} • {dream.status}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(dream.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="bg-white border border-indigo-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-indigo-100">
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Propostas e apoiadores</h2>
            </div>
            <div className="divide-y divide-indigo-50">
              {proposals.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500">Ainda não há propostas ligadas a este caso.</div>
              ) : (
                proposals.map((proposal) => (
                  <div key={proposal.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{proposal.supporterName ?? 'Apoiador'}</p>
                        <p className="text-xs text-gray-500 mt-1">{proposal.dreamTitle ?? 'Sonho'} • {proposal.status}</p>
                      </div>
                      <Link to="/instituicao/propostas" className="text-xs text-indigo-600 hover:text-indigo-700">
                        Ver proposta
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white border border-indigo-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-indigo-100">
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Conversas do caso</h2>
            </div>
            <div className="divide-y divide-indigo-50">
              {conversations.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500">Nenhuma conversa iniciada para este paciente.</div>
              ) : (
                conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    to={`/instituicao/chat?conversationId=${conversation.id}`}
                    className="block px-5 py-4 hover:bg-indigo-50/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{conversation.dreamTitle ?? 'Conversa ativa'}</p>
                        <p className="text-xs text-gray-500 mt-1">{conversation.supporterName ?? 'Apoiador'} • {conversation.status}</p>
                      </div>
                      <span className="text-xs text-indigo-600">Abrir chat</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Dados do paciente</h2>
              <p className="text-xs text-gray-500 mt-1">Atualize o cadastro básico do beneficiário sem sair da visão do caso.</p>
            </div>

            <form onSubmit={handlePatientSubmit} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="patient-detail-name" className="text-sm text-gray-700">Nome do paciente</label>
                <input
                  id="patient-detail-name"
                  value={patientForm.name}
                  onChange={(event) => setPatientForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Nome completo do paciente"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="patient-detail-state" className="text-sm text-gray-700">Estado</label>
                <select
                  id="patient-detail-state"
                  value={patientForm.state}
                  onChange={(event) => setPatientForm((current) => ({
                    ...current,
                    state: event.target.value,
                    city: '',
                  }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Selecione</option>
                  {BRAZIL_STATES.map((state) => (
                    <option key={state.uf} value={state.uf}>
                      {state.name} ({state.uf})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="patient-detail-city" className="text-sm text-gray-700">Cidade</label>
                <select
                  id="patient-detail-city"
                  value={patientForm.city}
                  onChange={(event) => setPatientForm((current) => ({ ...current, city: event.target.value }))}
                  disabled={!patientForm.state}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
                >
                  <option value="">{patientForm.state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={savingPatient || !patientForm.name.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-3 text-sm"
              >
                {savingPatient ? 'Salvando...' : 'Salvar dados do paciente'}
              </button>
            </form>

            {patientSuccess && <p className="text-sm text-green-700">{patientSuccess}</p>}
          </section>

          <section className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Criar acesso do paciente</h2>
              <p className="text-xs text-gray-500 mt-1">Convide o paciente por e-mail para acompanhar o próprio caso sem tirar a instituição da operação.</p>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="patient-access-email" className="text-sm text-gray-700">Email do paciente</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="patient-access-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="paciente@exemplo.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingInvite || patient.accessStatus === 'ativo'}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-3 text-sm"
              >
                <Users className="w-4 h-4" />
                {patient.accessStatus === 'ativo' ? 'Acesso já ativado' : sendingInvite ? 'Enviando convite...' : 'Enviar convite'}
              </button>
            </form>

            {success && <p className="text-sm text-green-700">{success}</p>}
            {inviteUrl && (
              <div className="rounded-2xl bg-indigo-50 p-4 space-y-2">
                <p className="text-xs text-indigo-700">Link de ativação</p>
                <a href={inviteUrl} className="text-xs text-indigo-700 break-all underline">
                  {inviteUrl}
                </a>
              </div>
            )}
          </section>
        </aside>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
