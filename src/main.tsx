import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { initGoogleAnalytics } from './app/lib/googleAnalytics.ts';
import { initFrontendSentry } from './app/lib/sentry.ts';
import './styles/index.css';

initFrontendSentry();
if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
  initGoogleAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID);
}

createRoot(document.getElementById('root')!).render(<App />);
