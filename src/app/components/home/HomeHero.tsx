import { Link } from 'react-router';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useI18n } from '../../i18n/I18nProvider';
import careCollageImage from '../../../assets/public/casa-de-cuidado-collage.webp';

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HomeHero() {
  const { localizedPath } = useI18n();

  return (
    <section className="bg-[#fff8ef] px-4 pb-12 pt-14 text-[#241b24] sm:px-6 lg:pb-16 lg:pt-20">
      <motion.div
        initial="hidden"
        animate="visible"
        className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center"
      >
        <motion.div variants={fadeIn} className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-full border border-[#ecd8c8] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#a8544a]">
            Uma ponte humana
          </p>

          <h1 className="max-w-4xl text-5xl font-extrabold leading-[0.94] tracking-normal sm:text-6xl lg:text-7xl">
            Sonhos possíveis começam com presença.
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-semibold leading-relaxed text-[#514550]">
            Conectamos pessoas vivendo momentos delicados de saúde a apoiadores dispostos a oferecer tempo,
            companhia, habilidades e experiências com cuidado e consentimento.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                to={localizedPath('/cadastro?tipo=paciente')}
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-[#a8544a] px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(168,84,74,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#8b3d44] focus:outline-none focus:ring-4 focus:ring-[#f3c8ba]"
              >
                Compartilhar um sonho
              </Link>
              <Link
                to={localizedPath('/apoiador/explorar')}
                className="group inline-flex min-h-[2.75rem] items-center gap-2 rounded-full px-1 py-2 text-sm font-extrabold text-[#245b53] transition-colors hover:text-[#8b3d44] focus:outline-none focus:ring-4 focus:ring-[#d5efe7]"
              >
                Ver sonhos para apoiar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <p className="flex max-w-xl items-start gap-2.5 border-t border-[#ecd8c8]/70 pt-4 text-sm font-bold leading-relaxed text-[#6b5b60]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#a8544a]/80" />
              Apoio por presença, tempo ou habilidade. Sempre com cuidado e consentimento.
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-[#ecd8c8] bg-white p-3 shadow-[0_28px_70px_rgba(92,62,51,0.1)]">
            <ImageWithFallback
              src={careCollageImage}
              alt="Cenas acolhedoras de cuidado, conversa e presença"
              loading="eager"
              className="aspect-[1.18] w-full rounded-[1.45rem] object-cover"
              style={{ objectPosition: 'center center' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
