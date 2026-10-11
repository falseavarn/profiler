import assert from 'node:assert';
import { avatar } from './index.js';

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
console.log('ok');
