import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import App from './App';
import './index.css';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="{{projectName}}-theme">
      <BrowserRouter future={routerFuture}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
