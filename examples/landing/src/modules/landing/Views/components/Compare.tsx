import { Text } from 'fiboui/content';
import { Column } from 'fiboui/layout';
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
  return Box()
    .className('section section-paper')
    .id('compare')
    .children([
      Box()
        .className('section-grid')
        .children([
          Column()
            .crossAxisAlignment('start')
            .children([
              Text('Assembly').className('eyebrow'),
              <h2 className="section-title">Same idea. Fewer brackets.</h2>,
              Text(
                'Builders in .children() do not need .build(). Text(() => signal.value) patches the text node. mount("#root", App) mounts a root builder without a trailing build() call.'
              ).className('section-copy'),
            ]),
          Box()
            .className('compare')
            .children([
              <pre className="code" tabIndex={0}>
                <span className="code-label">FiboUI 2.0</span>
                {fibo}
              </pre>,
              <pre className="code light" tabIndex={0}>
                <span className="code-label">Plain React</span>
                {react}
              </pre>,
            ]),
        ]),
    ]);
}
