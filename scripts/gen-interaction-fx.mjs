/**
 * Generates src/core/interactionFxCss.ts — full fiboui-owned effect sheet.
 * Run: node scripts/gen-interaction-fx.mjs
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TRIGGERS = (sel) =>
  [
    `${sel}.fibo-fx-on-hover:hover`,
    `${sel}.fibo-fx-on-active:active`,
    `${sel}.fibo-fx-on-focus:focus`,
    `${sel}.fibo-fx-on-focus-visible:focus-visible`,
    `${sel}.fibo-fx-on-focus-within:focus-within`,
    `.group:hover ${sel}.fibo-fx-on-group-hover`,
    `.group:active ${sel}.fibo-fx-on-group-active`,
    `.group:focus-within ${sel}.fibo-fx-on-group-focus-within`,
  ].join(',\n');

const TRIGGERS_BEFORE = (sel) =>
  [
    `${sel}.fibo-fx-on-hover:hover::before`,
    `${sel}.fibo-fx-on-active:active::before`,
    `${sel}.fibo-fx-on-focus:focus::before`,
    `${sel}.fibo-fx-on-focus-visible:focus-visible::before`,
    `${sel}.fibo-fx-on-focus-within:focus-within::before`,
    `.group:hover ${sel}.fibo-fx-on-group-hover::before`,
    `.group:active ${sel}.fibo-fx-on-group-active::before`,
    `.group:focus-within ${sel}.fibo-fx-on-group-focus-within::before`,
  ].join(',\n');

const TRIGGERS_AFTER = (sel) =>
  TRIGGERS_BEFORE(sel).replaceAll('::before', '::after');

function fx(name, { base = '', active = '', before = '', beforeActive = '', after = '', afterActive = '' } = {}) {
  const sel = `.fibo-fx-${name}`;
  const parts = [];
  if (base) parts.push(`${sel} { ${base} }`);
  if (before) parts.push(`${sel}::before { ${before} }`);
  if (after) parts.push(`${sel}::after { ${after} }`);
  if (active) parts.push(`${TRIGGERS(sel)} { ${active} }`);
  if (beforeActive) parts.push(`${TRIGGERS_BEFORE(sel)} { ${beforeActive} }`);
  if (afterActive) parts.push(`${TRIGGERS_AFTER(sel)} { ${afterActive} }`);
  return parts.join('\n');
}

const KEYFRAMES = `
@keyframes fibo-fx-pulse { 25% { transform: scale(1.1); } 75% { transform: scale(0.9); } }
@keyframes fibo-fx-pulse-grow { to { transform: scale(1.1); } }
@keyframes fibo-fx-pulse-shrink { to { transform: scale(0.9); } }
@keyframes fibo-fx-push { 50% { transform: scale(0.8); } 100% { transform: scale(1); } }
@keyframes fibo-fx-pop { 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
@keyframes fibo-fx-bounce-in {
  0% { transform: scale(0); } 40% { transform: scale(1.15); } 60% { transform: scale(0.95); }
  80% { transform: scale(1.05); } 100% { transform: scale(1); }
}
@keyframes fibo-fx-bounce-out {
  0% { transform: scale(1); } 25% { transform: scale(0.95); } 50% { transform: scale(1.08); }
  100% { transform: scale(0); opacity: 0; }
}
@keyframes fibo-fx-bob {
  0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); }
}
@keyframes fibo-fx-hang {
  0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); }
}
@keyframes fibo-fx-wobble-h {
  16.65% { transform: translateX(8px); } 33.3% { transform: translateX(-6px); }
  49.95% { transform: translateX(4px); } 66.6% { transform: translateX(-2px); }
  83.25% { transform: translateX(1px); } 100% { transform: translateX(0); }
}
@keyframes fibo-fx-wobble-v {
  16.65% { transform: translateY(8px); } 33.3% { transform: translateY(-6px); }
  49.95% { transform: translateY(4px); } 66.6% { transform: translateY(-2px); }
  83.25% { transform: translateY(1px); } 100% { transform: translateY(0); }
}
@keyframes fibo-fx-wobble-br {
  16.65% { transform: translate(8px,8px); } 33.3% { transform: translate(-6px,-6px); }
  49.95% { transform: translate(4px,4px); } 66.6% { transform: translate(-2px,-2px); }
  83.25% { transform: translate(1px,1px); } 100% { transform: translate(0,0); }
}
@keyframes fibo-fx-wobble-tr {
  16.65% { transform: translate(8px,-8px); } 33.3% { transform: translate(-6px,6px); }
  49.95% { transform: translate(4px,-4px); } 66.6% { transform: translate(-2px,2px); }
  83.25% { transform: translate(1px,-1px); } 100% { transform: translate(0,0); }
}
@keyframes fibo-fx-wobble-top {
  16.65% { transform: skew(-12deg); } 33.3% { transform: skew(10deg); }
  49.95% { transform: skew(-6deg); } 66.6% { transform: skew(4deg); }
  83.25% { transform: skew(-2deg); } 100% { transform: skew(0); }
  /* origin top */
}
@keyframes fibo-fx-wobble-bottom {
  16.65% { transform: skew(-12deg); } 33.3% { transform: skew(10deg); }
  49.95% { transform: skew(-6deg); } 66.6% { transform: skew(4deg); }
  83.25% { transform: skew(-2deg); } 100% { transform: skew(0); }
}
@keyframes fibo-fx-wobble-skew {
  16.65% { transform: skew(-12deg); } 33.3% { transform: skew(10deg); }
  49.95% { transform: skew(-6deg); } 66.6% { transform: skew(4deg); }
  83.25% { transform: skew(-2deg); } 100% { transform: skew(0); }
}
@keyframes fibo-fx-buzz {
  0%,100% { transform: translateX(0) rotate(0); }
  25% { transform: translateX(3px) rotate(2deg); }
  75% { transform: translateX(-3px) rotate(-2deg); }
}
@keyframes fibo-fx-buzz-out {
  10% { transform: translateX(3px) rotate(2deg); }
  20% { transform: translateX(-3px) rotate(-2deg); }
  30% { transform: translateX(3px) rotate(2deg); }
  40% { transform: translateX(-3px) rotate(-2deg); }
  50%,100% { transform: translateX(0) rotate(0); }
}
@keyframes fibo-fx-icon-drop {
  0% { opacity: 0; transform: translateY(-20px); }
  50% { opacity: 1; transform: translateY(0); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes fibo-fx-icon-bob {
  0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); }
}
@keyframes fibo-fx-icon-hang {
  0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); }
}
@keyframes fibo-fx-icon-buzz {
  0%,100% { transform: translateX(0) rotate(0); }
  25% { transform: translateX(3px) rotate(2deg); }
  75% { transform: translateX(-3px) rotate(-2deg); }
}
@keyframes fibo-fx-back-pulse {
  50% { background-color: rgba(127,127,127,0.25); }
}
@keyframes fibo-fx-ripple-out {
  100% { top: -12px; right: -12px; bottom: -12px; left: -12px; opacity: 0; }
}
@keyframes fibo-fx-ripple-in {
  100% { top: 0; right: 0; bottom: 0; left: 0; opacity: 1; }
}
`.trim();

const BASE = `
.fibo-fx {
  -webkit-tap-highlight-color: transparent;
  /* Do NOT set a resting transform — hover/active replace transform and would jump. */
  backface-visibility: hidden;
  box-shadow: 0 0 1px rgba(0,0,0,0);
}
.fibo-fx[class*="fibo-fx-sweep"],
.fibo-fx[class*="fibo-fx-bounce-to"],
.fibo-fx[class*="fibo-fx-radial"],
.fibo-fx[class*="fibo-fx-rectangle"],
.fibo-fx[class*="fibo-fx-shutter"],
.fibo-fx[class*="fibo-fx-curl"],
.fibo-fx[class*="fibo-fx-bubble"] {
  position: relative;
}
.fibo-fx[class*="fibo-fx-sweep"],
.fibo-fx[class*="fibo-fx-bounce-to"],
.fibo-fx[class*="fibo-fx-radial"],
.fibo-fx[class*="fibo-fx-rectangle"],
.fibo-fx[class*="fibo-fx-shutter"],
.fibo-fx[class*="fibo-fx-curl"] {
  overflow: hidden;
}
`.trim();

const PSEUDO_FILL = `
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0;
  background: var(--fibo-fx-fill, currentColor);
  transition-property: transform, opacity, border-radius, box-shadow, top, right, bottom, left;
  transition-duration: 0.3s;
  transition-timing-function: ease-out;
