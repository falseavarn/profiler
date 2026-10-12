// Seeded placeholder avatars as plain SVG strings. All shapes live in a 100x100 viewBox.
const p = (d: string) => `<path d="${d}"/>`;

// all keep >= 5:1 contrast with the #1f3a4d line color
const BG = ['#b0bec5', '#ffd966', '#ff8a5c', '#00e0a4', '#94a3ff', '#7fd8ff',
  '#ff9ec4', '#c9a3ff', '#ffc09f', '#c5e86c', '#5fd3c6', '#e8d5b0'];
const HAIR = [
  p('M30 10v14M40 7v16M50 6v17M60 7v16M70 10v14'),       // crew-cut strokes
  p('M19 22q4.5-5 9 0t9 0t9 0t9 0t9 0t9 0t9 0'),          // scallop
  p('M16 30Q35 18 50 14Q65 18 84 30'),                    // center part
  p('M18 24l8-7 8 7 8-7 8 7 8-7 8 7 8-7 8 7'),            // zigzag
  p('M18 22q8-6 16 0t16 0t16 0t16 0'),                    // wavy crest
  p('M17 28C35 30 50 22 58 14Q70 16 82 26'),              // side sweep
];
const BROWS = [
  '',
  p('M31 39h10M59 39h10'),
  p('M31 40q5-4 10 0M59 40q5-4 10 0'),
  p('M30 37q6-7 12 0M58 37q6-7 12 0'),
];
const EYES = [
  '<circle cx="36" cy="48" r="4.5"/><circle cx="64" cy="48" r="4.5"/>',
  // inward spiral of shrinking half-arcs; one path per eye so each spins around its own center
  '<path class="pf-swirl" d="M42 48a6 6 0 0 0-12 0a4 4 0 0 0 8 0a2 2 0 0 0-4 0"/><path class="pf-swirl" d="M58 48a6 6 0 0 1 12 0a4 4 0 0 1-8 0a2 2 0 0 1 4 0"/>',
];
const NOSE = [
  p('M46 56q4 3 8 0'),
  p('M46 59q4-6 8 0'),
  '<rect x="46" y="50" width="8" height="12" rx="4"/>',
];
const MOUTH = [
  p('M38 71h24a12 12 0 0 1-24 0z'),                       // open D
  p('M36 71q14 10 28 0'),                                 // line smile
  p('M42 71q8 5 16 0M46 79q4 2 8 0'),                     // smile + chin
  p('M38 69q12 6 24 0c4 6 0 12-12 12s-16-6-12-12z'),      // wide loop
  '<rect x="42" y="69" width="16" height="10" rx="5"/>',  // capsule
  p('M44 71h12a6 6 0 0 1-12 0z'),                         // small D
];
const CHEEKS = ['', p('M26 60l3-3M30 60l3-3M34 60l3-3M64 60l3-3M68 60l3-3M72 60l3-3')];

// Scoped by root classes (pf-b / pf-s) because inline <style> applies page-wide.
const CSS = '<style>@media (prefers-reduced-motion:no-preference){' +
  '.pf-b .pf-blink{transform-origin:50px 48px;animation:pf-blink 4s infinite}' +
  '@keyframes pf-blink{0%,92%,100%{transform:none}96%{transform:scaleY(.1)}}' +
  '.pf-s .pf-swirl{transform-box:fill-box;transform-origin:center;animation:pf-spin 3s linear infinite}' +
  '@keyframes pf-spin{to{transform:rotate(1turn)}}}</style>';

/** 'square' fills any container aspect (oversized background), face stays centered. */
export type Shape = 'circle' | 'square';

/** CSS animations, off by default. `spin` only affects swirl eyes. */
export interface Effects {
  /** Eyes blink every few seconds, out of sync between avatars. */
  blink?: boolean;
  /** Swirl eyes rotate. */
  spin?: boolean;
}

/** Same seed, same face. Returns SVG markup; the seed is hashed, never echoed into it. */
export function avatar(seed: string | number, shape: Shape = 'circle', { blink, spin }: Effects = {}): string {
  // FNV-1a hash -> mulberry32 PRNG
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
  const rand = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (a: string[]) => a[(rand() * a.length) | 0];
  const [bg, hair, brows, eyes, nose, mouth, cheeks] = [BG, HAIR, BROWS, EYES, NOSE, MOUTH, CHEEKS].map(pick);
  const fx = (blink ? ' pf-b' : '') + (spin ? ' pf-s' : '');
  // negative delay so blinking avatars don't blink in sync
  const delay = blink ? ` style="animation-delay:-${(rand() * 4).toFixed(2)}s"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${fx ? ` class="${fx.trim()}">${CSS}` : '>'}${shape == 'square' ? '<rect x="-950" y="-950" width="2000" height="2000"' : '<circle cx="50" cy="50" r="50"'} fill="${bg}"/><g fill="none" stroke="#1f3a4d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${hair}${brows}<g class="pf-look"><g class="pf-blink"${delay}>${eyes}</g></g>${nose}${mouth}${cheeks}</g></svg>`;
}

/** Eyes of inline-SVG avatars under root follow the pointer. Returns a stop function. */
export function follow(root: ParentNode = document): () => void {
  let raf = 0, x = 0, y = 0;
  const update = () => {
    raf = 0;
    for (const g of root.querySelectorAll<SVGGElement>('.pf-look')) {
      const r = g.ownerSVGElement!.getBoundingClientRect();
      const dx = x - r.left - r.width / 2, dy = y - r.top - r.height / 2;
      const k = Math.min(1.5, Math.hypot(dx, dy) / 100) / (Math.hypot(dx, dy) || 1); // max 1.5 units
      g.setAttribute('transform', `translate(${(dx * k).toFixed(2)} ${(dy * k).toFixed(2)})`);
    }
  };
  const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; raf ||= requestAnimationFrame(update); };
  addEventListener('pointermove', move);
  return () => {
    removeEventListener('pointermove', move);
    cancelAnimationFrame(raf);
    for (const g of root.querySelectorAll('.pf-look')) g.removeAttribute('transform');
  };
}
