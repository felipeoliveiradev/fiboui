# Constants

| Name | Source | Type |
| --- | --- | --- |
| `Easing` | `src/core/animationHooks.ts` | `{ linear: (t: number) => number; easeIn: (t: number) => number; easeOut: (t: number) => number; easeInOut: (t: number) => number; easeInCubic: (t: number) => nu` |
| `MOTION_PRESETS` | `src/core/motionCss.ts` | `readonly ["fadeIn", "fadeOut", "fade", "slideUp", "slideDown", "slideLeft", "slideRight", "scaleIn", "scaleOut", "scale", "blurIn", "blurOut", "blur", "pop", "b` |
| `FIBO_MOTION_CSS` | `src/core/motionCss.ts` | `string` |
| `FIBO_BREAKPOINTS` | `src/core/breakpoints.ts` | `{ readonly sm: 640; readonly md: 768; readonly lg: 1024; readonly xl: 1280; }` |
| `materialTheme` | `src/theme/material.ts` | `FiboTheme` |
| `cupertinoTheme` | `src/theme/cupertino.ts` | `FiboTheme` |
| `webTheme` | `src/theme/web.ts` | `FiboTheme` |
| `FiboTheme` | `src/theme/types.ts` | `any` |
| `storageAdapters` | `src/state/persistence.ts` | `{ localStorage: StorageAdapter; sessionStorage: StorageAdapter; }` |

### MOTION_PRESETS

`fadeIn`, `fadeOut`, `fade`, `slideUp`, `slideDown`, `slideLeft`, `slideRight`, `scaleIn`, `scaleOut`, `scale`, `blurIn`, `blurOut`, `blur`, `pop`, `bounce`.

```ts snippet
import { MOTION_PRESETS, Box } from 'fiboui';

export default function Example() {
  return Box().animate(MOTION_PRESETS[0]).children(MOTION_PRESETS[0]);
}
```

### FIBO_BREAKPOINTS

`sm` 640, `md` 768, `lg` 1024, `xl` 1280.

```ts snippet
import { FIBO_BREAKPOINTS, Box } from 'fiboui';

export default function Example() {
  return Box().md({ width: FIBO_BREAKPOINTS.md });
}
```
