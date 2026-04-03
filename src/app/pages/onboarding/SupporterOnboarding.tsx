import { useNavigate } from 'react-router';
import { useState } from 'react';
import {
  ArrowRight, ArrowLeft, CheckCircle, Heart, MapPin, ChevronDown, X,
  Shield, Loader2, User,
} from 'lucide-react';
import { BRAZIL_STATES } from '../../data/brazilCities';

const steps = ['Como quer ajudar', 'Disponibilidade', 'Confirmar cadastro'];

const helpTypes = [
  { id: 'companhia', emoji: '🤝', label: 'Companhia', desc: 'Estar presente, conversar' },
  { id: 'presença', emoji: '🏠', label: 'Visita presencial', desc: 'Ir até a pessoa' },
  { id: 'aprendizado', emoji: '📚', label: 'Ensinar algo', desc: 'Habilidade, ofício' },
  { id: 'experiencia', emoji: '🌟', label: 'Proporcionar experiência', desc: 'Passeio, atividade' },
  { id: 'video', emoji: '📹', label: 'Videochamada', desc: 'Conversa online' },
  { id: 'motorista', emoji: '🚗', label: 'Transporte', desc: 'Levar/buscar a pessoa' },
  { id: 'culinaria', emoji: '🍳', label: 'Culinária', desc: 'Cozinhar, ensinar receita' },
  { id: 'arte', emoji: '🎨', label: 'Arte e música', desc: 'Criar, ensinar, tocar' },
];

const hoursOptions = ['1-2h', '3-5h', '6-10h', '10h+'];
const daysOptions = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const hoursLabels: Record<string, string> = {
  '1-2h': '1 a 2 horas',
  '3-5h': '3 a 5 horas',
  '6-10h': '6 a 10 horas',
  '10h+': 'Mais de 10 horas',
};

