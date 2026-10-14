---
layout: home

hero:
  name: FiboUI
  text: Fluent React UI
  tagline: Builders are React elements. CSS-compiled motion. Signals when you need them. ESM-only.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: API reference
      link: /api/
    - theme: alt
      text: GitHub
      link: https://github.com/felipeoliveiradev/fiboui

features:
  - title: Fluent builders
    details: Column(), Button(), Text() return React elements. Nest them, return them, key them. No .build() at call sites.
  - title: CSS motion
    details: .animate() presets compile to deduped @keyframes. Springs use CSS linear(). Scroll helpers fall back without rAF.
  - title: Themes as CSS variables
    details: Material, Cupertino, and Web tokens on --fibo-* variables. Import fiboui/style.css yourself.
---
