export type HomeHeroVariant = {
  id: string;
  image: string;
  headline: string;
  subheadline: string;
  photoCaption: string;
  badge: string;
  alt: string;
  imageFocus?: string;
};

const defaultSubheadline =
  'O NextDream aproxima pessoas vivendo momentos delicados de saúde de apoiadores dispostos a oferecer tempo, presença, habilidades e carinho.';

const defaultBadge = 'Tempo, presença e carinho.';

const volunteerAlbumPhoto =
  'https://images.pexels.com/photos/6647035/pexels-photo-6647035.jpeg?auto=compress&cs=tinysrgb&w=1600';
const listeningConversationPhoto =
  'https://images.pexels.com/photos/8057002/pexels-photo-8057002.jpeg?auto=compress&cs=tinysrgb&w=1600';
const holdingHandsPhoto =
  'https://images.pexels.com/photos/8790972/pexels-photo-8790972.jpeg?auto=compress&cs=tinysrgb&w=1600';
const careConversationPhoto =
  'https://images.unsplash.com/photo-1773227059881-ef8ecf22aac8?auto=format&fit=crop&fm=jpg&q=80&w=1600';

export const HOME_HERO_VARIANTS: HomeHeroVariant[] = [
  {
    id: 'receita-afetiva',
    image: volunteerAlbumPhoto,
    headline: 'Conectando sonhos com corações dispostos a ajudar.',
    subheadline: defaultSubheadline,
    photoCaption: 'Revisitar memórias juntos também pode realizar um sonho.',
    badge: defaultBadge,
    alt: 'Voluntários sentados com uma pessoa idosa olhando um álbum de fotos',
    imageFocus: 'center 45%',
  },
  {
    id: 'musica-tranquila',
    image: listeningConversationPhoto,
    headline: 'Pequenos gestos podem virar esperança.',
    subheadline: defaultSubheadline,
    photoCaption: 'Escuta com atenção pode transformar um dia difícil.',
    badge: defaultBadge,
    alt: 'Pessoa ouvindo outra com atenção durante uma conversa',
    imageFocus: 'center 35%',
  },
  {
    id: 'conversa-sem-pressa',
    image: careConversationPhoto,
    headline: 'Uma conversa também pode realizar um sonho.',
    subheadline: defaultSubheadline,
    photoCaption: 'Tempo e presença abrem espaço para encontros possíveis.',
    badge: defaultBadge,
    alt: 'Duas pessoas idosas conversando em um ambiente de cuidado',
    imageFocus: 'center 45%',
  },
  {
    id: 'familia-memorias',
    image: volunteerAlbumPhoto,
    headline: 'Momentos especiais também são sonhos.',
    subheadline: defaultSubheadline,
    photoCaption: 'Uma tarde de memória e companhia pode ficar para sempre.',
    badge: defaultBadge,
    alt: 'Voluntários compartilhando fotos com uma pessoa idosa',
    imageFocus: 'center 45%',
  },
  {
    id: 'carta-com-cuidado',
    image: holdingHandsPhoto,
    headline: 'Dar voz a um sonho já abre caminho.',
    subheadline: defaultSubheadline,
    photoCaption: 'Um gesto simples pode comunicar presença e cuidado.',
    badge: defaultBadge,
    alt: 'Mãos unidas em gesto de apoio e presença',
    imageFocus: 'center center',
  },
  {
    id: 'passeio-leve',
    image: listeningConversationPhoto,
    headline: 'Um encontro possível pode trazer leveza.',
    subheadline: defaultSubheadline,
    photoCaption: 'Presença com respeito aos limites faz diferença.',
    badge: defaultBadge,
    alt: 'Duas pessoas conversando com atenção e proximidade',
    imageFocus: 'center 35%',
  },
  {
    id: 'mesa-compartilhada',
    image: careConversationPhoto,
    headline: 'Gentileza também se organiza em comunidade.',
    subheadline: defaultSubheadline,
    photoCaption: 'Uma conversa pode aproximar histórias que estavam distantes.',
    badge: defaultBadge,
    alt: 'Pessoas conversando em um ambiente de apoio comunitário',
    imageFocus: 'center 45%',
  },
  {
    id: 'gesto-de-apoio',
    image: holdingHandsPhoto,
    headline: 'Sonhos precisam de pessoas, não de distância.',
    subheadline: defaultSubheadline,
    photoCaption: 'Apoio real começa quando alguém se aproxima com respeito.',
    badge: defaultBadge,
    alt: 'Mãos segurando outras mãos em sinal de cuidado',
    imageFocus: 'center center',
  },
  {
    id: 'experiencia-compartilhada',
    image: volunteerAlbumPhoto,
    headline: 'Habilidades compartilhadas criam momentos especiais.',
    subheadline: defaultSubheadline,
    photoCaption: 'Apoiadores podem transformar disponibilidade em encontro.',
    badge: defaultBadge,
    alt: 'Voluntários acompanhando uma pessoa idosa em casa',
    imageFocus: 'center 45%',
  },
  {
    id: 'tempo-e-escuta',
    image: listeningConversationPhoto,
    headline: 'Conexões genuínas trazem dignidade e alegria.',
    subheadline: defaultSubheadline,
    photoCaption: 'Companhia sem pressa também é realização.',
    badge: defaultBadge,
    alt: 'Pessoa em conversa atenta com outra pessoa',
    imageFocus: 'center 35%',
  },
];
