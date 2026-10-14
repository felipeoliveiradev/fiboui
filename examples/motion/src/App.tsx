import { Box, Column, Row, Text } from 'fiboui';
import { MotionStyles } from 'fiboui/motion';

const items = ['Alpha', 'Beta', 'Gamma', 'Delta'];

export function App() {
  return Column()
    .id('motion-demo')
    .css({
      minHeight: '220vh',
      padding: '32px',
      gap: '28px',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      background: '#0b0c10',
      color: '#e8e8ef',
    })
    .children([
      MotionStyles(),
      Text('FiboUI CSS motion').variant('h1').id('title').animate('fadeIn').duration(280),
      Text('Compiled to @keyframes + linear() springs. No per-frame JS.')
        .muted()
        .animate('fadeIn')
        .delay(40),
      Row()
        .id('preset-row')
        .css({ gap: '16px', flexWrap: 'wrap' })
        .children(
          (['fadeIn', 'slideUp', 'scaleIn', 'blurIn', 'pop'] as const).map((preset) =>
            Box()
              .key(preset)
              .id(`preset-${preset}`)
              .animate(preset)
              .duration(300)
              .ease(preset === 'pop' ? 'spring' : 'ease-out')
              .css({
                padding: '16px 20px',
                borderRadius: '16px',
                background: '#171821',
                border: '1px solid #2a2b36',
                minWidth: '120px',
              })
              .children([Text(preset)])
          )
        ),
      Box()
        .id('hover-card')
        .hover((s) => s.scale(1.03))
        .press()
        .duration(200)
        .css({
          padding: '24px',
          borderRadius: '20px',
          background: '#1b1c28',
          border: '1px solid #3d3f54',
          width: '280px',
          cursor: 'pointer',
        })
        .children([Text('Hover / press me').variant('h3')]),
      Column()
        .id('stagger-list')
        .stagger(70)
        .css({ gap: '8px' })
        .children(
          items.map((label, i) =>
            Box()
              .key(label)
              .id(`stagger-${i}`)
              .animate('slideUp')
              .duration(320)
              .css({
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#14151d',
                border: '1px solid #2c2d3a',
              })
              .children([Text(label)])
          )
        ),
      Box()
        .id('spring-box')
        .animate('slideUp', { from: 20 })
        .duration(400)
        .ease('spring')
        .css({
          padding: '20px',
          borderRadius: '16px',
          background: '#221833',
          width: '240px',
        })
        .children([Text('spring linear()')]),
      Box()
        .id('reveal-card')
        .reveal('fadeUp')
        .css({
          marginTop: '70vh',
          padding: '32px',
          borderRadius: '20px',
          background: '#10231c',
          border: '1px solid #2f6f55',
        })
        .children([Text('Scroll-reveal (IntersectionObserver + CSS)')]),
    ]);
}
