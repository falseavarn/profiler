# Collaboration guide

Thanks for helping grow the face set. The whole face generator is [src/index.ts](src/index.ts), and most contributions are a single new line in one of its feature tables. The framework components in `src/react.ts`, `src/vue.ts` and `src/angular.ts` are thin wrappers and rarely need changes.

## How it works

1. The seed is hashed with FNV-1a, and the hash seeds a `mulberry32` random number generator.
2. The generator picks one entry from each table, always in this order: `BG, HAIR, BROWS, EYES, NOSE, MOUTH, CHEEKS`.
3. The picked fragments are joined inside one `<g>` that sets the shared line style: no fill, `#1f3a4d` stroke, width 2.5, round caps and joins.

Every option in a table must therefore look right next to every option in every other table.

## Adding a face feature option

Append an entry to the relevant table. Use the `p(d)` helper for a single path, or write raw SVG for `<circle>`, `<rect>` and so on. Don't set `fill`, `stroke` or `stroke-width`; they come from the parent group.

```js
const MOUTH = [
  // ...existing
  p('M40 72q10 -6 20 0'),   // smirk  ← new option
];
```

Draw inside the 100×100 face, and keep to the zone that feature already uses so it doesn't collide with other parts:

| Feature | Zone (y) | Notes |
|---|---|---|
| Hair | 6–30 | Stay inside the circle: at y=20 the edge is at x≈10 and x≈90 |
| Brows | 37–40 | Two strokes, centered over x=36 and x=64 |
| Eyes | 42–54 | Centered at (36, 48) and (64, 48), radius ≤ 6 |
| Nose | 50–62 | Centered on x=50 |
| Cheeks | 57–60 | Below the eyes, outside x=46–54 so they don't meet the nose |
| Mouth | 69–83 | Leave a gap of about 7 units below the nose |

An empty string `''` is a valid option and means "none" (see `BROWS` and `CHEEKS`).

### Effect hooks

- **Eyes** sit inside `<g class="pf-look"><g class="pf-blink">…</g></g>`. `follow()` moves the outer group and `blink` squashes the inner one around y=48, so new eye shapes get both effects for free if they're centered on y=48.
- **Spinning eyes**: give each eye its own element with `class="pf-swirl"`. Each eye rotates around the center of its own bounding box, so draw it symmetric about that center.

## Adding a background color

Append it to `BG`. It must keep **at least 5:1 contrast** with the `#1f3a4d` line color. To check:

```sh
node -e "const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};console.log(((L(process.argv[1])+.05)/(L('#1f3a4d')+.05)).toFixed(1))" '#ff9ec4'
```

## Adding a new feature slot

For example, a slot for glasses or freckles:

1. Add a new table and **append it to the end** of the pick list in `avatar()`, after `CHEEKS`. Putting it at the end keeps the earlier picks, and so every existing face, unchanged.
2. Insert its fragment into the template in the right drawing order (later elements paint on top).
3. Include `''` as an option if some faces shouldn't have it.

## Seed stability (please read)

Users rely on a seed always producing the same face.

| Change | Effect on existing seeds |
|---|---|
| Append a new slot at the end of the pick list | None |
| Change the shape of an existing option | That option looks different everywhere it's used |
| Add or remove options in an existing table | **Many seeds change that feature**, because the pick depends on table length |
| Reorder tables or options | **Most faces change** |

Changing table lengths or order is a breaking change. Call it out in the commit message and bump the major version.

## Updating the demo seeds

`SEEDS` in [demo.html](demo.html) is a list of 30 sample names that together show every option. After changing a table length, check that the list still covers everything. Keep `N` in sync with the table lengths, in pick order:

```sh
node -e "
const N=[12,6,4,2,3,6,2], F='BG HAIR BROWS EYES NOSE MOUTH CHEEKS'.split(' ');
const idx=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.codePointAt(0),16777619);const r=()=>{h=(h+0x6d2b79f5)|0;let t=Math.imul(h^(h>>>15),1|h);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};return N.map(n=>(r()*n)|0)};
const seeds=JSON.parse(require('fs').readFileSync('demo.html','utf8').match(/SEEDS = (\[[^\]]*\])/)[1].replace(/'/g,'\"'));
const cov=N.map(()=>new Set());seeds.forEach(s=>idx(s).forEach((v,f)=>cov[f].add(v)));
N.forEach((n,f)=>{const miss=[...Array(n).keys()].filter(i=>!cov[f].has(i));console.log(F[f],miss.length?'missing option(s) '+miss:'ok')})"
```

If something is missing, swap names in the list until every line prints `ok`.

## Before opening a PR

1. Run `npm test`. It builds `dist/` and must print `ok`.
2. Run `npx serve .`, open `/demo.html` and check your change in every shape (circle, square, rounded, wide) at small (32px) and large (256px) sizes, with each effect on.
3. Keep the library free of runtime dependencies and small (check the sizes `npm run build` prints). Each new option is one table entry, not new logic.
4. Write commit messages with a short imperative subject line and a body explaining why, and mention any seed-stability impact.

## Credits

The visual style is inspired by **Faces Faces** on Dribbble:
https://dribbble.com/shots/2583723-faces-faces
