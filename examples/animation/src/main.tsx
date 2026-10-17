import '../../../src/styles/core.css';
import '../../../src/styles/motion.css';
import './demo.css';
import { mount } from 'fiboui';
import { App } from './App';

function boot(): void {
  if (typeof document === 'undefined') return;
  mount('#root', App);
}

boot();
