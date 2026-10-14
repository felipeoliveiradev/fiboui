import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'fiboui/style.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import './base.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
