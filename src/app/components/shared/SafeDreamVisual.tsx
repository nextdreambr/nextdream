import careTextureImage from '../../../assets/public/rede-de-cuidado-textura.webp';
import { cn } from '../ui/utils';

export type SafeDreamScene =
  | 'sea'
  | 'art'
  | 'conversation'
  | 'kitchen'
  | 'reading'
  | 'memory'
  | 'learning'
  | 'skill';

type DreamVisual = {
  alt: string;
  supportType: string;
  scene: SafeDreamScene;
};

const dreamVisuals: Record<string, DreamVisual> = {
  'Experiência ao ar livre': {
    alt: 'Paisagem de natureza aberta representando um sonho ao ar livre',
    supportType: 'Experiência, presença',
    scene: 'sea',
  },
  'Arte e Música': {
    alt: 'Materiais de arte em uma mesa representando uma atividade criativa',
    supportType: 'Arte, música',
    scene: 'art',
  },
  'Conversa e Companhia': {
    alt: 'Mesa acolhedora de conversa representando companhia e escuta',
    supportType: 'Companhia, conversa',
    scene: 'conversation',
  },
  Culinária: {
    alt: 'Cozinha caseira representando uma receita compartilhada com cuidado',
    supportType: 'Culinária, companhia',
    scene: 'kitchen',
  },
  'Literatura e Cultura': {
    alt: 'Livros e leitura representando uma roda de histórias',
    supportType: 'Leitura, conversa',
    scene: 'reading',
  },
  'Aprendizado e Educação': {
    alt: 'Mesa com materiais criativos representando uma oficina leve',
    supportType: 'Atividade, aprendizado',
    scene: 'learning',
  },
  'Família e Memórias': {
    alt: 'Caderno e fotografias representando memórias familiares preservadas com cuidado',
    supportType: 'Memória, companhia',
    scene: 'memory',
  },
  'Esporte e Lazer': {
    alt: 'Cena ao ar livre representando uma atividade leve e possível',
    supportType: 'Atividade, presença',
    scene: 'sea',
  },
  'Saúde e Bem-estar': {
    alt: 'Ambiente tranquilo representando cuidado e presença sem exposição de saúde',
    supportType: 'Presença, cuidado',
    scene: 'conversation',
  },
  Tecnologia: {
    alt: 'Mesa clara representando apoio simples para aprender uma habilidade',
    supportType: 'Habilidade, orientação',
    scene: 'skill',
  },
  Outro: {
    alt: 'Cena tranquila representando um sonho possível com cuidado',
    supportType: 'Presença, cuidado',
    scene: 'memory',
  },
};

const sceneBackgrounds: Record<SafeDreamScene, string> = {
  sea: 'linear-gradient(160deg, #b9e5ef 0%, #f7d9c6 52%, #245b53 100%)',
  art: 'linear-gradient(145deg, #f7d9c6 0%, #fff4d8 40%, #8d7aa9 100%)',
  conversation: 'linear-gradient(145deg, #f4d3bd 0%, #fff6e9 45%, #6fa195 100%)',
  kitchen: 'linear-gradient(145deg, #ffe3b8 0%, #fff4d8 48%, #a8544a 100%)',
  reading: 'linear-gradient(145deg, #e5f4ee 0%, #fff8ef 46%, #8b6f47 100%)',
  memory: 'linear-gradient(145deg, #f3e8dc 0%, #fffaf4 44%, #7b8e7d 100%)',
  learning: 'linear-gradient(145deg, #e8f4ee 0%, #fff4d8 48%, #c96d5b 100%)',
  skill: 'linear-gradient(145deg, #e3f0f2 0%, #fff8ef 48%, #245b53 100%)',
};

export function getSafeDreamVisual(category: string) {
  return dreamVisuals[category] ?? dreamVisuals.Outro;
}

