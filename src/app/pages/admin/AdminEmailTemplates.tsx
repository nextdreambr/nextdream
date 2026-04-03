import { useState, useMemo } from 'react';
import {
  Mail, Search, User, Star, Send, MessageCircle,
  Shield, Copy, Check, Tag,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateVar { key: string; desc: string; example: string; }

interface EmailTemplate {
  id: string;
  category: string;
  name: string;
  subject: string;
  recipient: string;
  trigger: string;
  variables: TemplateVar[];
  render: (v: Record<string, string>) => JSX.Element;
}

// ─── Brand primitives ─────────────────────────────────────────────────────────

const BRAND = '#D91B8C';
const BRAND_LIGHT = '#fce7f3';
const BRAND_DARK = '#a8166c';

function EmailFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#f3f4f6', padding: '32px 0', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {children}
        {/* Footer */}
        <div style={{ background: '#1f2937', padding: '24px 32px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: 12, margin: '0 0 8px' }}>
            NextDream · Conectando sonhos e pessoas
          </p>
          <p style={{ color: '#6b7280', fontSize: 11, margin: 0, lineHeight: 1.6 }}>
            Você está recebendo este e-mail porque tem uma conta no NextDream.<br />
            <a href="#" style={{ color: '#d97706', textDecoration: 'none' }}>Cancelar inscrição</a>
            {' · '}
            <a href="#" style={{ color: '#d97706', textDecoration: 'none' }}>Política de Privacidade</a>
            {' · '}
            <a href="#" style={{ color: '#d97706', textDecoration: 'none' }}>Suporte</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function EmailHeader({ title, subtitle, emoji }: { title: string; subtitle?: string; emoji?: string }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`, padding: '40px 32px 32px', textAlign: 'center' }}>
      {emoji && <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>}
      <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3 }}>{title}</h1>
      {subtitle && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

function EmailBody({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '32px' }}>{children}</div>;
}

function EmailButton({ label, href = '#' }: { label: string; href?: string }) {
  return (
    <div style={{ textAlign: 'center', margin: '28px 0' }}>
      <a href={href} style={{ display: 'inline-block', background: BRAND, color: '#fff', fontWeight: 600, fontSize: 15, padding: '14px 36px', borderRadius: 50, textDecoration: 'none', letterSpacing: 0.3 }}>
        {label}
      </a>
    </div>
  );
}

function EmailCard({ children, color = '#f9fafb', border = '#e5e7eb' }: { children: React.ReactNode; color?: string; border?: string }) {
  return (
    <div style={{ background: color, border: `1px solid ${border}`, borderRadius: 12, padding: '16px 20px', margin: '16px 0' }}>
      {children}
    </div>
  );
}

function EmailText({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p style={{ color: muted ? '#6b7280' : '#374151', fontSize: 14, lineHeight: 1.7, margin: '0 0 12px' }}>
      {children}
    </p>
  );
}

function EmailDivider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '20px 0' }} />;
}

function Var({ v, k }: { v: Record<string, string>; k: string }) {
  return <strong style={{ color: BRAND }}>{v[k] ?? `{{${k}}}`}</strong>;
}

// ─── All Templates ─────────────────────────────────────────────────────────────

const TEMPLATES: EmailTemplate[] = [

  // ─── Conta & Boas-vindas ────────────────────────────────────────────────────

  {
    id: 'welcome-patient',
    category: 'Conta & Boas-vindas',
    name: 'Boas-vindas — Paciente',
    subject: 'Bem-vindo ao NextDream, {{name}} 💕',
    recipient: 'Paciente',
    trigger: 'Cadastro concluído como paciente',
    variables: [
      { key: 'name', desc: 'Nome do paciente', example: 'Ana Souza' },
      { key: 'email', desc: 'E-mail cadastrado', example: 'ana@email.com' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="💕" title={`Bem-vinda, ${v.name || 'Ana'}!`} subtitle="Seu cadastro no NextDream foi confirmado" />
        <EmailBody>
          <EmailText>Que alegria ter você aqui! O NextDream é um espaço para transformar sonhos em realidade, conectando você com apoiadores que oferecem tempo, presença e companhia — de coração, sem nenhum custo.</EmailText>
          <EmailText>Com sua conta você pode:</EmailText>
          <EmailCard>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: '#374151' }}>✨ <strong>Publicar seus sonhos</strong> — conte o que deseja vivenciar</p>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: '#374151' }}>💌 <strong>Receber propostas</strong> — apoiadores irão até você</p>
            <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>🤝 <strong>Conectar com segurança</strong> — chat monitorado e protegido</p>
          </EmailCard>
          <EmailButton label="Publicar meu primeiro sonho" />
          <EmailDivider />
          <EmailText muted>Se precisar de ajuda em qualquer momento, nossa equipe está aqui. Você não está sozinha nessa jornada.</EmailText>
          <EmailText muted>Com carinho,<br /><strong style={{ color: '#374151' }}>Equipe NextDream</strong></EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'welcome-supporter',
    category: 'Conta & Boas-vindas',
    name: 'Boas-vindas — Apoiador',
    subject: 'Bem-vindo ao NextDream, {{name}} 🌟',
    recipient: 'Apoiador',
    trigger: 'Cadastro concluído como apoiador',
    variables: [
      { key: 'name', desc: 'Nome do apoiador', example: 'Pedro Rocha' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="🌟" title={`Olá, ${v.name || 'Pedro'}!`} subtitle="Você acabou de se tornar um Apoiador NextDream" />
        <EmailBody>
          <EmailText>Parabéns por dar esse passo incrível! Ser um apoiador é oferecer algo que nenhum dinheiro compra: sua presença, seu tempo e sua humanidade.</EmailText>
          <EmailText>A partir de agora você pode:</EmailText>
          <EmailCard>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: '#374151' }}>🔍 <strong>Explorar sonhos</strong> — encontre histórias que te tocam</p>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: '#374151' }}>📩 <strong>Enviar propostas</strong> — diga como pode ajudar</p>
            <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>💬 <strong>Conectar com segurança</strong> — chat liberado após aceite</p>
          </EmailCard>
          <EmailCard color="#fef3c7" border="#fde68a">
            <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              <strong>⚠️ Importante:</strong> O NextDream é uma plataforma 100% gratuita e solidária. É estritamente proibido solicitar qualquer forma de pagamento, PIX ou dados pessoais fora da plataforma.
            </p>
          </EmailCard>
          <EmailButton label="Explorar sonhos agora" />
          <EmailText muted>Com gratidão pelo que você está prestes a fazer,<br /><strong style={{ color: '#374151' }}>Equipe NextDream</strong></EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'email-verification',
    category: 'Conta & Boas-vindas',
    name: 'Verificação de E-mail',
    subject: 'Confirme seu e-mail no NextDream',
    recipient: 'Todos',
    trigger: 'Cadastro novo ou alteração de e-mail',
    variables: [
      { key: 'name', desc: 'Nome do usuário', example: 'Ana Souza' },
      { key: 'code', desc: 'Código de verificação 6 dígitos', example: '847 291' },
      { key: 'expires', desc: 'Prazo de expiração', example: '30 minutos' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="✉️" title="Confirme seu e-mail" subtitle="Só mais um passo para começar" />
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />! Use o código abaixo para confirmar seu endereço de e-mail:</EmailText>
          <div style={{ textAlign: 'center', margin: '28px 0' }}>
            <div style={{ display: 'inline-block', background: BRAND_LIGHT, border: `2px solid ${BRAND}`, borderRadius: 16, padding: '20px 40px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9d174d', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>Código de verificação</p>
              <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: BRAND, letterSpacing: 8 }}>{v.code || '847 291'}</p>
            </div>
          </div>
          <EmailText muted>Este código expira em <strong style={{ color: '#374151' }}>{v.expires || '30 minutos'}</strong>. Se você não criou uma conta no NextDream, ignore este e-mail.</EmailText>
          <EmailButton label="Confirmar e-mail" />
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'password-reset',
    category: 'Conta & Boas-vindas',
    name: 'Redefinição de Senha',
    subject: 'Redefinir sua senha no NextDream',
    recipient: 'Todos',
    trigger: 'Solicitação de "Esqueci minha senha"',
    variables: [
      { key: 'name', desc: 'Nome do usuário', example: 'Ana Souza' },
      { key: 'expires', desc: 'Prazo do link', example: '1 hora' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="🔐" title="Redefinir senha" subtitle="Recebemos sua solicitação" />
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />! Recebemos uma solicitação para redefinir a senha da sua conta no NextDream.</EmailText>
          <EmailButton label="Redefinir minha senha" />
          <EmailCard color="#fef2f2" border="#fecaca">
            <p style={{ margin: 0, fontSize: 13, color: '#991b1b', lineHeight: 1.6 }}>
              <strong>⏱️ Atenção:</strong> Este link expira em <strong>{v.expires || '1 hora'}</strong>. Se você não solicitou a redefinição de senha, sua conta está segura — ignore este e-mail.
            </p>
          </EmailCard>
          <EmailDivider />
          <EmailText muted>Se o botão não funcionar, copie e cole este link no navegador. Por segurança, nunca compartilhe este link com ninguém.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'account-verified',
    category: 'Conta & Boas-vindas',
    name: 'Conta Verificada',
    subject: '✅ Sua conta foi verificada no NextDream!',
    recipient: 'Todos',
    trigger: 'Admin verifica manualmente a conta do usuário',
    variables: [
      { key: 'name', desc: 'Nome do usuário', example: 'Pedro Rocha' },
      { key: 'role', desc: 'Tipo de conta', example: 'Apoiador' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="✅" title="Conta verificada!" subtitle={`Seu perfil de ${v.role || 'Apoiador'} foi confirmado`} />
        <EmailBody>
          <EmailText>Parabéns, <Var v={v} k="name" />! Sua conta foi verificada com sucesso pela equipe NextDream. Isso significa que outros usuários verão o selo de verificação no seu perfil.</EmailText>
          <EmailCard color="#f0fdf4" border="#bbf7d0">
            <p style={{ margin: 0, fontSize: 14, color: '#166534', lineHeight: 1.6 }}>
              <strong>🛡️ O que muda agora:</strong> Seu perfil exibe o badge de verificado, o que aumenta a confiança e as chances de conexões bem-sucedidas na plataforma.
            </p>
          </EmailCard>
          <EmailButton label="Ver meu perfil verificado" />
          <EmailText muted>Obrigado por fazer parte da comunidade NextDream.<br /><strong style={{ color: '#374151' }}>Equipe NextDream</strong></EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  // ─── Paciente — Sonhos ───────────────────────────────────────────────────────

  {
    id: 'dream-published',
    category: 'Paciente — Sonhos',
    name: 'Sonho Publicado',
    subject: '🌟 Seu sonho foi publicado no NextDream!',
    recipient: 'Paciente',
    trigger: 'Sonho aprovado e publicado (automaticamente ou pelo admin)',
    variables: [
      { key: 'name', desc: 'Nome do paciente', example: 'Ana Souza' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ver o nascer do sol na praia' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="🌟" title="Seu sonho está no ar!" subtitle="Apoiadores já podem encontrá-lo" />
        <EmailBody>
          <EmailText>Que momento especial, <Var v={v} k="name" />! Seu sonho foi publicado com sucesso e já está disponível para apoiadores de todo o Brasil.</EmailText>
          <EmailCard color={BRAND_LIGHT} border="#fbcfe8">
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9d174d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Sonho publicado</p>
            <p style={{ margin: 0, fontSize: 16, color: '#831843', fontWeight: 700 }}>"{v.dream_title || 'Ver o nascer do sol na praia'}"</p>
          </EmailCard>
          <EmailText>Agora é só aguardar — assim que um apoiador enviar uma proposta para você, avisaremos imediatamente por e-mail.</EmailText>
          <EmailButton label="Ver meu sonho publicado" />
          <EmailText muted>Sonhos que recebem mais propostas costumam ter descrições detalhadas e carinhosas. Se quiser, você pode editar seu sonho a qualquer momento.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'dream-new-proposal',
    category: 'Paciente — Sonhos',
    name: 'Nova Proposta Recebida',
    subject: '💌 {{supporter_name}} quer ajudar a realizar seu sonho!',
    recipient: 'Paciente',
    trigger: 'Apoiador envia proposta para o sonho do paciente',
    variables: [
      { key: 'name', desc: 'Nome do paciente', example: 'Ana Souza' },
      { key: 'supporter_name', desc: 'Nome do apoiador', example: 'Pedro Rocha' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ver o nascer do sol na praia' },
      { key: 'offering', desc: 'O que o apoiador oferece', example: 'Transporte adaptado e companhia' },
      { key: 'total_proposals', desc: 'Total de propostas recebidas', example: '3' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="💌" title="Nova proposta recebida!" subtitle={`${v.supporter_name || 'Pedro Rocha'} quer ajudar você`} />
        <EmailBody>
          <EmailText>Boa notícia, <Var v={v} k="name" />! Você recebeu uma nova proposta para o seu sonho.</EmailText>
          <EmailCard color={BRAND_LIGHT} border="#fbcfe8">
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9d174d', fontWeight: 600 }}>Para o sonho</p>
            <p style={{ margin: '0 0 12px', fontSize: 15, color: '#831843', fontWeight: 700 }}>"{v.dream_title || 'Ver o nascer do sol na praia'}"</p>
            <div style={{ borderTop: '1px solid #fbcfe8', paddingTop: 12 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9d174d', fontWeight: 600 }}>Apoiador</p>
              <p style={{ margin: '0 0 8px', fontSize: 15, color: '#1f2937', fontWeight: 600 }}>{v.supporter_name || 'Pedro Rocha'}</p>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9d174d', fontWeight: 600 }}>O que oferece</p>
              <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>{v.offering || 'Transporte adaptado e companhia'}</p>
            </div>
          </EmailCard>
          <EmailText>Você tem no total <strong style={{ color: BRAND }}>{v.total_proposals || '3'} proposta(s)</strong> para revisar. Lembre-se: após aceitar uma proposta, o chat é liberado automaticamente.</EmailText>
          <EmailButton label="Ver propostas e escolher" />
          <EmailText muted>Só você decide quem irá te acompanhar nessa experiência tão especial.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'proposal-accepted-patient',
    category: 'Paciente — Sonhos',
    name: 'Proposta Aceita (Paciente)',
    subject: '🎉 Chat liberado! Converse com {{supporter_name}}',
    recipient: 'Paciente',
    trigger: 'Paciente aceita uma proposta de apoiador',
    variables: [
      { key: 'name', desc: 'Nome do paciente', example: 'Ana Souza' },
      { key: 'supporter_name', desc: 'Nome do apoiador', example: 'Pedro Rocha' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ver o nascer do sol na praia' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="🎉" title="Chat liberado!" subtitle="Sua conexão começou" />
        <EmailBody>
          <EmailText>Parabéns, <Var v={v} k="name" />! Você aceitou a proposta de <Var v={v} k="supporter_name" /> para o sonho <strong style={{ color: '#374151' }}>"{v.dream_title || 'Ver o nascer do sol na praia'}"</strong>.</EmailText>
          <EmailCard color="#f0fdf4" border="#bbf7d0">
            <p style={{ margin: 0, fontSize: 14, color: '#166534', lineHeight: 1.7 }}>
              ✅ <strong>O chat foi liberado</strong> — você já pode conversar com {v.supporter_name || 'Pedro Rocha'} para combinar todos os detalhes da realização do seu sonho.
            </p>
          </EmailCard>
          <EmailCard color="#fef3c7" border="#fde68a">
            <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              <strong>🔒 Segurança em primeiro lugar:</strong> Use apenas o chat interno da plataforma. Não compartilhe dados pessoais como endereço, CPF ou dados bancários.
            </p>
          </EmailCard>
          <EmailButton label="Ir para o chat agora" />
          <EmailText muted>Estamos muito felizes por você. Que esse encontro seja lindo e cheio de significado.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'dream-completed',
    category: 'Paciente — Sonhos',
    name: 'Sonho Realizado 🎊',
    subject: '✨ Seu sonho foi realizado! Que momento especial',
    recipient: 'Paciente',
    trigger: 'Sonho marcado como concluído',
    variables: [
      { key: 'name', desc: 'Nome do paciente', example: 'Ana Souza' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ver o nascer do sol na praia' },
      { key: 'supporter_name', desc: 'Nome do apoiador', example: 'Pedro Rocha' },
    ],
    render: v => (
      <EmailFrame>
        <div style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #f97316 100%)`, padding: '48px 32px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🌅</div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Sonho realizado!</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, margin: 0 }}>Este é um momento que ficará para sempre</p>
        </div>
        <EmailBody>
          <EmailText>Querida <Var v={v} k="name" />,</EmailText>
          <EmailText>Que momento incrível e emocionante! O sonho <strong style={{ color: BRAND }}>"{v.dream_title || 'Ver o nascer do sol na praia'}"</strong> foi marcado como realizado. 💕</EmailText>
          <EmailCard color={BRAND_LIGHT} border="#fbcfe8">
            <p style={{ margin: '0 0 8px', fontSize: 14, color: '#9d174d' }}>Com o apoio especial de</p>
            <p style={{ margin: 0, fontSize: 18, color: '#831843', fontWeight: 700 }}>💛 {v.supporter_name || 'Pedro Rocha'}</p>
          </EmailCard>
          <EmailText>O NextDream existe por causa de momentos como este. Obrigada por confiar na nossa plataforma para realizar algo tão precioso.</EmailText>
          <EmailButton label="Compartilhar minha experiência" />
          <EmailText muted>Se quiser, você pode publicar um novo sonho a qualquer momento. A jornada continua. ✨</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'dream-paused',
    category: 'Paciente — Sonhos',
    name: 'Sonho Pausado / Cancelado',
    subject: 'Atualização sobre o seu sonho no NextDream',
    recipient: 'Paciente',
    trigger: 'Admin pausa ou cancela um sonho por revisão',
    variables: [
      { key: 'name', desc: 'Nome do paciente', example: 'Ana Souza' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Meu sonho especial' },
      { key: 'reason', desc: 'Motivo da ação', example: 'Conteúdo em revisão por nossa equipe' },
      { key: 'action', desc: 'Ação aplicada', example: 'pausado temporariamente' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="⏸️" title="Sonho pausado" subtitle="Sua atenção é necessária" />
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />. Precisamos te informar que seu sonho <strong>"{v.dream_title || 'Meu sonho especial'}"</strong> foi <strong style={{ color: '#d97706' }}>{v.action || 'pausado temporariamente'}</strong>.</EmailText>
          <EmailCard color="#fef3c7" border="#fde68a">
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#92400e', fontWeight: 600 }}>Motivo</p>
            <p style={{ margin: 0, fontSize: 14, color: '#78350f' }}>{v.reason || 'Conteúdo em revisão por nossa equipe'}</p>
          </EmailCard>
          <EmailText>Nossa equipe pode entrar em contato em breve. Se você tiver dúvidas ou quiser entender melhor, acesse sua conta ou entre em contato com o suporte.</EmailText>
          <EmailButton label="Ver minha conta" />
          <EmailText muted>Agimos sempre com respeito e empatia. Estamos aqui para ajudar.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  // ─── Apoiador — Propostas ────────────────────────────────────────────────────

  {
    id: 'proposal-sent',
    category: 'Apoiador — Propostas',
    name: 'Proposta Enviada',
    subject: '📩 Sua proposta foi enviada com sucesso!',
    recipient: 'Apoiador',
    trigger: 'Apoiador envia uma proposta para um sonho',
    variables: [
      { key: 'name', desc: 'Nome do apoiador', example: 'Pedro Rocha' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ver o nascer do sol na praia' },
      { key: 'patient_name', desc: 'Nome do paciente', example: 'Ana Souza' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="📩" title="Proposta enviada!" subtitle="Aguardando resposta do paciente" />
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />! Sua proposta foi enviada com sucesso para o sonho:</EmailText>
          <EmailCard color={BRAND_LIGHT} border="#fbcfe8">
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9d174d', fontWeight: 600 }}>Sonho</p>
            <p style={{ margin: '0 0 8px', fontSize: 15, color: '#831843', fontWeight: 700 }}>"{v.dream_title || 'Ver o nascer do sol na praia'}"</p>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9d174d', fontWeight: 600 }}>Paciente</p>
            <p style={{ margin: 0, fontSize: 14, color: '#1f2937' }}>{v.patient_name || 'Ana Souza'}</p>
          </EmailCard>
          <EmailText>{v.patient_name || 'Ana Souza'} irá analisar sua proposta e te notificaremos quando houver uma resposta. Enquanto isso, você pode explorar outros sonhos.</EmailText>
          <EmailButton label="Explorar mais sonhos" />
          <EmailText muted>Obrigado por querer fazer a diferença. Cada proposta carrega uma centelha de esperança. 💛</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'proposal-accepted-supporter',
    category: 'Apoiador — Propostas',
    name: 'Proposta Aceita (Apoiador)',
    subject: '🎉 Sua proposta foi aceita! Prepare-se para algo especial',
    recipient: 'Apoiador',
    trigger: 'Paciente aceita a proposta do apoiador',
    variables: [
      { key: 'name', desc: 'Nome do apoiador', example: 'Pedro Rocha' },
      { key: 'patient_name', desc: 'Nome do paciente', example: 'Ana Souza' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ver o nascer do sol na praia' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="🎉" title="Sua proposta foi aceita!" subtitle={`${v.patient_name || 'Ana Souza'} escolheu você`} />
        <EmailBody>
          <EmailText><Var v={v} k="name" />, que notícia maravilhosa! <strong style={{ color: BRAND }}>{v.patient_name || 'Ana Souza'}</strong> escolheu a sua proposta para realizar o sonho <strong style={{ color: '#374151' }}>"{v.dream_title || 'Ver o nascer do sol na praia'}"</strong>. 💕</EmailText>
          <EmailCard color="#f0fdf4" border="#bbf7d0">
            <p style={{ margin: 0, fontSize: 14, color: '#166534', lineHeight: 1.7 }}>
              🟢 <strong>O chat foi liberado!</strong> Você já pode conversar com {v.patient_name || 'Ana'} para combinar todos os detalhes. Use apenas o chat interno da plataforma.
            </p>
          </EmailCard>
          <EmailCard color="#fef3c7" border="#fde68a">
            <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              <strong>⚠️ Nunca solicite</strong> dados pessoais, endereço, telefone ou qualquer forma de pagamento. Isso é proibido e pode resultar em suspensão da conta.
            </p>
          </EmailCard>
          <EmailButton label="Ir para o chat" />
          <EmailText muted>Você está prestes a fazer algo que importa de verdade. Obrigado por ser um apoiador NextDream.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'proposal-rejected',
    category: 'Apoiador — Propostas',
    name: 'Proposta Não Selecionada',
    subject: 'Atualização sobre sua proposta no NextDream',
    recipient: 'Apoiador',
    trigger: 'Paciente aceita outra proposta ou recusa explicitamente',
    variables: [
      { key: 'name', desc: 'Nome do apoiador', example: 'Juliana Costa' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ver o nascer do sol na praia' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="💙" title="Obrigado pela sua proposta" subtitle="Desta vez não foi selecionada" />
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />! Passamos para informar que sua proposta para <strong>"{v.dream_title || 'Ver o nascer do sol na praia'}"</strong> não foi selecionada desta vez.</EmailText>
          <EmailText>Isso não significa que você não foi incrível — às vezes outro apoiador simplesmente tinha uma disponibilidade ou experiência mais específica para aquele momento.</EmailText>
          <EmailCard color="#eff6ff" border="#bfdbfe">
            <p style={{ margin: 0, fontSize: 14, color: '#1e40af', lineHeight: 1.7 }}>
              💙 <strong>Não desanime!</strong> Há muitos outros sonhos esperando por pessoas como você. Cada proposta enviada já é um gesto bonito.
            </p>
          </EmailCard>
          <EmailButton label="Explorar novos sonhos" />
          <EmailText muted>Sua generosidade faz diferença, mesmo quando não é você o escolhido. Obrigado por fazer parte do NextDream.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'dream-completed-supporter',
    category: 'Apoiador — Propostas',
    name: 'Sonho Realizado (Apoiador)',
    subject: '🌟 Você ajudou a realizar um sonho! Que incrível',
    recipient: 'Apoiador',
    trigger: 'Sonho marcado como concluído',
    variables: [
      { key: 'name', desc: 'Nome do apoiador', example: 'Pedro Rocha' },
      { key: 'patient_name', desc: 'Nome do paciente', example: 'Ana Souza' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ver o nascer do sol na praia' },
    ],
    render: v => (
      <EmailFrame>
        <div style={{ background: `linear-gradient(135deg, #0f766e 0%, ${BRAND_DARK} 100%)`, padding: '48px 32px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🌟</div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Você realizou um sonho!</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, margin: 0 }}>Obrigado por ser essa pessoa incrível</p>
        </div>
        <EmailBody>
          <EmailText><Var v={v} k="name" />, que momento! O sonho <strong style={{ color: BRAND }}>"{v.dream_title || 'Ver o nascer do sol na praia'}"</strong> de <strong>{v.patient_name || 'Ana Souza'}</strong> foi marcado como concluído. E você foi fundamental nisso. 💛</EmailText>
          <EmailCard color="#f0fdf4" border="#bbf7d0">
            <p style={{ margin: 0, fontSize: 15, color: '#166534', lineHeight: 1.7, textAlign: 'center', fontWeight: 500 }}>
              "Você não doou dinheiro. Você doou presença.<br />E isso vale muito mais."
            </p>
          </EmailCard>
          <EmailButton label="Ver histórico de conexões" />
          <EmailText muted>Siga explorando sonhos. O mundo precisa de mais pessoas como você.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  // ─── Chat ────────────────────────────────────────────────────────────────────

  {
    id: 'chat-unlocked',
    category: 'Chat',
    name: 'Chat Liberado',
    subject: '💬 Sua conversa foi liberada no NextDream',
    recipient: 'Ambos',
    trigger: 'Paciente aceita proposta — enviado para os dois participantes',
    variables: [
      { key: 'name', desc: 'Nome do destinatário', example: 'Ana Souza' },
      { key: 'other_name', desc: 'Nome do outro participante', example: 'Pedro Rocha' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ver o nascer do sol na praia' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="💬" title="Chat liberado!" subtitle="Agora vocês podem conversar" />
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />! O chat com <strong style={{ color: BRAND }}>{v.other_name || 'Pedro Rocha'}</strong> para o sonho <strong>"{v.dream_title || 'Ver o nascer do sol na praia'}"</strong> foi liberado.</EmailText>
          <EmailCard color="#f0fdf4" border="#bbf7d0">
            <p style={{ margin: '0 0 8px', fontSize: 14, color: '#166534', fontWeight: 600 }}>✅ O que você pode fazer agora:</p>
            <p style={{ margin: '0 0 6px', fontSize: 14, color: '#374151' }}>• Combinar data, hora e local do encontro</p>
            <p style={{ margin: '0 0 6px', fontSize: 14, color: '#374151' }}>• Alinhar expectativas e necessidades específicas</p>
            <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>• Tirar dúvidas e se preparar para algo incrível</p>
          </EmailCard>
          <EmailCard color="#fef3c7" border="#fde68a">
            <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              <strong>🔒 Regras do chat:</strong> Não compartilhe dados pessoais como telefone, e-mail ou endereço completo. Não aceite nem solicite pagamentos. Use sempre o chat da plataforma.
            </p>
          </EmailCard>
          <EmailButton label="Ir para o chat" />
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'chat-new-message',
    category: 'Chat',
    name: 'Nova Mensagem (Digest)',
    subject: '💬 Você tem {{count}} nova(s) mensagem(ns) no NextDream',
    recipient: 'Ambos',
    trigger: 'Usuário inativo há 2h+ com mensagens não lidas',
    variables: [
      { key: 'name', desc: 'Nome do destinatário', example: 'Ana Souza' },
      { key: 'other_name', desc: 'Remetente da mensagem', example: 'Pedro Rocha' },
      { key: 'count', desc: 'Quantidade de mensagens não lidas', example: '3' },
      { key: 'preview', desc: 'Prévia da última mensagem', example: 'Que dia funciona melhor pra você?' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ver o nascer do sol na praia' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="💬" title={`${v.count || '3'} mensagens não lidas`} subtitle={`${v.other_name || 'Pedro Rocha'} está esperando sua resposta`} />
        <EmailBody>
          <EmailText>Oi, <Var v={v} k="name" />! Você tem mensagens não lidas no chat sobre o sonho <strong>"{v.dream_title || 'Ver o nascer do sol na praia'}"</strong>.</EmailText>
          <EmailCard color="#f9fafb" border="#e5e7eb">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {(v.other_name || 'P')[0]}
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{v.other_name || 'Pedro Rocha'}</p>
                <p style={{ margin: 0, fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>"{v.preview || 'Que dia funciona melhor pra você?'}"</p>
              </div>
            </div>
          </EmailCard>
          <EmailButton label="Responder agora" />
          <EmailText muted>Você pode desativar as notificações de e-mail nas suas configurações de conta.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'chat-suspended',
    category: 'Chat',
    name: 'Chat Suspenso',
    subject: '⚠️ Uma conversa sua foi suspensa para revisão',
    recipient: 'Ambos',
    trigger: 'Admin ou sistema suspende uma conversa por alerta',
    variables: [
      { key: 'name', desc: 'Nome do usuário', example: 'Maria Jesus' },
      { key: 'dream_title', desc: 'Título do sonho', example: 'Ouvir histórias de quem viajou' },
      { key: 'reason', desc: 'Motivo da suspensão', example: 'Possível solicitação financeira detectada' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="⚠️" title="Conversa suspensa" subtitle="Revisão em andamento" />
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />. A conversa referente ao sonho <strong>"{v.dream_title || 'Ouvir histórias de quem viajou'}"</strong> foi temporariamente suspensa.</EmailText>
          <EmailCard color="#fef2f2" border="#fecaca">
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#991b1b', fontWeight: 600 }}>Motivo</p>
            <p style={{ margin: 0, fontSize: 14, color: '#7f1d1d' }}>{v.reason || 'Possível solicitação financeira detectada'}</p>
          </EmailCard>
          <EmailText>Nossa equipe de moderação irá revisar a situação e entrar em contato em breve. Enquanto isso, a conversa ficará bloqueada para novas mensagens.</EmailText>
          <EmailText>Se você acredita que isso é um engano, entre em contato com o suporte.</EmailText>
          <EmailButton label="Contatar suporte" />
        </EmailBody>
      </EmailFrame>
    ),
  },

  // ─── Moderação & Segurança ───────────────────────────────────────────────────

  {
    id: 'report-received',
    category: 'Moderação & Segurança',
    name: 'Denúncia Registrada',
    subject: '🛡️ Sua denúncia foi recebida pelo NextDream',
    recipient: 'Quem denunciou',
    trigger: 'Usuário registra uma denúncia na plataforma',
    variables: [
      { key: 'name', desc: 'Nome de quem denunciou', example: 'Maria Jesus' },
      { key: 'report_id', desc: 'ID da denúncia', example: '#R-2024-0042' },
      { key: 'type', desc: 'Tipo da denúncia', example: 'Pedido de dinheiro / PIX' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="🛡️" title="Denúncia registrada" subtitle="Sua segurança é nossa prioridade" />
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />! Recebemos sua denúncia e ela já está sendo analisada pela nossa equipe de moderação.</EmailText>
          <EmailCard>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>Número da denúncia</p>
            <p style={{ margin: '0 0 12px', fontSize: 16, color: '#1f2937', fontWeight: 700 }}>{v.report_id || '#R-2024-0042'}</p>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6b7280' }}>Tipo relatado</p>
            <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>{v.type || 'Pedido de dinheiro / PIX'}</p>
          </EmailCard>
          <EmailText>Nossa equipe leva todas as denúncias a sério. Em geral, revisamos e tomamos ação em até <strong>48 horas</strong>. Você será notificado sobre o resultado.</EmailText>
          <EmailCard color="#f0fdf4" border="#bbf7d0">
            <p style={{ margin: 0, fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
              <strong>👍 O que fazer agora:</strong> Se você se sentiu em perigo ou constrangido, pode encerrar a conversa imediatamente pela plataforma. Sua segurança vem antes de tudo.
            </p>
          </EmailCard>
          <EmailButton label="Ver status da denúncia" />
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'report-resolved',
    category: 'Moderação & Segurança',
    name: 'Denúncia Resolvida',
    subject: '✅ Sua denúncia foi resolvida — veja o resultado',
    recipient: 'Quem denunciou',
    trigger: 'Admin marca denúncia como resolvida',
    variables: [
      { key: 'name', desc: 'Nome de quem denunciou', example: 'Maria Jesus' },
      { key: 'report_id', desc: 'ID da denúncia', example: '#R-2024-0042' },
      { key: 'outcome', desc: 'Resultado da análise', example: 'O usuário denunciado foi suspenso por 7 dias' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="✅" title="Denúncia resolvida" subtitle="Ação tomada pela equipe NextDream" />
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />! A denúncia <strong>{v.report_id || '#R-2024-0042'}</strong> foi analisada e resolvida pela nossa equipe.</EmailText>
          <EmailCard color="#f0fdf4" border="#bbf7d0">
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#166534', fontWeight: 600 }}>Resultado</p>
            <p style={{ margin: 0, fontSize: 14, color: '#1f2937' }}>{v.outcome || 'O usuário denunciado foi suspenso por 7 dias'}</p>
          </EmailCard>
          <EmailText>Agradecemos por ajudar a manter o NextDream um espaço seguro e acolhedor para todos. Sua ação fez diferença.</EmailText>
          <EmailButton label="Voltar à plataforma" />
          <EmailText muted>Caso tenha mais dúvidas, entre em contato com o suporte.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'user-warning',
    category: 'Moderação & Segurança',
    name: 'Advertência Formal',
    subject: '⚠️ Advertência formal — leia com atenção',
    recipient: 'Usuário infrator',
    trigger: 'Admin emite advertência formal pelo painel',
    variables: [
      { key: 'name', desc: 'Nome do usuário', example: 'Pedro Rocha' },
      { key: 'violation', desc: 'Comportamento violado', example: 'Linguagem agressiva com outro usuário' },
      { key: 'context', desc: 'Contexto da infração', example: 'Chat referente ao sonho "Aprender a tocar violão"' },
    ],
    render: v => (
      <EmailFrame>
        <div style={{ background: '#f97316', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Advertência formal</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, margin: 0 }}>Ação registrada no seu histórico</p>
        </div>
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />. Nossa equipe identificou um comportamento que viola as diretrizes da plataforma NextDream.</EmailText>
          <EmailCard color="#fff7ed" border="#fed7aa">
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#c2410c', fontWeight: 600 }}>Violação identificada</p>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#431407' }}>{v.violation || 'Linguagem agressiva com outro usuário'}</p>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#c2410c', fontWeight: 600 }}>Contexto</p>
            <p style={{ margin: 0, fontSize: 14, color: '#431407' }}>{v.context || 'Chat referente ao sonho "Aprender a tocar violão"'}</p>
          </EmailCard>
          <EmailText>Esta advertência está registrada no seu perfil. <strong>Em caso de reincidência, sua conta poderá ser suspensa.</strong></EmailText>
          <EmailText>O NextDream é um espaço de cuidado e empatia. Pedimos que reveja as nossas diretrizes de comunidade.</EmailText>
          <EmailButton label="Ler as diretrizes da comunidade" />
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'user-suspended',
    category: 'Moderação & Segurança',
    name: 'Conta Suspensa',
    subject: '🚫 Sua conta foi suspensa temporariamente',
    recipient: 'Usuário suspenso',
    trigger: 'Admin aplica suspensão temporária',
    variables: [
      { key: 'name', desc: 'Nome do usuário', example: 'Carla Oliveira' },
      { key: 'duration', desc: 'Duração da suspensão', example: '7 dias' },
      { key: 'reason', desc: 'Motivo da suspensão', example: 'Solicitação de pagamento via PIX a outro usuário' },
      { key: 'until', desc: 'Data de término', example: '17 de fevereiro de 2026' },
    ],
    render: v => (
      <EmailFrame>
        <div style={{ background: '#dc2626', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Conta suspensa</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, margin: 0 }}>Por {v.duration || '7 dias'}</p>
        </div>
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />. Após análise, sua conta foi suspensa temporariamente por <strong>{v.duration || '7 dias'}</strong>.</EmailText>
          <EmailCard color="#fef2f2" border="#fecaca">
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#991b1b', fontWeight: 600 }}>Motivo</p>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#7f1d1d' }}>{v.reason || 'Solicitação de pagamento via PIX a outro usuário'}</p>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#991b1b', fontWeight: 600 }}>Suspensão até</p>
            <p style={{ margin: 0, fontSize: 14, color: '#7f1d1d', fontWeight: 600 }}>{v.until || '17 de fevereiro de 2026'}</p>
          </EmailCard>
          <EmailText>Durante a suspensão você não poderá acessar a plataforma. Após esse período, sua conta será reativada automaticamente.</EmailText>
          <EmailText>Se acredita que houve um engano, entre em contato com nosso suporte explicando a situação.</EmailText>
          <EmailButton label="Contatar suporte" />
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'user-banned',
    category: 'Moderação & Segurança',
    name: 'Conta Banida',
    subject: 'Encerramento definitivo da conta NextDream',
    recipient: 'Usuário banido',
    trigger: 'Admin aplica banimento permanente',
    variables: [
      { key: 'name', desc: 'Nome do usuário', example: 'Usuário' },
      { key: 'reason', desc: 'Motivo do banimento', example: 'Múltiplas violações graves das diretrizes' },
    ],
    render: v => (
      <EmailFrame>
        <div style={{ background: '#1f2937', padding: '40px 32px', textAlign: 'center' }}>
          <h1 style={{ color: '#f9fafb', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Conta encerrada</h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Decisão permanente da equipe NextDream</p>
        </div>
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />. Após análise detalhada, sua conta no NextDream foi encerrada permanentemente.</EmailText>
          <EmailCard color="#fef2f2" border="#fecaca">
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#991b1b', fontWeight: 600 }}>Motivo</p>
            <p style={{ margin: 0, fontSize: 14, color: '#7f1d1d' }}>{v.reason || 'Múltiplas violações graves das diretrizes'}</p>
          </EmailCard>
          <EmailText>Esta decisão é definitiva e não pode ser revertida. O NextDream existe para proteger pessoas em situação de vulnerabilidade, e qualquer comportamento que coloque isso em risco não é tolerado.</EmailText>
          <EmailText muted>Se acredita que houve um erro grave, você pode enviar um recurso formal para nosso e-mail de suporte com as devidas justificativas.</EmailText>
        </EmailBody>
      </EmailFrame>
    ),
  },

  {
    id: 'content-removed',
    category: 'Moderação & Segurança',
    name: 'Conteúdo Removido',
    subject: 'Conteúdo removido pela moderação NextDream',
    recipient: 'Autor do conteúdo',
    trigger: 'Admin remove sonho, proposta ou mensagem por violação',
    variables: [
      { key: 'name', desc: 'Nome do usuário', example: 'Roberto Alves' },
      { key: 'content_type', desc: 'Tipo de conteúdo removido', example: 'Sonho' },
      { key: 'content_title', desc: 'Título/descrição do conteúdo', example: 'Assistir ao jogo do meu time' },
      { key: 'reason', desc: 'Motivo da remoção', example: 'Dados médicos sensíveis expostos publicamente' },
    ],
    render: v => (
      <EmailFrame>
        <EmailHeader emoji="🗑️" title="Conteúdo removido" subtitle="Ação de moderação aplicada" />
        <EmailBody>
          <EmailText>Olá, <Var v={v} k="name" />. Um conteúdo da sua conta foi removido pela nossa equipe de moderação.</EmailText>
          <EmailCard>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Tipo de conteúdo</p>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#1f2937' }}>{v.content_type || 'Sonho'}</p>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Título</p>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#1f2937' }}>"{v.content_title || 'Assistir ao jogo do meu time'}"</p>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Motivo</p>
            <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>{v.reason || 'Dados médicos sensíveis expostos publicamente'}</p>
          </EmailCard>
          <EmailText>Agimos sempre com intenção de proteger você e a comunidade. Se desejar, pode publicar um novo conteúdo revisado seguindo nossas diretrizes.</EmailText>
          <EmailButton label="Ver diretrizes de conteúdo" />
        </EmailBody>
      </EmailFrame>
    ),
  },
];

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Conta & Boas-vindas',   icon: User,           color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  { name: 'Paciente — Sonhos',      icon: Star,           color: 'text-pink-600',   bg: 'bg-pink-50',   border: 'border-pink-200' },
  { name: 'Apoiador — Propostas',   icon: Send,           color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-200' },
  { name: 'Chat',                   icon: MessageCircle,  color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  { name: 'Moderação & Segurança',  icon: Shield,         color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
];

const catCfg = (name: string) => CATEGORIES.find(c => c.name === name) ?? CATEGORIES[0];

// ─── Variable Editor ──────────────────────────────────────────────────────────

function VariablesPanel({ template, vars, onChange }: {
  template: EmailTemplate;
  vars: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  if (template.variables.length === 0) return null;
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Variáveis do template</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {template.variables.map(tv => (
          <div key={tv.key}>
            <label className="block text-xs text-gray-500 mb-1">
              <code className="bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded text-[10px]">{`{{${tv.key}}}`}</code>
              <span className="ml-1.5 text-gray-400">{tv.desc}</span>
            </label>
            <input
              value={vars[tv.key] ?? ''}
              onChange={e => onChange(tv.key, e.target.value)}
              placeholder={tv.example}
              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminEmailTemplates() {
  const [selectedId, setSelectedId] = useState<string>(TEMPLATES[0].id);
  const [search, setSearch] = useState('');
  const [vars, setVars] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const setVar = (k: string, v: string) => setVars(prev => ({ ...prev, [k]: v }));

  const template = TEMPLATES.find(t => t.id === selectedId) ?? TEMPLATES[0];

  const filtered = useMemo(() => {
    if (!search.trim()) return TEMPLATES;
    const q = search.toLowerCase();
    return TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.trigger.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      templates: filtered.filter(t => t.category === cat.name),
    })).filter(g => g.templates.length > 0),
    [filtered]
  );

  const handleCopy = () => {
    const el = document.getElementById('email-preview-html');
    if (el) {
      navigator.clipboard.writeText(el.innerHTML).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const cc = catCfg(template.category);
  const CatIcon = cc.icon;

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Templates de E-mail</h1>
          <p className="text-gray-500 text-sm">{TEMPLATES.length} templates · {CATEGORIES.length} categorias</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-xl">
            <Mail className="w-3.5 h-3.5 text-pink-500" />
            Edite as variáveis para visualizar o e-mail personalizado
          </div>
        </div>
      </div>

      <div className="flex gap-5 items-start">

        {/* ── Sidebar ── */}
        <div className="w-72 shrink-0 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar templates..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </div>

          {/* Template list */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {grouped.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">Nenhum template encontrado.</p>
            )}
            {grouped.map((group, gi) => {
              const Ic = group.icon;
              return (
                <div key={group.name}>
                  {gi > 0 && <div className="border-t border-gray-100" />}
                  <div className={`flex items-center gap-2 px-4 py-2.5 ${group.bg}`}>
                    <Ic className={`w-3.5 h-3.5 ${group.color} shrink-0`} />
                    <span className={`text-xs uppercase tracking-wide ${group.color}`} style={{ fontWeight: 600 }}>{group.name}</span>
                    <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${group.bg} ${group.color} border ${group.border}`}>{group.templates.length}</span>
                  </div>
                  {group.templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedId(t.id); setVars({}); }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-2.5 transition-colors border-l-2 hover:bg-gray-50
                        ${selectedId === t.id ? `border-l-pink-500 bg-pink-50` : 'border-l-transparent'}`}
                    >
                      <Mail className={`w-3.5 h-3.5 shrink-0 ${selectedId === t.id ? 'text-pink-500' : 'text-gray-300'}`} />
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${selectedId === t.id ? 'text-pink-700' : 'text-gray-700'}`} style={{ fontWeight: selectedId === t.id ? 600 : 400 }}>{t.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{t.recipient}</p>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Preview Panel ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Template meta */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${cc.bg} ${cc.border} border flex items-center justify-center shrink-0`}>
                  <CatIcon className={`w-5 h-5 ${cc.color}`} />
                </div>
                <div>
                  <h2 className="text-gray-800 text-base" style={{ fontWeight: 700 }}>{template.name}</h2>
                  <p className={`text-xs mt-0.5 ${cc.color}`}>{template.category}</p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border transition-all
                  ${copied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar HTML</>}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>Assunto</p>
                <p className="text-xs text-gray-700 leading-relaxed">{template.subject}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>Destinatário</p>
                <p className="text-xs text-gray-700">{template.recipient}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>Disparado quando</p>
                <p className="text-xs text-gray-700 leading-relaxed">{template.trigger}</p>
              </div>
            </div>
          </div>

          {/* Variables */}
          <VariablesPanel template={template} vars={vars} onChange={setVar} />

          {/* Email Preview */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-3">
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-500 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-pink-400" />
                  Pré-visualização do e-mail
                </div>
              </div>
              <div className="flex items-center gap-2">
                {template.variables.length > 0 && (
                  <span className="text-[10px] text-pink-600 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {Object.keys(vars).length}/{template.variables.length} vars preenchidas
                  </span>
                )}
              </div>
            </div>
            <div id="email-preview-html" className="overflow-auto" style={{ maxHeight: 700 }}>
              {template.render(vars)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
