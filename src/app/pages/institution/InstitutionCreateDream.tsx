import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Lock,
  Shield,
} from 'lucide-react';
import { DREAM_CATEGORIES } from '../../data/dreamCategories';
import { ApiError, dreamsApi, institutionApi, type ManagedPatient } from '../../lib/api';
import { formatLocationLabel } from '../../lib/location';

const steps = ['Conte seu sonho', 'Preferências', 'Privacidade', 'Revisar e publicar'];

const BLOCKED_WORDS = ['pix', 'doação', 'doacao', 'transferência', 'transferencia', 'pagamento', 'dinheiro', 'reais', 'r$', 'vaquinha'];

function checkForMoney(text: string): boolean {
  return BLOCKED_WORDS.some((word) => text.toLowerCase().includes(word));
}

function getDescriptionWarning(text: string): string {
  return checkForMoney(text)
    ? 'O NextDream não permite pedidos de dinheiro, PIX ou doações. Ajuste sua mensagem. 🚫'
    : '';
}

export default function InstitutionCreateDream() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [step, setStep] = useState(0);
  const [patients, setPatients] = useState<ManagedPatient[]>([]);
  const [managedPatientId, setManagedPatientId] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    format: '',
    privacy: 'publico',
    urgency: 'media',
  });
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  const preferredManagedPatientId = (location.state as { managedPatientId?: string } | null)?.managedPatientId;
  const selectedPatient = patients.find((patient) => patient.id === managedPatientId) ?? null;

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setPublishError('');
      try {
        const [patientList, dream] = await Promise.all([
          institutionApi.listPatients(),
          id ? dreamsApi.getById(id) : Promise.resolve(null),
        ]);

        if (!mounted) return;
        setPatients(patientList);

        const nextManagedPatientId = isEditing
          ? dream?.managedPatientId ?? preferredManagedPatientId ?? ''
          : dream?.managedPatientId ?? preferredManagedPatientId ?? patientList[0]?.id ?? '';
        setManagedPatientId(nextManagedPatientId);
        setWarning(getDescriptionWarning((dream?.description ?? '').trim()));
        setForm((current) => ({
          ...current,
          title: dream?.title ?? '',
          description: dream?.description ?? '',
          category: dream?.category ?? '',
          format: dream?.format ?? '',
          privacy: dream?.privacy ?? 'publico',
          urgency: dream?.urgency ?? 'media',
        }));
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiError) setPublishError(err.message);
        else setPublishError('Não foi possível carregar o sonho institucional.');
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
  }, [id, isEditing, preferredManagedPatientId]);

  const handleDescChange = (value: string) => {
    setWarning(getDescriptionWarning(value.trim()));
    setForm((current) => ({ ...current, description: value }));
  };

  const canNext = () => {
    if (step === 0) {
      return managedPatientId.length > 0 && form.title.trim().length > 0 && form.description.trim().length > 0 && form.category && !warning;
    }
    if (step === 1) {
      return form.format !== '';
    }
    return true;
  };

  async function handlePublish() {
    if (!managedPatientId) {
      setPublishError('Selecione o paciente acompanhado antes de publicar o sonho.');
      setStep(0);
      return;
    }

    const trimmedDescription = form.description.trim();
    const descriptionWarning = getDescriptionWarning(trimmedDescription);
    setWarning(descriptionWarning);
    if (descriptionWarning) {
      setPublishError('Revise a descrição do sonho antes de publicar.');
      setStep(0);
      return;
    }

    setPublishing(true);
    setPublishError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: trimmedDescription,
        category: form.category,
        format: form.format as 'remoto' | 'presencial' | 'ambos',
        urgency: form.urgency as 'baixa' | 'media' | 'alta',
        privacy: form.privacy as 'publico' | 'verificados' | 'anonimo',
        managedPatientId,
      };

      if (id) {
        await dreamsApi.update(id, payload);
      } else {
        await dreamsApi.create(payload);
      }

      navigate('/instituicao/sonhos');
    } catch (err) {
      if (err instanceof ApiError) {
        setPublishError(err.message);
      } else {
        setPublishError(isEditing ? 'Não foi possível atualizar o sonho agora.' : 'Não foi possível publicar o sonho agora. Tente novamente.');
      }
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div data-sandbox-tour-id="institution-create-dream-form" className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>
          {isEditing ? 'Editar sonho institucional' : 'Publicar sonho institucional'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Mesmo fluxo do paciente, com a instituição operando o caso em nome do beneficiário.
        </p>
      </div>

      {selectedPatient && (
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-xs text-indigo-700 mb-1">Beneficiário do caso</p>
          <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{selectedPatient.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatLocationLabel(selectedPatient) || 'Localização não informada'} • A instituição continua operando propostas e conversas
          </p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  index < step ? 'bg-pink-600 text-white' : index === step ? 'bg-pink-600 text-white ring-4 ring-pink-100' : 'bg-gray-200 text-gray-500'
                }`}
                style={{ fontWeight: 600 }}
              >
                {index < step ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded-full ${index < step ? 'bg-pink-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs">
          {steps.map((label, index) => (
            <span key={label} className={index === step ? 'text-pink-600' : 'text-gray-400'} style={{ fontWeight: index === step ? 500 : 400 }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 p-6 sm:p-8">
        {loading ? (
          <div className="py-6 text-sm text-gray-500">Carregando dados do sonho...</div>
        ) : (
          <>
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-gray-800 mb-1">Conte seu sonho</h2>
                  <p className="text-gray-500 text-sm">Escolha o beneficiário certo e descreva o que a instituição quer tornar possível.</p>
                </div>

                <div>
                  <label htmlFor="managed-patient-id" className="text-sm text-gray-700 block mb-1.5" style={{ fontWeight: 500 }}>
                    Paciente acompanhado <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="managed-patient-id"
                    value={managedPatientId}
                    onChange={(event) => setManagedPatientId(event.target.value)}
                    className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="">Selecione o paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}{formatLocationLabel(patient) ? ` • ${formatLocationLabel(patient)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="institution-dream-title" className="text-sm text-gray-700 block mb-1.5" style={{ fontWeight: 500 }}>
                    Título do sonho <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="institution-dream-title"
                    type="text"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Ex: Ver o nascer do sol na praia uma última vez"
                    maxLength={80}
                    className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.title.length}/80 caracteres</p>
                </div>

                <div>
                  <label htmlFor="institution-dream-description" className="text-sm text-gray-700 block mb-1.5" style={{ fontWeight: 500 }}>
                    Descreva seu sonho <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="institution-dream-description"
                    value={form.description}
                    onChange={(event) => handleDescChange(event.target.value)}
                    placeholder="Conte com suas palavras o que o paciente deseja, por que isso é especial e como um apoiador pode ajudar..."
                    rows={4}
                    className={`w-full px-4 py-3 bg-pink-50 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none ${
                      warning ? 'border-red-300 focus:ring-red-300' : 'border-pink-100 focus:ring-pink-300'
                    }`}
                  />
                  {warning && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700">{warning}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {DREAM_CATEGORIES.map((category) => (
                      <button
                        type="button"
                        key={category}
                        onClick={() => setForm((current) => ({ ...current, category }))}
                        className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${
                          form.category === category ? 'bg-pink-600 text-white border-pink-600' : 'border-pink-200 text-pink-700 hover:bg-pink-50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>Urgência</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'baixa', label: '🟢 Baixa', ring: 'ring-green-300', active: 'bg-green-50 border-green-400 text-green-700' },
                      { val: 'media', label: '🟡 Média', ring: 'ring-amber-300', active: 'bg-amber-50 border-amber-400 text-amber-700' },
                      { val: 'alta', label: '🔴 Alta', ring: 'ring-red-300', active: 'bg-red-50 border-red-400 text-red-700' },
                    ].map((urgency) => (
                      <button
                        type="button"
                        key={urgency.val}
                        onClick={() => setForm((current) => ({ ...current, urgency: urgency.val }))}
                        className={`py-2.5 rounded-xl text-xs border-2 transition-all ${
                          form.urgency === urgency.val ? `${urgency.active} ring-2 ring-offset-1 ${urgency.ring}` : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                        style={{ fontWeight: form.urgency === urgency.val ? 600 : 400 }}
                      >
                        {urgency.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-gray-800 mb-1">Preferências de apoio</h2>
                  <p className="text-gray-500 text-sm">Como, quando e onde o apoio faz mais sentido para este paciente?</p>
                </div>

                <div>
                  <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>
                    Formato <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'remoto', label: '💻 Online', sub: 'Video, chat, áudio' },
                      { val: 'presencial', label: '📍 Presencial', sub: 'Encontro físico' },
                      { val: 'ambos', label: '🤝 Ambos', sub: 'Sem restrição' },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.val}
                        onClick={() => setForm((current) => ({ ...current, format: option.val }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          form.format === option.val ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-pink-200'
                        }`}
                      >
                        <p className="text-sm">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-gray-800 mb-1">Configurações de privacidade</h2>
                  <p className="text-gray-500 text-sm">Controle quem pode ver e como este sonho aparece para apoiadores.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { val: 'publico', icon: Globe, label: 'Público', desc: 'Qualquer pessoa na plataforma pode ver este sonho', color: 'text-blue-600 bg-blue-100' },
                    { val: 'verificados', icon: Shield, label: 'Somente verificados', desc: 'Apenas apoiadores com conta verificada podem ver', color: 'text-teal-600 bg-teal-100' },
                    { val: 'anonimo', icon: Lock, label: 'Anônimo', desc: 'O nome completo do paciente não aparece na publicação', color: 'text-pink-600 bg-pink-100' },
                  ].map((privacy) => (
                    <button
                      type="button"
                      key={privacy.val}
                      onClick={() => setForm((current) => ({ ...current, privacy: privacy.val }))}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        form.privacy === privacy.val ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${privacy.color}`}>
                        <privacy.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{privacy.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{privacy.desc}</p>
                      </div>
                      {form.privacy === privacy.val && <CheckCircle className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />}
                    </button>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    📌 <strong>Nunca exibimos</strong> informações médicas, endereço completo ou dados de contato antes da aceitação de uma proposta. O chat só se abre após a instituição aceitar.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-gray-800 mb-1">Revisar e publicar</h2>
                  <p className="text-gray-500 text-sm">Confira tudo antes de publicar. A instituição pode editar depois.</p>
                </div>

                <div className="bg-pink-50 rounded-xl p-5 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Beneficiário</p>
                    <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{selectedPatient?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Título</p>
                    <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{form.title || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Descrição</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{form.description || '—'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Categoria</p>
                      <p className="text-xs text-gray-700">{form.category || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Formato</p>
                      <p className="text-xs text-gray-700 capitalize">{form.format || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Privacidade</p>
                      <p className="text-xs text-gray-700 capitalize">{form.privacy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Urgência</p>
                      <p className="text-xs text-gray-700 capitalize">{form.urgency}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-700" style={{ fontWeight: 500 }}>Verificação de conteúdo</p>
                  </div>
                  <p className="text-xs text-green-600">Nenhum conteúdo financeiro (PIX, dinheiro, doação) foi detectado. ✓</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Ao publicar, a instituição confirma que o sonho <strong>não envolve</strong> pedidos de dinheiro, PIX, transferências ou doações financeiras.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {publishError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {publishError}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current + 1)}
            disabled={!canNext() || loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
              canNext() && !loading ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            style={{ fontWeight: 600 }}
          >
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || loading}
            className="flex-1 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl transition-colors"
            style={{ fontWeight: 600 }}
          >
            {publishing
              ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Star className="w-4 h-4" /> {isEditing ? 'Salvar alterações' : 'Publicar sonho'}</>
            }
          </button>
        )}
      </div>
    </div>
  );
}