export function SafeDreamArtwork({
  scene,
  alt,
  className,
}: {
  scene: SafeDreamScene;
  alt: string;
  className?: string;
}) {
  const isSea = scene === 'sea';
  const isArt = scene === 'art' || scene === 'learning';
  const isConversation = scene === 'conversation';
  const isReading = scene === 'reading' || scene === 'memory';

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn('relative h-full min-h-[12rem] w-full overflow-hidden', className)}
      style={{ background: sceneBackgrounds[scene] }}
    >
      <div
        className="absolute inset-0 opacity-45 mix-blend-soft-light"
        style={{
          backgroundImage: `url(${careTextureImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      <span className="absolute -left-8 top-10 h-28 w-44 rotate-[-12deg] rounded-[45%] bg-white/45 blur-sm" />
      <span className="absolute right-6 top-8 h-20 w-20 rounded-full bg-white/38 shadow-[0_22px_50px_rgba(255,255,255,0.22)]" />
      <span className="absolute bottom-[-3rem] right-[-2rem] h-36 w-36 rounded-full bg-[#241b24]/18" />

      {isSea && (
        <>
          <span className="absolute bottom-16 left-0 right-0 h-px bg-white/70" />
          <span className="absolute bottom-12 left-10 h-5 w-44 rounded-full border-t border-white/70" />
          <span className="absolute bottom-24 right-12 h-16 w-16 rounded-full bg-[#fff4d8]/80" />
        </>
      )}

      {isArt && (
        <>
          <span className="absolute bottom-14 left-9 h-24 w-24 rotate-[-8deg] rounded-3xl bg-[#fffaf4]/78 shadow-sm" />
          <span className="absolute bottom-20 left-20 h-20 w-5 rotate-[22deg] rounded-full bg-[#a8544a]/78" />
          <span className="absolute bottom-16 left-32 h-16 w-5 rotate-[22deg] rounded-full bg-[#245b53]/76" />
          <span className="absolute bottom-12 right-16 h-28 w-28 rounded-[38%] bg-[#8d7aa9]/42" />
        </>
      )}

      {isConversation && (
        <>
          <span className="absolute bottom-10 left-12 right-12 h-16 rounded-[50%] bg-[#8b3d44]/22" />
          <span className="absolute bottom-24 left-20 h-12 w-12 rounded-full border-[10px] border-white/72" />
          <span className="absolute bottom-24 right-24 h-12 w-12 rounded-full border-[10px] border-[#245b53]/34" />
        </>
      )}

      {isReading && (
        <>
          <span className="absolute bottom-10 left-10 h-28 w-24 rotate-[-7deg] rounded-2xl bg-white/72 shadow-sm" />
          <span className="absolute bottom-10 left-28 h-28 w-24 rotate-[8deg] rounded-2xl bg-[#fff4d8]/82 shadow-sm" />
          <span className="absolute bottom-20 left-16 h-px w-32 bg-[#8b6f47]/35" />
          <span className="absolute bottom-28 left-16 h-px w-36 bg-[#8b6f47]/30" />
        </>
      )}

      {scene === 'kitchen' && (
        <>
          <span className="absolute bottom-10 left-12 h-24 w-24 rounded-full bg-white/70 shadow-sm" />
          <span className="absolute bottom-20 left-24 h-3 w-28 rotate-[-12deg] rounded-full bg-[#8b3d44]/45" />
          <span className="absolute bottom-16 right-16 h-20 w-28 rounded-[2rem] bg-[#fffaf4]/70" />
        </>
      )}

      {scene === 'skill' && (
        <>
          <span className="absolute bottom-12 left-12 h-24 w-36 rounded-[1.4rem] border border-white/60 bg-white/54" />
          <span className="absolute bottom-24 left-20 h-3 w-20 rounded-full bg-[#245b53]/42" />
          <span className="absolute bottom-[4.5rem] left-20 h-3 w-28 rounded-full bg-[#a8544a]/36" />
        </>
      )}
    </div>
  );
}
