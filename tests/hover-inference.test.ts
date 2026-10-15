import { describe, expect, expectTypeOf, it } from 'vitest';
import { Box, Card } from '../src';
import type { PseudoStateBuilder } from '../src';

describe('PseudoStateBuilder export + hover inference', () => {
  it('infers PseudoStateBuilder inside map (not implicit any)', () => {
    const cards = ['alpha', 'beta'].map((label) =>
      Card()
        .key(label)
        .hover((h) => {
          expectTypeOf(h).not.toBeAny();
          expectTypeOf(h).toEqualTypeOf<PseudoStateBuilder>();
          expectTypeOf(h.scale).parameter(0).toEqualTypeOf<number>();
          h.scale(1.03).translateY(-2);
        })
        .children(label)
    );
    const focused = ['one'].map((label) =>
      Box()
        .key(label)
        .focus((f) => {
          expectTypeOf(f).not.toBeAny();
          f.color('#111');
        })
        .children(label)
    );
    expect(cards).toHaveLength(2);
    expect(focused).toHaveLength(1);
  });
});
