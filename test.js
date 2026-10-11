import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createSSRApp, h } from 'vue';
import { renderToString as vueToString } from 'vue/server-renderer';
import { avatar } from './dist/index.js';
import { Avatar as ReactAvatar } from './dist/react.js';
import { Avatar as VueAvatar } from './dist/vue.js';

assert.strictEqual(avatar('alice'), avatar('alice'));
assert.strictEqual(avatar(42), avatar('42'));
assert.match(avatar('x'), /^<svg [^>]*viewBox="0 0 100 100"><circle/);
assert.match(avatar('x', 'square'), /><rect /);
assert.strictEqual(avatar('x').slice(-200), avatar('x', 'square').slice(-200)); // shape doesn't change the face
const unique = new Set(Array.from({ length: 100 }, (_, i) => avatar('user' + i)));
assert.ok(unique.size >= 90, `only ${unique.size} unique of 100`);
assert.ok(!avatar('x').includes('<style>'), 'no animation CSS unless asked');
assert.match(avatar('x', 'circle', { blink: true }), /class="pf-b">.*animation-delay/);
assert.match(avatar('x', 'circle', { spin: true }), /class="pf-s"><style>/);

// wrappers render the same SVG as the core
const svg = avatar('x', 'square', { blink: true });
assert.ok(renderToString(createElement(ReactAvatar, { seed: 'x', shape: 'square', blink: true, className: 'a' })).includes(svg));
assert.ok((await vueToString(createSSRApp({ render: () => h(VueAvatar, { seed: 'x', shape: 'square', blink: true }) }))).includes(svg));
// Angular must ship partially compiled so consumer apps can link it
assert.match(readFileSync('dist/angular.js', 'utf8'), /ɵɵngDeclareComponent/);
console.log('ok');
