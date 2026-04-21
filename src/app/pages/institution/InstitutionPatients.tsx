import { FormEvent, useEffect, useState } from 'react';
import { Building2, MapPin, PencilLine, Plus, Search, Users, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiError, institutionApi, type ManagedPatient } from '../../lib/api';
import { BRAZIL_STATES } from '../../data/brazilCities';
import { formatLocationLabel, getCitiesForState } from '../../lib/location';
import { EntityPagination } from '../../components/shared/EntityPagination';

const PAGE_SIZE = 2;

type PatientFormState = {
  name: string;
  state: string;
  city: string;
};

const initialFormState: PatientFormState = {
  name: '',
  state: '',
  city: '',
};

export default function InstitutionPatients() {
  const { currentUser } = useApp();
  const [patients, setPatients] = useState<ManagedPatient[]>([]);
  const [form, setForm] = useState<PatientFormState>(initialFormState);
  const [editingPatient, setEditingPatient] = useState<ManagedPatient | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cities = getCitiesForState(form.state);
  const hasIncompleteLocation = Boolean((form.state && !form.city) || (!form.state && form.city));
  const isEditing = Boolean(editingPatient);

  async function loadPatients(nextPage = page, nextQuery = query) {
    setLoading(true);
    setError('');
    try {
      const data = await institutionApi.listPatientsPage({
        page: nextPage,
        pageSize: PAGE_SIZE,
        query: nextQuery,
      });
      setPatients(data.items);
      setPage(data.page);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível carregar os pacientes acompanhados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!currentUser?.approved) {
      return;
    }

    void loadPatients(page, query);
  }, [currentUser?.approved, page, query]);

  function resetForm() {
    setForm(initialFormState);
    setEditingPatient(null);
  }

  function startEditing(patient: ManagedPatient) {
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      state: patient.state ?? '',
      city: patient.city ?? '',
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      return;
    }
    if (hasIncompleteLocation) {
      setError('Preencha estado e cidade juntos ou deixe ambos em branco.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        state: form.state || undefined,
        city: form.city.trim() || undefined,
      };

      if (editingPatient) {
        await institutionApi.updatePatient(editingPatient.id, payload);
      } else {
        await institutionApi.createPatient(payload);
      }

      resetForm();
      await loadPatients(page, query);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(isEditing ? 'Não foi possível atualizar o paciente agora.' : 'Não foi possível adicionar o paciente agora.');
    } finally {
      setSaving(false);
    }
  }

  if (!currentUser?.approved) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-indigo-100 rounded-2xl p-6 text-sm text-gray-600">
        A aprovação da conta institucional é necessária antes de cadastrar pacientes acompanhados.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Pacientes acompanhados</h1>
          <p className="text-sm text-gray-500">
            Gerencie a carteira da instituição com edição rápida e localização padronizada.
          </p>
        </div>

        <div className="w-full lg:w-80 relative">
          <label htmlFor="institution-patients-search" className="sr-only">Buscar pacientes</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="institution-patients-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar pacientes"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-6">
        <form onSubmit={handleSubmit} className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              <Building2 className="w-3.5 h-3.5" />
              {isEditing ? 'Editar paciente' : 'Novo paciente'}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancelar edição
              </button>
            )}
          </div>

          <div>
            <label htmlFor="institution-patient-name" className="text-sm text-gray-700 block mb-1.5">Nome do paciente</label>
            <input
              id="institution-patient-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Ex: Maria das Dores"
            />
          </div>

          <div>
            <label htmlFor="institution-patient-state" className="text-sm text-gray-700 block mb-1.5">Estado</label>
            <select
              id="institution-patient-state"
              value={form.state}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  state: event.target.value,
                  city: '',
                }));
              }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Selecione</option>
              {BRAZIL_STATES.map((item) => (
                <option key={item.uf} value={item.uf}>
                  {item.name} ({item.uf})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="institution-patient-city" className="text-sm text-gray-700 block mb-1.5">Cidade</label>
            <select
              id="institution-patient-city"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              disabled={!form.state}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
            >
              <option value="">{form.state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving || !form.name.trim() || hasIncompleteLocation}
            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-xl text-sm font-medium"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : isEditing ? <PencilLine className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditing ? 'Salvar edição' : 'Adicionar paciente'}
          </button>
        </form>

        <div className="bg-white border border-indigo-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-indigo-100 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Lista da instituição</h2>
              <p className="text-xs text-gray-500">
                {total} paciente{total === 1 ? '' : 's'} encontrado{total === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-500">Carregando pacientes...</div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-800">Nenhum paciente acompanhado ainda</p>
              <p className="text-xs text-gray-500">
                Use o formulário ao lado para começar a montar sua carteira de acompanhamento.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-indigo-50">
              {patients.map((patient) => (
                <div key={patient.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{patient.name}</p>
                    <p className="text-xs text-gray-500 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {formatLocationLabel(patient) || 'Localização não informada'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">Acompanhado</span>
                    <button
                      type="button"
                      onClick={() => startEditing(patient)}
                      aria-label={`Editar ${patient.name}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:border-indigo-200 hover:text-indigo-700"
                    >
                      <PencilLine className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-4 border-t border-indigo-100">
            <EntityPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
