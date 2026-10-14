import { Code, Text } from 'fiboui/content';
import { Column, Section } from 'fiboui/layout';
import { Box } from 'fiboui/structure';

const fibo = `import { signal } from 'fiboui/core';
import { Column } from 'fiboui/layout';
import { Text } from 'fiboui/content';
import { Button } from 'fiboui/interactive';

const count = signal(0);

Column().children([
  Text(() => \`Count: \${count.value}\`),
  Button('+').onPress(() => {
    count.value += 1;
  }),
]);`;

const react = `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((n) => n + 1)}>
        +
      </button>
    </div>
  );
}`;

export function Compare() {
  return Section()
    .className('section section-paper')
    .id('compare')
    .labelledBy('compare-title')
    .children([
      Box()
        .className('section-grid')
        .children([
          Column()
            .crossAxisAlignment('start')
            .children([
              Text('Assembly').className('eyebrow'),
              Text('Same idea. Fewer brackets.')
                .h2()
                .className('section-title')
                .id('compare-title'),
              Text(
                'Builders in .children() do not need .build(). Text(() => signal.value) patches the text node. mount("#root", App) mounts a root builder without a trailing build() call.'
              ).className('section-copy'),
            ]),
          Box()
            .className('compare')
            .children([
              Code(fibo).label('FiboUI 2.0').language('ts').className('code'),
              Code(react).label('Plain React').language('tsx').className('code light'),
            ]),
        ]),
    ]);
}
