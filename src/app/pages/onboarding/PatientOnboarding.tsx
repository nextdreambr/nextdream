import { useNavigate } from 'react-router';
import { useState } from 'react';
import {
  ArrowRight, ArrowLeft, User, Users, Video, MapPin, CheckCircle,
  Star, ChevronDown, X, Shield, Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRAZIL_STATES } from '../../data/brazilCities';

const steps = ['Sobre você', 'Preferências', 'Confirmar cadastro'];

const formatOptions = [
  { icon: Video, label: 'Online', value: 'online', desc: 'Vídeo ou chat' },
  { icon: MapPin, label: 'Presencial', value: 'presencial', desc: 'Encontro físico' },
  { icon: CheckCircle, label: 'Ambos', value: 'ambos', desc: 'Sem restrição' },
];

const restrictionOptions = [
  'Mobilidade reduzida',
  'Restrições médicas',
  'Precisa de cuidador',
  'Idioma específico',
  'Horário restrito',
];

export default function PatientOnboarding() {
  const [step, setStep] = useState(0);
  const [forOther, setForOther] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [format, setFormat] = useState('');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const toggleRestriction = (r: string) =>
    setRestrictions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const handleStateChange = (uf: string) => {
    setState(uf);
    setCity('');
  };

  const selectedState = BRAZIL_STATES.find(s => s.uf === state);
  const cities = selectedState?.cities ?? [];

  const canNext = () => {
    if (step === 0) return !forOther || patientName.trim().length > 0;
    if (step === 1) return format !== '';
    return true;
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    }
  };

  const handleFinish = () => {
    setSaving(true);
    setTimeout(() => {
      navigate('/paciente/sonhos/criar');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs shrink-0
                    ${i < step ? 'bg-pink-600 text-white' : i === step ? 'bg-pink-600 text-white ring-4 ring-pink-100' : 'bg-gray-200 text-gray-400'}`}
                  style={{ fontWeight: 600 }}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-1 flex-1 rounded-full ${i < step ? 'bg-pink-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {steps.map((s, i) => (
              <span key={i} className={`text-xs ${i === step ? 'text-pink-600' : 'text-gray-400'}`}
                style={{ fontWeight: i === step ? 500 : 400 }}>{s}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 sm:p-8">

          {/* ── Step 0: Sobre você ── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-gray-800 mb-1">Quem está usando o NextDream?</h2>
                <p className="text-gray-500 text-sm">Você pode se cadastrar por outra pessoa com tranquilidade.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForOther(false)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${!forOther ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}
                >
                  <User className={`w-6 h-6 mb-3 ${!forOther ? 'text-pink-600' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>Para mim</p>
                  <p className="text-xs text-gray-500 mt-1">Eu mesmo sou o paciente</p>
                  {!forOther && <CheckCircle className="w-4 h-4 text-pink-600 mt-2" />}
                </button>
                <button
                  type="button"
                  onClick={() => setForOther(true)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${forOther ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}
                >
                  <Users className={`w-6 h-6 mb-3 ${forOther ? 'text-pink-600' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>Para outra pessoa</p>
                  <p className="text-xs text-gray-500 mt-1">Familiar ou paciente</p>
                  {forOther && <CheckCircle className="w-4 h-4 text-pink-600 mt-2" />}
                </button>
              </div>

              {forOther && (
                <div className="bg-pink-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-pink-800" style={{ fontWeight: 500 }}>Informações sobre o paciente</p>
                  <input
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="Nome do paciente"
                    className="w-full px-4 py-2.5 bg-white border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                  <p className="text-xs text-pink-600">Você gerenciará os sonhos em nome dela. A relação (familiar, cuidador) ficará no perfil.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 1: Preferências ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-gray-800 mb-1">Como prefere receber apoio?</h2>
                <p className="text-gray-500 text-sm">Estas preferências ajudam a encontrar apoiadores compatíveis.</p>
              </div>

              {/* Format */}
              <div>
                <p className="text-sm text-gray-700 mb-3" style={{ fontWeight: 500 }}>
                  Formato preferido <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {formatOptions.map(f => {
                    const isActive = format === f.value;
                    return (
                      <button
                        type="button"
                        key={f.value}
                        onClick={() => setFormat(f.value)}
                        className={`p-3 border-2 rounded-xl text-center transition-all
                          ${isActive
                            ? 'border-pink-600 bg-pink-50 ring-2 ring-pink-200 ring-offset-1'
                            : 'border-gray-200 hover:border-pink-300'
                          }`}
                      >
                        <f.icon className={`w-5 h-5 mx-auto mb-1.5 ${isActive ? 'text-pink-600' : 'text-gray-400'}`} />
                        <p className="text-xs text-gray-700" style={{ fontWeight: isActive ? 600 : 500 }}>{f.label}</p>
                        <p className="text-xs text-gray-500">{f.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Restrictions */}
              <div>
                <p className="text-sm text-gray-700 mb-3" style={{ fontWeight: 500 }}>
                  Restrições importantes <span className="text-gray-400 text-xs">(opcional)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {restrictionOptions.map(r => {
                    const isActive = restrictions.includes(r);
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => toggleRestriction(r)}
                        className={`px-3 py-1.5 text-xs border rounded-full transition-all
                          ${isActive
                            ? 'bg-pink-600 text-white border-pink-600'
                            : 'border-pink-200 text-pink-600 hover:bg-pink-50'
                          }`}
                        style={{ fontWeight: isActive ? 600 : 400 }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
                {restrictions.length > 0 && (
                  <p className="text-xs text-pink-600 mt-1.5">
                    {restrictions.length} {restrictions.length === 1 ? 'restrição selecionada' : 'restrições selecionadas'}
                  </p>
                )}
              </div>

              {/* Location — State + City cascade */}
              <div>
                <p className="text-sm text-gray-700 mb-2 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                  <MapPin className="w-3.5 h-3.5 text-pink-500" />
                  Cidade / Região <span className="text-gray-400 text-xs">(opcional)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* State selector */}
                  <div className="relative">
                    <select
                      value={state}
                      onChange={e => handleStateChange(e.target.value)}
                      className="w-full pl-4 pr-9 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                        backgroundColor: '#fdf2f8',
                        border: '1px solid #fce7f3',
                        color: state ? '#374151' : '#9ca3af',
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
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      disabled={!state}
                      className="w-full pl-4 pr-9 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                        backgroundColor: state ? '#fdf2f8' : '#f9fafb',
                        border: `1px solid ${state ? '#fce7f3' : '#e5e7eb'}`,
                        color: city ? '#374151' : '#9ca3af',
                        cursor: state ? 'pointer' : 'not-allowed',
                        opacity: state ? 1 : 0.7,
                      }}
                    >
                      <option value="">{state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${!state ? 'text-gray-300' : 'text-gray-400'}`} />
                  </div>
                </div>

                {/* Selected location pill */}
                {state && city && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1.5 bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full" style={{ fontWeight: 500 }}>
                      <MapPin className="w-3 h-3" />
                      {city}, {state}
                    </span>
                    <button type="button" onClick={() => { setState(''); setCity(''); }}
                      className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Confirmar cadastro ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-pink-600" />
                </div>
                <h2 className="text-gray-800 mb-1">Confirme seus dados</h2>
                <p className="text-gray-500 text-sm">Revise as informações e finalize seu cadastro.</p>
              </div>

              {/* Summary card */}
              <div className="bg-pink-50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-pink-100">
                  <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-pink-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
                      {currentUser?.name || 'Paciente'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {forOther ? `Cuidador de ${patientName || '—'}` : 'Paciente (para si mesmo)'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Formato</p>
                    <p className="text-xs text-gray-700" style={{ fontWeight: 500 }}>
                      {format === 'online' ? 'Online' : format === 'presencial' ? 'Presencial' : format === 'ambos' ? 'Ambos' : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Localização</p>
                    <p className="text-xs text-gray-700" style={{ fontWeight: 500 }}>
                      {city && state ? `${city}, ${state}` : 'Não informada'}
                    </p>
                  </div>
                  {restrictions.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 mb-1">Restrições</p>
                      <div className="flex flex-wrap gap-1">
                        {restrictions.map(r => (
                          <span key={r} className="bg-pink-200 text-pink-800 text-xs px-2 py-0.5 rounded-full">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* What happens next */}
              <div className="bg-white border border-pink-100 rounded-xl p-4 space-y-2.5">
                <p className="text-sm text-gray-700" style={{ fontWeight: 600 }}>Ao concluir o cadastro:</p>
                {[
                  { icon: '✨', text: 'Seu perfil será criado e ativado' },
                  { icon: '📝', text: 'Você poderá compartilhar seu primeiro sonho' },
                  { icon: '💌', text: 'Apoiadores verificados poderão enviar propostas' },
                  { icon: '💬', text: 'Chat seguro será habilitado após aceite' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-base">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Security note */}
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-green-800" style={{ fontWeight: 600 }}>Seus dados estão protegidos</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Nunca exibimos informações médicas, endereço completo ou dados de contato sem sua autorização.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700">
                  Lembre-se: o NextDream não permite pedidos de dinheiro, PIX ou doações. Nosso foco é presença, tempo e carinho.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors
                ${canNext()
                  ? 'bg-pink-600 hover:bg-pink-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              style={{ fontWeight: 600 }}
            >
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-3.5 rounded-xl transition-colors disabled:opacity-80"
              style={{ fontWeight: 600 }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando sua conta...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Concluir cadastro e criar meu primeiro sonho
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
