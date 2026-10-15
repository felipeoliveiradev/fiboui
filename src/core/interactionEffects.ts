/**
 * Full interaction-effect catalog (Hover.css–inspired names, fiboui-owned CSS).
 * NOT a vendor of Hover.css — reimplemented for commercial use inside fiboui.
 *
 * Apply on any trigger:
 *   .hover(h => h.effect("sweepToRight"))
 *   .pressEffect("shrink")
 *   .focusEffect("glow")
 */

export const INTERACTION_EFFECTS = [
  // —— 2D Transitions ——
  'grow',
  'shrink',
  'pulse',
  'pulseGrow',
  'pulseShrink',
  'push',
  'pop',
  'bounceIn',
  'bounceOut',
  'rotate',
  'growRotate',
  'float',
  'sink',
  'bob',
  'hang',
  'skew',
  'skewForward',
  'skewBackward',
  'wobbleHorizontal',
  'wobbleVertical',
  'wobbleToBottomRight',
  'wobbleToTopRight',
  'wobbleTop',
  'wobbleBottom',
  'wobbleSkew',
  'buzz',
  'buzzOut',
  'forward',
  'backward',
  'nudge',

  // —— Background Transitions ——
  'fade',
  'backPulse',
  'sweepToRight',
  'sweepToLeft',
  'sweepToBottom',
  'sweepToTop',
  'bounceToRight',
  'bounceToLeft',
  'bounceToBottom',
  'bounceToTop',
  'radialOut',
  'radialIn',
  'rectangleIn',
  'rectangleOut',
  'shutterInHorizontal',
  'shutterOutHorizontal',
  'shutterInVertical',
  'shutterOutVertical',

  // —— Icon (same motion; names for discoverability) ——
  'iconBack',
  'iconForward',
  'iconDown',
  'iconUp',
  'iconSpin',
  'iconDrop',
  'iconFade',
  'iconFloatAway',
  'iconSinkAway',
  'iconGrow',
  'iconShrink',
  'iconPulse',
  'iconPulseGrow',
  'iconPulseShrink',
  'iconPush',
  'iconPop',
  'iconBounce',
  'iconRotate',
  'iconGrowRotate',
  'iconFloat',
  'iconSink',
  'iconBob',
  'iconHang',
  'iconWobbleHorizontal',
  'iconWobbleVertical',
  'iconBuzz',
  'iconBuzzOut',

  // —— Border Transitions ——
  'borderFade',
  'hollow',
  'trim',
  'rippleOut',
  'rippleIn',
  'outlineOut',
  'outlineIn',
  'roundCorners',
  'underlineFromLeft',
  'underlineFromCenter',
  'underlineFromRight',
  'reveal',
  'underlineReveal',
  'overlineFromLeft',
  'overlineFromCenter',
  'overlineFromRight',
  'overlineReveal',

  // —— Shadow and Glow ——
  'shadowGrow',
  'shadowFloat',
  'shadowGlow',
  'shadowRadial',
  'boxShadowOutset',
  'boxShadowInset',
  'lift',
  'glow',

  // —— Speech Bubbles ——
  'bubbleTop',
  'bubbleRight',
  'bubbleBottom',
  'bubbleLeft',
  'bubbleFloatTop',
  'bubbleFloatRight',
  'bubbleFloatBottom',
  'bubbleFloatLeft',

  // —— Curls ——
  'curlTopLeft',
  'curlTopRight',
  'curlBottomRight',
  'curlBottomLeft',
] as const;

export type InteractionEffectName = (typeof INTERACTION_EFFECTS)[number];

