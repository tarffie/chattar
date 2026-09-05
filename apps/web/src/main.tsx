import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Styles
import './index.css';
import '@chattar/ui/src/styles/ui.css';

const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
