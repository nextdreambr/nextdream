import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Video, MapPinned, Clock, Send, AlertTriangle, Heart, MessageCircle, HeartHandshake, ShieldCheck } from 'lucide-react';
import { DreamStatusBadge, ProposalStatusBadge } from '../../components/shared/StatusBadge';
import { useApp } from '../../context/AppContext';
import { ApiError, Proposal, PublicDream, dreamsApi, proposalsApi } from '../../lib/api';
import { buildProposalMapByDream } from '../../lib/proposals';
import { recordSandboxDreamVisit } from '../../lib/sandboxProfileState';
import { HumanCard, ProductHero, ProductPageShell, SensitiveNotice } from '../../components/shared/VisualSystem';
import { DreamLanguageAssist } from '../../components/shared/DreamLanguageAssist';

const templates = [
  { label: 'Videochamada', text: 'Posso participar por videochamada. Tenho disponibilidade nos fins de semana e posso combinar no ritmo que for confortável.' },
  { label: 'Presencial', text: 'Posso estar presencialmente na região informada, respeitando os limites combinados e a presença de acompanhante se necessário.' },
  { label: 'Ensino', text: 'Tenho experiência nessa área e posso compartilhar uma habilidade de forma simples, com calma e sem pressa.' },
];

export default function SupporterDreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [dream, setDream] = useState<PublicDream | null>(null);
  const [loadingDream, setLoadingDream] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showProposal, setShowProposal] = useState(false);
  const [existingProposal, setExistingProposal] = useState<Proposal | null>(null);
  const [message, setMessage] = useState('');
  const [offering, setOffering] = useState('');
  const [availability, setAvailability] = useState('');
  const [duration, setDuration] = useState('');
  const [conductAccepted, setConductAccepted] = useState(false);
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
        const [current, myProposals] = await Promise.all([
          dreamsApi.getById(id),
          proposalsApi.listMine(),
        ]);
        if (!mounted) return;
        setDream(current);
        setExistingProposal(buildProposalMapByDream(myProposals).get(id) ?? null);
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

  useEffect(() => {
    if (!dream || !currentUser || currentUser.role !== 'apoiador') return;
    recordSandboxDreamVisit(currentUser.id, 'apoiador', {
      dreamId: dream.id,
      title: dream.title,
      path: `/apoiador/sonhos/${dream.id}`,
    });
  }, [currentUser, dream]);

  const handleMsgChange = (val: string) => {
    if (BLOCKED.some(w => val.toLowerCase().includes(w))) {
      setWarning('Pedidos de dinheiro não são permitidos no NextDream.');
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
      const proposals = await proposalsApi.listMine();
      const proposal = buildProposalMapByDream(proposals).get(id) ?? null;
      setExistingProposal(proposal);
      setShowProposal(false);
      setSuccessMessage('Proposta enviada com sucesso.');
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
        if (err.status === 409) {
          const proposals = await proposalsApi.listMine();
          const proposal = buildProposalMapByDream(proposals).get(id) ?? null;
          setExistingProposal(proposal);
          setShowProposal(false);
        }
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
        <div className="bg-white border border-[#c9e5dc] rounded-2xl p-6">
          <p className="text-[#245b53] text-sm">{loadError || 'Não encontramos este sonho.'}</p>
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

  return (
    <DreamLanguageAssist dream={dream} variant="detail">
      {({ title, description, controls }) => (
    <ProductPageShell tone="support" width="content">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[#50645d] hover:text-[#245b53]">
        <ArrowLeft className="w-4 h-4" /> Explorar sonhos
      </button>

      <ProductHero
        tone="support"
        icon={HeartHandshake}
        eyebrow={dream.category}
        title={title}
        description="Leia a história com calma e envie proposta apenas se puder oferecer presença, tempo, companhia ou habilidade de forma realista."
        aside={(
          <SensitiveNotice tone="support" title="Apoio responsável">
            Não ofereça dinheiro, PIX, presentes financeiros ou promessas. Combine limites e próximos passos apenas depois do aceite.
          </SensitiveNotice>
        )}
      />

      <HumanCard tone="support" className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <DreamStatusBadge status={dream.status} />
          <span className="rounded-full bg-[#e5f4ee] px-3 py-1 text-xs font-bold text-[#245b53]">{dream.category}</span>
        </div>

        <p className="text-[#4d5f56] leading-relaxed">{description}</p>
        {controls}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: dream.format === 'remoto' ? Video : MapPinned, label: 'Formato', value: dream.format === 'remoto' ? 'Online' : dream.format === 'presencial' ? 'Presencial' : 'Presencial ou Online' },
              { icon: MapPin, label: 'Região', value: dream.patientCity || 'Não informada' },
              { icon: Clock, label: 'Publicado', value: new Date(dream.createdAt).toLocaleDateString('pt-BR') },
            ].map((item, i) => (
              <div key={i} className="bg-[#f2fbf8] rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><item.icon className="w-3 h-3" />{item.label}</p>
                <p className="text-sm text-gray-700">{item.value}</p>
              </div>
            ))}
          </div>

          {dream.restrictions && (
            <div className="bg-[#fff4d8] border border-[#ead8c4] rounded-xl p-4">
              <p className="text-xs text-[#8b3d44] font-medium mb-1">Limites importantes — leia antes de propor</p>
              <p className="text-sm text-[#6b5d63]">{dream.restrictions}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {[
              dream.category,
              dream.format === 'remoto' ? 'Online' : dream.format === 'presencial' ? 'Presencial' : 'Presencial ou online',
              'Apoio por presença',
            ].map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-[#f2fbf8] text-[#245b53] rounded-full text-xs font-semibold">{tag}</span>
            ))}
          </div>
      </HumanCard>

      {successMessage && (
        <div className="bg-[#e5f4ee] border border-[#c9e5dc] rounded-2xl p-4 text-sm text-[#245b53]">
          {successMessage}
        </div>
      )}

      {existingProposal ? (
        <div className="bg-white rounded-2xl border border-[#c9e5dc] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#c9e5dc] bg-[#e5f4ee] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[#245b53]">Sua proposta</h2>
              <p className="text-[#50645d] text-sm">Você já enviou uma proposta para este sonho.</p>
            </div>
            <ProposalStatusBadge status={existingProposal.status} />
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">{existingProposal.message}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">O que você oferece</p>
                <p className="text-sm text-gray-700">{existingProposal.offering || 'Não informado'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Disponibilidade</p>
                <p className="text-sm text-gray-700">{existingProposal.availability || 'Não informada'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Duração</p>
                <p className="text-sm text-gray-700">{existingProposal.duration || 'Não informada'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Enviada em</p>
                <p className="text-sm text-gray-700">{new Date(existingProposal.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/apoiador/propostas')}
                className="border border-[#c9e5dc] px-5 py-3 rounded-xl text-[#50645d] hover:bg-[#e5f4ee] text-sm"
              >
                Ver minhas propostas
              </button>
              {existingProposal.status === 'aceita' && (
                <button
                  onClick={() => navigate('/apoiador/chat')}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" /> Abrir conversa
                </button>
              )}
            </div>
          </div>
        </div>
      ) : !showProposal ? (
        <button
          onClick={() => setShowProposal(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#245b53] hover:bg-[#17453f] text-white py-4 rounded-full font-extrabold text-base transition-colors shadow-md shadow-[#c9e5dc]"
        >
          <Heart className="w-5 h-5" />
          Oferecer presença
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-[#c9e5dc] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#c9e5dc] bg-[#e5f4ee]">
            <h2 className="text-[#245b53]">Enviar proposta</h2>
            <p className="text-[#50645d] text-sm">Seja específico, respeitoso e realista sobre o que pode oferecer.</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Templates */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Modelos cuidadosos:</p>
              <div className="flex flex-wrap gap-2">
                {templates.map(t => (
                  <button key={t.label} onClick={() => { setMessage(t.text); setWarning(''); }}
                    className="px-3 py-1.5 bg-[#f2fbf8] border border-[#c9e5dc] text-[#245b53] rounded-xl text-xs hover:bg-[#e5f4ee] transition-colors">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Sua mensagem <span className="text-[#245b53]">*</span></label>
              <textarea
                value={message}
                onChange={e => handleMsgChange(e.target.value)}
                placeholder="Apresente-se e diga o que você pode oferecer com respeito aos limites descritos."
                rows={4}
                className={`w-full px-4 py-3 bg-[#fbfffc] border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none
                  ${warning ? 'border-[#245b53] focus:ring-[#9ed0c1]' : 'border-[#c9e5dc] focus:ring-[#9ed0c1]'}`}
              />
              {warning && (
                <div className="flex items-start gap-2 bg-[#e5f4ee] border border-[#c9e5dc] rounded-xl p-3 mt-2">
                  <AlertTriangle className="w-4 h-4 text-[#245b53] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#245b53]">{warning}</p>
                </div>
              )}
            </div>

            {submitError && (
              <div className="bg-[#e5f4ee] border border-[#c9e5dc] rounded-xl p-3 text-sm text-[#245b53]">
                {submitError}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">O que você oferece</label>
              <input type="text" value={offering} onChange={e => setOffering(e.target.value)}
                placeholder="Ex: Companhia, transporte adaptado, aula de violão..."
                className="w-full px-4 py-3 bg-[#fbfffc] border border-[#c9e5dc] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed0c1]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Disponibilidade</label>
                <input type="text" value={availability} onChange={e => setAvailability(e.target.value)}
                  placeholder="Ex: Fins de semana"
                  className="w-full px-4 py-3 bg-[#fbfffc] border border-[#c9e5dc] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed0c1]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Duração estimada</label>
                <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
                  placeholder="Ex: 2-3 horas"
                  className="w-full px-4 py-3 bg-[#fbfffc] border border-[#c9e5dc] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed0c1]" />
              </div>
            </div>

            {/* Conduct term */}
            <div className="bg-[#fff4d8] border border-[#ead8c4] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" id="conduct" checked={conductAccepted} onChange={e => setConductAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600" />
                <label htmlFor="conduct" className="text-xs text-[#6b5d63] leading-relaxed cursor-pointer">
                  <strong>Termo de conduta:</strong> Confirmo que não farei pedidos de dinheiro, PIX ou qualquer compensação financeira. Ofereço meu tempo e presença voluntariamente, com respeito e dignidade.
                </label>
              </div>
            </div>

            <SensitiveNotice tone="support" icon={ShieldCheck} title="Depois do aceite">
              O contato só avança se a pessoa ou responsável aceitar a proposta. Até lá, mantenha a mensagem dentro da plataforma.
            </SensitiveNotice>

            <div className="flex gap-3">
              <button onClick={() => setShowProposal(false)} className="px-5 py-3 border border-[#c9e5dc] text-[#50645d] rounded-xl text-sm hover:bg-[#e5f4ee] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={!conductAccepted || !message.trim() || !!warning || sending}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors
                  ${conductAccepted && message.trim() && !warning ? 'bg-[#245b53] hover:bg-[#17453f] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {sending ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Enviar proposta</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProductPageShell>
      )}
    </DreamLanguageAssist>
  );
}