export default function SupporterOnboarding() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [hours, setHours] = useState('');
  const [days, setDays] = useState<string[]>([]);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const toggleHelp = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleDay = (d: string) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleStateChange = (uf: string) => {
    setState(uf);
    setCity('');
  };

  const selectedState = BRAZIL_STATES.find(s => s.uf === state);
  const cities = selectedState?.cities ?? [];

  const canNext = () => {
    if (step === 0) return selected.length > 0;
    if (step === 1) return true; // availability is optional
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
      navigate('/cadastro', { state: { role: 'apoiador' } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs shrink-0
                    ${i < step ? 'bg-teal-600 text-white' : i === step ? 'bg-teal-600 text-white ring-4 ring-teal-100' : 'bg-gray-200 text-gray-400'}`}
                  style={{ fontWeight: 600 }}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-1 flex-1 rounded-full ${i < step ? 'bg-teal-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {steps.map((s, i) => (
              <span key={i} className={`text-xs ${i === step ? 'text-teal-600' : 'text-gray-400'}`}
                style={{ fontWeight: i === step ? 500 : 400 }}>{s}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6 sm:p-8">

          {/* ── Step 0: Como quer ajudar ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-gray-800 mb-1">Como você quer ajudar?</h2>
                <p className="text-gray-500 text-sm">Selecione o que você pode oferecer. Pode escolher vários.</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {helpTypes.map(h => (
                  <button
                    type="button"
                    key={h.id}
                    onClick={() => toggleHelp(h.id)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3
                      ${selected.includes(h.id) ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-teal-200'}`}
                  >
                    <span className="text-xl">{h.emoji}</span>
                    <div>
                      <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{h.label}</p>
                      <p className="text-xs text-gray-500">{h.desc}</p>
                    </div>
                    {selected.includes(h.id) && <CheckCircle className="w-4 h-4 text-teal-500 ml-auto shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
              {selected.length > 0 && (
                <p className="text-sm text-teal-600">{selected.length} {selected.length === 1 ? 'forma selecionada' : 'formas selecionadas'}</p>
              )}
            </div>
          )}

          {/* ── Step 1: Disponibilidade ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-gray-800 mb-1">Qual sua disponibilidade?</h2>
                <p className="text-gray-500 text-sm">Isso ajuda a encontrar sonhos compatíveis com seu tempo.</p>
              </div>

              {/* Hours per week */}
              <div>
                <p className="text-sm text-gray-700 mb-3" style={{ fontWeight: 500 }}>Horas disponíveis por semana</p>
                <div className="grid grid-cols-4 gap-2">
                  {hoursOptions.map(h => {
                    const isActive = hours === h;
                    return (
                      <button
                        type="button"
                        key={h}
                        onClick={() => setHours(h)}
                        className={`p-3 border-2 rounded-xl text-xs transition-all
                          ${isActive
                            ? 'border-teal-500 bg-teal-100 text-teal-800 ring-2 ring-teal-200 ring-offset-1'
                            : 'border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-400'
                          }`}
                        style={{ fontWeight: isActive ? 700 : 500 }}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
                {hours && (
                  <p className="text-xs text-teal-600 mt-1.5">
                    Selecionado: {hours} por semana
                  </p>
                )}
              </div>

              {/* Days of week */}
              <div>
                <p className="text-sm text-gray-700 mb-3" style={{ fontWeight: 500 }}>Dias da semana</p>
                <div className="flex flex-wrap gap-2">
                  {daysOptions.map(d => {
                    const isActive = days.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`w-11 h-11 border-2 rounded-xl text-xs transition-all
                          ${isActive
                            ? 'border-teal-500 bg-teal-600 text-white shadow-sm'
                            : 'border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-400'
                          }`}
                        style={{ fontWeight: isActive ? 700 : 500 }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                {days.length > 0 && (
                  <p className="text-xs text-teal-600 mt-1.5">
                    Selecionado: {days.join(', ')}
                  </p>
                )}
              </div>

              {/* Location — State + City cascade */}
              <div>
                <p className="text-sm text-gray-700 mb-2 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                  <MapPin className="w-3.5 h-3.5 text-teal-500" />
                  Cidade / região <span className="text-gray-400 text-xs">(opcional)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* State selector */}
                  <div className="relative">
                    <select
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full pl-4 pr-9 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                        backgroundColor: '#f0fdfa',
                        border: '1px solid #ccfbf1',
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
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!state}
                      className="w-full pl-4 pr-9 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                        backgroundColor: state ? '#f0fdfa' : '#f9fafb',
                        border: `1px solid ${state ? '#ccfbf1' : '#e5e7eb'}`,
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
                    <span className="flex items-center gap-1.5 bg-teal-100 text-teal-700 text-xs px-3 py-1 rounded-full" style={{ fontWeight: 500 }}>
                      <MapPin className="w-3 h-3" />
                      {city}, {state}
                    </span>
                    <button type="button" onClick={() => { setState(''); setCity(''); }}
                      className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-1.5">Usado apenas para sugerir sonhos próximos. Nunca exibido publicamente sem sua permissão.</p>
              </div>
            </div>
          )}

          {/* ── Step 2: Confirmar cadastro ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-teal-600 fill-teal-200" />
                </div>
                <h2 className="text-gray-800 mb-1">Confirme seus dados</h2>
                <p className="text-gray-500 text-sm">Revise as informações e finalize para criar sua conta.</p>
              </div>

              {/* Summary card */}
              <div className="bg-teal-50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-teal-100">
                  <div className="w-10 h-10 bg-teal-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
                      Perfil: Apoiador
                    </p>
                    <p className="text-xs text-gray-500">
                      Oferecer tempo, presença e companhia
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Formas de ajudar</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.map(id => {
                        const h = helpTypes.find(ht => ht.id === id);
                        return h ? (
                          <span key={id} className="bg-teal-200 text-teal-800 text-xs px-2 py-0.5 rounded-full">
                            {h.emoji} {h.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Localização</p>
                    <p className="text-xs text-gray-700" style={{ fontWeight: 500 }}>
                      {city && state ? `${city}, ${state}` : 'Não informada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Horas / semana</p>
                    <p className="text-xs text-gray-700" style={{ fontWeight: 500 }}>
                      {hours ? hoursLabels[hours] || hours : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Dias disponíveis</p>
                    <p className="text-xs text-gray-700" style={{ fontWeight: 500 }}>
                      {days.length > 0 ? days.join(', ') : 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="bg-white border border-teal-100 rounded-xl p-4 space-y-2.5">
                <p className="text-sm text-gray-700" style={{ fontWeight: 600 }}>Ao concluir:</p>
                {[
                  { icon: '✨', text: 'Você será direcionado para criar sua conta' },
                  { icon: '🔍', text: 'Poderá explorar sonhos publicados por pacientes' },
                  { icon: '💌', text: 'Envie propostas com sua mensagem pessoal' },
                  { icon: '💬', text: 'Converse pelo chat seguro após aceite' },
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
                    Localização e informações pessoais nunca são exibidas sem sua autorização expressa.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700">
                  Importante: Nunca peça dinheiro, PIX ou qualquer compensação financeira. Violações resultam em banimento.
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
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
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
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl transition-colors disabled:opacity-80"
              style={{ fontWeight: 600 }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparando seu cadastro...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Concluir e criar minha conta
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
