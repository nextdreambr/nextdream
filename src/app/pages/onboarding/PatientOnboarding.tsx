import { useNavigate } from 'react-router';
import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Users,
  Video,
  MapPin,
  CheckCircle,
  Star,
  ChevronDown,
  X,
  Shield,
  Loader2,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  Languages,
  Clock3,
  Accessibility,
  Stethoscope,
  UserRoundCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRAZIL_STATES } from '../../data/brazilCities';

const steps = ['Sobre você', 'Preferências', 'Confirmar cadastro'];

const formatOptions = [
  {
    icon: Video,
    label: 'Online',
    value: 'online',
    desc: 'Conversa por vídeo, áudio ou mensagem',
  },
  {
    icon: MapPin,
    label: 'Presencial',
    value: 'presencial',
    desc: 'Encontro combinado com cuidado e segurança',
  },
  {
    icon: HeartHandshake,
    label: 'Ambos',
    value: 'ambos',
    desc: 'Tenho abertura para os dois formatos',
  },
];

const restrictionOptions = [
  { icon: Accessibility, label: 'Mobilidade reduzida' },
  { icon: Stethoscope, label: 'Cuidados médicos específicos' },
  { icon: UserRoundCheck, label: 'Precisa de acompanhante/cuidador' },
  { icon: Languages, label: 'Preferência de idioma' },
  { icon: Clock3, label: 'Horários limitados' },
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

  const continueHint = () => {
    if (canNext()) return '';
    if (step === 0 && forOther) return 'Informe o nome da pessoa para continuar.';
    if (step === 1) return 'Escolha um formato de apoio para continuar.';
    return '';
  };

  const handleNext = () => {
    if (step < steps.length - 1 && canNext()) {
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8f6_0%,#f7fbf9_48%,#fff_100%)] px-4 py-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 rounded-lg border border-pink-100 bg-white/86 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-pink-700">Cadastro de paciente</p>
              <h1 className="mt-1 text-xl font-extrabold leading-tight text-slate-950 sm:text-2xl">
                Um cadastro para cuidar do jeito que faz sentido
              </h1>
            </div>
            <div className="rounded-lg bg-teal-50 px-3 py-2 text-right text-xs font-bold text-teal-700">
              Etapa {step + 1} de {steps.length}
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            {steps.map((s, i) => {
              const done = i < step;
              const active = i === step;

              return (
                <div key={s} className="flex flex-1 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-extrabold transition-all
                      ${done ? 'border-teal-600 bg-teal-600 text-white' : ''}
                      ${active ? 'border-pink-600 bg-pink-50 text-pink-700 ring-4 ring-pink-100' : ''}
                      ${!done && !active ? 'border-slate-200 bg-white text-slate-400' : ''}`}
                    aria-current={active ? 'step' : undefined}
                  >
                    {done ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className={`text-sm font-bold ${active ? 'text-slate-950' : done ? 'text-teal-700' : 'text-slate-400'}`}>
                    {s}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={`h-px flex-1 ${done ? 'bg-teal-300' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="sm:hidden">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-extrabold text-slate-950">{steps[step]}</span>
              <span className="font-bold text-slate-500">Etapa {step + 1} de {steps.length}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-pink-600 transition-all"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 sm:p-7 lg:p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-pink-700">Sobre você</p>
                <h2 className="mb-2 text-2xl font-extrabold text-slate-950">Quem está usando o NextDream?</h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  Você pode preencher para si ou representar alguém da família com calma e privacidade.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setForOther(false)}
                  aria-pressed={!forOther}
                  className={`min-h-32 rounded-lg border-2 p-5 text-left transition-all focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2
                    ${!forOther ? 'border-pink-600 bg-pink-50 shadow-sm' : 'border-slate-200 hover:border-pink-200 hover:bg-pink-50/30'}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <User className={`h-6 w-6 ${!forOther ? 'text-pink-700' : 'text-slate-400'}`} />
                    {!forOther && <CheckCircle className="h-5 w-5 text-pink-700" />}
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">Para mim</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Eu mesmo vou compartilhar meus sonhos.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForOther(true)}
                  aria-pressed={forOther}
                  className={`min-h-32 rounded-lg border-2 p-5 text-left transition-all focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2
                    ${forOther ? 'border-pink-600 bg-pink-50 shadow-sm' : 'border-slate-200 hover:border-pink-200 hover:bg-pink-50/30'}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Users className={`h-6 w-6 ${forOther ? 'text-pink-700' : 'text-slate-400'}`} />
                    {forOther && <CheckCircle className="h-5 w-5 text-pink-700" />}
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">Para outra pessoa</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Sou familiar, responsável ou cuidador.</p>
                </button>
              </div>

              {forOther && (
                <div className="rounded-lg border border-pink-100 bg-pink-50/70 p-4">
                  <label htmlFor="patient-name" className="mb-2 block text-sm font-extrabold text-slate-800">
                    Nome da pessoa
                  </label>
                  <input
                    id="patient-name"
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="Como podemos chamar essa pessoa?"
                    className="h-11 w-full rounded-lg border border-pink-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-pink-300"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-pink-800">
                    Use apenas o necessário. Você poderá cuidar dos detalhes com privacidade depois.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-7">
              <div className="rounded-lg border border-teal-100 bg-teal-50/80 p-4">
                <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-teal-700">Preferências</p>
                <h2 className="mb-2 text-2xl font-extrabold leading-tight text-slate-950">
                  Como você prefere que o apoio aconteça?
                </h2>
                <p className="text-sm leading-relaxed text-slate-700">
                  Suas escolhas ajudam a encontrar apoiadores que respeitem seus limites, sua rotina e o melhor formato para você.
                </p>
              </div>

              <section aria-labelledby="support-format-heading" className="space-y-3">
                <div>
                  <h3 id="support-format-heading" className="text-base font-extrabold text-slate-900">
                    Formato preferido <span className="text-pink-700">*</span>
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Escolha o caminho que parece mais confortável agora. Você continua no controle.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-labelledby="support-format-heading">
                  {formatOptions.map(f => {
                    const isActive = format === f.value;
                    return (
                      <button
                        type="button"
                        key={f.value}
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setFormat(f.value)}
                        className={`relative min-h-36 rounded-lg border-2 p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2
                          ${isActive
                            ? 'border-pink-600 bg-pink-50 shadow-md shadow-pink-100'
                            : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-pink-200 hover:bg-pink-50/30 hover:shadow-sm'
                          }`}
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${isActive ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <f.icon className="h-5 w-5" />
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-extrabold text-pink-700">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Selecionado
                            </span>
                          )}
                        </div>
                        <p className="text-base font-extrabold text-slate-950">{f.label}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section aria-labelledby="care-notes-heading" className="space-y-3">
                <div>
                  <h3 id="care-notes-heading" className="text-base font-extrabold text-slate-900">
                    Algo que precisamos respeitar?
                    <span className="ml-2 text-xs font-bold text-slate-400">(opcional)</span>
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Marque tudo que pode ajudar o apoiador a preparar uma proposta mais adequada.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {restrictionOptions.map(r => {
                    const isActive = restrictions.includes(r.label);
                    return (
                      <button
                        type="button"
                        key={r.label}
                        onClick={() => toggleRestriction(r.label)}
                        aria-pressed={isActive}
                        className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2
                          ${isActive
                            ? 'border-pink-700 bg-pink-700 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-pink-200 hover:bg-pink-50'
                          }`}
                      >
                        <r.icon className="h-4 w-4" />
                        <span className="font-bold">{r.label}</span>
                        {isActive && <CheckCircle className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
                {restrictions.length > 0 && (
                  <p className="text-xs font-bold text-pink-700">
                    {restrictions.length} {restrictions.length === 1 ? 'cuidado selecionado' : 'cuidados selecionados'}.
                  </p>
                )}
              </section>

              <section aria-labelledby="location-heading" className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-4">
                  <h3 id="location-heading" className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                    <MapPin className="h-4 w-4 text-teal-700" />
                    Localização para apoio presencial
                    <span className="text-xs font-bold text-slate-400">(opcional)</span>
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Usamos essa informação apenas para encontrar apoiadores próximos quando o apoio for presencial ou híbrido.
                  </p>
                  {format === 'online' && (
                    <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                      Como você escolheu online, a localização pode ficar em branco.
                    </p>
                  )}
                  {(format === 'presencial' || format === 'ambos') && (
                    <p className="mt-2 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
                      Para apoio presencial ou híbrido, informar cidade ajuda a encontrar pessoas próximas. Não é obrigatório nesta etapa.
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="patient-state" className="mb-2 block text-sm font-bold text-slate-700">
                      Estado
                    </label>
                    <div className="relative">
                      <select
                        id="patient-state"
                        value={state}
                        onChange={e => handleStateChange(e.target.value)}
                        className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-800 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-200"
                      >
                        <option value="">Selecione o estado</option>
                        {BRAZIL_STATES.map(s => (
                          <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="patient-city" className="mb-2 block text-sm font-bold text-slate-700">
                      Cidade
                    </label>
                    <div className="relative">
                      <select
                        id="patient-city"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        disabled={!state}
                        className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-800 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        <option value="">{state ? 'Selecione a cidade' : 'Selecione um estado primeiro'}</option>
                        {cities.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${!state ? 'text-slate-300' : 'text-slate-400'}`} />
                    </div>
                  </div>
                </div>

                {state && city && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1.5 text-xs font-bold text-teal-800">
                      <MapPin className="h-3.5 w-3.5" />
                      {city}, {state}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setState(''); setCity(''); }}
                      aria-label="Remover localização"
                      className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </section>

              <div className="flex items-start gap-3 rounded-lg border border-teal-100 bg-teal-50 p-4">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                <div>
                  <p className="text-sm font-extrabold text-teal-900">Você compartilha apenas o necessário</p>
                  <p className="mt-1 text-xs leading-relaxed text-teal-800">
                    Essas informações ajudam a proteger sua experiência. Nenhum contato pessoal é exibido sem sua autorização.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-pink-50">
                  <Star className="h-8 w-8 text-pink-700" />
                </div>
                <h2 className="mb-2 text-2xl font-extrabold text-slate-950">Confirme seus dados</h2>
                <p className="text-sm leading-relaxed text-slate-600">Revise as informações e finalize seu cadastro com tranquilidade.</p>
              </div>

              <div className="rounded-lg border border-pink-100 bg-pink-50/60 p-5">
                <div className="mb-4 flex items-center gap-3 border-b border-pink-100 pb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-pink-700">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {currentUser?.name || 'Paciente'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {forOther ? `Representando ${patientName || 'a pessoa paciente'}` : 'Cadastro para si mesmo'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="mb-0.5 text-xs font-extrabold uppercase tracking-wide text-slate-400">Formato</p>
                    <p className="font-bold text-slate-800">
                      {format === 'online' ? 'Online' : format === 'presencial' ? 'Presencial' : format === 'ambos' ? 'Ambos' : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs font-extrabold uppercase tracking-wide text-slate-400">Localização</p>
                    <p className="font-bold text-slate-800">
                      {city && state ? `${city}, ${state}` : 'Não informada'}
                    </p>
                  </div>
                  {restrictions.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-400">Cuidados importantes</p>
                      <div className="flex flex-wrap gap-2">
                        {restrictions.map(r => (
                          <span key={r} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-pink-800">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="mb-3 text-sm font-extrabold text-slate-800">Ao concluir o cadastro:</p>
                {[
                  { icon: CheckCircle, text: 'Seu perfil será criado e ativado' },
                  { icon: Star, text: 'Você poderá compartilhar seu primeiro sonho' },
                  { icon: HeartHandshake, text: 'Apoiadores verificados poderão enviar propostas' },
                  { icon: MessageCircle, text: 'O chat seguro será habilitado após aceite' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 py-1.5 text-sm text-slate-600">
                    <item.icon className="h-4 w-4 text-pink-700" />
                    {item.text}
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-teal-100 bg-teal-50 p-4">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                <div>
                  <p className="text-xs font-extrabold text-teal-900">Seus dados estão protegidos</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-teal-800">
                    Nunca exibimos informações médicas, endereço completo ou dados de contato sem sua autorização.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs leading-relaxed text-amber-800">
                  Lembre-se: o NextDream não permite pedidos financeiros. Nosso foco é presença, tempo, companhia e cuidado.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-3">
          {continueHint() && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              {continueHint()}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext()}
                className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 font-extrabold transition-colors
                  ${canNext()
                    ? 'bg-pink-700 text-white shadow-lg shadow-pink-100 hover:bg-pink-800'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500'
                  }`}
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-pink-700 px-6 py-3 font-extrabold text-white shadow-lg shadow-pink-100 transition-colors hover:bg-pink-800 disabled:opacity-80"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando sua conta...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Concluir cadastro e criar meu primeiro sonho
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
