import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './lib/auth.tsx';
import { LiveProvider } from './lib/live.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      }).catch((error) => {
        console.warn('Failed to unregister service workers in development mode.', error);
      });
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        console.warn('Service worker registration failed.');
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LiveProvider>
          <App />
        </LiveProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