/** Hover.css / kebab aliases → camelCase catalog ids. */
const ALIAS: Partial<Record<string, InteractionEffectName>> = {
  'pulse-grow': 'pulseGrow',
  'pulse-shrink': 'pulseShrink',
  'bounce-in': 'bounceIn',
  'bounce-out': 'bounceOut',
  'grow-rotate': 'growRotate',
  'skew-forward': 'skewForward',
  'skew-backward': 'skewBackward',
  'wobble-horizontal': 'wobbleHorizontal',
  'wobble-vertical': 'wobbleVertical',
  'wobble-to-bottom-right': 'wobbleToBottomRight',
  'wobble-to-top-right': 'wobbleToTopRight',
  'wobble-top': 'wobbleTop',
  'wobble-bottom': 'wobbleBottom',
  'wobble-skew': 'wobbleSkew',
  'buzz-out': 'buzzOut',
  'back-pulse': 'backPulse',
  'sweep-to-right': 'sweepToRight',
  'sweep-to-left': 'sweepToLeft',
  'sweep-to-bottom': 'sweepToBottom',
  'sweep-to-top': 'sweepToTop',
  'bounce-to-right': 'bounceToRight',
  'bounce-to-left': 'bounceToLeft',
  'bounce-to-bottom': 'bounceToBottom',
  'bounce-to-top': 'bounceToTop',
  'radial-out': 'radialOut',
  'radial-in': 'radialIn',
  'rectangle-in': 'rectangleIn',
  'rectangle-out': 'rectangleOut',
  'shutter-in-horizontal': 'shutterInHorizontal',
  'shutter-out-horizontal': 'shutterOutHorizontal',
  'shutter-in-vertical': 'shutterInVertical',
  'shutter-out-vertical': 'shutterOutVertical',
  'icon-back': 'iconBack',
  'icon-forward': 'iconForward',
  'icon-down': 'iconDown',
  'icon-up': 'iconUp',
  'icon-spin': 'iconSpin',
  'icon-drop': 'iconDrop',
  'icon-fade': 'iconFade',
  'icon-float-away': 'iconFloatAway',
  'icon-sink-away': 'iconSinkAway',
  'icon-grow': 'iconGrow',
  'icon-shrink': 'iconShrink',
  'icon-pulse': 'iconPulse',
  'icon-pulse-grow': 'iconPulseGrow',
  'icon-pulse-shrink': 'iconPulseShrink',
  'icon-push': 'iconPush',
  'icon-pop': 'iconPop',
  'icon-bounce': 'iconBounce',
  'icon-rotate': 'iconRotate',
  'icon-grow-rotate': 'iconGrowRotate',
  'icon-float': 'iconFloat',
  'icon-sink': 'iconSink',
  'icon-bob': 'iconBob',
  'icon-hang': 'iconHang',
  'icon-wobble-horizontal': 'iconWobbleHorizontal',
  'icon-wobble-vertical': 'iconWobbleVertical',
  'icon-buzz': 'iconBuzz',
  'icon-buzz-out': 'iconBuzzOut',
  'border-fade': 'borderFade',
  'ripple-out': 'rippleOut',
  'ripple-in': 'rippleIn',
  'outline-out': 'outlineOut',
  'outline-in': 'outlineIn',
  'round-corners': 'roundCorners',
  'underline-from-left': 'underlineFromLeft',
  'underline-from-center': 'underlineFromCenter',
  'underline-from-right': 'underlineFromRight',
  'underline-reveal': 'underlineReveal',
  'overline-from-left': 'overlineFromLeft',
  'overline-from-center': 'overlineFromCenter',
  'overline-from-right': 'overlineFromRight',
  'overline-reveal': 'overlineReveal',
  'shadow-grow': 'shadowGrow',
  'shadow-float': 'shadowFloat',
  'shadow-glow': 'shadowGlow',
  'shadow-radial': 'shadowRadial',
  'box-shadow-outset': 'boxShadowOutset',
  'box-shadow-inset': 'boxShadowInset',
  'bubble-top': 'bubbleTop',
  'bubble-right': 'bubbleRight',
  'bubble-bottom': 'bubbleBottom',
  'bubble-left': 'bubbleLeft',
  'bubble-float-top': 'bubbleFloatTop',
  'bubble-float-right': 'bubbleFloatRight',
  'bubble-float-bottom': 'bubbleFloatBottom',
  'bubble-float-left': 'bubbleFloatLeft',
  'curl-top-left': 'curlTopLeft',
  'curl-top-right': 'curlTopRight',
  'curl-bottom-right': 'curlBottomRight',
  'curl-bottom-left': 'curlBottomLeft',
  // hvr-* prefix from Hover.css class names
  'hvr-grow': 'grow',
  'hvr-float': 'float',
  'hvr-sweep-to-right': 'sweepToRight',
};

export function interactionEffectKebab(name: InteractionEffectName): string {
  return name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

export function isInteractionEffectName(value: string): value is InteractionEffectName {
  return (INTERACTION_EFFECTS as readonly string[]).includes(value);
}

export function normalizeInteractionEffect(name: string): InteractionEffectName {
  const key = name.trim();
  const fromAlias = ALIAS[key] ?? ALIAS[key.toLowerCase()];
  if (fromAlias) return fromAlias;
  if (isInteractionEffectName(key)) return key;
  // kebab → camel
  const camel = key.replace(/-([a-z])/g, (_m: string, c: string) => c.toUpperCase());
  if (isInteractionEffectName(camel)) return camel;
  throw new Error(
    `Unknown interaction effect "${name}". Use one of ${INTERACTION_EFFECTS.length} presets — see INTERACTION_EFFECTS.`,
  );
}

/** Trigger class stamped by PseudoStateBuilder.effect(). */
export function interactionEffectTriggerClass(
  pseudoState: string,
  isGroup = false,
): string {
  if (isGroup) return `fibo-fx-on-group-${pseudoState}`;
  return `fibo-fx-on-${pseudoState}`;
}

export function interactionEffectClass(name: InteractionEffectName): string {
  return `fibo-fx-${interactionEffectKebab(name)}`;
}
