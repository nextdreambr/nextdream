import { Outlet, Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { isSandboxEnvironment } from '../../config/environment';
import logoImg from '../../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sandbox = isSandboxEnvironment();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const navLinkClassName = isHome
    ? 'text-sm font-bold text-[#5c4b52] transition-colors hover:text-[#a8544a]'
    : 'text-sm font-bold text-[#5c4b52] transition-colors hover:text-[#a8544a]';

  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf4] text-[#241b24]">
      <nav
        className={
          isHome
            ? 'absolute inset-x-0 top-0 z-40 border-b border-[#ead8c4]/70 bg-[#fff8ef]/82 text-[#241b24] backdrop-blur-md'
            : 'sticky top-0 z-40 border-b border-[#eadfd2] bg-[#fffaf4]/94 backdrop-blur-md'
        }
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <img src={logoImg} alt="NextDream" className="h-9 w-auto" />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link to="/como-funciona" className={navLinkClassName}>Como funciona</Link>
            <Link to="/parcerias" className={navLinkClassName}>Parcerias</Link>
            <Link to="/seguranca" className={navLinkClassName}>Segurança</Link>
            <Link to="/faq" className={navLinkClassName}>FAQ</Link>
            <Link to="/contato" className={navLinkClassName}>Fale conosco</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to={sandbox ? '/sandbox' : '/login'}
              className={
                isHome
                  ? 'rounded-full px-4 py-2 text-sm font-extrabold text-[#245b53] transition-colors hover:bg-white/70'
                  : 'rounded-full px-4 py-2 text-sm font-extrabold text-[#245b53] transition-colors hover:bg-[#e5f4ee]'
              }
            >
              {sandbox ? 'Conhecer a plataforma' : 'Entrar'}
            </Link>
            {!sandbox && (
              <Link
                to="/cadastro"
                className={
                  isHome
                    ? 'rounded-full bg-[#a8544a] px-4 py-2 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#8b3d44]'
                    : 'rounded-full bg-[#a8544a] px-4 py-2 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#8b3d44]'
                }
              >
                Criar conta
              </Link>
            )}
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            className={
              isHome
                ? 'rounded-full p-2 text-[#241b24] transition-colors hover:bg-white/70 md:hidden'
                : 'rounded-full p-2 text-[#241b24] transition-colors hover:bg-[#fff4d8] md:hidden'
            }
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div
            className={
              isHome
                ? 'space-y-3 border-t border-[#ead8c4] bg-[#fff8ef]/96 px-4 py-4 md:hidden'
                : 'space-y-3 border-t border-[#eadfd2] bg-[#fffaf4] px-4 py-4 md:hidden'
            }
          >
            <Link to="/como-funciona" className="block py-2 text-sm font-bold text-[#5c4b52]" onClick={() => setMobileOpen(false)}>Como funciona</Link>
            <Link to="/parcerias" className="block py-2 text-sm font-bold text-[#5c4b52]" onClick={() => setMobileOpen(false)}>Parcerias</Link>
            <Link to="/seguranca" className="block py-2 text-sm font-bold text-[#5c4b52]" onClick={() => setMobileOpen(false)}>Segurança</Link>
            <Link to="/faq" className="block py-2 text-sm font-bold text-[#5c4b52]" onClick={() => setMobileOpen(false)}>FAQ</Link>
            <Link to="/contato" className="block py-2 text-sm font-bold text-[#5c4b52]" onClick={() => setMobileOpen(false)}>Fale conosco</Link>
            <div className="flex gap-3 pt-2">
              <Link
                to={sandbox ? '/sandbox' : '/login'}
                className="flex-1 rounded-full border border-[#c9e5dc] py-2 text-center text-sm font-bold text-[#245b53]"
                onClick={() => setMobileOpen(false)}
              >
                {sandbox ? 'Conhecer a plataforma' : 'Entrar'}
              </Link>
              {!sandbox && (
                <Link
                  to="/cadastro"
                  className="flex-1 rounded-full bg-[#a8544a] py-2 text-center text-sm font-bold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Criar conta
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#241b24] px-4 py-10 text-[#f7efe6] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-[1.7rem] border border-white/10 bg-white/7 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f7d9c6]">
              NextDream
            </p>
            <p className="mt-3 max-w-3xl text-2xl font-extrabold leading-tight text-white md:text-3xl">
              Presença, tempo e cuidado também realizam sonhos.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[1.35fr_0.85fr_0.85fr]">
            <div>
              <img src={logoImg} alt="NextDream" className="mb-4 h-8 w-auto" />
              <p className="max-w-md text-sm font-semibold leading-relaxed text-[#e8d9cf]">
                NextDream conecta pessoas em momentos delicados de saúde a apoiadores dispostos a
                oferecer presença, tempo, companhia e habilidades com cuidado.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-extrabold text-white">Caminhos</h4>
              <ul className="space-y-2 text-sm text-[#e8d9cf]">
                <li><Link to="/como-funciona" className="transition-colors hover:text-[#f7d9c6]">Como funciona</Link></li>
                <li><Link to="/seguranca" className="transition-colors hover:text-[#f7d9c6]">Segurança</Link></li>
                <li><Link to="/faq" className="transition-colors hover:text-[#f7d9c6]">FAQ</Link></li>
                <li><Link to="/contato" className="transition-colors hover:text-[#f7d9c6]">Fale conosco</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-extrabold text-white">Contato</h4>
              <ul className="space-y-2 text-sm text-[#e8d9cf]">
                <li><Link to="/termos" className="transition-colors hover:text-[#f7d9c6]">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="transition-colors hover:text-[#f7d9c6]">Privacidade</Link></li>
                <li><Link to="/diretrizes" className="transition-colors hover:text-[#f7d9c6]">Diretrizes</Link></li>
                <li><a href="mailto:contato@nextdream.ong.br" className="transition-colors hover:text-[#f7d9c6]">contato@nextdream.ong.br</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 border-t border-white/10 pt-5 text-xs text-[#d8c9bf] sm:flex-row">
            <p>© 2026 NextDream. Construído para conexões humanas com cuidado.</p>
            <p>Presença, privacidade e consentimento primeiro.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
