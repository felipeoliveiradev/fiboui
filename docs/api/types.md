# Types

Type-only exports from `src/index.ts`.

| Name | Source |
| --- | --- |
| `Buildable` | `src/core/types.ts` |
| `FiboChild` | `src/core/types.ts` |
| `FiboChildren` | `src/core/types.ts` |
| `FiboThemeName` | `src/core/types.ts` |
| `ResponsiveStyles` | `src/core/types.ts` |
| `BaseProps` | `src/core/types.ts` |
| `ChildrenProps` | `src/core/types.ts` |
| `Alignment` | `src/core/types.ts` |
| `MainAxisAlignment` | `src/core/types.ts` |
| `CrossAxisAlignment` | `src/core/types.ts` |
| `LayoutProps` | `src/core/types.ts` |
| `TextType` | `src/core/types.ts` |
| `ButtonVariant` | `src/core/types.ts` |
| `StatusType` | `src/core/types.ts` |
| `BindableSignal` | `src/core/state.ts` |
| `ReactiveStore` | `src/core/state.ts` |
| `TransitionConfig` | `src/core/animationHooks.ts` |
| `SpringConfig` | `src/core/animationHooks.ts` |
| `AnimationOptions` | `src/core/animations.ts` |
| `PresenceProps` | `src/core/Presence.tsx` |
| `RevealProps` | `src/core/Reveal.tsx` |
| `SpringOptions` | `src/core/easing.ts` |
| `MotionPreset` | `src/core/motionCss.ts` |
| `CustomMotion` | `src/core/motionCss.ts` |
| `BreakpointKey` | `src/core/breakpoints.ts` |
| `FiboPlugin` | `src/core/plugin/types.ts` |
| `FiboContext` | `src/core/plugin/types.ts` |
| `RouteDefinition` | `src/core/plugin/types.ts` |
| `SidebarConfig` | `src/core/plugin/types.ts` |
| `PseudoStateFn` | `src/core/builder.ts` |
| `FiboTheme` | `src/theme/types.ts` |
| `PersistOptions` | `src/state/persistence.ts` |
| `StorageAdapter` | `src/state/persistence.ts` |

### Buildable

Any fluent builder that can produce a React element.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### FiboChild

A single child accepted by `.children()` / layout slots / JSX / component returns.
Builders are React elements — they do not need `.build()`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### FiboChildren

Value accepted by `.children()`: one child, a list, or a lazy factory.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### FiboThemeName

Type export `FiboThemeName`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### ResponsiveStyles

Type export `ResponsiveStyles`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### BaseProps

Type export `BaseProps`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### ChildrenProps

Type export `ChildrenProps`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### Alignment

Type export `Alignment`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### MainAxisAlignment

Type export `MainAxisAlignment`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### CrossAxisAlignment

Type export `CrossAxisAlignment`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### LayoutProps

Type export `LayoutProps`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### TextType

Type export `TextType`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### ButtonVariant

Type export `ButtonVariant`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### StatusType

Type export `StatusType`.

- **Source:** `src/core/types.ts`
- **Type:** `any`

### BindableSignal

Anything `.bindSignal()` can subscribe to (`Signal` or `ComputedSignal`).

- **Source:** `src/core/state.ts`
- **Type:** `any`

### ReactiveStore

Type export `ReactiveStore`.

- **Source:** `src/core/state.ts`
- **Type:** `any`

### TransitionConfig

Type export `TransitionConfig`.

- **Source:** `src/core/animationHooks.ts`
- **Type:** `any`

### SpringConfig

Type export `SpringConfig`.

- **Source:** `src/core/animationHooks.ts`
- **Type:** `any`

### AnimationOptions

Type export `AnimationOptions`.

- **Source:** `src/core/animations.ts`
- **Type:** `any`

### PresenceProps

Type export `PresenceProps`.

- **Source:** `src/core/Presence.tsx`
- **Type:** `any`

### RevealProps

Type export `RevealProps`.

- **Source:** `src/core/Reveal.tsx`
- **Type:** `any`

### SpringOptions

Type export `SpringOptions`.

- **Source:** `src/core/easing.ts`
- **Type:** `any`

### MotionPreset

Type export `MotionPreset`.

- **Source:** `src/core/motionCss.ts`
- **Type:** `any`

### CustomMotion

Type export `CustomMotion`.

- **Source:** `src/core/motionCss.ts`
- **Type:** `any`

### BreakpointKey

Type export `BreakpointKey`.

- **Source:** `src/core/breakpoints.ts`
- **Type:** `any`

### FiboPlugin

Type export `FiboPlugin`.

- **Source:** `src/core/plugin/types.ts`
- **Type:** `any`

### FiboContext

Type export `FiboContext`.

- **Source:** `src/core/plugin/types.ts`
- **Type:** `any`

### RouteDefinition

Type export `RouteDefinition`.

- **Source:** `src/core/plugin/types.ts`
- **Type:** `any`

### SidebarConfig

Type export `SidebarConfig`.

- **Source:** `src/core/plugin/types.ts`
- **Type:** `any`

### PseudoStateFn

Callback form of `.hover()` / `.focus()` / … Contextual typing uses the *last*
overload, so this signature must stay last or `h` becomes implicit `any` inside `.map()`.

- **Source:** `src/core/builder.ts`
- **Type:** `any`

### FiboTheme

Type export `FiboTheme`.

- **Source:** `src/theme/types.ts`
- **Type:** `any`

### PersistOptions

Type export `PersistOptions`.

- **Source:** `src/state/persistence.ts`
- **Type:** `any`

### StorageAdapter

Type export `StorageAdapter`.

- **Source:** `src/state/persistence.ts`
- **Type:** `any`

