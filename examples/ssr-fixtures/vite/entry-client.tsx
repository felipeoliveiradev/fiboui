import { createElement, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import '../../../dist/style.css';
import { App } from '../shared/App';

declare global {
  interface Window {
    __FIBO_HYDRATED__?: boolean;
  }
}

function Root() {
  useEffect(() => {
    window.__FIBO_HYDRATED__ = true;
  }, []);
  return createElement(App);
}

function mount(): void {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('#root missing');
  }
  hydrateRoot(root, createElement(Root));
}

mount();
