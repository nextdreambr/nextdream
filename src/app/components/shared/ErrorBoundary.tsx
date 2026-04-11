import React from 'react';
import { Heart, RefreshCw, Home } from 'lucide-react';
import { captureFrontendException } from '@/app/lib/sentry';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('NextDream ErrorBoundary caught:', error, info);
    captureFrontendException(error, {
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-pink-400" />
            </div>
            <h1 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
              Algo inesperado aconteceu
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-2">
              Ocorreu um erro ao carregar esta página. Nosso time foi notificado.
            </p>
            {this.state.error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-6 font-mono text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="flex items-center justify-center gap-2 border border-pink-200 text-pink-600 hover:bg-pink-50 px-6 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Ir para o início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
