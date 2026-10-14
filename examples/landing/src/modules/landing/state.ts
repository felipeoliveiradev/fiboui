import { computed, signal } from 'fiboui/core';

export const amount = signal(3845.75);
export const ring = signal(64);
export const tile = signal(0);
export const copied = signal(false);

export const amountLabel = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount.value)
);

export const deltaLabel = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always',
  }).format(amount.value - 3845.75)
);

export const tiles = [
  {
    title: 'Builders',
    subtitle: 'Factories return chainable instances',
  },
  {
    title: 'Signals',
    subtitle: 'Fine-grained updates, no extra JSX',
  },
  {
    title: 'ListTile',
    subtitle: 'Leading, title, trailing, chevron',
  },
] as const;

export function bump(delta: number) {
  amount.value = Math.round((amount.value + delta) * 100) / 100;
  ring.value = Math.min(100, Math.max(8, ring.value + (delta > 0 ? 6 : -6)));
}

export function cycleTile() {
  tile.value = (tile.value + 1) % tiles.length;
}

export function copyInstall() {
  const text = 'npm install fiboui';
  if (navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(text);
  }
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1800);
}
