export const dreamImgs = {
  beach:   "https://images.unsplash.com/photo-1708461859488-2a0c081ff826?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwd29tYW4lMjBob3NwaXRhbCUyMHdhcm18ZW58MXx8fHwxNzcyODAzMzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  art:     "https://images.unsplash.com/photo-1578496781985-452d4a934d50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMHBhdGllbnQlMjBzbWlsaW5nJTIwaG9zcGl0YWx8ZW58MXx8fHwxNzcyODAzMzY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  forest:  "https://images.unsplash.com/photo-1578496781379-7dcfb995293d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMGNhbmNlciUyMHBhdGllbnQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjgwMzM0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  dance:   "https://images.unsplash.com/photo-1663696112800-58698b47c13e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwd29tYW4lMjBob2xkaW5nJTIwaGFuZCUyMHdhcm10aHxlbnwxfHx8fDE3NzI4MDMzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  reading: "https://images.unsplash.com/photo-1744912739625-1c188aa85c7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwbWFuJTIwc21pbGluZyUyMGhvc3BpdGFsfGVufDF8fHx8MTc3MjgwMzM3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  coffee:  "https://images.unsplash.com/photo-1676286111583-9fec2694b26c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXIlMjByZWFkaW5nJTIwdG8lMjBjaGlsZCUyMGhvc3BpdGFsfGVufDF8fHx8MTc3MjgwMzM0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
};

export interface PublicDream {
  id: string;
  img: string;
  title: string;
  desc: string;
  fullDesc: string;
  name: string;
  initials: string;
  age: number | null;
  city: string;
  tag: string;
  tagColor: string;
  time: string;
  status: string;
  accent: string;
  hasProposal?: boolean;
  format: string;
  what: string; // o que o apoiador vai fazer
}

