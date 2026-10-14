import { Column } from 'fiboui/layout';
import { Compare } from './components/Compare';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { QuickStart } from './components/QuickStart';
import { Showcase } from './components/Showcase';
import { Why } from './components/Why';

export function LandingPage() {
  return Column()
    .className('landing')
    .id('top')
    .crossAxisAlignment('stretch')
    .children([
      <a className="skip-link" href="#hero-title">
        Skip to content
      </a>,
      Hero(),
      Why(),
      Compare(),
      Showcase(),
      QuickStart(),
      Footer(),
    ]);
}
