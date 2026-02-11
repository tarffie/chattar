import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import { RouterProvider } from 'react-router';
// import { router } from './Router';
import App from './App';
import './index.css';

const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
/* <RouterProvider router={router} /> */
