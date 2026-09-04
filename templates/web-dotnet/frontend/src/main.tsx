import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { ThemeProvider } from '@/components/theme-provider';
import App from './App';
import './index.css';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="{{projectName}}-theme">
      <Provider store={store}>
        <BrowserRouter future={routerFuture}>
          <App />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
);
