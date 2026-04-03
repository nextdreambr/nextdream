import { useState } from 'react';
import { 
  Building2, 
  HeartHandshake, 
  Megaphone, 
  CheckCircle, 
  Send, 
  Sparkles, 
  Briefcase,
  Mail,
  Heart
} from 'lucide-react';
import { Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const partnershipTypes = [
  { value: '', label: 'Selecione o tipo de parceria' },
  { value: 'ong', label: 'ONG / Instituição (Hospital, Asilo, etc)' },
  { value: 'empresa', label: 'Voluntariado Corporativo (Empresa)' },
  { value: 'imprensa', label: 'Mídia e Imprensa' },
  { value: 'influenciador', label: 'Influenciador Digital / Embaixador' },
  { value: 'outro', label: 'Outro' },
];

export default function Partnerships() {
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const canSend = name.trim() && email.trim() && type && message.trim().length >= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1500);
  };

  const handleReset = () => {
    setName('');
    setOrg('');
    setEmail('');
    setType('');
    setMessage('');
    setSent(false);
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-pink-600 via-pink-500 to-rose-500 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -right-8 w-60 h-60 rounded-full bg-rose-300/20 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/90 px-4 py-1.5 rounded-full text-sm mb-6">
            <HeartHandshake className="w-3.5 h-3.5" />
            Juntos somos mais fortes
          </div>
          <h1 className="text-white mb-4" style={{ fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.15 }}>
            Seja um Parceiro NextDream
          </h1>
          <p className="text-pink-100 max-w-2xl mx-auto text-lg leading-relaxed">
            Nós acreditamos no poder das conexões humanas. Convidamos ONGs, empresas e comunicadores a se unirem 
            à nossa missão de levar tempo, atenção e companheirismo a quem precisa.
          </p>
        </div>
      </section>

      {/* ── Pilares ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '1.875rem' }}>
            Como você pode fazer parte?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            O NextDream é uma plataforma sem fins lucrativos ou transações financeiras. 
            Nossas parcerias visam ampliar a rede de apoio emocional e presença.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 text-pink-500">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1.25rem' }}>ONGs e Instituições</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Asilos, orfanatos e hospitais podem cadastrar seus assistidos como "Pacientes" para que eles recebam
              visitas, conversas e atenção dos nossos "Apoiadores".
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 text-pink-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1.25rem' }}>Voluntariado Corporativo</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empresas que desejam engajar seus funcionários em ações de impacto social podem criar campanhas 
              de tempo e companhia através da nossa plataforma.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 text-pink-500">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1.25rem' }}>Mídia e Divulgação</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Veículos de comunicação e influenciadores digitais podem ajudar a dar visibilidade aos sonhos 
              e atrair mais voluntários dispostos a doar seu tempo.
            </p>
          </div>
        </div>

        {/* ── Formulário e Imagem ──────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-12 items-start bg-gray-50 rounded-[2.5rem] p-6 sm:p-12 border border-gray-100">
          
          <div className="space-y-6">
            <div>
              <h2 className="text-gray-900 mb-4" style={{ fontWeight: 700, fontSize: '2rem', lineHeight: 1.2 }}>
                Vamos construir <br/><span className="text-pink-600">algo incrível juntos?</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Preencha o formulário ao lado com os dados da sua organização. Nossa equipe de parcerias analisará 
                seu perfil e entrará em contato para agendar um bate-papo em até 48 horas úteis.
              </p>
            </div>
            
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-sm">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1769837230054-7f3a7356dde1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXJpbmclMjB0ZWFtd29yayUyMGNvbW11bml0eXxlbnwxfHx8fDE3NzI4MDAzNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Voluntários trabalhando em equipe"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-sm font-medium opacity-90">Juntos pelo próximo</p>
              </div>
            </div>
          </div>

          <div>
            {sent ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center h-full flex flex-col justify-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
                  Proposta recebida!
                </h2>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed mb-8">
                  Agradecemos o interesse em fazer parte do NextDream! Entraremos em contato com você no e-mail <strong className="text-gray-700">{email}</strong> em breve.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                    style={{ fontWeight: 500 }}
                  >
                    Nova proposta
                  </button>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl transition-colors text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    <Heart className="w-4 h-4" />
                    Voltar ao início
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-gray-900 mb-1" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                    Envie sua proposta
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Preencha os campos abaixo.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-700 block mb-1.5">
                        Seu Nome <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="João da Silva"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 block mb-1.5">
                        Organização / Empresa
                      </label>
                      <input
                        type="text"
                        value={org}
                        onChange={e => setOrg(e.target.value)}
                        placeholder="Nome da instituição"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700 block mb-1.5">
                      E-mail corporativo / oficial <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="contato@suaempresa.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700 block mb-1.5">
                      Tipo de parceria <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-colors"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                        color: type ? '#374151' : '#9ca3af',
                      }}
                    >
                      {partnershipTypes.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700 block mb-1.5">
                      Como podemos atuar juntos? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Descreva brevemente o seu projeto ou ideia de parceria (mínimo de 10 caracteres)..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white resize-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!canSend || sending}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all text-sm mt-2
                      ${canSend && !sending
                        ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-200/50 hover:shadow-lg hover:shadow-pink-200/50'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    style={{ fontWeight: 600 }}
                  >
                    {sending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar proposta
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Responderemos em até 48 horas úteis
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
