import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, ArrowRight, CheckCircle, AlertTriangle,
  Lock, Star, Globe, Shield, Image as ImageIcon, X, Pencil, MapPin, ChevronDown,
} from 'lucide-react';
import { dreamCategories } from '../../data/mockData';
import { ImagePickerModal, type StockImage } from '../../components/shared/ImagePickerModal';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { BRAZIL_STATES } from '../../data/brazilCities';

const steps = ['Conte seu sonho', 'Preferências', 'Privacidade', 'Revisar e publicar'];

const BLOCKED_WORDS = ['pix', 'doação', 'doacao', 'transferência', 'transferencia', 'pagamento', 'dinheiro', 'reais', 'r$', 'vaquinha'];

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
  const [showImagePicker, setShowImagePicker] = useState(false);
  const navigate = useNavigate();

  const handleDescChange = (val: string) => {
    setWarning(checkForMoney(val) ? 'O NextDream não permite pedidos de dinheiro, PIX ou doações. Ajuste sua mensagem. 🚫' : '');
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

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => navigate('/paciente/sonhos'), 1200);
  };

  const selectedState = BRAZIL_STATES.find(s => s.uf === form.state);
  const cities = selectedState?.cities ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Compartilhar um sonho</h1>
        <p className="text-gray-500 text-sm mt-1">4 passos simples para encontrar seu apoiador</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0
                ${i < step ? 'bg-pink-600 text-white' : i === step ? 'bg-pink-600 text-white ring-4 ring-pink-100' : 'bg-gray-200 text-gray-500'}`}
                style={{ fontWeight: 600 }}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded-full ${i < step ? 'bg-pink-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs">
          {steps.map((s, i) => (
            <span key={i} className={i === step ? 'text-pink-600' : 'text-gray-400'}
              style={{ fontWeight: i === step ? 500 : 400 }}>{s}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 p-6 sm:p-8">

        {/* ── Step 0: Conte seu sonho ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-gray-800 mb-1">Conte seu sonho</h2>
              <p className="text-gray-500 text-sm">Seja simples e sincero. Apoiadores vão ler e se identificar.</p>
            </div>

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
                      className="flex items-center gap-1.5 bg-red-500/90 hover:bg-red-500 text-white text-xs px-3 py-2 rounded-xl transition-colors"
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
                  className="w-full h-32 border-2 border-dashed border-pink-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-pink-400 hover:bg-pink-50/50 transition-all group">
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                    <ImageIcon className="w-5 h-5 text-pink-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-pink-600" style={{ fontWeight: 600 }}>Escolher do banco de imagens</p>
                    <p className="text-xs text-gray-400 mt-0.5">Fotos gratuitas do Unsplash por categoria</p>
                  </div>
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-sm text-gray-700 block mb-1.5" style={{ fontWeight: 500 }}>
                Título do sonho <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Ver o nascer do sol na praia uma última vez"
                maxLength={80}
                className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <p className="text-xs text-gray-400 mt-1">{form.title.length}/80 caracteres</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-gray-700 block mb-1.5" style={{ fontWeight: 500 }}>
                Descreva seu sonho <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => handleDescChange(e.target.value)}
                placeholder="Conte com suas palavras o que você deseja, por que é especial e o que um apoiador poderia fazer por você..."
                rows={4}
                className={`w-full px-4 py-3 bg-pink-50 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none
                  ${warning ? 'border-red-300 focus:ring-red-300' : 'border-pink-100 focus:ring-pink-300'}`}
              />
              {warning && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700">{warning}</p>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>Categoria</label>
              <div className="flex flex-wrap gap-2">
                {dreamCategories.map(cat => (
                  <button type="button" key={cat}
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                      ${form.category === cat ? 'bg-pink-600 text-white border-pink-600' : 'border-pink-200 text-pink-700 hover:bg-pink-50'}`}>
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
                  { id: 'companhia',  label: '🤝 Companhia' },
                  { id: 'experiencia', label: '✨ Experiência' },
                  { id: 'aprendizado', label: '📚 Aprendizado' },
                  { id: 'conversa',   label: '💬 Conversa' },
                  { id: 'presenca',   label: '🏠 Presença' },
                ].map(t => (
                  <button type="button" key={t.id} onClick={() => toggleType(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                      ${form.type.includes(t.id) ? 'bg-pink-600 text-white border-pink-600' : 'border-pink-200 text-pink-700 hover:bg-pink-50'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>Urgência</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'baixa', label: '🟢 Baixa',  ring: 'ring-green-300',  active: 'bg-green-50 border-green-400 text-green-700'  },
                  { val: 'media', label: '🟡 Média',  ring: 'ring-amber-300',  active: 'bg-amber-50 border-amber-400 text-amber-700'  },
                  { val: 'alta',  label: '🔴 Alta',   ring: 'ring-red-300',    active: 'bg-red-50 border-red-400 text-red-700'        },
                ].map(u => (
                  <button type="button" key={u.val} onClick={() => setForm(f => ({ ...f, urgency: u.val }))}
                    className={`py-2.5 rounded-xl text-xs border-2 transition-all
                      ${form.urgency === u.val ? `${u.active} ring-2 ring-offset-1 ${u.ring}` : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    style={{ fontWeight: form.urgency === u.val ? 600 : 400 }}>
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Preferências ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-gray-800 mb-1">Preferências de apoio</h2>
              <p className="text-gray-500 text-sm">Como, quando e onde você prefere receber apoio?</p>
            </div>

            {/* Format */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>
                Formato <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'remoto',     label: '💻 Online',     sub: 'Video, chat, áudio' },
                  { val: 'presencial', label: '📍 Presencial', sub: 'Encontro físico' },
                  { val: 'ambos',      label: '🤝 Ambos',      sub: 'Sem restrição' },
                ].map(f => (
                  <button type="button" key={f.val} onClick={() => setForm(fm => ({ ...fm, format: f.val }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all
                      ${form.format === f.val ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}>
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
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600'
                        }`}
                      style={{ fontWeight: selected ? 700 : 400 }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              {form.days.length > 0 && (
                <p className="text-xs text-pink-600 mt-1.5">
                  Selecionado: {form.days.join(', ')}
                </p>
              )}
            </div>

            {/* Location — State + City */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" />
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
                    className="w-full pl-4 pr-9 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundColor: '#fdf2f8',
                      border: '1px solid #fce7f3',
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
                    className="w-full pl-4 pr-9 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundColor: form.state ? '#fdf2f8' : '#f9fafb',
                      border: `1px solid ${form.state ? '#fce7f3' : '#e5e7eb'}`,
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
                  <span className="flex items-center gap-1.5 bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full" style={{ fontWeight: 500 }}>
                    <MapPin className="w-3 h-3" />
                    {form.city}, {form.state}
                  </span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, state: '', city: '' }))}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
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
                className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
              />
            </div>

            {/* Language */}
            <div>
              <label className="text-sm text-gray-700 block mb-2" style={{ fontWeight: 500 }}>Idioma</label>
              <select
                value={form.language}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none"
              >
                <option>Português</option>
                <option>Inglês</option>
                <option>Espanhol</option>
                <option>Outro</option>
              </select>
            </div>
          </div>
        )}

        {/* ── Step 2: Privacidade ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-gray-800 mb-1">Configurações de privacidade</h2>
              <p className="text-gray-500 text-sm">Controle quem pode ver e como seu sonho aparece.</p>
            </div>

            <div className="space-y-3">
              {[
                { val: 'publico',     icon: Globe,  label: 'Público',             desc: 'Qualquer pessoa na plataforma pode ver seu sonho',           color: 'text-blue-600 bg-blue-100' },
                { val: 'verificados', icon: Shield, label: 'Somente verificados', desc: 'Apenas apoiadores com conta verificada podem ver',            color: 'text-teal-600 bg-teal-100' },
                { val: 'anonimo',     icon: Lock,   label: 'Anônimo',             desc: 'Seu nome completo não aparece (somente primeiro nome)',       color: 'text-pink-600 bg-pink-100' },
              ].map(p => (
                <button type="button" key={p.val} onClick={() => setForm(f => ({ ...f, privacy: p.val }))}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all
                    ${form.privacy === p.val ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.color}`}>
                    <p.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{p.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                  </div>
                  {form.privacy === p.val && <CheckCircle className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                📌 <strong>Nunca exibimos</strong> informações médicas, endereço completo ou dados de contato antes da aceitação de uma proposta. O chat só se abre após você aceitar.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 3: Revisar e publicar ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-gray-800 mb-1">Revisar e publicar</h2>
              <p className="text-gray-500 text-sm">Confira antes de publicar. Você pode editar depois.</p>
            </div>

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

            <div className="bg-pink-50 rounded-xl p-5 space-y-3">
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

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700" style={{ fontWeight: 500 }}>Verificação de conteúdo</p>
              </div>
              <p className="text-xs text-green-600">Nenhum conteúdo financeiro (PIX, dinheiro, doação) foi detectado. ✓</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-700 leading-relaxed">
                Ao publicar, você confirma que seu sonho <strong>não envolve</strong> pedidos de dinheiro, PIX, transferências ou doações financeiras.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors
              ${canNext() ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            style={{ fontWeight: 600 }}>
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={handlePublish} disabled={publishing}
            className="flex-1 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl transition-colors"
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
    </div>
  );
}