`.replace(/\n\s+/g, ' ').trim();

const blocks = [];

// —— 2D ——
blocks.push(fx('grow', { base: 'transition-duration:.3s;transition-property:transform;', active: 'transform:scale(1.1);' }));
blocks.push(fx('shrink', { base: 'transition-duration:.3s;transition-property:transform;', active: 'transform:scale(0.9);' }));
blocks.push(fx('pulse', { active: 'animation-name:fibo-fx-pulse;animation-duration:1s;animation-timing-function:linear;animation-iteration-count:infinite;' }));
blocks.push(fx('pulse-grow', { active: 'animation-name:fibo-fx-pulse-grow;animation-duration:.3s;animation-timing-function:linear;animation-iteration-count:infinite;animation-direction:alternate;' }));
blocks.push(fx('pulse-shrink', { active: 'animation-name:fibo-fx-pulse-shrink;animation-duration:.3s;animation-timing-function:linear;animation-iteration-count:infinite;animation-direction:alternate;' }));
blocks.push(fx('push', { active: 'animation-name:fibo-fx-push;animation-duration:.3s;animation-timing-function:linear;animation-iteration-count:1;' }));
blocks.push(fx('pop', { active: 'animation-name:fibo-fx-pop;animation-duration:.3s;animation-timing-function:linear;animation-iteration-count:1;' }));
blocks.push(fx('bounce-in', { active: 'animation-name:fibo-fx-bounce-in;animation-duration:.5s;animation-timing-function:cubic-bezier(0.47,2.02,.31,-.36);animation-iteration-count:1;' }));
blocks.push(fx('bounce-out', { active: 'animation-name:fibo-fx-bounce-out;animation-duration:.5s;animation-timing-function:cubic-bezier(.47,-.36,.31,2.02);animation-iteration-count:1;' }));
blocks.push(fx('rotate', { base: 'transition-duration:.3s;transition-property:transform;', active: 'transform:rotate(4deg);' }));
blocks.push(fx('grow-rotate', { base: 'transition-duration:.3s;transition-property:transform;', active: 'transform:scale(1.1) rotate(4deg);' }));
blocks.push(fx('float', { base: 'transition-duration:.3s;transition-property:transform;transition-timing-function:ease-out;', active: 'transform:translateY(-8px);' }));
blocks.push(fx('sink', { base: 'transition-duration:.3s;transition-property:transform;transition-timing-function:ease-out;', active: 'transform:translateY(8px);' }));
blocks.push(fx('bob', { active: 'animation-name:fibo-fx-bob;animation-duration:1s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;' }));
blocks.push(fx('hang', { active: 'animation-name:fibo-fx-hang;animation-duration:1s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;' }));
blocks.push(fx('skew', { base: 'transition-duration:.3s;transition-property:transform;', active: 'transform:skew(-10deg);' }));
blocks.push(fx('skew-forward', { base: 'transition-duration:.3s;transition-property:transform;transform-origin:0 100%;', active: 'transform:skew(-10deg);' }));
blocks.push(fx('skew-backward', { base: 'transition-duration:.3s;transition-property:transform;transform-origin:100% 0;', active: 'transform:skew(10deg);' }));
blocks.push(fx('wobble-horizontal', { active: 'animation-name:fibo-fx-wobble-h;animation-duration:1s;animation-timing-function:ease-in-out;animation-iteration-count:1;' }));
blocks.push(fx('wobble-vertical', { active: 'animation-name:fibo-fx-wobble-v;animation-duration:1s;animation-timing-function:ease-in-out;animation-iteration-count:1;' }));
blocks.push(fx('wobble-to-bottom-right', { active: 'animation-name:fibo-fx-wobble-br;animation-duration:1s;animation-timing-function:ease-in-out;animation-iteration-count:1;' }));
blocks.push(fx('wobble-to-top-right', { active: 'animation-name:fibo-fx-wobble-tr;animation-duration:1s;animation-timing-function:ease-in-out;animation-iteration-count:1;' }));
blocks.push(fx('wobble-top', { base: 'transform-origin:0 0;', active: 'animation-name:fibo-fx-wobble-top;animation-duration:1s;animation-timing-function:ease-in-out;animation-iteration-count:1;' }));
blocks.push(fx('wobble-bottom', { base: 'transform-origin:100% 100%;', active: 'animation-name:fibo-fx-wobble-bottom;animation-duration:1s;animation-timing-function:ease-in-out;animation-iteration-count:1;' }));
blocks.push(fx('wobble-skew', { active: 'animation-name:fibo-fx-wobble-skew;animation-duration:1s;animation-timing-function:ease-in-out;animation-iteration-count:1;' }));
blocks.push(fx('buzz', { active: 'animation-name:fibo-fx-buzz;animation-duration:.15s;animation-timing-function:linear;animation-iteration-count:infinite;' }));
blocks.push(fx('buzz-out', { active: 'animation-name:fibo-fx-buzz-out;animation-duration:.75s;animation-timing-function:linear;animation-iteration-count:1;' }));
blocks.push(fx('forward', { base: 'transition-duration:.3s;transition-property:transform;', active: 'transform:translateX(8px);' }));
blocks.push(fx('backward', { base: 'transition-duration:.3s;transition-property:transform;', active: 'transform:translateX(-8px);' }));
blocks.push(fx('nudge', { base: 'transition-duration:.24s;transition-property:transform;transition-timing-function:ease-out;', active: 'transform:translate3d(3px,0,0);' }));

// —— Background ——
blocks.push(fx('fade', { base: 'transition-duration:.3s;transition-property:background-color,color,opacity;', active: 'background-color:var(--fibo-fx-fill,rgba(127,127,127,.15));' }));
blocks.push(fx('back-pulse', { active: 'animation-name:fibo-fx-back-pulse;animation-duration:1s;animation-timing-function:linear;animation-iteration-count:infinite;' }));

function sweep(name, idleTransform, origin, activeTransform) {
  blocks.push(
    fx(name, {
      base: 'transition-duration:.3s;',
      before: `${PSEUDO_FILL} transform:${idleTransform}; transform-origin:${origin};`,
      beforeActive: `transform:${activeTransform};`,
    }),
  );
}
sweep('sweep-to-right', 'scaleX(0)', '0 50%', 'scaleX(1)');
sweep('sweep-to-left', 'scaleX(0)', '100% 50%', 'scaleX(1)');
sweep('sweep-to-bottom', 'scaleY(0)', '50% 0', 'scaleY(1)');
sweep('sweep-to-top', 'scaleY(0)', '50% 100%', 'scaleY(1)');

function bounceSweep(name, idle, origin, active) {
  blocks.push(
    fx(name, {
      before: `${PSEUDO_FILL} transform:${idle}; transform-origin:${origin}; transition-timing-function:cubic-bezier(.47,2.02,.31,-.36);`,
      beforeActive: `transform:${active};`,
    }),
  );
}
bounceSweep('bounce-to-right', 'scaleX(0)', '0 50%', 'scaleX(1)');
bounceSweep('bounce-to-left', 'scaleX(0)', '100% 50%', 'scaleX(1)');
bounceSweep('bounce-to-bottom', 'scaleY(0)', '50% 0', 'scaleY(1)');
bounceSweep('bounce-to-top', 'scaleY(0)', '50% 100%', 'scaleY(1)');

blocks.push(fx('radial-out', {
  before: `${PSEUDO_FILL} border-radius:100%; transform:scale(0);`,
  beforeActive: 'transform:scale(2);',
}));
blocks.push(fx('radial-in', {
  before: `${PSEUDO_FILL} border-radius:100%; transform:scale(2); opacity:0;`,
  beforeActive: 'transform:scale(0); opacity:1;',
  active: 'color:var(--fibo-fx-ink, inherit);',
}));
blocks.push(fx('rectangle-in', {
  before: `${PSEUDO_FILL} transform:scale(1);`,
  beforeActive: 'transform:scale(0);',
}));
blocks.push(fx('rectangle-out', {
  before: `${PSEUDO_FILL} transform:scale(0);`,
  beforeActive: 'transform:scale(1);',
}));

function shutter(name, beforeIdle, afterIdle, beforeActive, afterActive) {
  blocks.push(
    fx(name, {
      before: `${PSEUDO_FILL} ${beforeIdle}`,
      after: `${PSEUDO_FILL} ${afterIdle}`,
      beforeActive,
      afterActive,
    }),
  );
}
shutter(
  'shutter-in-horizontal',
  'transform:scaleX(1);transform-origin:100% 50%;',
  'transform:scaleX(1);transform-origin:0 50%;left:50%;',
  'transform:scaleX(0);',
  'transform:scaleX(0);',
);
shutter(
  'shutter-out-horizontal',
  'transform:scaleX(0);transform-origin:100% 50%;',
  'transform:scaleX(0);transform-origin:0 50%;left:50%;',
  'transform:scaleX(1);',
  'transform:scaleX(1);',
);
shutter(
  'shutter-in-vertical',
  'transform:scaleY(1);transform-origin:50% 100%;',
  'transform:scaleY(1);transform-origin:50% 0;top:50%;',
  'transform:scaleY(0);',
  'transform:scaleY(0);',
);
shutter(
  'shutter-out-vertical',
  'transform:scaleY(0);transform-origin:50% 100%;',
  'transform:scaleY(0);transform-origin:50% 0;top:50%;',
  'transform:scaleY(1);',
  'transform:scaleY(1);',
);

// —— Icons (motion on self; use on icon wrappers) ——
const iconMap = [
  ['icon-back', 'transition-duration:.3s;transition-property:transform;', 'transform:translateX(-6px);'],
  ['icon-forward', 'transition-duration:.3s;transition-property:transform;', 'transform:translateX(6px);'],
  ['icon-down', 'transition-duration:.3s;transition-property:transform;', 'transform:translateY(6px);'],
  ['icon-up', 'transition-duration:.3s;transition-property:transform;', 'transform:translateY(-6px);'],
  ['icon-grow', 'transition-duration:.3s;transition-property:transform;', 'transform:scale(1.3);'],
  ['icon-shrink', 'transition-duration:.3s;transition-property:transform;', 'transform:scale(0.8);'],
  ['icon-float', 'transition-duration:.3s;transition-property:transform;', 'transform:translateY(-6px);'],
  ['icon-sink', 'transition-duration:.3s;transition-property:transform;', 'transform:translateY(6px);'],
  ['icon-rotate', 'transition-duration:.3s;transition-property:transform;', 'transform:rotate(90deg);'],
  ['icon-grow-rotate', 'transition-duration:.3s;transition-property:transform;', 'transform:scale(1.3) rotate(90deg);'],
  ['icon-fade', 'transition-duration:.3s;transition-property:opacity;', 'opacity:0;'],
];
for (const [n, b, a] of iconMap) blocks.push(fx(n, { base: b, active: a }));
blocks.push(fx('icon-spin', { active: 'transition-duration:1s;transform:rotate(360deg);' }));
blocks.push(fx('icon-drop', { active: 'animation-name:fibo-fx-icon-drop;animation-duration:.5s;animation-timing-function:ease-out;animation-iteration-count:1;animation-fill-mode:forwards;' }));
blocks.push(fx('icon-float-away', { base: 'transition-duration:.3s;transition-property:transform,opacity;', active: 'transform:translateY(-12px);opacity:0;' }));
blocks.push(fx('icon-sink-away', { base: 'transition-duration:.3s;transition-property:transform,opacity;', active: 'transform:translateY(12px);opacity:0;' }));
blocks.push(fx('icon-pulse', { active: 'animation-name:fibo-fx-pulse;animation-duration:1s;animation-timing-function:linear;animation-iteration-count:infinite;' }));
blocks.push(fx('icon-pulse-grow', { active: 'animation-name:fibo-fx-pulse-grow;animation-duration:.3s;animation-timing-function:linear;animation-iteration-count:infinite;animation-direction:alternate;' }));
blocks.push(fx('icon-pulse-shrink', { active: 'animation-name:fibo-fx-pulse-shrink;animation-duration:.3s;animation-timing-function:linear;animation-iteration-count:infinite;animation-direction:alternate;' }));
blocks.push(fx('icon-push', { active: 'animation-name:fibo-fx-push;animation-duration:.3s;animation-iteration-count:1;' }));
blocks.push(fx('icon-pop', { active: 'animation-name:fibo-fx-pop;animation-duration:.3s;animation-iteration-count:1;' }));
blocks.push(fx('icon-bounce', { active: 'animation-name:fibo-fx-bounce-in;animation-duration:.5s;animation-iteration-count:1;' }));
blocks.push(fx('icon-bob', { active: 'animation-name:fibo-fx-icon-bob;animation-duration:.75s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;' }));
blocks.push(fx('icon-hang', { active: 'animation-name:fibo-fx-icon-hang;animation-duration:.75s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;' }));
blocks.push(fx('icon-wobble-horizontal', { active: 'animation-name:fibo-fx-wobble-h;animation-duration:1s;animation-iteration-count:1;' }));
blocks.push(fx('icon-wobble-vertical', { active: 'animation-name:fibo-fx-wobble-v;animation-duration:1s;animation-iteration-count:1;' }));
blocks.push(fx('icon-buzz', { active: 'animation-name:fibo-fx-icon-buzz;animation-duration:.15s;animation-iteration-count:infinite;' }));
blocks.push(fx('icon-buzz-out', { active: 'animation-name:fibo-fx-buzz-out;animation-duration:.75s;animation-iteration-count:1;' }));

// —— Border ——
blocks.push(fx('border-fade', {
  base: 'transition-duration:.3s;transition-property:box-shadow;box-shadow:inset 0 0 0 4px var(--fibo-fx-fill,currentColor);',
  active: 'box-shadow:inset 0 0 0 4px transparent;',
}));
blocks.push(fx('hollow', {
  base: 'transition-duration:.3s;transition-property:background,box-shadow;box-shadow:inset 0 0 0 4px var(--fibo-fx-fill,currentColor);',
  active: 'background:transparent;box-shadow:inset 0 0 0 4px var(--fibo-fx-fill,currentColor);',
}));
blocks.push(fx('trim', {
  before: `content:"";position:absolute;inset:4px;border:2px solid transparent;transition-duration:.3s;`,
  beforeActive: 'border-color:var(--fibo-fx-fill,currentColor);',
  base: 'position:relative;',
}));
blocks.push(fx('ripple-out', {
  base: 'position:relative;',
  before: `content:"";position:absolute;border:var(--fibo-fx-fill,currentColor) solid 4px;top:0;right:0;bottom:0;left:0;opacity:1;`,
  beforeActive: 'animation-name:fibo-fx-ripple-out;animation-duration:1s;animation-iteration-count:1;',
}));
blocks.push(fx('ripple-in', {
  base: 'position:relative;',
  before: `content:"";position:absolute;border:var(--fibo-fx-fill,currentColor) solid 4px;top:-12px;right:-12px;bottom:-12px;left:-12px;opacity:0;`,
  beforeActive: 'animation-name:fibo-fx-ripple-in;animation-duration:1s;animation-iteration-count:1;',
}));
blocks.push(fx('outline-out', {
  base: 'position:relative;',
  before: `content:"";position:absolute;inset:0;border:2px solid transparent;transition-duration:.3s;`,
  beforeActive: 'inset:-8px;border-color:var(--fibo-fx-fill,currentColor);',
}));
blocks.push(fx('outline-in', {
  base: 'position:relative;',
  before: `content:"";position:absolute;inset:-8px;border:2px solid transparent;transition-duration:.3s;`,
  beforeActive: 'inset:0;border-color:var(--fibo-fx-fill,currentColor);',
}));
blocks.push(fx('round-corners', {
  base: 'transition-duration:.3s;transition-property:border-radius;',
  active: 'border-radius:1em;',
}));

function line(name, pos, origin, scaleProp) {
  const idle = scaleProp === 'X' ? 'scaleX(0)' : 'scaleY(0)';
  const place =
    pos === 'underline'
      ? 'left:0;right:0;bottom:0;height:2px;top:auto;'
      : 'left:0;right:0;top:0;height:2px;bottom:auto;';
  blocks.push(
    fx(name, {
      base: 'position:relative;',
      before: `content:"";position:absolute;${place}background:var(--fibo-fx-fill,currentColor);transform:${idle};transform-origin:${origin};transition-duration:.3s;`,
      beforeActive: 'transform:scaleX(1) scaleY(1);',
    }),
  );
}
line('underline-from-left', 'underline', '0 50%', 'X');
line('underline-from-center', 'underline', '50% 50%', 'X');
line('underline-from-right', 'underline', '100% 50%', 'X');
line('overline-from-left', 'overline', '0 50%', 'X');
line('overline-from-center', 'overline', '50% 50%', 'X');
line('overline-from-right', 'overline', '100% 50%', 'X');

blocks.push(fx('reveal', {
  base: 'position:relative;',
  before: `content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--fibo-fx-fill,currentColor);transform:scaleX(0);transform-origin:100% 50%;transition-duration:.3s;`,
  beforeActive: 'transform:scaleX(1);transform-origin:0 50%;',
}));
blocks.push(fx('underline-reveal', {
  base: 'position:relative;',
  before: `content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--fibo-fx-fill,currentColor);transform:scaleX(0);transform-origin:100% 50%;transition-duration:.3s;`,
  beforeActive: 'transform:scaleX(1);transform-origin:0 50%;',
}));
blocks.push(fx('overline-reveal', {
  base: 'position:relative;',
  before: `content:"";position:absolute;left:0;right:0;top:0;height:2px;background:var(--fibo-fx-fill,currentColor);transform:scaleX(0);transform-origin:100% 50%;transition-duration:.3s;`,
  beforeActive: 'transform:scaleX(1);transform-origin:0 50%;',
}));

// —— Shadow ——
blocks.push(fx('shadow-grow', { base: 'transition-duration:.3s;transition-property:box-shadow;', active: 'box-shadow:0 10px 10px -10px rgba(0,0,0,.5);' }));
blocks.push(fx('shadow-float', { base: 'transition-duration:.3s;transition-property:transform,box-shadow;', active: 'transform:translateY(-6px);box-shadow:0 12px 16px -8px rgba(0,0,0,.4);' }));
blocks.push(fx('shadow-glow', { base: 'transition-duration:.3s;transition-property:box-shadow;', active: 'box-shadow:0 0 12px 4px rgba(255,255,255,.25);' }));
blocks.push(fx('shadow-radial', {
  base: 'position:relative;',
  after: `content:"";position:absolute;z-index:-1;inset:0;border-radius:inherit;opacity:0;box-shadow:0 0 0 12px transparent;transition-duration:.3s;`,
  afterActive: 'opacity:1;box-shadow:0 0 0 12px rgba(127,127,127,.15);',
}));
blocks.push(fx('box-shadow-outset', { base: 'transition-duration:.3s;transition-property:box-shadow;', active: 'box-shadow:2px 2px 4px rgba(0,0,0,.4);' }));
blocks.push(fx('box-shadow-inset', { base: 'transition-duration:.3s;transition-property:box-shadow;', active: 'box-shadow:inset 2px 2px 4px rgba(0,0,0,.4);' }));
blocks.push(fx('lift', { base: 'transition-duration:.25s;transition-property:transform,box-shadow;transition-timing-function:ease-out;', active: 'transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.18);' }));
blocks.push(fx('glow', { base: 'transition-duration:.25s;transition-property:box-shadow;', active: 'box-shadow:0 0 0 3px rgba(255,255,255,.16);' }));

// —— Bubbles (set data-fibo-bubble="Tip" on the host) ——
const bubbleBase =
  'padding:0.5em 1em;background:var(--fibo-fx-fill,#333);color:var(--fibo-fx-ink,#fff);border-radius:4px;white-space:nowrap;opacity:0;pointer-events:none;transition-duration:.3s;font-size:12px;z-index:2;';
blocks.push(fx('bubble-top', {
  base: 'position:relative;',
  after: `content:attr(data-fibo-bubble);position:absolute;bottom:100%;left:50%;transform:translateX(-50%) translateY(-8px);${bubbleBase}`,
  afterActive: 'opacity:1;',
}));
blocks.push(fx('bubble-right', {
  base: 'position:relative;',
  after: `content:attr(data-fibo-bubble);position:absolute;left:100%;top:50%;transform:translateY(-50%) translateX(8px);${bubbleBase}`,
  afterActive: 'opacity:1;',
}));
blocks.push(fx('bubble-bottom', {
  base: 'position:relative;',
  after: `content:attr(data-fibo-bubble);position:absolute;top:100%;left:50%;transform:translateX(-50%) translateY(8px);${bubbleBase}`,
  afterActive: 'opacity:1;',
}));
blocks.push(fx('bubble-left', {
  base: 'position:relative;',
  after: `content:attr(data-fibo-bubble);position:absolute;right:100%;top:50%;transform:translateY(-50%) translateX(-8px);${bubbleBase}`,
  afterActive: 'opacity:1;',
}));
blocks.push(fx('bubble-float-top', {
  base: 'position:relative;',
  after: `content:attr(data-fibo-bubble);position:absolute;bottom:100%;left:50%;transform:translateX(-50%) translateY(0);${bubbleBase}`,
  afterActive: 'opacity:1;transform:translateX(-50%) translateY(-10px);',
}));
blocks.push(fx('bubble-float-right', {
  base: 'position:relative;',
  after: `content:attr(data-fibo-bubble);position:absolute;left:100%;top:50%;transform:translateY(-50%) translateX(0);${bubbleBase}`,
  afterActive: 'opacity:1;transform:translateY(-50%) translateX(10px);',
}));
blocks.push(fx('bubble-float-bottom', {
  base: 'position:relative;',
  after: `content:attr(data-fibo-bubble);position:absolute;top:100%;left:50%;transform:translateX(-50%) translateY(0);${bubbleBase}`,
  afterActive: 'opacity:1;transform:translateX(-50%) translateY(10px);',
}));
blocks.push(fx('bubble-float-left', {
  base: 'position:relative;',
  after: `content:attr(data-fibo-bubble);position:absolute;right:100%;top:50%;transform:translateY(-50%) translateX(0);${bubbleBase}`,
  afterActive: 'opacity:1;transform:translateY(-50%) translateX(-10px);',
}));

// —— Curls ——
function curl(name, origin, rotate) {
  blocks.push(
    fx(name, {
      base: 'position:relative;transform-style:preserve-3d;',
      after: `content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(135deg,transparent 50%,rgba(0,0,0,.08) 50%);transform-origin:${origin};transition-duration:.3s;pointer-events:none;box-shadow:0 0 0 transparent;`,
      afterActive: `transform:rotate${rotate};box-shadow:-2px -2px 4px rgba(0,0,0,.15);`,
    }),
  );
}
curl('curl-top-left', '0 0', 'X(20deg)');
curl('curl-top-right', '100% 0', 'Y(-20deg)');
curl('curl-bottom-right', '100% 100%', 'X(-20deg)');
curl('curl-bottom-left', '0 100%', 'Y(20deg)');

const css = `/**
 * AUTO-GENERATED by scripts/gen-interaction-fx.mjs — do not edit by hand.
 * Fiboui-owned interaction effects (Hover.css–inspired names, not a vendor dump).
 */
export const FIBO_INTERACTION_FX_CSS = \`
${KEYFRAMES}

${BASE}

${blocks.join('\n\n')}

@media (prefers-reduced-motion: reduce) {
  .fibo-fx:not(.fibo-motion-force),
  .fibo-fx:not(.fibo-motion-force)::before,
  .fibo-fx:not(.fibo-motion-force)::after {
    animation: none !important;
    transition: none !important;
  }
}
\`.trim();
`;

const out = resolve(__dirname, '../src/core/interactionFxCss.ts');
writeFileSync(out, css);
console.log('wrote', out, 'bytes', css.length);
