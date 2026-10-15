import { createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import '../../../dist/style.css';
import { App } from '../shared/App';

const root = document.getElementById('root');
if (!root) {
  throw new Error('#root missing');
}

hydrateRoot(root, createElement(App));
