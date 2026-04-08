import { Outlet, Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logoImg from '../../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <img src={logoImg} alt="NextDream" className="h-9 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/como-funciona" className="text-gray-600 hover:text-pink-600 text-sm transition-colors">Como funciona</Link>
            <Link to="/parcerias"     className="text-gray-600 hover:text-pink-600 text-sm transition-colors">Parcerias</Link>
            <Link to="/seguranca"     className="text-gray-600 hover:text-pink-600 text-sm transition-colors">Segurança</Link>
            <Link to="/faq"           className="text-gray-600 hover:text-pink-600 text-sm transition-colors">FAQ</Link>
            <Link to="/contato"       className="text-gray-600 hover:text-pink-600 text-sm transition-colors">Fale conosco</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className="text-pink-700 hover:text-pink-800 text-sm font-medium px-4 py-2 rounded-xl hover:bg-pink-50 transition-colors">
              Entrar
            </Link>
            <Link to="/cadastro"
              className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              Criar conta
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-pink-100 px-4 py-4 space-y-3">
            <Link to="/como-funciona" className="block text-gray-600 text-sm py-2" onClick={() => setMobileOpen(false)}>Como funciona</Link>
            <Link to="/parcerias"     className="block text-gray-600 text-sm py-2" onClick={() => setMobileOpen(false)}>Parcerias</Link>
            <Link to="/seguranca"     className="block text-gray-600 text-sm py-2" onClick={() => setMobileOpen(false)}>Segurança</Link>
            <Link to="/faq"           className="block text-gray-600 text-sm py-2" onClick={() => setMobileOpen(false)}>FAQ</Link>
            <Link to="/contato"       className="block text-gray-600 text-sm py-2" onClick={() => setMobileOpen(false)}>Fale conosco</Link>
            <div className="flex gap-3 pt-2">
              <Link to="/login"    className="flex-1 text-center border border-pink-300 text-pink-700 py-2 rounded-xl text-sm" onClick={() => setMobileOpen(false)}>Entrar</Link>
              <Link to="/cadastro" className="flex-1 text-center bg-pink-600 text-white py-2 rounded-xl text-sm"               onClick={() => setMobileOpen(false)}>Criar conta</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={logoImg} alt="NextDream" className="h-8 w-auto brightness-0 invert opacity-90" />
              </div>
              <p className="text-sm leading-relaxed">Conectando sonhos com pessoas dispostas a ajudar. Tempo, presença e carinho.</p>
            </div>
            <div>
              <h4 className="text-white text-sm mb-3">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/como-funciona" className="hover:text-white transition-colors">Como funciona</Link></li>
                <li><Link to="/seguranca"     className="hover:text-white transition-colors">Segurança</Link></li>
                <li><Link to="/faq"           className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/termos"      className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
                <li><Link to="/diretrizes"  className="hover:text-white transition-colors">Diretrizes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm mb-3">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contato" className="hover:text-white transition-colors">Fale conosco</Link></li>
                <li><Link to="/parcerias" className="hover:text-white transition-colors">Parcerias</Link></li>
                <li><a href="mailto:contato@nextdream.com.br" className="hover:text-white transition-colors">contato@nextdream.com.br</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs">© 2026 NextDream. Feito com ❤️ para quem precisa de presença.</p>
            <div className="bg-pink-900/40 border border-pink-800 text-pink-300 px-4 py-2 rounded-xl text-xs">
              🚫 Sem dinheiro, PIX ou doações. Só conexões humanas.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
