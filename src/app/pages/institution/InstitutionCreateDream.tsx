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
  HeartHandshake,
} from 'lucide-react';
import { DREAM_CATEGORIES } from '../../data/dreamCategories';
import { ApiError, dreamsApi, institutionApi, type ManagedPatient } from '../../lib/api';
import { formatLocationLabel } from '../../lib/location';
import {
  FormSection,
  GentleProgress,
  ProductHero,
  ProductPageShell,
  SensitiveNotice,
} from '../../components/shared/VisualSystem';

const steps = ['Conte seu sonho', 'Preferências', 'Privacidade', 'Revisar e publicar'];

const BLOCKED_WORDS = ['pix', 'doação', 'doacao', 'transferência', 'transferencia', 'pagamento', 'dinheiro', 'reais', 'r$', 'vaquinha'];
const CARE_WINDOW_LABELS: Record<'baixa' | 'media' | 'alta', string> = {
  baixa: 'Flexível',
  media: 'Moderada',
  alta: 'Mais próxima',
};

function checkForMoney(text: string): boolean {
  return BLOCKED_WORDS.some((word) => text.toLowerCase().includes(word));
}

function getDescriptionWarning(text: string): string {
  return checkForMoney(text)
    ? 'O NextDream não permite pedidos de dinheiro, PIX ou doações. Ajuste sua mensagem antes de continuar.'
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
    <ProductPageShell data-sandbox-tour-id="institution-create-dream-form" tone="institution" width="content">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[#5f5268] hover:text-[#584478]">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <ProductHero
        tone="institution"
        icon={HeartHandshake}
        eyebrow="História mediada"
        title={isEditing ? 'Editar sonho institucional' : 'Publicar sonho institucional'}
        description="A instituição ajuda a organizar a história, mas privacidade, consentimento e limites do beneficiário continuam no centro."
        aside={(
          <SensitiveNotice tone="institution" title="Responsabilidade institucional">
            Publique apenas com autorização adequada. Evite detalhes médicos, endereço completo e qualquer pedido financeiro.
          </SensitiveNotice>
        )}
      />

      {selectedPatient && (
        <div className="rounded-2xl border border-[#d8cdeb] bg-[#f6f0ff] p-4">
          <p className="text-xs text-[#584478] mb-1 font-bold">Beneficiário do caso</p>
          <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{selectedPatient.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            Dado interno da instituição. {formatLocationLabel(selectedPatient) || 'Localização não informada'} • A instituição continua operando propostas e conversas
          </p>
        </div>
      )}

      <GentleProgress steps={steps} current={step} tone="institution" />

      <div className="bg-white rounded-2xl border border-[#d8cdeb] p-6 shadow-[0_24px_70px_rgba(88,68,120,0.08)] sm:p-8">
        {loading ? (
          <div className="py-6 text-sm text-gray-500">Carregando dados do sonho...</div>
        ) : (
          <>
            {step === 0 && (
              <FormSection
                title="Conte uma cena possível"
                description="Escolha o beneficiário correto e descreva apenas o necessário para apoiadores entenderem presença, limites e formato."
              >
                <SensitiveNotice tone="institution" title="Antes de escrever">
                  A história deve respeitar consentimento, privacidade e dignidade do beneficiário. Não inclua diagnóstico, endereço completo ou pedido financeiro.
                </SensitiveNotice>

                <div>
                  <label htmlFor="managed-patient-id" className="text-sm text-gray-700 block mb-1.5" style={{ fontWeight: 500 }}>
                    Paciente acompanhado <span className="text-[#584478]">*</span>
                  </label>
                  <select
                    id="managed-patient-id"
                    value={managedPatientId}
                    onChange={(event) => setManagedPatientId(event.target.value)}
                    className="w-full px-4 py-3 bg-[#fffdfd] border border-[#d8cdeb] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d8cdeb] focus:border-[#584478]"
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
                    Título do sonho <span className="text-[#584478]">*</span>
                  </label>
                  <input
                    id="institution-dream-title"
                    type="text"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Ex.: Uma tarde ouvindo música com a família"
                    maxLength={80}
                    className="w-full px-4 py-3 bg-[#fffdfd] border border-[#d8cdeb] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d8cdeb] focus:border-[#584478]"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.title.length}/80 caracteres</p>
                </div>

                <div>
                  <label htmlFor="institution-dream-description" className="text-sm text-gray-700 block mb-1.5" style={{ fontWeight: 500 }}>
                    Descreva seu sonho <span className="text-[#584478]">*</span>
                  </label>
                  <textarea
                    id="institution-dream-description"
                    value={form.description}
                    onChange={(event) => handleDescChange(event.target.value)}
                    placeholder="Conte com cuidado o momento desejado, quem precisa estar junto e quais limites devem ser respeitados."
                    rows={4}
                    className={`w-full px-4 py-3 bg-[#fffdfd] border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none ${
                      warning ? 'border-[#584478] focus:ring-[#d8cdeb]' : 'border-[#d8cdeb] focus:ring-[#d8cdeb]'
                    }`}
                  />
                  {warning && (
                    <div className="flex items-start gap-2 bg-[#f6f0ff] border border-[#d8cdeb] rounded-xl p-3 mt-2">
                      <AlertTriangle className="w-4 h-4 text-[#584478] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#584478]">{warning}</p>
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
                          form.category === category ? 'bg-[#584478] text-white border-[#584478]' : 'border-[#d8cdeb] text-[#584478] hover:bg-[#f6f0ff]'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>Janela de cuidado</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'baixa', label: 'Flexível', ring: 'ring-[#c9e5dc]', active: 'bg-[#e5f4ee] border-[#245b53] text-[#245b53]' },
                      { val: 'media', label: 'Moderada', ring: 'ring-[#f7d9c6]', active: 'bg-[#fff4d8] border-[#a8544a] text-[#8b3d44]' },
                      { val: 'alta', label: 'Mais próxima', ring: 'ring-[#d8cdeb]', active: 'bg-[#f6f0ff] border-[#584478] text-[#584478]' },
                    ].map((urgency) => (
                      <button
                        type="button"
                        key={urgency.val}
                        onClick={() => setForm((current) => ({ ...current, urgency: urgency.val }))}
                        className={`py-2.5 rounded-xl text-xs border-2 transition-all ${
                          form.urgency === urgency.val ? `${urgency.active} ring-2 ring-offset-1 ${urgency.ring}` : 'border-[#d8cdeb] text-[#5f5268] hover:border-[#bda9d8]'
                        }`}
                        style={{ fontWeight: form.urgency === urgency.val ? 600 : 400 }}
                      >
                        {urgency.label}
                      </button>
                    ))}
                  </div>
                </div>
              </FormSection>
            )}

            {step === 1 && (
              <FormSection
                title="Preferências de apoio"
                description="Mostre como o apoio pode acontecer sem expor a pessoa acompanhada além do necessário."
              >

                <div>
                  <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>
                    Formato <span className="text-[#584478]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'remoto', label: 'Online', sub: 'Vídeo, chat ou áudio' },
                      { val: 'presencial', label: 'Presencial', sub: 'Encontro físico com cuidado' },
                      { val: 'ambos', label: 'Ambos', sub: 'A combinar com cuidado' },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.val}
                        onClick={() => setForm((current) => ({ ...current, format: option.val }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          form.format === option.val ? 'border-[#584478] bg-[#f6f0ff]' : 'border-[#d8cdeb] hover:border-[#bda9d8]'
                        }`}
                      >
                        <p className="text-sm">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </FormSection>
            )}

            {step === 2 && (
              <FormSection
                title="Privacidade antes de publicar"
                description="Controle quem pode ver e como este sonho aparece para apoiadores."
              >

                <div className="space-y-3">
                  {[
                    { val: 'publico', icon: Globe, label: 'Público', desc: 'Apoiadores podem encontrar este sonho na plataforma', color: 'text-[#245b53] bg-[#e5f4ee]' },
                    { val: 'verificados', icon: Shield, label: 'Somente verificados', desc: 'Apenas apoiadores com conta verificada podem ver', color: 'text-[#245b53] bg-[#e5f4ee]' },
                    { val: 'anonimo', icon: Lock, label: 'Nome protegido', desc: 'O nome completo do paciente não aparece na publicação', color: 'text-[#584478] bg-[#f6f0ff]' },
                  ].map((privacy) => (
                    <button
                      type="button"
                      key={privacy.val}
                      onClick={() => setForm((current) => ({ ...current, privacy: privacy.val }))}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        form.privacy === privacy.val ? 'border-[#584478] bg-[#f8f5ff]' : 'border-[#eadfd2] hover:border-[#d8cdeb]'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${privacy.color}`}>
                        <privacy.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{privacy.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{privacy.desc}</p>
                      </div>
                      {form.privacy === privacy.val && <CheckCircle className="w-5 h-5 text-[#584478] shrink-0 mt-0.5" />}
                    </button>
                  ))}
                </div>

                <SensitiveNotice tone="institution" title="Antes de qualquer contato">
                  Nunca exibimos informações médicas, endereço completo ou dados de contato antes da aceitação de uma proposta. O chat só se abre após a instituição aceitar.
                </SensitiveNotice>
              </FormSection>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-gray-800 mb-1">Revisar e publicar</h2>
                  <p className="text-gray-500 text-sm">Confira tudo antes de publicar. A instituição pode editar depois.</p>
                </div>

                <div className="bg-[#f8f5ff] rounded-xl p-5 space-y-3">
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
                      <p className="text-xs text-gray-400 mb-0.5">Janela de cuidado</p>
                      <p className="text-xs text-gray-700">{CARE_WINDOW_LABELS[form.urgency as 'baixa' | 'media' | 'alta']}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#e5f4ee] border border-[#c9e5dc] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-[#245b53]" />
                    <p className="text-sm text-[#245b53]" style={{ fontWeight: 500 }}>Verificação de conteúdo</p>
                  </div>
                  <p className="text-xs text-[#245b53]">Nenhum conteúdo financeiro foi detectado.</p>
                </div>

                <div className="bg-[#fff4d8] border border-[#ead8c4] rounded-xl p-4">
                  <p className="text-xs text-[#6b5d63] leading-relaxed">
                    Ao publicar, a instituição confirma que o sonho <strong>não envolve</strong> pedidos de dinheiro, PIX, transferências ou doações financeiras.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {publishError && (
        <div className="mt-4 bg-[#f6f0ff] border border-[#d8cdeb] text-[#584478] text-sm rounded-xl px-4 py-3">
          {publishError}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="flex items-center gap-2 px-6 py-3 border border-[#d8cdeb] rounded-xl text-[#5f5268] hover:bg-[#f6f0ff] transition-colors"
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
              canNext() && !loading ? 'bg-[#584478] hover:bg-[#44345f] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
            className="flex-1 flex items-center justify-center gap-2 bg-[#584478] hover:bg-[#44345f] text-white py-3 rounded-full transition-colors"
            style={{ fontWeight: 600 }}
          >
            {publishing
              ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Star className="w-4 h-4" /> {isEditing ? 'Salvar alterações' : 'Publicar sonho'}</>
            }
          </button>
        )}
      </div>
    </ProductPageShell>
  );
}
