import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowRight, Star } from 'lucide-react';
import { DREAM_CATEGORIES } from '../../data/dreamCategories';
import { ApiError, dreamsApi, institutionApi, type ManagedPatient } from '../../lib/api';
import { formatLocationLabel } from '../../lib/location';

export default function InstitutionCreateDream() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [patients, setPatients] = useState<ManagedPatient[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(DREAM_CATEGORIES[0] ?? 'Outro');
  const [format, setFormat] = useState<'remoto' | 'presencial' | 'ambos'>('presencial');
  const [urgency, setUrgency] = useState<'baixa' | 'media' | 'alta'>('media');
  const [privacy, setPrivacy] = useState<'publico' | 'verificados' | 'anonimo'>('publico');
  const [managedPatientId, setManagedPatientId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [data, dream] = await Promise.all([
          institutionApi.listPatients(),
          id ? dreamsApi.getById(id) : Promise.resolve(null),
        ]);
        if (!mounted) return;
        setPatients(data);
        if (dream) {
          setTitle(dream.title);
          setDescription(dream.description);
          setCategory(dream.category);
          setFormat(dream.format);
          setUrgency(dream.urgency);
          setPrivacy(dream.privacy);
          setManagedPatientId(dream.managedPatientId ?? data[0]?.id ?? '');
        } else {
          setTitle('');
          setDescription('');
          setCategory(DREAM_CATEGORIES[0] ?? 'Outro');
          setFormat('presencial');
          setUrgency('media');
          setPrivacy('publico');
          setManagedPatientId(data[0]?.id ?? '');
        }
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar os pacientes da instituição.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!managedPatientId) {
      setError('Selecione um paciente acompanhado antes de publicar o sonho.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        title,
        description,
        category,
        format,
        urgency,
        privacy,
        managedPatientId,
      };
      if (id) {
        await dreamsApi.update(id, payload);
      } else {
        await dreamsApi.create(payload);
      }
      navigate('/instituicao/sonhos');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(isEditing ? 'Não foi possível atualizar o sonho agora.' : 'Não foi possível publicar o sonho agora.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>{isEditing ? 'Editar sonho institucional' : 'Publicar sonho institucional'}</h1>
        <p className="text-sm text-gray-500">
          {isEditing
            ? 'Atualize o sonho em nome do paciente acompanhado e mantenha o contexto institucional consistente.'
            : 'Escolha o paciente acompanhado e descreva o sonho com clareza para os apoiadores.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-indigo-100 rounded-2xl p-6 space-y-4">
        {loading && <p className="text-sm text-gray-500">Carregando dados do sonho...</p>}
        <div>
          <label htmlFor="managed-patient-id" className="text-sm text-gray-700 block mb-1.5">Paciente acompanhado</label>
          <select
            id="managed-patient-id"
            value={managedPatientId}
            onChange={(event) => setManagedPatientId(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">Selecione</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}{formatLocationLabel(patient) ? ` • ${formatLocationLabel(patient)}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="institution-dream-title" className="text-sm text-gray-700 block mb-1.5">Título do sonho</label>
          <input
            id="institution-dream-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="institution-dream-description" className="text-sm text-gray-700 block mb-1.5">Descrição</label>
          <textarea
            id="institution-dream-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="institution-dream-category" className="text-sm text-gray-700 block mb-1.5">Categoria</label>
            <select
              id="institution-dream-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {DREAM_CATEGORIES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="institution-dream-format" className="text-sm text-gray-700 block mb-1.5">Formato</label>
            <select
              id="institution-dream-format"
              value={format}
              onChange={(event) => setFormat(event.target.value as 'remoto' | 'presencial' | 'ambos')}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="institution-dream-urgency" className="text-sm text-gray-700 block mb-1.5">Urgência</label>
            <select
              id="institution-dream-urgency"
              value={urgency}
              onChange={(event) => setUrgency(event.target.value as 'baixa' | 'media' | 'alta')}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div>
            <label htmlFor="institution-dream-privacy" className="text-sm text-gray-700 block mb-1.5">Privacidade</label>
            <select
              id="institution-dream-privacy"
              value={privacy}
              onChange={(event) => setPrivacy(event.target.value as 'publico' | 'verificados' | 'anonimo')}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="publico">Público</option>
              <option value="verificados">Somente verificados</option>
              <option value="anonimo">Anônimo</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-medium"
        >
          {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Star className="w-4 h-4" />}
          {isEditing ? 'Salvar alterações' : 'Publicar sonho'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