export const publicDreams: PublicDream[] = [
  {
    id: '1',
    img: dreamImgs.beach,
    title: 'Ver o nascer do sol na praia uma última vez',
    desc: 'Há 3 anos não sinto a areia nos pés. Meu maior sonho é ver o sol nascer no mar antes do próximo ciclo de quimio.',
    fullDesc: 'Meu nome é Ana e tenho 67 anos. Há três anos estou em tratamento e raramente consigo sair de casa. Cresci à beira-mar em Santos e nada me trazia mais paz do que ver o sol surgindo no horizonte. Peço apenas companhia — alguém que me ajude com o deslocamento e fique ao meu lado enquanto contemplamos juntos esse momento. Não precisa de nada especial, apenas presença e gentileza.',
    name: 'Ana S.',
    initials: 'AS',
    age: 67,
    city: 'Santos, SP',
    tag: 'Experiência',
    tagColor: 'bg-amber-100 text-amber-700',
    time: '2 horas',
    status: 'Aguardando apoiador',
    accent: 'from-orange-600/70',
    format: 'Presencial',
    what: 'Acompanhar até a praia, assistir ao nascer do sol juntos',
  },
  {
    id: '2',
    img: dreamImgs.art,
    title: 'Pintar um quadro com um artista de verdade',
    desc: 'Miguel ama desenhar mas nunca teve uma aula de verdade. Ele quer criar algo lindo para guardar.',
    fullDesc: 'Miguel tem 8 anos e desde que entrou no hospital sempre pediu lápis e papel. Ele desenha sem parar — navios, florestas, personagens inventados. O sonho dele é ter uma aula com um artista de verdade, alguém que ensine técnicas de verdade e ajude a criar um quadro que ele possa guardar para sempre. Pode ser aquarela, acrílico, lápis de cor — o que o apoiador se sentir confortável em ensinar.',
    name: 'Família Lima',
    initials: 'FL',
    age: 8,
    city: 'São Paulo, SP',
    tag: 'Habilidade',
    tagColor: 'bg-purple-100 text-purple-700',
    time: '3 horas',
    status: 'Aguardando apoiador',
    accent: 'from-purple-700/70',
    format: 'Presencial ou remoto',
    what: 'Dar uma aula de pintura e criar um quadro junto',
  },
  {
    id: '3',
    img: dreamImgs.forest,
    title: 'Caminhar numa floresta e respirar ar puro',
    desc: 'Meses de hospital. Só quero sentir o vento, ouvir pássaros e andar entre árvores por uma manhã.',
    fullDesc: 'Cláudia tem 45 anos e está há meses alternando entre casa e hospital. Ela cresceu no interior e a natureza sempre foi seu lugar de paz. Seu sonho é caminhar numa trilha tranquila, sentir o chão irregular sob os pés, ouvir pássaros e respirar ar que não seja de hospital. Precisa de alguém que possa acompanhá-la e, se necessário, oferecer apoio físico discreto durante a caminhada.',
    name: 'Cláudia M.',
    initials: 'CM',
    age: 45,
    city: 'Campinas, SP',
    tag: 'Natureza',
    tagColor: 'bg-green-100 text-green-700',
    time: '4 horas',
    status: 'Aguardando apoiador',
    accent: 'from-green-800/70',
    format: 'Presencial',
    what: 'Acompanhar numa trilha ou parque natural próximo a Campinas',
  },
  {
    id: '4',
    img: dreamImgs.dance,
    title: 'Dançar uma valsa com alguém especial',
    desc: 'Roberto sempre adorou dançar. Perdeu a esposa há dois anos e quer sentir a alegria da dança novamente.',
    fullDesc: 'Roberto tem 72 anos e passou décadas dançando com a esposa, Maria, que partiu há dois anos. Ele diz que a dança sempre foi a linguagem deles. Seu sonho é dançar uma valsa novamente — não importa onde, pode ser na sala de casa com uma música no celular. Ele quer sentir aquela leveza de novo, aquela sensação de que a vida ainda tem alegria. Procura um apoiador que saiba ao menos os passos básicos de valsa ou que simplesmente tope dançar com leveza e carinho.',
    name: 'Roberto F.',
    initials: 'RF',
    age: 72,
    city: 'Rio de Janeiro, RJ',
    tag: 'Companhia',
    tagColor: 'bg-pink-100 text-pink-700',
    time: '2 horas',
    status: '1 proposta recebida',
    accent: 'from-rose-700/70',
    hasProposal: true,
    format: 'Presencial',
    what: 'Dançar uma valsa — pode ser em casa, num salão ou jardim',
  },
  {
    id: '5',
    img: dreamImgs.reading,
    title: 'Uma tarde só para ler meu livro em paz',
    desc: 'Parece simples, mas preciso de alguém que cuide da minha mãe por algumas horas enquanto me reconecto comigo.',
    fullDesc: 'Beatriz tem 34 anos e cuida da mãe, que tem Alzheimer avançado, praticamente sozinha. Há meses ela não tem tempo para si mesma — nem para ler, que era sua grande paixão. Seu sonho é ter uma tarde inteira para ler, tomar um chá, e simplesmente respirar. Para isso, precisa de alguém de confiança que possa ficar com sua mãe em casa por 3 horas enquanto ela vai a um café ou parque próximo. Não é necessário nenhum conhecimento especializado — apenas paciência, gentileza e atenção.',
    name: 'Beatriz N.',
    initials: 'BN',
    age: 34,
    city: 'Belo Horizonte, MG',
    tag: 'Descanso',
    tagColor: 'bg-blue-100 text-blue-700',
    time: '3 horas',
    status: 'Aguardando apoiador',
    accent: 'from-blue-700/70',
    format: 'Presencial',
    what: 'Ficar com a mãe dela em casa enquanto Beatriz descansa',
  },
  {
    id: '6',
    img: dreamImgs.coffee,
    title: 'Tomar café da manhã em família no jardim',
    desc: 'A quimioterapia nos afastou de muita coisa. Queremos uma manhã simples e alegre juntos, fora do hospital.',
    fullDesc: 'A família Souza passou os últimos meses alternando entre internações e tratamentos. Os filhos pequenos sentem falta dos momentos simples do dia a dia. O sonho da família é ter uma manhã descontraída num jardim ou praça com verde — tomar café, comer pão com manteiga, rir juntos. Procuram alguém que possa ajudar a organizar esse momento especial, talvez trazer algo para a mesa ou simplesmente fazer companhia e criar um ambiente leve e festivo.',
    name: 'Família Souza',
    initials: 'FS',
    age: null,
    city: 'Curitiba, PR',
    tag: 'Família',
    tagColor: 'bg-teal-100 text-teal-700',
    time: '3 horas',
    status: 'Aguardando apoiador',
    accent: 'from-teal-700/70',
    format: 'Presencial',
    what: 'Organizar e participar de um café da manhã em família ao ar livre',
  },
];
