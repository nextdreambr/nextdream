import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';
import logoImg from '../../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';
import careTextureImage from '../../../assets/public/rede-de-cuidado-textura.webp';

export function AuthCareFrame({
  eyebrow = 'Acesso seguro',
  title,
  description,
  icon: Icon = ShieldCheck,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-[#fffaf4] px-4 py-12 text-[#241b24]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(255,250,244,0.98), rgba(255,250,244,0.9)), url(${careTextureImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <aside className="rounded-[2rem] border border-[#ead8c4] bg-[#fff4d8]/90 p-6 shadow-[0_24px_70px_rgba(92,62,51,0.08)] backdrop-blur md:p-8">
          <img src={logoImg} alt="NextDream" className="mb-8 h-12 w-auto" />
          <p className="mb-4 inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b3d44]">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.02] text-[#241b24] md:text-5xl">{title}</h1>
          <p className="mt-5 text-base font-semibold leading-relaxed text-[#5c4b52]">{description}</p>
          <div className="mt-8 rounded-2xl border border-[#c9e5dc] bg-[#e5f4ee] p-4 text-[#245b53]">
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold">
              <Icon className="h-4 w-4" />
              Privacidade em primeiro lugar
            </div>
            <p className="text-sm font-semibold leading-relaxed text-[#50645d]">
              O NextDream protege dados sensíveis e nunca solicita PIX, vaquinha ou pagamento para conectar histórias.
            </p>
          </div>
        </aside>

        <div className="rounded-[2rem] border border-[#ead8c4] bg-white p-6 shadow-[0_24px_70px_rgba(92,62,51,0.08)] sm:p-8">
          {children}
          {footer ? <div className="mt-6 text-center">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
