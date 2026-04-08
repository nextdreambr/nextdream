import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Video, MapPinned, Clock, Send, AlertTriangle, Heart } from 'lucide-react';
import { DreamStatusBadge, UrgencyBadge } from '../../components/shared/StatusBadge';
import { ApiError, PublicDream, dreamsApi } from '../../lib/api';

const templates = [
  { label: '💻 Video', text: 'Posso te ajudar por videochamada! Tenho disponibilidade nos fins de semana e seria uma honra conhecer sua história.' },
  { label: '📍 Presencial', text: 'Posso comparecer presencialmente! Moro na mesma região e tenho mobilidade para ir até você.' },
  { label: '📚 Ensino', text: 'Tenho experiência nessa área e adoraria ensinar! Podemos começar pelo básico e ir avançando no seu ritmo.' },
];

export default function SupporterDreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dream, setDream] = useState<PublicDream | null>(null);
  const [loadingDream, setLoadingDream] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showProposal, setShowProposal] = useState(false);
  const [message, setMessage] = useState('');
  const [offering, setOffering] = useState('');
  const [availability, setAvailability] = useState('');
  const [duration, setDuration] = useState('');
  const [conductAccepted, setConductAccepted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [warning, setWarning] = useState('');
  const [submitError, setSubmitError] = useState('');

  const BLOCKED = ['pix', 'r$', 'dinheiro', 'pagamento', 'doação'];

  useEffect(() => {
    let mounted = true;

    async function loadDream() {
      if (!id) {
        setLoadError('Sonho inválido.');
        setLoadingDream(false);
        return;
      }

      setLoadingDream(true);
      setLoadError('');

      try {
        const dreams = await dreamsApi.listPublic();
        const current = dreams.find((item) => item.id === id);
        if (!current) {
          setLoadError('Sonho não encontrado ou indisponível.');
          return;
        }
        if (mounted) setDream(current);
      } catch (err) {
        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError('Não foi possível carregar o sonho agora.');
        }
      } finally {
        if (mounted) setLoadingDream(false);
      }
    }

    void loadDream();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleMsgChange = (val: string) => {
    if (BLOCKED.some(w => val.toLowerCase().includes(w))) {
      setWarning('Pedidos de dinheiro não são permitidos no NextDream. 🚫');
    } else {
      setWarning('');
    }
    setMessage(val);
  };

  const handleSend = async () => {
    if (!conductAccepted || warning || !message.trim() || !id) return;
    setSubmitError('');
    setSending(true);
    try {
      await dreamsApi.createProposal(id, {
        message: message.trim(),
        offering: offering.trim(),
        availability: availability.trim(),
        duration: duration.trim(),
      });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Não foi possível enviar a proposta agora.');
      }
    } finally {
      setSending(false);
    }
  };

  if (loadingDream) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-gray-500">
        Carregando sonho...
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="bg-white border border-red-200 rounded-2xl p-6">
          <p className="text-red-700 text-sm">{loadError || 'Não encontramos este sonho.'}</p>
          <button
            onClick={() => navigate('/apoiador/explorar')}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm"
          >
            Voltar para explorar
          </button>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-20 px-8">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-teal-600 fill-teal-200" />
          </div>
          <h2 className="text-gray-800 mb-3" style={{ fontWeight: 700 }}>Proposta enviada! 💚</h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            Sua proposta foi enviada com carinho para <strong>{dream.patientName}</strong>. Aguarde enquanto ela analisa — você será notificado quando houver resposta.
          </p>
          <div className="bg-teal-50 rounded-2xl p-5 text-left mb-6">
            <p className="text-sm font-medium text-teal-800 mb-3">O que acontece agora:</p>
            <div className="space-y-2">
              {['✉️ O paciente receberá sua proposta', '⏳ Aguarde a análise (costuma ser rápida)', '✅ Se aceito, um chat privado será aberto', '💬 Vocês combinam todos os detalhes no chat'].map((step, i) => (
                <p key={i} className="text-sm text-teal-700">{step}</p>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/apoiador/propostas')} className="border border-gray-200 px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-50 text-sm">
              Ver minhas propostas
            </button>
            <button onClick={() => navigate('/apoiador/explorar')} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium text-sm">
              Explorar mais sonhos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft className="w-4 h-4" /> Explorar sonhos
      </button>

      {/* Dream card */}
      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-50 to-teal-50 px-6 py-5 border-b border-pink-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-2xl shrink-0">
              {dream.category === 'Experiência ao ar livre' ? '🌅' : dream.category === 'Arte e Música' ? '🎵' : dream.category === 'Culinária' ? '🍳' : '✨'}
            </div>
            <div className="flex-1">
              <h1 className="text-gray-800 mb-2" style={{ fontSize: '1.1rem' }}>{dream.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <DreamStatusBadge status={dream.status} />
                {dream.urgency === 'alta' && <UrgencyBadge urgency={dream.urgency} />}
                <span className="text-xs text-pink-600">{dream.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-gray-600 leading-relaxed">{dream.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: dream.format === 'remoto' ? Video : MapPinned, label: 'Formato', value: dream.format === 'remoto' ? 'Online' : dream.format === 'presencial' ? 'Presencial' : 'Presencial ou Online' },
              { icon: MapPin, label: 'Região', value: dream.patientCity || 'Não informada' },
              { icon: Clock, label: 'Publicado', value: new Date(dream.createdAt).toLocaleDateString('pt-BR') },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><item.icon className="w-3 h-3" />{item.label}</p>
                <p className="text-sm text-gray-700">{item.value}</p>
              </div>
            ))}
          </div>

          {dream.restrictions && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-amber-700 font-medium mb-1">⚠️ Restrições importantes — leia antes de propor</p>
              <p className="text-sm text-amber-600">{dream.restrictions}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {[dream.category, dream.format, dream.urgency].map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-pink-50 text-pink-600 rounded-full text-xs">#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Proposal form */}
      {!showProposal ? (
        <button
          onClick={() => setShowProposal(true)}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-semibold text-base transition-colors shadow-md shadow-teal-100"
        >
          <Heart className="w-5 h-5" />
          Quero ajudar a realizar esse sonho
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-teal-100 bg-teal-50">
            <h2 className="text-teal-800">Enviar proposta</h2>
            <p className="text-teal-600 text-sm">Seja direto, carinhoso e específico.</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Templates */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Modelos rápidos:</p>
              <div className="flex flex-wrap gap-2">
                {templates.map(t => (
                  <button key={t.label} onClick={() => { setMessage(t.text); setWarning(''); }}
                    className="px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-xs hover:bg-teal-100 transition-colors">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Sua mensagem <span className="text-red-500">*</span></label>
              <textarea
                value={message}
                onChange={e => handleMsgChange(e.target.value)}
                placeholder="Apresente-se, conte por que quer ajudar e o que você pode oferecer..."
                rows={4}
                className={`w-full px-4 py-3 bg-teal-50 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none
                  ${warning ? 'border-red-300 focus:ring-red-300' : 'border-teal-100 focus:ring-teal-300'}`}
              />
              {warning && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700">{warning}</p>
                </div>
              )}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">O que você oferece</label>
              <input type="text" value={offering} onChange={e => setOffering(e.target.value)}
                placeholder="Ex: Companhia, transporte adaptado, aula de violão..."
                className="w-full px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Disponibilidade</label>
                <input type="text" value={availability} onChange={e => setAvailability(e.target.value)}
                  placeholder="Ex: Fins de semana"
                  className="w-full px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Duração estimada</label>
                <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
                  placeholder="Ex: 2-3 horas"
                  className="w-full px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl text-sm focus:outline-none" />
              </div>
            </div>

            {/* Conduct term */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" id="conduct" checked={conductAccepted} onChange={e => setConductAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600" />
                <label htmlFor="conduct" className="text-xs text-amber-700 leading-relaxed cursor-pointer">
                  <strong>Termo de conduta:</strong> Confirmo que não farei pedidos de dinheiro, PIX ou qualquer compensação financeira. Ofereço meu tempo e presença voluntariamente, com respeito e dignidade.
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowProposal(false)} className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={!conductAccepted || !message.trim() || !!warning || sending}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors
                  ${conductAccepted && message.trim() && !warning ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {sending ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Enviar proposta</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
