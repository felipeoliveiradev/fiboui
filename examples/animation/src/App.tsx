import { useState } from 'react';
import {
  Box,
  Button,
  Column,
  Presence,
  Text,
  scrollTo,
} from 'fiboui';

export function App() {
  return <Page />;
}

function Page() {
  const [open, setOpen] = useState(true);
  const [hovers, setHovers] = useState(0);

  return (
    <div className="demo-page">
      {Box()
        .id('progress')
        .scrollProgress()
        .className('demo-bar')
        .height(6)
        .children('')}
      {Text('FiboUI motion')
        .id('title')
        .fontSize(28)
        .fontWeight(700)
        .marginBottom(16)}
      {Box()
        .id('fade-in')
        .animate('fadeIn')
        .duration(360)
        .className('demo-card')
        .marginBottom(12)
        .children('fadeIn preset')}
      {Box()
        .id('spring-pop')
        .animate('pop')
        .spring({ stiffness: 220, damping: 24 })
        .className('demo-card')
        .marginBottom(12)
        .children('pop + spring linear()')}
      {Box()
        .id('hover-card')
        .className('demo-card')
        .marginBottom(12)
        .hover((h) => {
          h.scale(1.05).translateY(-4);
        })
        .press()
        .focusRing()
        .children('hover scale + translate')}
      {Column()
        .id('stagger-list')
        .stagger(80)
        .gap(8)
        .marginBottom(16)
        .children([
          Box().animate('slideUp').id('stagger-0').className('demo-card').children('One'),
          Box().animate('slideUp').id('stagger-1').className('demo-card').children('Two'),
          Box().animate('slideUp').id('stagger-2').className('demo-card').children('Three'),
        ])}
      {Box()
        .id('reveal-card')
        .onScroll('fadeIn')
        .className('demo-card')
        .marginBottom(12)
        .children('scroll reveal')}
      {Box()
        .id('sticky-bar')
        .sticky(0)
        .backgroundColor('#1b1e28')
        .padding(8)
        .marginBottom(12)
        .children('sticky')}
      {Box()
        .id('snap-scroller')
        .scrollSnap('y')
        .smoothScroll()
        .className('demo-snap')
        .marginBottom(16)
        .children([
          Box().scrollSnapAlign('start').className('demo-snap-item').children('Snap A'),
          Box().scrollSnapAlign('start').className('demo-snap-item').children('Snap B'),
        ])}
      {Button(`Hover me (${hovers})`)
        .id('hover-btn')
        .onHover(() => setHovers((n) => n + 1))
        .onPress(() => setOpen((v) => !v))}
      <Presence show={open} enter="fadeIn" exit="fadeOut">
        {Box().id('panel').className('demo-card').marginTop(12).children('presence panel')}
      </Presence>
      {Button('Go to footer')
        .id('to-footer')
        .onPress(() => scrollTo('#footer'))}
      {Box()
        .anchor('footer')
        .marginTop(48)
        .className('demo-card')
        .children('footer anchor')}
    </div>
  );
}
