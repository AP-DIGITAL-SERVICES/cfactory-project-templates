import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

function renderApp() {
  return render(
    <Provider store={store}>
      <MemoryRouter future={routerFuture}>
        <App />
      </MemoryRouter>
    </Provider>,
  );
}

describe('App', () => {
  it('renders without crashing', () => {
    renderApp();
  });

  it('shows the project name', () => {
    renderApp();
    expect(screen.getByText('{{projectName}}')).toBeInTheDocument();
  });
});
