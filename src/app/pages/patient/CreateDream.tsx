import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, ArrowRight, CheckCircle, AlertTriangle,
  Lock, Star, Globe, Shield, Image as ImageIcon, X, Pencil, MapPin, ChevronDown, HeartHandshake,
} from 'lucide-react';
import { DREAM_CATEGORIES } from '../../data/dreamCategories';
import { ImagePickerModal, type StockImage } from '../../components/shared/ImagePickerModal';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { BRAZIL_STATES } from '../../data/brazilCities';
import { ApiError, dreamsApi } from '../../lib/api';
import { getCitiesForState } from '../../lib/location';
import {
  FieldHelp,
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
  return BLOCKED_WORDS.some(w => text.toLowerCase().includes(w));
}

export default function CreateDream() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    type: [] as string[],
    format: '',
    days: [] as string[],
    state: '',
    city: '',
    restrictions: '',
    language: 'Português',
    privacy: 'publico',
    hideName: false,
    urgency: 'media',
    verifiedOnly: false,
    coverImage: null as StockImage | null,
  });
  const [warning, setWarning] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const navigate = useNavigate();

  const handleDescChange = (val: string) => {
    setWarning(checkForMoney(val) ? 'O NextDream não permite pedidos de dinheiro, PIX ou doações. Ajuste sua mensagem antes de continuar.' : '');
    setForm(f => ({ ...f, description: val }));
  };

  const toggleType = (t: string) =>
    setForm(f => ({ ...f, type: f.type.includes(t) ? f.type.filter(x => x !== t) : [...f.type, t] }));

  const toggleDay = (d: string) =>
    setForm(f => ({ ...f, days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d] }));

  const canNext = () => {
    if (step === 0) return form.title.trim().length > 0 && form.description.trim().length > 0 && form.category && !warning;
    if (step === 1) return form.format !== '';
    return true;
  };

  const handlePublish = async () => {
    setPublishError('');
    setPublishing(true);
    try {
      await dreamsApi.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        format: form.format as 'remoto' | 'presencial' | 'ambos',
        urgency: form.urgency as 'baixa' | 'media' | 'alta',
        privacy: form.privacy as 'publico' | 'verificados' | 'anonimo',
      });
      navigate('/paciente/sonhos');
    } catch (err) {
      if (err instanceof ApiError) {
        setPublishError(err.message);
      } else {
        setPublishError('Não foi possível publicar o sonho agora. Tente novamente.');
      }
    } finally {
      setPublishing(false);
    }
  };

  const cities = getCitiesForState(form.state);

  return (
    <ProductPageShell data-sandbox-tour-id="patient-create-dream-form" tone="care" width="content">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-[#6b5d63] hover:text-[#8b3d44]">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <ProductHero
        tone="care"
        icon={HeartHandshake}
        eyebrow="Carta guiada"
        title="Compartilhe um sonho com cuidado."
        description="Conte apenas o que for confortável agora. Antes de publicar, você revisa privacidade, limites e como sua história será vista."
        aside={(
          <SensitiveNotice tone="care" title="Você controla a história">
            Nenhuma informação de contato, endereço completo ou dado médico precisa aparecer. O encontro só avança com aceite e consentimento.
          </SensitiveNotice>
        )}
      />

      <GentleProgress steps={steps} current={step} tone="care" />

      <div className="rounded-2xl border border-[#ecd8c8] bg-white p-6 shadow-[0_24px_70px_rgba(92,62,51,0.08)] sm:p-8">

        {/* ── Step 0: Conte seu sonho ── */}
        {step === 0 && (
          <FormSection
            title="Comece pela cena possível"
            description="Escreva como uma carta curta. O importante é deixar claro que tipo de presença, companhia ou habilidade poderia ajudar."
          >
            <SensitiveNotice tone="care" title="Antes de escrever">
              Evite dados médicos detalhados, endereço completo e qualquer pedido financeiro. Você poderá ajustar a exposição antes da publicação.
            </SensitiveNotice>

            {/* Cover image */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>
                Imagem de capa <span className="text-gray-400">(opcional)</span>
              </label>
              {form.coverImage ? (
                <div className="relative rounded-xl overflow-hidden h-40 group">
                  <ImageWithFallback src={form.coverImage.url} alt={form.coverImage.alt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setShowImagePicker(true)}
                      className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-800 text-xs px-3 py-2 rounded-xl transition-colors"
                      style={{ fontWeight: 600 }}>
                      <Pencil className="w-3.5 h-3.5" /> Trocar
                    </button>
                    <button type="button" onClick={() => setForm(f => ({ ...f, coverImage: null }))}
                      className="flex items-center gap-1.5 bg-[#8b3d44]/95 hover:bg-[#8b3d44] text-white text-xs px-3 py-2 rounded-xl transition-colors"
                      style={{ fontWeight: 600 }}>
                      <X className="w-3.5 h-3.5" /> Remover
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-lg">
                    {form.coverImage.alt}
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowImagePicker(true)}
                  className="w-full h-32 border-2 border-dashed border-[#ead8c4] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#a8544a] hover:bg-[#fff4d8]/60 transition-all group">
                  <div className="w-10 h-10 bg-[#fff4d8] rounded-xl flex items-center justify-center group-hover:bg-[#f7d9c6] transition-colors">
                    <ImageIcon className="w-5 h-5 text-[#a8544a]" />
                  </div>
                  <div className="text-center">
                  <p className="text-sm text-[#8b3d44]" style={{ fontWeight: 600 }}>Escolher do banco de imagens</p>
                    <p className="text-xs text-gray-400 mt-0.5">Escolha uma imagem leve, sem exposição de vulnerabilidade.</p>
                  </div>
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-sm text-gray-700 block mb-1.5" style={{ fontWeight: 500 }}>
                Título do sonho <span className="text-[#a8544a]">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex.: Uma tarde ouvindo música com minha família"
                maxLength={80}
                className="w-full px-4 py-3 bg-[#fffaf4] border border-[#ead8c4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbbd] focus:border-[#a8544a]"
              />
              <FieldHelp>{form.title.length}/80 caracteres. Use um título simples e respeitoso.</FieldHelp>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-gray-700 block mb-1.5" style={{ fontWeight: 500 }}>
                Descreva seu sonho <span className="text-[#a8544a]">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => handleDescChange(e.target.value)}
                placeholder="Conte com calma o momento desejado, quem precisa estar junto e quais limites devem ser respeitados."
                rows={4}
                className={`w-full px-4 py-3 bg-[#fffaf4] border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none
                  ${warning ? 'border-[#a8544a] focus:ring-[#f4cbbd]' : 'border-[#ead8c4] focus:ring-[#f4cbbd]'}`}
              />
              {warning && (
                <div className="flex items-start gap-2 bg-[#fff4d8] border border-[#ead8c4] rounded-xl p-3 mt-2">
                  <AlertTriangle className="w-4 h-4 text-[#a8544a] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#8b3d44]">{warning}</p>
                </div>
              )}
              <FieldHelp>Essa descrição aparece para apoiadores conforme a privacidade escolhida na próxima etapa.</FieldHelp>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>Categoria</label>
              <div className="flex flex-wrap gap-2">
                {DREAM_CATEGORIES.map(cat => (
                  <button type="button" key={cat}
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                      ${form.category === cat ? 'bg-[#a8544a] text-white border-[#a8544a]' : 'border-[#ead8c4] text-[#8b3d44] hover:bg-[#fff4d8]'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>O que você precisa? <span className="text-gray-400 text-xs">(pode marcar vários)</span></label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'companhia',  label: 'Companhia' },
                  { id: 'experiencia', label: 'Experiência' },
                  { id: 'aprendizado', label: 'Aprendizado' },
                  { id: 'conversa',   label: 'Conversa' },
                  { id: 'presenca',   label: 'Presença' },
                ].map(t => (
                  <button type="button" key={t.id} onClick={() => toggleType(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                      ${form.type.includes(t.id) ? 'bg-[#a8544a] text-white border-[#a8544a]' : 'border-[#ead8c4] text-[#8b3d44] hover:bg-[#fff4d8]'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>Janela de cuidado</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'baixa', label: 'Flexível',  ring: 'ring-[#c9e5dc]',  active: 'bg-[#e5f4ee] border-[#245b53] text-[#245b53]'  },
                  { val: 'media', label: 'Moderada',  ring: 'ring-[#f7d9c6]',  active: 'bg-[#fff4d8] border-[#a8544a] text-[#8b3d44]'  },
                  { val: 'alta',  label: 'Mais próxima',   ring: 'ring-[#d8cdeb]',    active: 'bg-[#f6f0ff] border-[#584478] text-[#584478]'        },
                ].map(u => (
                  <button type="button" key={u.val} onClick={() => setForm(f => ({ ...f, urgency: u.val }))}
                    className={`py-2.5 rounded-xl text-xs border-2 transition-all
                      ${form.urgency === u.val ? `${u.active} ring-2 ring-offset-1 ${u.ring}` : 'border-[#ead8c4] text-[#6b5d63] hover:border-[#f4cbbd]'}`}
                    style={{ fontWeight: form.urgency === u.val ? 600 : 400 }}>
                    {u.label}
                  </button>
                ))}
              </div>
              <FieldHelp>Use apenas para orientar disponibilidade e cuidado. Evite criar sensação de pressão ou urgência pública.</FieldHelp>
            </div>
          </FormSection>
        )}

        {/* ── Step 1: Preferências ── */}
        {step === 1 && (
          <FormSection
            title="Preferências de apoio"
            description="Ajude a pessoa apoiadora a entender o que é possível sem revelar mais do que você deseja."
          >

            {/* Format */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>
                Formato <span className="text-[#a8544a]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'remoto',     label: 'Online',     sub: 'Vídeo, chat ou áudio' },
                  { val: 'presencial', label: 'Presencial', sub: 'Encontro físico com cuidado' },
                  { val: 'ambos',      label: 'Ambos', sub: 'A combinar com cuidado' },
                ].map(f => (
                  <button type="button" key={f.val} onClick={() => setForm(fm => ({ ...fm, format: f.val }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all
                      ${form.format === f.val ? 'border-[#a8544a] bg-[#fff4d8]' : 'border-[#ead8c4] hover:border-[#f4cbbd]'}`}>
                    <p className="text-sm">{f.label}</p>
                    <p className="text-xs text-gray-500">{f.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Days */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>Dias preferidos</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'Seg', label: 'Seg' },
                  { key: 'Ter', label: 'Ter' },
                  { key: 'Qua', label: 'Qua' },
                  { key: 'Qui', label: 'Qui' },
                  { key: 'Sex', label: 'Sex' },
                  { key: 'Sáb', label: 'Sáb' },
                  { key: 'Dom', label: 'Dom' },
                ].map(d => {
                  const selected = form.days.includes(d.key);
                  return (
                    <button
                      type="button"
                      key={d.key}
                      onClick={() => toggleDay(d.key)}
                      className={`w-11 h-11 rounded-xl text-xs border-2 transition-all
                        ${selected
                          ? 'bg-[#a8544a] text-white border-[#a8544a] shadow-sm'
                          : 'bg-white border-[#ead8c4] text-[#6b5d63] hover:border-[#f4cbbd] hover:text-[#8b3d44]'
                        }`}
                      style={{ fontWeight: selected ? 700 : 400 }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              {form.days.length > 0 && (
                <p className="text-xs text-[#8b3d44] mt-1.5">
                  Selecionado: {form.days.join(', ')}
                </p>
              )}
              <FieldHelp>Essas preferências são orientação inicial. Nada precisa ser combinado sem uma conversa segura.</FieldHelp>
            </div>

            {/* Location — State + City */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#a8544a]" />
                  Cidade / Região <span className="text-gray-400 text-xs">(opcional)</span>
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* State selector */}
                <div className="relative">
                  <select
                    value={form.state}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm(f => ({ ...f, state: val, city: '' }));
                    }}
                    className="w-full pl-4 pr-9 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundColor: '#fffaf4',
                      border: '1px solid #ead8c4',
                      color: form.state ? '#374151' : '#9ca3af',
                    }}
                  >
                    <option value="">Selecione o estado</option>
                    {BRAZIL_STATES.map(s => (
                      <option key={s.uf} value={s.uf}>{s.uf} — {s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* City selector */}
                <div className="relative">
                  <select
                    value={form.city}
                    onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                    disabled={!form.state}
                    className="w-full pl-4 pr-9 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundColor: form.state ? '#fffaf4' : '#f9fafb',
                      border: `1px solid ${form.state ? '#ead8c4' : '#e5e7eb'}`,
                      color: form.city ? '#374151' : '#9ca3af',
                      cursor: form.state ? 'pointer' : 'not-allowed',
                      opacity: form.state ? 1 : 0.7,
                    }}
                  >
                    <option value="">{form.state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${!form.state ? 'text-gray-300' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* Selected location pill */}
              {form.state && form.city && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1.5 bg-[#fff4d8] text-[#8b3d44] text-xs px-3 py-1 rounded-full" style={{ fontWeight: 500 }}>
                    <MapPin className="w-3 h-3" />
                    {form.city}, {form.state}
                  </span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, state: '', city: '' }))}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <FieldHelp>Informe apenas cidade ou região. Não informe endereço completo nesta etapa.</FieldHelp>
            </div>

            {/* Restrictions */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>
                Restrições ou necessidades especiais <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <textarea
                value={form.restrictions}
                onChange={e => setForm(f => ({ ...f, restrictions: e.target.value }))}
                placeholder="Ex: Uso cadeira de rodas, prefiro tarde, tenho acompanhante..."
                rows={2}
                className="w-full px-4 py-3 bg-[#fffaf4] border border-[#ead8c4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbbd] resize-none"
              />
              <FieldHelp>Compartilhe apenas limites práticos necessários para um encontro respeitoso.</FieldHelp>
            </div>

            {/* Language */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>Idioma</label>
              <select
                value={form.language}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                className="w-full px-4 py-3 bg-[#fffaf4] border border-[#ead8c4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
              >
                <option>Português</option>
                <option>Inglês</option>
                <option>Espanhol</option>
                <option>Outro</option>
              </select>
            </div>
          </FormSection>
        )}

        {/* ── Step 2: Privacidade ── */}
        {step === 2 && (
          <FormSection
            title="Privacidade antes de publicar"
            description="Escolha como a história aparece. Você continua no controle dos próximos passos."
          >

            <div className="space-y-3">
              {[
                { val: 'publico',     icon: Globe,  label: 'Público',             desc: 'Apoiadores podem encontrar este sonho na plataforma.',           color: 'text-[#245b53] bg-[#e5f4ee]' },
                { val: 'verificados', icon: Shield, label: 'Somente verificados', desc: 'Apenas apoiadores com conta verificada podem ver.',            color: 'text-[#245b53] bg-[#e5f4ee]' },
                { val: 'anonimo',     icon: Lock,   label: 'Nome protegido',       desc: 'Seu nome completo não aparece na publicação.',       color: 'text-[#8b3d44] bg-[#f7d9c6]' },
              ].map(p => (
                <button type="button" key={p.val} onClick={() => setForm(f => ({ ...f, privacy: p.val }))}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all
                    ${form.privacy === p.val ? 'border-[#a8544a] bg-[#fff8ef]' : 'border-[#eadfd2] hover:border-[#ecd8c8]'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.color}`}>
                    <p.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{p.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                  </div>
                  {form.privacy === p.val && <CheckCircle className="w-5 h-5 text-[#a8544a] shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>

            <SensitiveNotice tone="care" title="Antes de qualquer contato">
              Nunca exibimos informações médicas, endereço completo ou dados de contato antes da aceitação de uma proposta. O chat só se abre após você aceitar.
            </SensitiveNotice>
          </FormSection>
        )}

        {/* ── Step 3: Revisar e publicar ── */}
        {step === 3 && (
          <FormSection
            title="Revisar antes de publicar"
            description="Leia como uma pessoa apoiadora verá sua história e ajuste o que não estiver confortável."
          >

            {/* Cover preview */}
            {form.coverImage && (
              <div className="relative rounded-xl overflow-hidden h-36">
                <ImageWithFallback src={form.coverImage.url} alt={form.coverImage.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <p className="text-white text-xs opacity-80">Imagem de capa</p>
                  <p className="text-white text-sm" style={{ fontWeight: 600 }}>{form.coverImage.alt}</p>
                </div>
              </div>
            )}

            <div className="bg-[#fff8ef] rounded-xl p-5 space-y-3">
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
                {form.days.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Dias</p>
                    <p className="text-xs text-gray-700">{form.days.join(', ')}</p>
                  </div>
                )}
                {form.city && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Localização</p>
                    <p className="text-xs text-gray-700">{form.city}, {form.state}</p>
                  </div>
                )}
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
                Ao publicar, você confirma que seu sonho <strong>não envolve</strong> pedidos de dinheiro, PIX, transferências ou doações financeiras.
              </p>
            </div>
          </FormSection>
        )}
      </div>

      {publishError && (
        <div className="mt-4 bg-[#fff4d8] border border-[#ead8c4] text-[#8b3d44] text-sm rounded-xl px-4 py-3">
          {publishError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-6 py-3 border border-[#ead8c4] rounded-xl text-[#6b5d63] hover:bg-[#fff4d8] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-colors
              ${canNext() ? 'bg-[#a8544a] hover:bg-[#8b3d44] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            style={{ fontWeight: 600 }}>
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={handlePublish} disabled={publishing}
            className="flex-1 flex items-center justify-center gap-2 bg-[#a8544a] hover:bg-[#8b3d44] text-white py-3 rounded-full transition-colors"
            style={{ fontWeight: 600 }}>
            {publishing
              ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Star className="w-4 h-4" /> Publicar sonho</>
            }
          </button>
        )}
      </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePickerModal
          currentUrl={form.coverImage?.url}
          onSelect={img => setForm(f => ({ ...f, coverImage: img }))}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </ProductPageShell>
  );
}
