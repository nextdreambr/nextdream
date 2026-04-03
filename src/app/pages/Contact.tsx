import { useState } from 'react';
import {
  Mail, MessageSquare, Send, CheckCircle, Phone, MapPin,
  Clock, HelpCircle, AlertTriangle, Heart, ChevronDown, Sparkles,
} from 'lucide-react';
import { Link } from 'react-router';

const subjects = [
  { value: '', label: 'Selecione um assunto' },
  { value: 'duvida', label: 'Dúvida sobre a plataforma' },
  { value: 'problema', label: 'Problema técnico / bug' },
  { value: 'conta', label: 'Minha conta / perfil' },
  { value: 'denuncia', label: 'Denúncia de conduta' },
  { value: 'sugestao', label: 'Sugestão de melhoria' },
  { value: 'parceria', label: 'Parcerias e voluntariado' },
  { value: 'imprensa', label: 'Imprensa / mídia' },
  { value: 'outro', label: 'Outro assunto' },
];

const faqQuick = [
  { q: 'Como funciona o NextDream?', link: '/como-funciona' },
  { q: 'O NextDream é gratuito?', link: '/faq' },
  { q: 'Como denunciar uma conduta?', link: '/diretrizes' },
  { q: 'Meus dados estão seguros?', link: '/seguranca' },
];

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const canSend = name.trim() && email.trim() && subject && message.trim().length >= 10;

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
    setEmail('');
    setSubject('');
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20 relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/90 px-4 py-1.5 rounded-full text-sm mb-6">
            <MessageSquare className="w-3.5 h-3.5" />
            Estamos aqui para ajudar
          </div>
          <h1 className="text-white mb-4" style={{ fontWeight: 800, fontSize: '2.25rem', lineHeight: 1.15 }}>
            Fale conosco
          </h1>
          <p className="text-pink-100 max-w-xl mx-auto leading-relaxed">
            Tem dúvidas, sugestões ou precisa de ajuda? Nossa equipe responde em até 24 horas úteis.
            Queremos ouvir você.
          </p>
        </div>
      </section>

      {/* ── Conteúdo ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Coluna principal: formulário ── */}
          <div className="lg:col-span-2">
            {sent ? (
              /* Sucesso */
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
                  Mensagem enviada!
                </h2>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-2">
                  Recebemos sua mensagem e responderemos em até <span className="text-gray-700" style={{ fontWeight: 600 }}>24 horas úteis</span> no e-mail informado.
                </p>
                <p className="text-gray-400 text-sm mb-8">
                  Protocolo: #ND-{Date.now().toString(36).toUpperCase()}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                    style={{ fontWeight: 500 }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Enviar outra mensagem
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
              /* Formulário */
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-gray-900 mb-1" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                    Envie sua mensagem
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Preencha os campos abaixo. Campos com <span className="text-red-500">*</span> são obrigatórios.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Nome e Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-700 block mb-1.5">
                        Nome completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 block mb-1.5">
                        E-mail <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="w-full pl-10 pr-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assunto */}
                  <div>
                    <label className="text-sm text-gray-700 block mb-1.5">
                      Assunto <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none',
                          backgroundColor: '#fdf2f8',
                          border: '1px solid #fce7f3',
                          color: subject ? '#374151' : '#9ca3af',
                        }}
                      >
                        {subjects.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Alert for denúncia */}
                  {subject === 'denuncia' && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-amber-800" style={{ fontWeight: 600 }}>Denúncia de conduta</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Se alguém pediu dinheiro, PIX, ou teve conduta inadequada, descreva a situação com o máximo de detalhes. 
                          Sua denúncia será tratada com sigilo total.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mensagem */}
                  <div>
                    <label className="text-sm text-gray-700 block mb-1.5">
                      Mensagem <span className="text-red-500">*</span>
                      <span className="text-gray-400 text-xs ml-2">(mín. 10 caracteres)</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Descreva sua dúvida, problema ou sugestão..."
                      rows={5}
                      className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      <p className={`text-xs ${message.length >= 10 ? 'text-green-500' : 'text-gray-400'}`}>
                        {message.length} / mín. 10 caracteres
                      </p>
                    </div>
                  </div>

                  {/* Privacy note */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">
                      Suas informações são usadas apenas para responder sua mensagem. 
                      Consulte nossa <Link to="/privacidade" className="text-pink-600 hover:underline">Política de Privacidade</Link>.
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!canSend || sending}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl transition-colors text-sm
                      ${canSend && !sending
                        ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-100'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    style={{ fontWeight: 600 }}
                  >
                    {sending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar mensagem
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ── Coluna lateral ── */}
          <div className="space-y-5">

            {/* Informações de contato */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-gray-900 mb-4" style={{ fontWeight: 700, fontSize: '1rem' }}>
                Outras formas de contato
              </h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'E-mail', value: 'contato@nextdream.com.br', href: 'mailto:contato@nextdream.com.br' },
                  { icon: Phone, label: 'WhatsApp', value: '(11) 99999-0000', href: '#' },
                  { icon: MapPin, label: 'Localização', value: 'São Paulo, SP — Brasil', href: undefined },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm text-gray-700 hover:text-pink-600 transition-colors" style={{ fontWeight: 500 }}>
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-pink-400" />
                <p className="text-xs text-gray-500">
                  Resposta em até <span className="text-gray-700" style={{ fontWeight: 600 }}>24h úteis</span>
                </p>
              </div>
            </div>

            {/* FAQ rápido */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-pink-500" />
                <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Perguntas frequentes
                </h3>
              </div>
              <div className="space-y-2">
                {faqQuick.map(item => (
                  <Link
                    key={item.q}
                    to={item.link}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2.5 rounded-xl transition-colors group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-300 group-hover:text-pink-500 shrink-0" />
                    {item.q}
                  </Link>
                ))}
              </div>
              <Link
                to="/faq"
                className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 text-sm mt-3 px-3"
                style={{ fontWeight: 500 }}
              >
                Ver todas as perguntas →
              </Link>
            </div>

            {/* Conduta */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800" style={{ fontWeight: 600 }}>
                    Denúncia urgente?
                  </p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Se alguém pediu dinheiro, PIX ou teve conduta abusiva dentro da plataforma, 
                    use o formulário ao lado selecionando "Denúncia de conduta" ou envie diretamente para{' '}
                    <a href="mailto:denuncia@nextdream.com.br" className="underline" style={{ fontWeight: 600 }}>
                      denuncia@nextdream.com.br
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
