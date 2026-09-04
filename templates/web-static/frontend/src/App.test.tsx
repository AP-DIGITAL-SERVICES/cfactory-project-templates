import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

function renderApp() {
  return render(
    <MemoryRouter future={routerFuture}>
      <App />
    </MemoryRouter>,
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

  it('renders the primary call to action', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });
});
