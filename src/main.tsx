import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from './App';
import './index.css';
import { SupabaseProvider } from './lib/supabase/SupabaseProvider';
import { registerServiceWorker } from './registerServiceWorker';
import ScrollToTop from './components/layout/ScrollToTop';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider>
      <BrowserRouter>
        <ScrollToTop />
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </SupabaseProvider>
  </StrictMode>
);

// Registrar o service worker para funcionalidades offline e PWA
registerServiceWorker();