import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Root } from 'react-dom/client';
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ROOT = resolve(__dirname, '..');
const DEMO = resolve(ROOT, 'src/demo.tsx');

function demoSrc(): string {
  return readFileSync(DEMO, 'utf8');
}

function stubIntersectionObserver() {
  if (typeof IntersectionObserver !== 'undefined') return;
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = '';
    thresholds: number[] = [];
  } as unknown as typeof IntersectionObserver;
}

async function mountGallery() {
  stubIntersectionObserver();
  vi.resetModules();
  const el = document.createElement('div');
  el.id = 'root';
  document.body.appendChild(el);
  await act(async () => {
    await import('../src/demo');
  });
  return el;
}

function closestStakingGrid(node: Element | null): HTMLElement | null {
  let el: Element | null = node;
  while (el) {
    const cls = typeof el.className === 'string' ? el.className : '';
    if (/\bfibo-grid\b/.test(cls)) return el as HTMLElement;
    el = el.parentElement;
  }
  return null;
}

afterEach(() => {
  const hosted = (window as Window & { _reactRoot?: Root })._reactRoot;
  hosted?.unmount();
  delete (window as Window & { _reactRoot?: Root })._reactRoot;
  document.getElementById('root')?.remove();
  cleanup();
});

describe('W25-09 demo.tsx gallery leftovers', () => {
  beforeEach(() => {
    stubIntersectionObserver();
  });

  it('KEEP: StakentCard stays a fluent Box so .children() chains before .build()', () => {
    const src = demoSrc();
    const fluent = src.match(/StakentCard\(\{[\s\S]*?\}\)\s*\.children\(/g) ?? [];
    expect(fluent.length).toBeGreaterThanOrEqual(4);
    expect(src).not.toMatch(/StakentCard\([^)]*\)\s*\.build\(\)/);
  });

  it('paints 24h Ago next to the 2.23% reward rate (Text.children is dropped)', async () => {
    await mountGallery();
    expect(screen.getByText('2.23%')).toBeInTheDocument();
    expect(screen.getByText(/24h Ago/)).toBeInTheDocument();
    const rate = screen.getByText('2.23%');
    const ago = screen.getByText(/24h Ago/);
    expect(rate.parentElement).toBe(ago.parentElement);
  });

  it('paints the header clock beside Recommended coins (Text.children is dropped)', async () => {
    await mountGallery();
    const label = screen.getByText('Recommended coins for 24 hours');
    const row = label.parentElement as HTMLElement;
    expect(row.querySelector('.i-heroicons-clock')).not.toBeNull();
  });

  it('paints the last-update status dot beside the AVAX timestamp', async () => {
    await mountGallery();
    const stamp = screen.getByText('Last Update - 45 minutes ago');
    const row = stamp.parentElement as HTMLElement;
    expect(row.querySelector('.rounded-full')).not.toBeNull();
  });

  it('puts the dashboard Investment Period GridItem inside the staking Grid', async () => {
    await mountGallery();
    const eth = screen.getByText('Ethereum (ETH)');
    const period = screen.getAllByText('Investment Period')[0];
    const ethGrid = closestStakingGrid(eth);
    expect(ethGrid).not.toBeNull();
    expect(ethGrid).toContainElement(period);
    const item = period.closest('[class*="col-span"]') as HTMLElement | null;
    expect(item).not.toBeNull();
    expect(item!.className).toMatch(/col-span-full|md:col-span-3|col-span-3/);
    expect(item!.className).not.toMatch(/col-span-4/);
  });

  it('CollectionCard Future Scapes names its author instead of an empty Created by', async () => {
    await mountGallery();
    expect(screen.getByText('Future Scapes')).toBeInTheDocument();
    expect(screen.getByText('10k Items')).toBeInTheDocument();
    expect(screen.getByText('Created by')).toBeInTheDocument();
    expect(screen.getByText('Nova Labs')).toBeInTheDocument();
  });

  it('keeps Full Name after switching theme (anonymous hook islands remount)', async () => {
    await mountGallery();
    const input = screen.getByPlaceholderText('John Doe') as HTMLInputElement;
    await userEvent.type(input, 'Ada');
    expect(input).toHaveValue('Ada');
    fireEvent.click(screen.getByRole('button', { name: 'iOS' }));
    expect(screen.getByPlaceholderText('John Doe')).toHaveValue('Ada');
  });

  it('lazy list appends from previous length, not a stale items closure', () => {
    const src = demoSrc();
    expect(src).toMatch(/setItems\(\s*\(?\s*(?:prev|items)\s*\)?\s*=>/);
    expect(src).not.toMatch(/Loaded Item \$\{items\.length/);
    expect(src).not.toMatch(/React\.createElement\(\s*\(\s*\)\s*=>/);
  });
});
