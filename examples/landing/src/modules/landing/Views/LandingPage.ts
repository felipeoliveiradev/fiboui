import { Anchor } from 'fiboui/navigation';
import { Main } from 'fiboui/layout';
import { Compare } from './components/Compare';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { QuickStart } from './components/QuickStart';
import { Showcase } from './components/Showcase';
import { Why } from './components/Why';

export function LandingPage() {
  return Main()
    .className('landing')
    .id('top')
    .children([
      Anchor('#hero-title').text('Skip to content').className('skip-link'),
      Hero(),
      Why(),
      Compare(),
      Showcase(),
      QuickStart(),
      Footer(),
    ]);
}
