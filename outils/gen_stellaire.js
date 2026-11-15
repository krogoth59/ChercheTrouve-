// Génère les planches vectorielles de la catégorie « Guerre stellaire » (univers original).
// Trois races : l'Essaim (marron), les Exos (orange), les Humains (bleu).
// Usage : node outils/gen_stellaire.js <dossier du jeu>
// Écrit img/s01.svg, img/s02.svg, img/s03.svg et injecte la liste des objets dans index.html.
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2] || '.';

function rng32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let R = rng32(1);
const rnd = (a, b) => a + (b - a) * R();
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(R() * a.length)];
const f1 = n => Math.round(n * 10) / 10;

const OUT = '#1c1222';
const ol = (w = 1.6, c = OUT) => ` stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const st = (c, w) => ` stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`; // à utiliser avec fill 'none'
const op = o => ` opacity="${o}"`;
const P = (d, f, x = '') => `<path d="${d}" fill="${f}"${x}/>`;
const C = (cx, cy, r, f, x = '') => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${f}"${x}/>`;
const E = (cx, cy, rx, ry, f, x = '') => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${f}"${x}/>`;
const Rc = (x, y, w, h, f, rx = 0, xx = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="${f}"${xx}/>`;
const L = (x1, y1, x2, y2, c, w) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const LO = (x1, y1, x2, y2, c, w) => L(x1, y1, x2, y2, OUT, w + 2.4) + L(x1, y1, x2, y2, c, w); // trait avec contour
const PO = (d, c, w) => P(d, 'none', st(OUT, w + 2.4)) + P(d, 'none', st(c, w)); // chemin avec contour
const T = (x, y, inner, attrs = '') => `<g transform="translate(${f1(x)} ${f1(y)})"${attrs}>${inner}</g>`;
const G = (x, y, s, rot, inner, flip) => `<g transform="translate(${f1(x)} ${f1(y)})${rot ? ` rotate(${f1(rot)})` : ''} scale(${(flip ? -s : s).toFixed(3)} ${s.toFixed(3)})">${inner}</g>`;
function blob(rx, ry, n = 9, j = .25, cx = 0, cy = 0){
  const pts = [];
  for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2, k = 1 + rnd(-j, j); pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  let d = '';
  for (let i = 0; i < n; i++){
    const p = pts[i], q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    if (i === 0){ const pm = pts[n - 1]; d += `M${f1((pm[0] + p[0]) / 2)} ${f1((pm[1] + p[1]) / 2)}`; }
    d += ` Q${f1(p[0])} ${f1(p[1])} ${f1(m[0])} ${f1(m[1])}`;
  }
  return d + 'Z';
}
const poly = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L') + 'Z';
function shade(hex, k){
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
  const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
}
function star(n, r1, r2, rot = -Math.PI / 2){ const p = []; for (let i = 0; i < n * 2; i++){ const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1; p.push([Math.cos(a) * r, Math.sin(a) * r]); } return poly(p); }
function ridge(W, y0, amp, step, jit){ let d = `M0 ${y0}`; for (let x = 0; x <= W + step; x += step) d += ` L${x} ${f1(y0 - rnd(0, amp) - (R() < jit ? rnd(amp * .5, amp * 1.4) : 0))}`; return d + ` L${W} ${y0 + 400} L0 ${y0 + 400}Z`; }
function stars(W, h, n){ let s = ''; for (let i = 0; i < n; i++) s += C(rnd(0, W), rnd(0, h), rnd(.8, 2.4), '#fff', op(rnd(.3, .9).toFixed(2))); return s; }
// dégradés partagés par toutes les planches (feu, lueurs, fumée)
const DEFS = `<defs>
<radialGradient id="gF"><stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="#ffb030"/><stop offset=".7" stop-color="#ff5a1a" stop-opacity=".7"/><stop offset="1" stop-color="#ff3a0a" stop-opacity="0"/></radialGradient>
<radialGradient id="gO"><stop offset="0" stop-color="#ffcf6a" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient>
<radialGradient id="gC"><stop offset="0" stop-color="#bff8ff" stop-opacity=".9"/><stop offset="1" stop-color="#5fe8ff" stop-opacity="0"/></radialGradient>
<radialGradient id="gG"><stop offset="0" stop-color="#d8ff9a" stop-opacity=".9"/><stop offset="1" stop-color="#8fe03a" stop-opacity="0"/></radialGradient>
<radialGradient id="gP"><stop offset="0" stop-color="#ffc8f2" stop-opacity=".9"/><stop offset="1" stop-color="#ff5ad8" stop-opacity="0"/></radialGradient>
<radialGradient id="gS"><stop offset="0" stop-color="#5a5650" stop-opacity=".85"/><stop offset=".7" stop-color="#5a5650" stop-opacity=".45"/><stop offset="1" stop-color="#5a5650" stop-opacity="0"/></radialGradient>
</defs>`;
const boom = r => C(0, 0, r, 'url(#gF)') + P(star(9, r * .62, r * .32), '#ffb030', op('.9')) + P(star(7, r * .38, r * .2, 0.3), '#ffe48a') + C(0, 0, r * .16, '#fff8e0');
const smoke = (n, r, dx, dy) => { let s = ''; for (let i = 0; i < n; i++) s += C(dx * i + rnd(-r * .3, r * .3), dy * i, r * (1 + i * .25), 'url(#gS)'); return s; };

// =====================================================================================
// RACE 1 : L'ESSAIM (marron) — assaut d'une ville en ruines
// =====================================================================================
const BONE = '#f0e6c8', BR = '#8a6538', BR2 = '#5e4222', BR3 = '#b58a52', GR = '#8fe03a', MG = '#d84ac8', EYE = '#ffd23a', MAW = '#5a1a1a';
const CON = '#7a7e86', CON2 = '#5a5e66';
function jawTeeth(){ let s = ''; for (const a of [25, 50, 75, 105, 130, 155]){ const t = a * Math.PI / 180, x = 12 * Math.cos(t), y = -8 + 16 * Math.sin(t); const dx = -x * .35, dy = (-2 - y) * .35; const nx = -Math.sin(t) * 2.2, ny = Math.cos(t) * 2.2; s += P(poly([[x + nx, y + ny], [x - nx, y - ny], [x + dx, y + dy]]), '#fffaf0', ol(1)); } return s; }
const brown = () => pick([BR, '#94703e', '#7a5a30', '#a07a44']);
const ESS = {
  name: "Assaut de l'Essaim", sub: "Race : l'Essaim", mood: 'night', bonus: 'spores bleues', bonusN: 9, seed: 7101,
  targets: [
    ['un œuf luisant', () => C(0, 2, 21, '#c8f04a', op('.22')) + E(0, 3, 12, 16, '#b9ea3c', ol()) + E(-4, -3, 3.5, 6, '#f3ffb8') + P('M-7 10 Q0 3 7 12', 'none', st('#5f8f12', 1.2))],
    ['une larve', () => { let s = ''; [[-14, 4, 6], [-7, 2, 7], [0, 1, 7.5], [7, 2, 7]].forEach(([x, y, r]) => s += E(x, y, r * .8, r, '#f0dfbf', ol(1.3))); return s + P('M18 -3 L23 -7 M18 3 L23 6', 'none', st(OUT, 1.8)) + C(14, 0, 6.5, '#b07a4e', ol(1.3)) + C(15, -2, 1.4, OUT); }],
    ['un casque de soldat', () => P('M-16 6 Q-17 -17 0 -17 Q17 -17 16 6 Z', '#2f6be0', ol()) + P('M-12 -6 H12 Q13 2 10 4 H-10 Q-13 2 -12 -6Z', '#ffb52e', ol(1.2)) + P('M-9 -3 H-2', 'none', st('#fff3c0', 2)) + Rc(-19, 5, 38, 6, '#1c3f96', 2, ol())],
    ["une griffe d'os", () => P('M-12 16 Q-16 -4 12 -19 Q4 -4 5 16 Z', BONE, ol()) + P('M-6 13 Q-8 0 7 -12', 'none', st('#c9b892', 2)) + Rc(-15, 13, 23, 6, BR2, 2, ol())],
    ['un cocon violet', () => P('M0 -21 Q14 -8 0 21 Q-14 -8 0 -21Z', '#9b3fc0', ol()) + P('M-6 -10 Q0 -4 6 -10 M-8 0 Q0 6 8 0 M-6 10 Q0 15 6 10', 'none', st('#d79bf0', 1.6)) + E(-3, -8, 2, 5, '#e6c2f7')],
    ['un œil sur pédoncule', () => PO('M-2 21 Q-8 6 1 -6', BR3, 5) + C(2, -11, 9.5, '#fff7e8', ol()) + C(4, -11, 5.5, '#ff8a00') + E(4, -11, 1.5, 4.6, '#140a10') + C(1, -14, 2, '#fff')],
    ['une mâchoire', () => P('M-18 -8 Q-18 18 0 18 Q18 18 18 -8 L12 -8 Q12 8 0 8 Q-12 8 -12 -8Z', BONE, ol()) + jawTeeth()],
    ['un cristal bleu', () => P('M-6 18 L-15 2 L-10 -2 L-4 10Z', '#5aa0ff', ol()) + P('M4 18 L10 0 L15 6 L12 18Z', '#2f6fd6', ol()) + P('M-2 18 L-8 -4 L-2 -20 L4 -4 Z', '#3d8bff', ol()) + P('M-2 -20 L4 -4 L-2 18Z', '#8fc0ff') + Rc(-17, 16, 34, 5, BR2, 2, ol())],
    ['un baril toxique', () => Rc(-12, -17, 24, 34, '#f2c230', 4, ol()) + Rc(-12, -9, 24, 3, '#2a2020') + Rc(-12, 6, 24, 3, '#2a2020') + P(star(3, 5, 1.5), '#2a2020') + Rc(-9, -15, 3, 30, '#fff3b0', 1, op('.5')) + P('M-12 12 Q-15 18 -10 21 Q-7 16 -9 12Z', '#7dff4a', ol(1))],
    ['un scarabée doré', () => { let s = ''; for (const y of [-4, 3, 10]) s += L(-8, y, -17, y - 5, OUT, 2.2) + L(8, y, 17, y - 5, OUT, 2.2); return s + L(-2, -15, -7, -21, OUT, 1.6) + L(2, -15, 7, -21, OUT, 1.6) + C(0, -12, 5.5, '#7a5a10', ol()) + E(0, 3, 10.5, 13.5, '#e8b422', ol()) + L(0, -10, 0, 16, '#7a5a10', 1.4) + E(-4, -2, 2.5, 5, '#fff1a8'); }],
    ["une fiole d'échantillon", () => Rc(-6, 0, 12, 16, '#5de05d', 5) + Rc(-6, -12, 12, 28, '#d9f4ff', 5, ol() + ' fill-opacity=".35"') + Rc(-5, -19, 10, 8, '#9a6a3a', 2, ol()) + L(-3, -8, -3, 12, '#fff', 1.5)],
    ['un crâne', () => P('M-13 2 Q-15 -17 0 -17 Q15 -17 13 2 L9 6 V13 H-9 V6 Z', '#f2ecdc', ol()) + E(-5.5, -3, 4, 4.5, '#2a1a22') + E(5.5, -3, 4, 4.5, '#2a1a22') + P('M0 3 L-2 7 H2Z', '#2a1a22') + L(-4.5, 9, -4.5, 12.5, '#2a1a22', 1.3) + L(0, 9, 0, 12.5, '#2a1a22', 1.3) + L(4.5, 9, 4.5, 12.5, '#2a1a22', 1.3)],
    ['une antenne radio', () => C(0, -20, 7, '#ff3b3b', op('.3')) + LO(-9, 18, 0, 0, '#9aa4a8', 2) + LO(9, 18, 0, 0, '#9aa4a8', 2) + LO(0, 18, 0, -10, '#9aa4a8', 2.5) + P('M-10 -12 Q0 -2 10 -12 Q0 -19 -10 -12Z', '#c9d1d4', ol()) + C(0, -20, 3, '#ff3b3b', ol(1))],
    ['une aile membraneuse', () => P('M-16 14 Q-18 -14 16 -18 Q8 -6 12 4 Q2 2 2 12 Q-6 8 -16 14Z', '#c0704a', ol() + ' fill-opacity=".92"') + P('M-16 14 L12 -14 M-10 8 L6 -6 M-14 10 L-2 -14 M-8 12 L8 6', 'none', st('#7a3a22', 1.2))],
  ],
  clutter: [
    // coureur : petite bête à quatre pattes, défenses en os
    () => { const c = brown(); return PO('M-13 1 Q-20 -2 -22 -8', c, 2) + PO('M-8 4 L-12 12 L-9 17', BR2, 2.4) + PO('M-2 5 L-4 13 L0 17', BR2, 2.4) + PO('M6 4 L8 12 L12 17', BR2, 2.4) + PO('M10 3 L14 10 L17 16', BR2, 2.4)
      + P('M-11 17 L-7 17 L-9 14Z M-1 17 L3 17 L1 14Z M10 17 L14 17 L12 14Z M15 16 L19 16 L17 13Z', BONE, ol(.8))
      + E(0, 0, 13, 8, c, ol()) + P('M-11 -2 Q0 -8 11 -3', 'none', st(shade(c, .3), 2)) + P('M-8 -6 L-10 -14 L-4 -7Z M-2 -8 L-2 -16 L3 -8Z M4 -7 L7 -14 L9 -6Z', BONE, ol(1))
      + E(14, 1, 7, 5.5, c, ol()) + P('M17 3 L22 5 L17 7Z', MAW) + C(16, -1, 1.5, EYE) + P('M12 -2 Q8 -14 -2 -14 Q8 -10 10 -1Z', BONE, ol(1.1)); },
    // cracheur : ver dressé avec sac d'acide
    () => { const c = brown(); let s = PO('M2 -2 L8 2 L12 0', BR2, 1.8); [[-14, 14], [-12, 6], [-8, 0], [-2, -4], [4, -8], [9, -12]].forEach(([x, y], i) => s += E(x, y, 7 - i * .4, 6 - i * .3, i % 2 ? c : shade(c, -.15), ol(1.2)));
      const sac = pick([GR, MG]); return s + E(-6, -5, 8, 7, sac === GR ? 'url(#gG)' : 'url(#gP)') + E(-6, -5, 5, 4, sac, ol(1)) + C(-7.5, -6.5, 1.4, '#fff') + E(14, -14, 7, 5.5, c, ol()) + P('M18 -11 L20 -6 L16 -10Z M14 -10 L15 -5 L12 -9Z', BONE, ol(.8)) + C(15, -16, 1.4, EYE) + P('M10 -18 L4 -25 L12 -20Z M14 -19 L12 -26 L17 -19Z', BONE, ol(1)); },
    // tique explosive : sac vert sur petites pattes
    () => { const sac = pick([GR, GR, MG]); let s = ''; for (const x of [-8, -3, 3, 8]) s += PO(`M${x} 6 L${f1(x * 1.4)} 16`, BR2, 2); return s + C(0, -2, 17, sac === GR ? 'url(#gG)' : 'url(#gP)') + C(0, -1, 12, sac, ol()) + P('M-8 -6 Q0 -12 8 -6', 'none', st('#ffffff', 2) + op('.6')) + C(-4, -5, 2.5, '#ffffff', op('.8')) + E(9, 6, 6, 4.5, BR, ol()) + C(11, 5, 1.2, EYE) + P('M8 -10 L4 -16 L10 -12Z M0 -12 L-2 -18 L3 -13Z', BONE, ol(.9)); },
    // scarabée cornu
    () => { const c = brown(); let s = ''; for (const x of [-9, -2, 5]) s += PO(`M${x} 4 L${x - 3} 12 L${x - 1} 17`, BR2, 2.4) + PO(`M${x + 3} 4 L${x + 6} 12 L${x + 8} 17`, BR2, 2.4);
      return s + P('M-16 6 Q-16 -14 2 -14 Q16 -12 16 4 Z', c, ol()) + P('M-12 0 Q-6 -10 6 -10', 'none', st(shade(c, .3), 2.5)) + P('M-14 5 H15', 'none', st(shade(c, -.35), 2)) + E(16, 2, 6, 5, shade(c, -.1), ol()) + P('M18 -1 Q24 -12 18 -20 Q20 -10 14 -2Z', BONE, ol(1.1)) + C(18, 1, 1.3, EYE) + P('M-12 -8 L-14 -16 L-8 -11Z M-4 -12 L-4 -20 L0 -13Z M4 -12 L7 -19 L8 -11Z', BONE, ol(1)); },
    // œufs coriaces
    () => { let s = ''; [[-8, 4], [7, 5], [-1, -4]].forEach(([x, y]) => s += E(x, y, 6.5, 8.5, pick(['#a07a50', '#8a6a44', '#b08a5e']), ol(1.3)) + P(`M${x - 3} ${y - 2} Q${x} ${y + 2} ${x + 3} ${y - 2}`, 'none', st(GR, 1.6))); return s; },
    // pics d'os
    () => { const h = rnd(.8, 1.2); return P(`M-7 14 Q-3 ${f1(-6 * h)} ${f1(rnd(-2, 6))} ${f1(-24 * h)} Q5 ${f1(-4 * h)} 8 14Z`, BONE, ol()) + P(`M-3 12 Q-1 0 1 ${f1(-12 * h)}`, 'none', st('#fff6dc', 1.6)) + P(`M8 14 L14 ${f1(-8 * h)} L14 14Z`, '#d8c8a0', ol(1.2)); },
    // bulbe de substrat
    () => PO('M0 16 Q-3 6 0 -2', BR2, 3) + C(0, -8, 13, 'url(#gP)') + C(0, -8, 8, MG, ol()) + C(-3, -11, 2.4, '#ffd0f4') + P(blob(16, 5, 7, .2, 0, 15), '#4a2a3a', ol(1.2)),
    // épave de char humain
    () => Rc(-20, 2, 40, 11, '#2a2c30', 5, ol()) + P('M-18 2 L-14 -6 H12 L19 2Z', '#3a4a6a', ol()) + P('M-8 -6 Q-8 -13 1 -13 Q9 -13 9 -6Z', '#3a4a6a', ol()) + LO(7, -10, 20, -18, '#2a2c30', 2.2) + P('M-14 -2 L-6 -4 L-2 0', 'none', st('#1a1a1a', 2)) + smoke(3, 7, 3, -9).replace(/<circle cx="(-?[\d.]+)" cy="(-?[\d.]+)"/g, (m, x, y) => `<circle cx="${x}" cy="${f1(+y - 14)}"`),
    // gravats de béton
    () => { let s = ''; for (let i = 0; i < 4; i++){ const x = rnd(-12, 12), y = rnd(-6, 8), w = rnd(8, 14), h = rnd(6, 10); s += `<g transform="rotate(${f1(rnd(-30, 30))} ${f1(x)} ${f1(y)})">${Rc(x - w / 2, y - h / 2, w, h, pick([CON, '#8a8e96', CON2]), 1, ol(1.2))}</g>`; } return s + PO('M-6 -4 L-12 -14 M4 -2 L10 -12', '#8a4a2a', 1.2); },
    // terrier
    () => E(0, 0, 20, 9, '#5a3a3a', ol()) + E(0, 1, 15, 6, '#140806') + P('M-14 -3 L-18 -12 L-10 -5Z M12 -4 L17 -12 L8 -6Z', BONE, ol(1)),
    // cratère en feu
    () => E(0, 8, 20, 7, '#2a1a14', ol(1.2)) + C(0, 0, 18, 'url(#gF)') + P('M-10 8 Q-8 -6 -4 0 Q-2 -14 2 -3 Q6 -12 8 1 Q10 -5 12 8Z', '#ff7a1a', ol(1.2)) + P('M-5 8 Q-3 0 0 3 Q2 -4 5 8Z', '#ffe48a'),
    // flaque de substrat
    () => { const c = pick(['#5a3a4a', '#4a2a3a', '#6a4252']); let s = P(blob(rnd(18, 24), rnd(8, 11), 9, .18), c, ol()) + P(blob(10, 4, 7, .2, -4, -3), shade(c, .2)); for (let i = 0; i < ri(1, 3); i++) s += C(rnd(-12, 12), rnd(-4, 3), rnd(2, 3.2), GR, ol(1)); return s; },
  ],
  sky: [
    // wyverne : ailes de chauve-souris, longue queue
    () => { const c = pick(['#8a3a2a', '#7a5a30', '#9a4a3a', '#6a4a2a']); return P('M-2 -2 Q-12 -20 -24 -14 Q-16 -10 -18 -2 Q-10 -6 -2 2Z', shade(c, .15), ol(1.2)) + P('M2 -2 Q12 -20 24 -14 Q16 -10 18 -2 Q10 -6 2 2Z', shade(c, .15), ol(1.2)) + P('M-2 -2 Q-12 -16 -22 -13 M2 -2 Q12 -16 22 -13', 'none', st(shade(c, -.3), 1)) + PO('M0 9 Q-5 16 2 23', c, 2) + E(0, 2, 5, 8, c, ol()) + C(0, -6, 4, c, ol()) + C(-1.5, -7, 1, EYE) + C(1.5, -7, 1, EYE) + P('M-3 -9 L-6 -14 L-1 -10Z M3 -9 L6 -14 L1 -10Z', BONE, ol(.8)); },
    () => C(0, 0, 14, 'url(#gG)') + C(0, 0, 7, '#9a7a3a', ol()) + P('M-4 -3 L-9 -9 M4 -3 L9 -9 M0 5 L0 11', 'none', st(BONE, 1.6)) + C(-2, -2, 2, GR),
    () => boom(rnd(14, 22)),
  ],
  bonusDraw: () => C(0, 0, 10, '#4ef0ff', op('.3')) + P(star(4, 9, 2.5), '#9ff8ff', ol(1)) + C(0, 0, 4.5, '#4ef0ff', ol(1)) + C(-1.2, -1.2, 1.6, '#fff'),
  bonusSky: true,
  big: [
    // tour en ruines
    () => { const w = rnd(80, 110), h = rnd(220, 300); let s = E(0, 100, w * .9, 14, '#000', op('.3')) + P(poly([[-w / 2, 100], [-w / 2, 100 - h + 40], [-w / 4, 100 - h + 10], [-w / 10, 100 - h + 50], [w / 8, 100 - h], [w / 3, 100 - h + 35], [w / 2, 100 - h + 20], [w / 2, 100]]), CON, ol(3));
      s += Rc(w / 4, 100 - h + 30, w / 4, h - 30, CON2);
      for (let y = 100 - h + 60; y < 80; y += 26) for (let x = -w / 2 + 10; x < w / 2 - 14; x += 20) s += Rc(x, y, 11, 14, R() < .12 ? '#ffa030' : '#2a2c32', 1);
      s += P('M-10 ' + (100 - h + 60) + ' L4 ' + (100 - h + 110) + ' L-6 ' + (100 - h + 150), 'none', st('#2a2c32', 3));
      return s + P(blob(w * .7, 22, 9, .25, 0, 92), '#5a3a4a', ol(2.5)) + P(`M${-w / 2} 60 Q${-w / 2 - 10} 20 ${-w / 2 + 8} -10 Q${-w / 2 + 14} 30 ${-w / 2 + 20} 80Z`, '#6a4252', ol(2)); },
    // ruche
    () => { const c = pick(['#6a4a2a', '#5e4222', '#7a5530']); let s = E(0, 100, 125, 22, '#5a3a4a', ol(2.5));
      s += P('M-90 100 Q-100 20 -50 -60 Q-30 -150 0 -170 Q30 -150 50 -60 Q100 20 90 100Z', c, ol(3)) + P('M-62 92 Q-72 10 -32 -60 Q-12 -128 0 -150', 'none', st(shade(c, .25), 8));
      [[-100, 34], [-40, 58], [20, 84], [70, 88]].forEach(([y, w]) => s += P(`M${-w} ${y} Q0 ${y + 18} ${w} ${y}`, 'none', st(shade(c, -.35), 4)));
      s += P('M-22 -118 L-46 -168 L-8 -132Z M22 -118 L46 -168 L8 -132Z M-55 -40 L-96 -70 L-50 -20Z M55 -40 L96 -70 L50 -20Z', BONE, ol(2.5));
      [[-28, 0, 12, 16], [32, 42, 10, 13], [6, -84, 8, 11], [-40, 60, 7, 9]].forEach(([x, y, rx, ry]) => s += E(x, y, rx + 8, ry + 8, 'url(#gG)') + E(x, y, rx, ry, GR, ol(2)) + E(x, y + 2, rx * .55, ry * .6, '#e8ffb8'));
      return s; },
    // béhémoth cornu
    () => { const c = '#7a5a30'; let s = E(0, 100, 120, 14, '#000', op('.3'));
      for (const x of [-70, -30, 20, 60]) s += P(`M${x} 30 L${x - 14} 80 L${x - 6} 100 L${x + 8} 100 L${x + 2} 80 L${x + 12} 30Z`, BR2, ol(3)) + P(`M${x - 8} 100 L${x - 12} 108 L${x - 2} 104Z M${x + 4} 100 L${x + 6} 108 L${x + 10} 100Z`, BONE, ol(1.5));
      s += P('M-100 40 Q-112 -60 -20 -80 Q60 -90 90 -20 Q100 30 80 50 Q0 62 -100 40Z', c, ol(3)) + P('M-88 0 Q-40 -52 40 -62', 'none', st(BR3, 9)) + P('M-92 30 Q0 22 82 30', 'none', st(BR2, 5));
      for (let i = 0; i < 7; i++){ const x = -80 + i * 24, y = -60 - Math.sin(i / 6 * Math.PI) * 26; s += P(`M${x} ${f1(y + 12)} L${x - 8} ${f1(y - 26)} L${x + 12} ${f1(y + 8)}Z`, BONE, ol(2)); }
      s += P('M-100 20 Q-140 10 -150 -20 Q-130 0 -96 0Z', c, ol(2.5));
      s += E(96, 10, 32, 25, shade(c, -.1), ol(3)) + P('M112 20 Q130 26 120 36 Q104 34 100 24Z', MAW, ol(2)) + P('M114 22 L118 30 L120 22Z', BONE) + C(100, 0, 4.5, EYE, ol(1));
      return s + P('M100 -8 Q145 -40 124 -112 Q156 -50 122 2Z', BONE, ol(2.5)) + P('M80 -10 Q90 -50 70 -70 Q100 -46 92 -6Z', BONE, ol(2)); },
    // cheminée à spores
    () => { const c = pick(['#6a4a2a', '#7a5530']); let s = E(0, 90, 95, 18, '#5a3a4a', ol(2.5)) + P('M-45 90 Q-38 10 -18 -60 L18 -60 Q38 10 45 90Z', c, ol(3)) + P('M-28 80 Q-24 10 -10 -50', 'none', st(shade(c, .25), 6)) + E(0, -60, 20, 7, '#140806', ol(2.5));
      for (let i = 0; i < 7; i++) s += C(rnd(-30, 30), -80 - i * 18, 14 + i * 3, 'url(#gG)');
      return s + P('M-50 60 L-80 40 L-46 74Z M50 40 L84 20 L48 58Z', BONE, ol(2)); },
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262c38"/><stop offset=".55" stop-color="#6a6c74"/><stop offset="1" stop-color="#c9a88a"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#54404a"/><stop offset="1" stop-color="#2a1c22"/></linearGradient>
<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a98a0" stop-opacity="0"/><stop offset="1" stop-color="#b8aa9a" stop-opacity=".75"/></linearGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)');
    // nuages de fumée
    for (let i = 0; i < 40; i++) s += E(rnd(0, W), rnd(20, HZ - 150), rnd(120, 300), rnd(30, 70), pick(['#3a3c46', '#4a4a52', '#58565c']), op(rnd(.35, .7).toFixed(2)));
    // le colosse dans la brume (silhouette géante)
    s += T(520, HZ - 40, P('M-420 120 Q-380 -160 -160 -250 Q-40 -300 60 -240 Q160 -180 170 -60 Q260 -40 330 40 Q360 100 300 120Z', '#3a3640') + P('M-120 -250 Q-260 -420 -420 -380 Q-280 -360 -200 -240Z M20 -250 Q60 -430 230 -460 Q110 -380 90 -240Z M-200 -200 Q-360 -260 -440 -170 Q-330 -200 -230 -160Z', '#33303a') + P('M140 -40 Q250 -10 300 60 Q240 30 160 20Z', '#2c2a32') + C(80, -150, 10, '#ff8a3a') + C(80, -150, 30, 'url(#gO)') + C(-10, -170, 8, '#ff8a3a') + C(-10, -170, 24, 'url(#gO)'), op('.9'));
    // ville en ruines au loin
    let d = ''; for (let x = 900; x < W; x += rnd(60, 140)){ const w = rnd(50, 110), h = rnd(120, 340); d += `M${f1(x)} ${HZ + 30} V${f1(HZ - h)} L${f1(x + w * .3)} ${f1(HZ - h - rnd(10, 40))} L${f1(x + w * .55)} ${f1(HZ - h + rnd(10, 40))} L${f1(x + w)} ${f1(HZ - h - rnd(-20, 30))} V${HZ + 30}Z `; }
    s += P(d, '#4a4c56') + Rc(0, HZ - 220, W, 300, 'url(#mist)');
    d = ''; for (let x = -40; x < W; x += rnd(90, 180)){ const w = rnd(60, 120), h = rnd(60, 200); d += `M${f1(x)} ${HZ + 30} V${f1(HZ - h)} L${f1(x + w * .4)} ${f1(HZ - h - rnd(10, 50))} L${f1(x + w)} ${f1(HZ - h + rnd(0, 40))} V${HZ + 30}Z `; }
    s += P(d, '#3a3a44');
    // explosions et traînées de missiles
    for (const [x, y, r] of [[1700, HZ - 60, 120], [2550, HZ - 30, 90], [1150, HZ - 10, 70]]) s += T(x, y, boom(r)) + T(x, y - r, smoke(5, r * .5, rnd(-20, 20), -r * .45));
    for (let i = 0; i < 9; i++){ const x = rnd(1500, 2000), y = HZ - 60; s += P(`M${f1(x)} ${y} Q${f1(x + rnd(60, 200))} ${f1(y - rnd(150, 300))} ${f1(x + rnd(200, 420))} ${f1(y - rnd(250, 420))}`, 'none', st('#f4eee4', 3) + op('.7')); }
    s += Rc(0, HZ, W, H - HZ, 'url(#gnd)');
    for (let i = 0; i < 40; i++){ const x = rnd(0, W), y = rnd(HZ + 30, H), k = .5 + (y - HZ) / (H - HZ); s += P(blob(rnd(80, 200) * k, rnd(20, 50) * k, 10, .25, x, y), pick(['#4a2a3a', '#5a3a4a', '#5a5e66', '#4a4c54']), op('.7')); }
    for (let i = 0; i < 24; i++){ const x = rnd(0, W), y = rnd(HZ + 40, H), k = .5 + (y - HZ) / (H - HZ); s += P(`M${f1(x)} ${f1(y)} q${f1(60 * k)} ${f1(-30 * k)} ${f1(140 * k)} ${f1(rnd(-20, 20) * k)}`, 'none', st('#6a4252', 6 * k) + op('.6')); }
    return s;
  }
};

// =====================================================================================
// RACE 2 : LES EXOS (orange) — sanctuaire dans un marais nocturne
// =====================================================================================
const XW = '#f2f4f7', XW2 = '#c8cfd8', XW3 = '#8e99a8', OR = '#ff9a2e', OR2 = '#ffcf6a', TE = '#3fe8d8', XD = '#1f2a3a', GOLD = '#f2c14e', GOLD2 = '#b8862b';
const orange = () => pick([OR, '#ffad3a', '#ff8a1a']);
const EXO = {
  name: 'Sanctuaire Exo', sub: 'Race : les Exos', mood: 'night', bonus: 'lanternes flottantes', bonusN: 11, seed: 7202,
  targets: [
    ['une amulette dorée', () => P('M-12 -16 Q0 -2 12 -16', 'none', st(GOLD2, 2.2)) + C(0, 4, 13, GOLD, ol()) + C(0, 4, 8, GOLD2) + P('M0 -3 L5 4 L0 11 L-5 4Z', OR, ol(1.2)) + C(-4, 0, 2, '#fff6c8')],
    ['un masque blanc', () => P('M-14 -16 Q0 -22 14 -16 Q16 4 0 20 Q-16 4 -14 -16Z', XW, ol()) + P('M-10 -6 L-3 -4 L-4 -1 L-10 -3Z M10 -6 L3 -4 L4 -1 L10 -3Z', OR) + P('M0 -18 V2', 'none', st(XW3, 1.6)) + P('M-5 10 Q0 13 5 10', 'none', st(OUT, 1.3))],
    ["une lame d'énergie", () => LO(-17, 17, 6, -6, XW2, 3) + C(-17, 17, 3, XW3, ol(1)) + C(13, -12, 10, OR, op('.25')) + P('M4 -4 L21 -21 L12 -1Z', OR, ol(1.3)) + P('M7 -5 L18 -18 L11 -3Z', OR2) + LO(1, -9, 9, -1, XW, 2)],
    ['un cristal violet', () => P('M-6 18 L-15 2 L-10 -2 L-4 10Z', '#c27aff', ol()) + P('M4 18 L10 0 L15 6 L12 18Z', '#8a3ad6', ol()) + P('M-2 18 L-8 -4 L-2 -20 L4 -4 Z', '#a64cff', ol()) + P('M-2 -20 L4 -4 L-2 18Z', '#d6a8ff') + Rc(-17, 16, 34, 5, XW, 2, ol())],
    ['une lyre', () => P('M-12 -16 Q-18 4 -6 14 H6 Q18 4 12 -16 Q8 -8 6 6 H-6 Q-8 -8 -12 -16Z', GOLD, ol()) + L(-3, -10, -3, 6, OR, 1.2) + L(0, -10, 0, 6, OR, 1.2) + L(3, -10, 3, 6, OR, 1.2) + Rc(-7, -12, 14, 3, GOLD2, 1, ol(1))],
    ['un sablier céleste', () => P('M-9 -14 L9 -14 L1 0 L9 14 L-9 14 L-1 0Z', '#e6f6ff', ol(1.3) + ' fill-opacity=".7"') + P('M-6 -11 L6 -11 L0 -2Z', OR) + P('M-7 13 L7 13 L0 6Z', OR) + LO(-11, -14, -11, 14, XW, 2) + LO(11, -14, 11, 14, XW, 2) + Rc(-13, -18, 26, 4, XW2, 1, ol()) + Rc(-13, 14, 26, 4, XW2, 1, ol())],
    ['un bouclier rond', () => C(0, 0, 17, XW, ol()) + C(0, 0, 14.5, 'none', st(OR, 3.5)) + P(star(4, 10, 3), OR, ol(1))],
    ['une étoile à huit branches', () => C(0, 0, 17, '#fff2b0', op('.35')) + P(star(8, 19, 8), '#ffe27a', ol()) + C(0, 0, 5, '#fff')],
    ['un calice', () => P('M-13 -16 H13 Q12 0 2 4 V12 H8 V17 H-8 V12 H-2 V4 Q-12 0 -13 -16Z', GOLD, ol()) + E(0, -14, 11, 2.6, '#7a2a8a') + C(-6, -7, 2, OR) + C(6, -7, 2, OR)],
    ['une sphère armillaire', () => Rc(-2, 9, 4, 7, GOLD2, 0, ol(1)) + Rc(-9, 15, 18, 4, GOLD2, 1, ol(1)) + C(0, -3, 6, OR, ol(1.2)) + E(0, -3, 15, 6, 'none', st(OUT, 3.6)) + E(0, -3, 15, 6, 'none', st(GOLD, 2)) + E(0, -3, 6, 15, 'none', st(OUT, 3.6)) + E(0, -3, 6, 15, 'none', st(GOLD, 2)) + `<g transform="rotate(45 0 -3)">${E(0, -3, 15, 4, 'none', st(OUT, 3.2)) + E(0, -3, 15, 4, 'none', st('#ffe9a0', 1.6))}</g>`],
    ['une clé ancienne', () => C(-10, -8, 8, 'none', st(OUT, 6.5)) + C(-10, -8, 8, 'none', st('#d9a441', 3.6)) + LO(-4, -2, 15, 17, '#d9a441', 3.4) + LO(10, 12, 15, 7, '#d9a441', 3) + LO(14, 16, 19, 11, '#d9a441', 3) + C(-10, -8, 2.4, TE)],
    ['un œuf de cristal', () => C(0, 2, 20, TE, op('.2')) + E(0, 2, 12, 16, '#9ff6ff', ol() + ' fill-opacity=".85"') + P('M-12 2 L0 -6 L12 2 M0 -6 L0 18 M-8 -10 L0 -6 L8 -10', 'none', st('#2bb5c8', 1.2)) + E(-4, -6, 2.5, 5, '#fff')],
    ['un robot sonde', () => LO(-8, 6, -14, 18, XW3, 1.4) + LO(8, 6, 14, 18, XW3, 1.4) + LO(0, 8, 0, 19, XW3, 1.4) + C(0, -2, 12, XW, ol()) + P('M-12 -1 H12', 'none', st(XW3, 2)) + C(0, -4, 5, OUT) + C(0, -4, 3, '#ff4fd8') + L(0, -14, 0, -20, OUT, 1.6) + C(0, -21, 2, '#ff4fd8')],
    ['une plume blanche', () => P('M-14 16 Q-12 -8 14 -18 Q12 2 -14 16Z', '#f6f3ea', ol()) + P('M-16 18 Q-2 2 12 -15', 'none', st('#b9b2a0', 1.6)) + P('M-6 6 L-2 2 M0 0 L4 -4 M-10 10 L-7 7', 'none', st('#d9d3c3', 1))],
  ],
  clutter: [
    // guerrier exo : silhouette fine, cœur orange, lame d'énergie
    () => { const a = orange(); return PO('M-3 4 L-6 12 L-3 19', XW3, 2.6) + PO('M3 4 L7 11 L5 19', XW3, 2.6) + P('M-16 -20 Q-10 -16 -4 -15 Q-8 -12 -12 -13Z', XW2, ol(1))
      + P('M-8 -10 Q-10 4 -4 6 H4 Q10 4 8 -10 Q0 -14 -8 -10Z', XW, ol()) + P('M-6 2 Q0 5 6 2', 'none', st(XW3, 1.5)) + C(0, -3, 6, 'url(#gO)') + C(0, -3, 3.2, a, ol(1))
      + P('M-12 -12 Q-6 -16 -4 -9 Q-9 -8 -12 -12Z M12 -12 Q6 -16 4 -9 Q9 -8 12 -12Z', XW2, ol(1.2)) + E(0, -15, 4, 4.5, XW, ol(1.2)) + P('M-2 -18 Q-10 -25 -17 -21 Q-9 -19 -3 -14Z', XW2, ol(1)) + L(1, -15, 4, -15, a, 1.8)
      + PO('M8 -4 L12 0', XW2, 2) + C(18, -5, 9, 'url(#gO)') + P('M12 -1 L25 -10 L13 2Z', a, ol(1)) + P('M13 0 L22 -7 L14 1Z', OR2); },
    // marcheur à quatre pattes
    () => { const a = orange(); let s = ''; for (const [x1, x2] of [[-8, -17], [-3, -8], [3, 8], [8, 17]]) s += PO(`M${x1} -2 L${f1((x1 + x2) / 2)} -12 L${x2} 18`, XW2, 2.2);
      return s + E(0, -4, 12, 8, XW, ol()) + P('M-12 -4 Q0 2 12 -4 Q0 8 -12 -4Z', XW3) + C(9, -6, 7, 'url(#gO)') + C(9, -6, 3.4, a, ol(1)) + Rc(-7, -12, 10, 3, a, 1) + P('M-12 -6 L-18 -10 L-11 -2Z', XW2, ol(1)); },
    // drone orbe
    () => { const a = pick([OR, OR, TE]); return C(0, 0, 13, a === TE ? 'url(#gC)' : 'url(#gO)') + E(0, 0, 15, 4, 'none', st(OUT, 4.2)) + C(0, 0, 10, XW, ol()) + E(0, 0, 15, 4, 'none', st(XW2, 2)) + C(0, 0, 5, a, ol(1)) + C(-1.5, -1.5, 1.6, '#fff') + P('M-4 9 L0 16 L4 9Z', XW2, ol(1)); },
    // pylône à cristal
    () => { const a = orange(); return E(0, 16, 12, 3.5, a, op('.35')) + C(0, -8, 16, 'url(#gO)') + P('M0 -22 L7 -8 L0 5 L-7 -8Z', a, ol()) + P('M0 -22 L7 -8 L0 5Z', OR2) + P('M-13 4 Q0 16 13 4 L10 0 Q0 10 -10 0Z', XW, ol()) + P('M-13 4 L-16 -6 L-10 0Z M13 4 L16 -6 L10 0Z', XW2, ol(1)); },
    // petit portail
    () => E(0, 14, 14, 3, '#000', op('.3')) + E(0, -2, 13, 17, '#1d6a7a', op('.7')) + P('M-9 -2 Q0 -14 9 -2 Q0 8 -9 -2', 'none', st(TE, 2)) + C(0, -2, 4, '#c8fffa', op('.8')) + E(0, -2, 13, 17, 'none', st(OUT, 8)) + E(0, -2, 13, 17, 'none', st(XW, 5)) + C(0, -19, 2.4, OR, ol(.8)) + C(-13, -2, 2.4, OR, ol(.8)) + C(13, -2, 2.4, OR, ol(.8)),
    // générateur de bouclier
    () => E(0, 8, 18, 5, XW2, ol()) + P('M-16 8 Q-16 -14 0 -14 Q16 -14 16 8Z', TE, op('.28')) + P('M-16 8 Q-16 -14 0 -14 Q16 -14 16 8', 'none', st('#bffff8', 1.4)) + Rc(-4, -2, 8, 10, XW, 2, ol(1)) + C(0, 0, 2.6, OR),
    // plantes lumineuses roses
    () => { let s = ''; for (let i = 0; i < ri(2, 4); i++){ const x = rnd(-12, 12), h = rnd(10, 22); s += PO(`M${f1(x)} 16 Q${f1(x + rnd(-6, 6))} ${f1(16 - h / 2)} ${f1(x)} ${f1(16 - h)}`, '#2a5a5a', 1.6) + C(x, 16 - h, 7, 'url(#gP)') + C(x, 16 - h, 3.2, '#ff7ae0', ol(1)); } return s + P(blob(14, 4, 7, .2, 0, 16), '#1a3a3a', ol(1)); },
    // roche sombre
    () => { const c = pick(['#2c3a48', '#34424e', '#26323e']); return P(blob(rnd(14, 22), rnd(10, 15), 7, .3), c, ol()) + P(blob(7, 4, 6, .3, -4, -5), shade(c, .2)) + (R() < .4 ? C(rnd(-6, 6), rnd(-4, 2), 2.5, TE, ol(.8)) : ''); },
    // monolithe gravé
    () => P('M-6 16 L-4 -18 L2 -24 L6 16Z', XW, ol()) + P('M2 -24 L6 16 L1 16Z', XW2) + P('M-2 -12 L1 -8 L-2 -4 L1 0', 'none', st(OR, 1.8)) + C(0, 8, 2, OR) + E(0, 17, 9, 2.5, '#000', op('.3')),
    // feu follet d'énergie
    () => C(0, 0, 14, 'url(#gO)') + P(star(4, 7, 2), OR2, ol(.8)) + C(0, 0, 2.6, '#fff'),
    // roseaux
    () => { let s = ''; for (let i = 0; i < 6; i++){ const x = rnd(-12, 12), h = rnd(14, 26); s += P(`M${f1(x)} 14 Q${f1(x + rnd(-5, 5))} ${f1(14 - h / 2)} ${f1(x + rnd(-6, 6))} ${f1(14 - h)}`, 'none', st(pick(['#2a6a5a', '#1f5a4a', '#3a7a6a']), 2)); } return s; },
    // flaque reflétante
    () => E(0, 0, rnd(16, 22), rnd(5, 7), '#123a4a', ol(1.2)) + E(-4, -1, 8, 1.6, '#7fd8e8', op('.6')),
  ],
  sky: [
    // planeur exo
    () => { const a = orange(); return C(-20, 2, 7, 'url(#gO)') + P('M-6 -2 L-17 -15 L4 -2Z', XW2, ol(1.2)) + P('M-20 2 Q-4 -10 22 0 Q-4 5 -20 2Z', XW, ol()) + P('M-6 4 L-16 13 L4 3Z', XW2, ol(1.2)) + C(-20, 2, 2.4, a) + L(2, -2, 12, -1, a, 1.4); },
    () => C(0, 0, 13, 'url(#gO)') + E(0, 0, 15, 4, 'none', st(OUT, 4.2)) + C(0, 0, 10, XW, ol()) + E(0, 0, 15, 4, 'none', st(XW2, 2)) + C(0, 0, 5, OR, ol(1)),
    () => C(0, 0, 14, 'url(#gO)') + P(star(4, 7, 2), OR2, ol(.8)),
  ],
  bonusDraw: () => C(0, 0, 13, 'url(#gO)') + P('M0 -12 L8 0 L0 12 L-8 0Z', XW, ol()) + P('M0 -6 L4 0 L0 6 L-4 0Z', OR) + L(0, -12, 0, -17, OUT, 1.4),
  bonusSky: true,
  big: [
    // temple-coquille et son faisceau
    () => { let s = E(0, 100, 140, 18, TE, op('.18')) + P('M-30 100 L-20 30 H20 L30 100Z', XW2, ol(3)) + P('M-14 100 L-8 30 H8 L14 100Z', TE, op('.55')) + C(0, 80, 40, 'url(#gC)');
      s += P('M-10 -40 L0 -102 L10 -40Z', OR, ol(2)) + P('M0 -102 L10 -40 L0 -40Z', OR2) + P('M-30 -44 L-21 -82 L-12 -44Z', OR, ol(2)) + P('M12 -44 L21 -82 L30 -44Z', OR, ol(2)) + C(0, -70, 40, 'url(#gO)');
      s += P('M-140 10 Q-120 -40 -50 -50 Q0 -70 50 -50 Q120 -40 140 10 Q60 40 0 30 Q-60 40 -140 10Z', XW, ol(3)) + P('M-120 8 Q-60 30 0 22 Q60 30 120 8', 'none', st(XW3, 5)) + P('M-110 -10 Q-60 -40 0 -40', 'none', st('#ffffff', 6));
      s += P('M-44 -48 Q0 -80 44 -48 Q22 -34 0 -34 Q-22 -34 -44 -48Z', XW2, ol(2.5));
      for (const x of [-110, -70, 70, 110]) s += E(x, 2, 14, 7, XD, ol(2)) + E(x, 2, 9, 4, OR) + E(x, 2, 18, 10, 'url(#gO)');
      return s + P('M-140 10 L-178 -24 L-120 -10Z M140 10 L178 -24 L120 -10Z', XW, ol(2.5)); },
    // tripode géant
    () => { const a = orange(); let s = E(0, 100, 100, 12, '#000', op('.3'));
      for (const [kx, fx] of [[-60, -95], [0, 12], [62, 98]]) s += PO(`M${f1(fx * .2)} -60 L${kx} -10 L${fx} 100`, XW2, 7) + C(kx, -10, 7, a, ol(1.5)) + P(`M${fx - 10} 100 L${fx} 88 L${fx + 10} 100Z`, XW, ol(2));
      s += P('M-40 -82 L-86 -128 L-28 -96Z M40 -82 L86 -128 L28 -96Z', XW, ol(2.5)) + P('M-54 -70 Q0 -114 54 -70 Q30 -44 0 -44 Q-30 -44 -54 -70Z', XW, ol(3)) + P('M-40 -66 Q0 -54 40 -66', 'none', st(XW3, 4));
      return s + C(0, -66, 22, 'url(#gO)') + C(0, -66, 9, a, ol(2)) + C(-30, -74, 4, a) + C(30, -74, 4, a); },
    // grand portail
    () => E(0, 100, 90, 12, '#000', op('.3')) + P('M-60 100 L-40 70 H40 L60 100Z', XW2, ol(3)) + E(0, -10, 62, 82, '#1d6a7a', op('.6')) + P('M-40 -10 Q0 -70 40 -10 Q0 40 -40 -10', 'none', st(TE, 4)) + P('M-24 -10 Q0 -40 24 -10 Q0 18 -24 -10', 'none', st('#bffff8', 3)) + C(0, -10, 60, 'url(#gC)') + E(0, -10, 62, 82, 'none', st(OUT, 22)) + E(0, -10, 62, 82, 'none', st(XW, 17)) + E(0, -10, 62, 82, 'none', st(XW2, 4)) + C(0, -92, 7, OR, ol(2)) + C(-62, -10, 7, OR, ol(2)) + C(62, -10, 7, OR, ol(2)) + C(-44, 48, 6, OR, ol(2)) + C(44, 48, 6, OR, ol(2)),
    // flèche de cristal orange
    () => C(0, -20, 100, 'url(#gO)') + Rc(-60, 70, 120, 30, XW, 8, ol(3)) + P('M-30 72 L-46 -40 L-12 -170 L4 -40Z', OR, ol(3)) + P('M-12 -170 L4 -40 L-30 72Z', OR2) + P('M6 72 L18 -60 L44 -10 L36 72Z', '#e8781a', ol(3)) + P('M-40 72 L-70 0 L-50 -10 L-28 50Z', '#ffb84a', ol(3)) + P('M-70 70 Q-90 20 -70 -20 L-60 -16 Q-74 20 -58 70Z M70 70 Q90 20 70 -20 L60 -16 Q74 20 58 70Z', XW2, ol(2.5)),
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050c18"/><stop offset=".6" stop-color="#11283c"/><stop offset="1" stop-color="#2a5a68"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3b4a"/><stop offset="1" stop-color="#0c1c26"/></linearGradient>
<linearGradient id="ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#bfe8ff"/><stop offset="1" stop-color="#6aa8d8"/></linearGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)') + stars(W, HZ * .5, 140);
    for (let i = 0; i < 34; i++) s += E(rnd(0, W), rnd(20, HZ - 120), rnd(140, 320), rnd(30, 80), pick(['#0e1c2c', '#14263a', '#1a3048']), op(rnd(.5, .85).toFixed(2)));
    // vaisseau de cristal en vol stationnaire, éclairs
    const vx = 2150, vy = 230;
    s += C(vx, vy, 260, 'url(#gC)');
    s += T(vx, vy, P('M0 -170 Q60 -100 50 40 Q30 120 0 150 Q-30 120 -50 40 Q-60 -100 0 -170Z', 'url(#ice)', ol(3)) + P('M-60 -80 Q-130 -20 -110 90 Q-90 40 -64 30Z M60 -80 Q130 -20 110 90 Q90 40 64 30Z', 'url(#ice)', ol(3)) + P('M0 -150 Q20 -60 10 120', 'none', st('#ffffff', 6) + op('.8')) + P('M-30 -40 Q0 -20 30 -40 M-36 10 Q0 30 36 10 M-30 60 Q0 80 30 60', 'none', st('#7ab8e8', 3)) + C(0, 150, 14, '#ffffff') + C(0, 150, 40, 'url(#gC)'));
    const bolt = (x1, y1, x2, y2) => { let d = `M${x1} ${y1}`; const n = 9; for (let i = 1; i < n; i++) d += ` L${f1(x1 + (x2 - x1) * i / n + rnd(-40, 40))} ${f1(y1 + (y2 - y1) * i / n + rnd(-10, 10))}`; d += ` L${x2} ${y2}`; return P(d, 'none', st('#5fe8ff', 10) + op('.35')) + P(d, 'none', st('#e8ffff', 3)); };
    s += bolt(vx, vy + 150, vx - 260, HZ + 40) + bolt(vx, vy + 150, vx + 120, HZ + 60) + bolt(vx - 40, vy + 100, vx - 520, HZ - 20) + bolt(400, 0, 560, HZ - 120) + bolt(1200, 0, 1100, 260);
    // arbres tordus et flèches rocheuses
    let d = ''; for (let x = -40; x < W; x += rnd(120, 260)){ const h = rnd(150, 380), w = rnd(30, 70); d += `M${f1(x)} ${HZ + 30} Q${f1(x + w * .2)} ${f1(HZ - h * .5)} ${f1(x + w * .5 + rnd(-30, 30))} ${f1(HZ - h)} Q${f1(x + w * .8)} ${f1(HZ - h * .5)} ${f1(x + w)} ${HZ + 30}Z `; }
    s += P(d, '#0b1824') + P(ridge(W, HZ + 10, 50, 50, .1), '#102432');
    for (let i = 0; i < 40; i++) s += C(rnd(0, W), HZ - rnd(0, 80), rnd(8, 18), 'url(#gP)') + C(rnd(0, W), HZ - rnd(0, 60), rnd(2, 4), '#ff7ae0', op('.8'));
    s += Rc(0, HZ, W, H - HZ, 'url(#gnd)');
    for (let i = 0; i < 26; i++){ const x = rnd(0, W), y = rnd(HZ + 40, H), k = .5 + (y - HZ) / (H - HZ); s += P(blob(rnd(100, 260) * k, rnd(18, 40) * k, 10, .2, x, y), '#123a4a', op('.85')) + E(x - 20 * k, y - 4 * k, 60 * k, 4 * k, '#7fd8e8', op('.25')); }
    for (let i = 0; i < 30; i++){ const x = rnd(0, W), y = rnd(HZ + 30, H), k = .5 + (y - HZ) / (H - HZ); s += P(blob(rnd(60, 160) * k, rnd(14, 30) * k, 9, .25, x, y), pick(['#1a4a4a', '#22524a', '#173a40']), op('.7')); }
    return s;
  }
};

// =====================================================================================
// RACE 3 : LES HUMAINS (bleu) — base dans un canyon en flammes
// =====================================================================================
const B1 = '#2f6be0', B2 = '#1c3f96', B3 = '#6f9cff', HW = '#dfe5ea', HW2 = '#a9b3bc', HD = '#2a3038', GL = '#5fe8ff', VIS = '#ffb52e', HAZ = '#f2c230', OLV = '#5f6b3a';
const blue = () => pick([B1, '#2a5cc8', '#3a74e8']);
const hazard = (x, y, w, h) => { let s = Rc(x, y, w, h, HAZ, 1, ol(1.2)); for (let i = 0; i < w; i += 6) s += P(`M${f1(x + i)} ${f1(y + h)} L${f1(x + i + 3)} ${f1(y)} L${f1(Math.min(x + w, x + i + 6))} ${f1(y)} L${f1(Math.min(x + w, x + i + 3))} ${f1(y + h)}Z`, '#2a2a2a'); return s; };
const HUM = {
  name: 'Canyon des Humains', sub: 'Race : les Humains', mood: 'day', bonus: 'drapeaux bleus', bonusN: 7, seed: 7303,
  targets: [
    ['une clé à molette', () => LO(-12, 12, 6, -6, '#c3ccd0', 4.4) + C(9, -9, 8, '#c3ccd0', ol()) + `<g transform="rotate(45 9 -9)">${Rc(6, -21, 6, 9, '#a0583a')}</g>` + C(-12, 12, 4.5, '#c3ccd0', ol()) + C(-12, 12, 1.8, OUT)],
    ['un extincteur', () => P('M3 -15 Q14 -16 13 -4', 'none', st(OUT, 2.4)) + Rc(-7, -12, 14, 30, '#e0302a', 6, ol()) + Rc(-5, -18, 10, 7, '#2a2a2a', 1, ol(1)) + Rc(-7, -2, 14, 8, '#f4f1e6', 1) + L(-4, 10, -4, -8, '#ff8a80', 1.5)],
    ['une radio', () => L(8, -8, 14, -22, OUT, 2) + C(14, -22, 1.8, OUT) + Rc(-14, -8, 28, 22, OLV, 3, ol()) + C(-6, 3, 6, '#2a2f1e', ol(1)) + L(-10, 1, -2, 1, '#6a7448', 1) + L(-10, 5, -2, 5, '#6a7448', 1) + Rc(3, -4, 8, 5, '#9fe870', 1, ol(1)) + C(7, 8, 2.2, '#d8d8d8', ol(.8))],
    ['une tasse de café', () => P('M9 -6 Q18 -6 17 2 Q16 8 9 8', 'none', st(OUT, 3.2)) + Rc(-11, -12, 20, 26, '#f4f1e6', 3, ol()) + E(-1, -11, 9, 2.4, '#5a3a22') + Rc(-7, -2, 12, 6, B1, 1) + P('M-5 -16 Q-8 -20 -4 -24 M2 -16 Q-1 -20 3 -24', 'none', st('#ffffff', 1.6) + op('.8'))],
    ["un bidon d'essence", () => Rc(4, -18, 6, 6, '#2a2a2a', 1, ol(1)) + P('M-13 -12 L4 -12 L13 -4 L13 17 L-13 17Z', '#d8322b', ol()) + P('M-9 -9 H-1 V-5 H-9Z', OUT) + P('M-9 0 L9 14 M9 0 L-9 14', 'none', st('#a8221d', 2.2))],
    ['des jumelles', () => Rc(-12, -12, 9, 14, '#4f565c', 2, ol()) + Rc(3, -12, 9, 14, '#4f565c', 2, ol()) + Rc(-3, -8, 6, 6, '#2a2f33', 1, ol(1)) + C(-7, 4, 8, '#3a3f44', ol()) + C(7, 4, 8, '#3a3f44', ol()) + C(-7, 4, 4.5, '#5fb0ff') + C(7, 4, 4.5, '#5fb0ff') + C(-8.5, 2.5, 1.5, '#fff') + C(5.5, 2.5, 1.5, '#fff')],
    ['une médaille', () => P('M-8 -20 L-2 -4 L2 -4 L8 -20 L3 -20 L0 -12 L-3 -20Z', B1, ol(1.2)) + C(0, 7, 10, '#e8b422', ol()) + T(0, 7, P(star(5, 6, 2.5), '#fff1a8'))],
    ['un cadenas', () => PO('M-7 -2 V-9 Q-7 -18 0 -18 Q7 -18 7 -9 V-2', '#b9c2c6', 2.8) + Rc(-12, -3, 24, 20, '#e8b422', 3, ol()) + C(0, 5, 3, OUT) + Rc(-1, 6, 2, 6, OUT)],
    ['un casque de pilote', () => P('M-15 6 Q-16 -18 0 -18 Q16 -18 15 6 L10 10 H-10Z', HW, ol()) + P('M-11 -8 H11 Q12 2 6 4 H-6 Q-12 2 -11 -8Z', '#ff7a2a', ol(1.2)) + P('M-8 -6 H-1', 'none', st('#ffd0a8', 2)) + P('M-2 -18 V-10 M2 -18 V-10', 'none', st(B1, 2)) + Rc(-16, 2, 6, 6, HW2, 2, ol(1))],
    ['une guitare', () => LO(2, -2, 15, -17, '#7a4a22', 3) + `<g transform="rotate(-48 17 -19)">${Rc(13, -23, 8, 6, '#3a2412', 1, ol(1))}</g>` + C(-8, 8, 9.8, OUT) + C(-1, 1, 7.8, OUT) + C(-8, 8, 8, '#d07a2a') + C(-1, 1, 6, '#d07a2a') + C(-4, 4, 2.6, '#3a2412') + L(-12, 9, -8, 13, '#3a2412', 2)],
    ['un chat roux', () => PO('M8 14 Q21 12 16 -2', '#e8862a', 2.6) + E(0, 8, 10, 10, '#e8862a', ol()) + P('M-7 -12 L-6 -20 L-1 -14Z M7 -12 L6 -20 L1 -14Z', '#e8862a', ol(1.2)) + C(0, -8, 8, '#e8862a', ol()) + C(-3, -9, 1.4, '#2a5a1a') + C(3, -9, 1.4, '#2a5a1a') + P('M-1 -6 H1 L0 -5Z', '#ff8a9a') + P('M-6 4 H-2 M-7 8 H-2 M2 4 H6 M2 8 H7', 'none', st('#b05a10', 1.4))],
    ['une batterie', () => Rc(-3, -18, 6, 4, '#b9c2c6', 1, ol(1)) + Rc(-8, -14, 16, 30, '#2a2a2a', 3) + Rc(-8, -14, 16, 10, '#e8b422', 3) + Rc(-8, -14, 16, 30, 'none', 3, ol()) + P('M-3 4 H3 M0 1 V7', 'none', st('#fff', 1.8))],
    ["une plaque d'identité", () => P('M0 -20 Q-6 -12 -2 -8', 'none', st('#9aa4a8', 1.4)) + Rc(-9, -8, 18, 24, '#cfd6d9', 6, ol()) + C(0, -4, 1.8, OUT) + L(-5, 2, 5, 2, '#6b7478', 1.4) + L(-5, 6, 4, 6, '#6b7478', 1.4) + L(-5, 10, 3, 10, '#6b7478', 1.4)],
    ['une lampe torche', () => P('M14 -10 L23 -16 L23 16 L14 10Z', '#fff6a0', op('.5')) + Rc(-16, -5, 22, 10, '#3a3f44', 2, ol()) + P('M6 -8 L14 -10 L14 10 L6 8Z', '#5c676c', ol()) + L(-10, -5, -10, 5, '#e8b422', 2)],
  ],
  clutter: [
    // soldat en armure lourde, visière dorée
    () => { const b = blue(); return Rc(-8, 5, 6.5, 12, B2, 2, ol(1.3)) + Rc(1, 5, 6.5, 12, B2, 2, ol(1.3)) + Rc(-9, 15, 8.5, 4, HD, 1.5, ol(1.2)) + Rc(0, 15, 8.5, 4, HD, 1.5, ol(1.2))
      + P('M-11 -5 Q-12 8 -6 8 H6 Q12 8 11 -5 Q0 -11 -11 -5Z', b, ol()) + P('M-5 -4 H5 L4 5 H-4Z', HW) + P('M-9 -4 Q-9 4 -6 6', 'none', st(B3, 1.6))
      + E(-11, -6, 6.5, 5.5, b, ol()) + E(11, -6, 6.5, 5.5, b, ol()) + E(-12, -8, 3.5, 2, B3) + E(10, -8, 3.5, 2, B3)
      + C(0, -12, 6.5, b, ol()) + P('M-4.5 -13 H4.5 Q5 -8.5 0 -8 Q-5 -8.5 -4.5 -13Z', VIS, ol(1)) + E(-2, -12, 1.5, 1, '#fff3c0')
      + Rc(-4, -1, 26, 4.5, HD, 1.5, ol(1.2)) + Rc(13, -1.5, 6, 2, GL, 1) + (R() < .3 ? C(23, 1, 6, 'url(#gF)') : ''); },
    // marcheur léger
    () => { const b = blue(); return PO('M-5 2 L-11 10 L-7 19', HW2, 3) + PO('M5 2 L10 10 L7 19', HW2, 3) + Rc(-11, 17, 9, 3, HD, 1, ol(1)) + Rc(3, 17, 9, 3, HD, 1, ol(1))
      + Rc(-20, -10, 9, 6, HD, 1, ol(1)) + Rc(-12, -14, 24, 17, b, 4, ol()) + Rc(-12, -3, 24, 3, HW) + Rc(-2, -11, 11, 7, GL, 2, ol(1)) + Rc(-1, -10, 4, 2, '#e8ffff') + Rc(10, -7, 13, 4, HD, 1, ol(1)) + C(-16, -7, 1.4, '#ff5a3a'); },
    // char
    () => { const b = blue(); let s = Rc(-21, 3, 42, 12, HD, 6, ol()); for (const x of [-15, -7, 1, 9, 16]) s += C(x, 9, 3.2, '#4a525c'); return s + P('M-19 3 L-15 -5 H15 L20 3Z', b, ol()) + Rc(-15, -5, 30, 3, HW) + P('M-9 -5 Q-9 -13 0 -13 Q9 -13 9 -5Z', b, ol()) + Rc(6, -11, 20, 2.6, HD, 1, ol(1)) + Rc(6, -7.5, 20, 2.6, HD, 1, ol(1)) + C(-3, -9, 1.6, GL) + T(-12, -1, P(star(5, 3, 1.2), HW)); },
    // buggy
    () => { const b = blue(); return C(-12, 9, 6, HD, ol()) + C(12, 9, 6, HD, ol()) + C(-12, 9, 2.5, '#7a828c') + C(12, 9, 2.5, '#7a828c') + P('M-20 5 L-14 -4 H6 L14 -2 L20 4 V8 H-20Z', b, ol()) + P('M-8 -4 L-4 -10 H4 L6 -4Z', GL, ol(1)) + Rc(-16, 0, 30, 2.5, HW) + Rc(10, -8, 10, 3, HD, 1, ol(1)); },
    // drone de reconnaissance
    () => E(-12, -7, 8, 1.8, HW2, op('.8')) + E(12, -7, 8, 1.8, HW2, op('.8')) + LO(-6, -2, -12, -7, HW2, 1.2) + LO(6, -2, 12, -7, HW2, 1.2) + E(0, 0, 10, 6, HW, ol()) + P('M-10 0 Q0 6 10 0', 'none', st(B1, 2)) + C(0, 1, 3, GL, ol(.8)),
    // barricade
    () => Rc(-18, -4, 36, 14, '#9aa4ad', 2, ol()) + Rc(-18, -4, 36, 4, HW) + hazard(-14, 4, 12, 4) + hazard(4, 4, 12, 4),
    // caisse de ravitaillement
    () => Rc(-13, -13, 26, 26, '#3a4a66', 3, ol()) + Rc(-13, -4, 26, 8, HW2) + T(0, 0, P(star(5, 5, 2), B1, ol(.8))) + L(-10, -10, -4, -10, GL, 1.5),
    // tourelle lance-missiles
    () => P('M-14 14 L-10 4 H10 L14 14Z', '#5a6470', ol()) + Rc(-3, -2, 6, 7, HD, 1, ol(1)) + Rc(-11, -14, 22, 13, blue(), 3, ol()) + C(-5, -8, 2.4, HD) + C(1, -8, 2.4, HD) + C(7, -8, 2.4, HD) + Rc(-11, -14, 22, 3, HW),
    // dépôt
    () => Rc(-18, -8, 36, 18, '#6a7684', 3, ol()) + Rc(-18, -8, 36, 5, B1) + Rc(-12, 0, 5, 4, GL, 1) + Rc(-4, 0, 5, 4, GL, 1) + Rc(4, 0, 5, 4, GL, 1) + Rc(10, -14, 6, 7, HD, 1, ol(1)),
    // cratère en feu
    () => E(0, 8, 20, 7, '#2a1a14', ol(1.2)) + C(0, 0, 18, 'url(#gF)') + P('M-10 8 Q-8 -6 -4 0 Q-2 -14 2 -3 Q6 -12 8 1 Q10 -5 12 8Z', '#ff7a1a', ol(1.2)) + P('M-5 8 Q-3 0 0 3 Q2 -4 5 8Z', '#ffe48a'),
    // carcasse de créature de l'Essaim
    () => P(blob(16, 8, 8, .2, 0, 4), '#6a4a2a', ol()) + PO('M-6 0 L-10 -10 M0 -1 L1 -12 M6 0 L10 -9', BR2, 2) + P('M10 2 Q20 -8 16 -16 Q16 -6 8 -2Z', BONE, ol(1)) + C(-4, 5, 3, '#4a2a1a'),
    // roche du canyon
    () => { const c = pick(['#a0583a', '#8a4a30', '#b86a44']); return P(blob(rnd(14, 22), rnd(9, 14), 7, .3), c, ol()) + P(blob(7, 4, 6, .3, -4, -5), shade(c, .25)); },
    // fûts
    () => { const c = pick(['#2a4a8a', '#3a4450', '#c03a2a']); return Rc(-10, -15, 20, 30, c, 4, ol()) + Rc(-10, -7, 20, 2.5, shade(c, -.35)) + Rc(-10, 5, 20, 2.5, shade(c, -.35)) + Rc(-7, -13, 3, 26, shade(c, .3), 1); },
  ],
  sky: [
    // chasseur
    () => C(-24, 0, 8, 'url(#gC)') + P('M-22 0 L10 -4 L22 0 L10 4Z', HW, ol()) + P('M-4 -2 L-12 -14 L-6 -14 L4 -2Z M-4 2 L-12 14 L-6 14 L4 2Z', B1, ol(1.2)) + P('M-20 0 L-24 -7 L-18 -1Z', B2, ol(1)) + P('M8 -2 L14 -2 L12 0Z', GL),
    // transporteur
    () => C(-20, 6, 9, 'url(#gC)') + C(20, 6, 9, 'url(#gC)') + P('M-14 -8 H14 L20 2 L14 10 H-14 L-20 2Z', B1, ol()) + Rc(-14, -8, 28, 4, HW) + Rc(-24, 0, 10, 8, HD, 3, ol(1)) + Rc(14, 0, 10, 8, HD, 3, ol(1)) + P('M10 -6 L16 -6 L18 0 L10 0Z', GL, ol(1)),
    // wyverne ennemie
    () => { const c = pick(['#8a3a2a', '#7a5a30']); return P('M-2 -2 Q-12 -20 -24 -14 Q-16 -10 -18 -2 Q-10 -6 -2 2Z', shade(c, .15), ol(1.2)) + P('M2 -2 Q12 -20 24 -14 Q16 -10 18 -2 Q10 -6 2 2Z', shade(c, .15), ol(1.2)) + PO('M0 9 Q-5 16 2 23', c, 2) + E(0, 2, 5, 8, c, ol()) + C(0, -6, 4, c, ol()) + C(0, -7, 1, EYE); },
    () => boom(rnd(14, 22)),
  ],
  bonusDraw: () => LO(-6, 18, -6, -18, '#b9c2c6', 1.6) + P('M-5 -17 H13 V-3 H-5Z', B1, ol(1.3)) + T(4, -10, P(star(5, 4, 1.6), '#fff')) + C(-6, -19, 2, HAZ, ol(1)),
  bonusSky: false,
  big: [
    // centre de commandement
    () => { let s = E(0, 100, 145, 18, '#2a1a10', op('.45')) + Rc(-118, 70, 22, 30, '#5a6470', 2, ol(2.5)) + Rc(96, 70, 22, 30, '#5a6470', 2, ol(2.5));
      s += P('M-120 90 L-110 20 L-70 -20 H70 L110 20 L120 90Z', '#7d8896', ol(3)) + P('M-110 20 L-70 -20 H70 L110 20Z', HW2) + P('M-104 40 H104', 'none', st(B1, 8));
      s += Rc(-60, -80, 120, 62, '#6a7684', 6, ol(3)) + Rc(-60, -80, 120, 12, B1, 4);
      for (let x = -50; x < 50; x += 22) s += Rc(x, -60, 14, 8, GL, 1);
      s += Rc(-30, 30, 60, 60, '#3a4450', 3, ol(3)) + hazard(-30, 30, 60, 8) + LO(40, -80, 40, -130, '#5a6470', 3) + C(40, -132, 5, '#ff3b3b', ol(1.5)) + T(-40, -95, P('M-16 -4 Q0 12 16 -4 Q0 2 -16 -4Z', HW, ol(2)));
      for (const x of [-90, -60, 60, 90]) s += C(x, 62, 4, GL);
      return s + T(-80, 0, P(star(5, 10, 4), HW, ol(1.5))) + T(80, 0, P(star(5, 10, 4), HW, ol(1.5))); },
    // bunker
    () => E(0, 100, 120, 16, '#2a1a10', op('.4')) + P('M-100 100 V30 Q-100 -40 0 -50 Q100 -40 100 30 V100Z', '#7d8896', ol(3)) + P('M-100 20 Q0 -10 100 20', 'none', st(B1, 10)) + Rc(-70, 30, 40, 10, OUT, 2) + Rc(30, 30, 40, 10, OUT, 2) + Rc(-24, 50, 48, 50, HD, 3, ol(3)) + hazard(-24, 50, 48, 7) + Rc(-90, 84, 36, 18, '#c9b07a', 4, ol(2)) + Rc(54, 84, 36, 18, '#c9b07a', 4, ol(2)),
    // marcheur géant
    () => { let s = E(0, 100, 110, 14, '#2a1a10', op('.4'));
      s += P('M-50 20 L-70 70 L-58 100 H-24 L-36 70 L-24 20Z', '#5a6470', ol(3)) + P('M24 20 L36 70 L24 100 H58 L70 70 L50 20Z', '#5a6470', ol(3)) + Rc(-64, 56, 32, 20, B1, 6, ol(2.5)) + Rc(32, 56, 32, 20, B1, 6, ol(2.5)) + Rc(-56, 62, 16, 6, GL, 2) + Rc(40, 62, 16, 6, GL, 2);
      for (const x of [-58, 58]) s += Rc(x - 18, -112, 36, 72, '#3a4450', 6, ol(3)) + Rc(x - 18, -112, 36, 10, B1, 4) + C(x - 8, -114, 6, HD, ol(1.5)) + C(x + 8, -114, 6, HD, ol(1.5)) + Rc(x - 12, -82, 24, 6, GL, 2);
      s += P('M-62 -40 Q-68 30 -40 30 H40 Q68 30 62 -40 Q0 -72 -62 -40Z', HW, ol(3)) + P('M-40 -30 H40 L34 20 H-34Z', B1, ol(2.5)) + C(0, -8, 26, 'url(#gC)') + C(0, -8, 12, GL, ol(2)) + P('M-54 -30 Q-56 10 -42 22', 'none', st('#ffffff', 5));
      s += Rc(-124, -10, 64, 28, '#3a4450', 8, ol(3)) + Rc(-134, -6, 14, 20, HD, 3, ol(2)) + Rc(-114, -4, 44, 4, GL, 2) + Rc(60, -10, 64, 28, '#3a4450', 8, ol(3)) + Rc(120, -6, 14, 20, HD, 3, ol(2)) + Rc(70, -4, 44, 4, GL, 2);
      s += T(-74, -6, P(star(5, 8, 3.2), HW, ol(1.2))) + T(74, -6, P(star(5, 8, 3.2), HW, ol(1.2)));
      return s + Rc(-16, -64, 32, 22, B1, 5, ol(2.5)) + Rc(-10, -57, 20, 7, VIS, 2, ol(1.2)); },
    // hangar
    () => { let s = E(0, 100, 145, 16, '#2a1a10', op('.4')) + P('M-130 100 V0 Q-130 -90 0 -95 Q130 -90 130 0 V100Z', '#7d8a8f', ol(3)); for (let x = -100; x <= 100; x += 25) s += P(`M${x} 100 V0 Q${x} -70 ${f1(x * .4)} -88`, 'none', st('#6b777c', 2.5)); return s + Rc(-70, 10, 140, 90, '#4f5a5e', 2, ol(3)) + L(0, 10, 0, 100, '#3a3f44', 3) + hazard(-70, 10, 140, 10) + P('M-34 -52 h68 v18 h-68z', B1, ol(2)) + T(0, -43, P(star(5, 7, 2.8), HW)); },
    // artillerie déployée
    () => { let s = E(0, 100, 120, 14, '#2a1a10', op('.4')); for (const [a, b] of [[-60, -110], [60, 110]]) s += PO(`M${a} 50 L${b} 96`, '#5a6470', 7) + Rc(b - 14, 92, 28, 8, HD, 2, ol(2));
      s += Rc(-80, 20, 160, 50, '#5a6470', 10, ol(3)) + Rc(-80, 20, 160, 12, B1, 6) + P('M-50 20 Q-50 -30 0 -30 Q50 -30 50 20Z', B1, ol(3)) + P('M-36 10 Q-36 -18 0 -20', 'none', st(B3, 5));
      s += `<g transform="rotate(-20 20 -10)">${Rc(20, -22, 150, 16, HD, 4, ol(3)) + Rc(160, -26, 20, 24, '#3a4450', 3, ol(2.5))}</g>` + C(10, -6, 6, GL, ol(1.5));
      return s + T(-50, 46, P(star(5, 8, 3.2), HW, ol(1.2))); },
    // piste avec transporteur posé
    () => E(0, 92, 130, 26, '#6b7478', ol(3)) + E(0, 90, 100, 18, '#7d8a8f') + P('M-40 85 V70 M40 85 V70', 'none', st(HAZ, 5)) + C(-110, 50, 22, 'url(#gC)') + P('M-90 70 L-60 30 H60 L100 50 L110 70Z', B1, ol(3)) + Rc(-60, 30, 120, 8, HW) + P('M30 32 L70 34 L92 50 L40 50Z', GL, ol(2)) + P('M-90 70 L-130 40 L-110 72Z M-40 30 L-70 -10 L-40 -10 L-10 30Z', B2, ol(2.5)) + Rc(-30, 50, 50, 8, HAZ, 1, ol(1.5)),
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2430"/><stop offset=".5" stop-color="#8a5040"/><stop offset="1" stop-color="#f0a868"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a0603c"/><stop offset="1" stop-color="#5a3020"/></linearGradient>
<linearGradient id="hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6270"/><stop offset="1" stop-color="#22262e"/></linearGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)');
    for (let i = 0; i < 36; i++) s += E(rnd(0, W), rnd(20, HZ - 120), rnd(140, 340), rnd(30, 80), pick(['#4a3a40', '#5a4844', '#6a5048']), op(rnd(.35, .7).toFixed(2)));
    // mesas du canyon
    let d = `M0 ${HZ}`; for (let x = 0; x <= W; x += rnd(160, 320)){ const h = rnd(90, 260), w = rnd(100, 200); d += ` L${f1(x)} ${f1(HZ - h + 30)} L${f1(x + 20)} ${f1(HZ - h)} L${f1(x + w)} ${f1(HZ - h)} L${f1(x + w + 20)} ${f1(HZ - h + 40)}`; } d += ` L${W} ${HZ + 40} L0 ${HZ + 40}Z`;
    s += P(d, '#a8603e') + P(d, 'none', st('#c8804e', 3)); for (let i = 0; i < 6; i++) s += P(ridge(W, HZ - 60 + i * 14, 6, 80, 0), 'none', st('#8a4a30', 2) + op('.5'));
    s += P(ridge(W, HZ + 10, 40, 60, .1), '#8a4a30');
    // incendies au loin
    for (let i = 0; i < 7; i++){ const x = rnd(100, W - 100); s += T(x, HZ - rnd(0, 30), C(0, 0, rnd(40, 80), 'url(#gF)') + smoke(5, 30, rnd(-15, 15), -40)); }
    // vaisseau amiral en feu, traînées de fumée
    const sx = 1600, sy = 250;
    for (const [dx, dy] of [[-560, 30], [-560, -30], [-520, 80]]) s += P(`M${sx + dx} ${sy + dy} Q${sx - 1100} ${sy + dy + 60} ${sx - 1700} ${sy + dy + 260}`, 'none', st('#2a2626', 46) + op('.55'));
    s += T(sx, sy, P('M-560 -70 L-420 -120 L300 -120 L520 -60 L600 0 L520 60 L300 120 L-420 120 L-560 70Z', 'url(#hull)', ol(4))
      + P('M-400 -120 L-380 -170 L120 -170 L160 -120Z', '#3a404a', ol(3)) + P('M-300 120 L-280 160 L60 160 L90 120Z', '#2a2e36', ol(3))
      + P('M300 -120 L520 -60 L600 0 L300 0Z', '#4a525e', ol(3)) + Rc(-380, -40, 640, 18, B2, 3) + Rc(-380, 22, 640, 10, '#1a1e24', 2)
      + (() => { let w = ''; for (let x = -360; x < 260; x += 34) w += Rc(x, -90, 18, 8, GL, 2, op('.85')) + Rc(x + 6, 60, 14, 6, '#ffb030', 2, op('.7')); return w; })()
      + C(-560, -40, 46, 'url(#gC)') + C(-560, 40, 46, 'url(#gC)') + C(-560, -40, 30, '#c8f8ff', ol(3)) + C(-560, 40, 30, '#c8f8ff', ol(3)) + C(-560, -40, 14, '#ffffff') + C(-560, 40, 14, '#ffffff')
      + T(-100, -40, boom(60)) + T(180, 70, boom(46)) + T(-260, 90, boom(36)));
    for (let i = 0; i < 8; i++){ const x = sx + rnd(-500, 400); s += P(`M${f1(x)} ${sy + rnd(-60, 60)} L${f1(x + rnd(200, 400))} ${f1(sy + rnd(100, 300))}`, 'none', st('#ffd23a', 2) + op('.8')); }
    s += Rc(0, HZ, W, H - HZ, 'url(#gnd)');
    for (const [y, w] of [[HZ + 380, 70], [HZ + 920, 95]]){ let r = `M-20 ${y}`; for (let x = 0; x <= W + 200; x += 200) r += ` Q${x + 100} ${f1(y + rnd(-60, 60))} ${x + 200} ${f1(y + rnd(-20, 20))}`; s += P(r, 'none', st('#5a4a44', w)) + P(r, 'none', st('#e8d8a0', 3) + ' stroke-dasharray="30 30"'); }
    for (let i = 0; i < 40; i++){ const y = rnd(HZ + 20, H), x = rnd(0, W), k = .5 + (y - HZ) / (H - HZ); s += P(blob(rnd(40, 120) * k, rnd(10, 26) * k, 9, .25, x, y), pick(['#8a4a30', '#b06a44', '#7a3a24']), op('.6')); }
    return s;
  }
};

// =====================================================================================
// Composition d'une planche
// =====================================================================================
function icon(fn){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-26 -26 52 52">${fn()}</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/%20/g, ' ').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2F/g, '/').replace(/%22/g, "'");
}
function build(F, id, n){
  R = rng32(F.seed);
  const W = 3000, H = 2000, HZ = 560;
  const persp = y => .72 + .5 * (y - HZ) / (H - HZ);
  const occ = [], ground = [], sky = [];
  const free = (x, y, r, k) => occ.every(o => Math.hypot(o.x - x, o.y - y) > (o.r + r) * k);
  // 1. grandes structures
  for (let n = 0, t = 0; n < 9 && t < 5000; t++){
    const x = rnd(170, W - 170), y = rnd(HZ + 90, HZ + 560), s = persp(y) * rnd(.85, 1.15), r = 120 * s;
    if (!free(x, y, r, 1.05)) continue;
    occ.push({x, y, r, big: true}); ground.push({z: y + 100 * s, svg: G(x, y, s, 0, pick(F.big)(), R() < .5)}); n++;
  }
  // 2. objets à trouver
  const items = [];
  F.targets.forEach(([label, fn]) => {
    for (let t = 0; t < 20000; t++){
      const x = rnd(90, W - 90), y = rnd(HZ + 70, H - 60), s = persp(y) * .92, r = 21 * s;
      if (!free(x, y, r + 30, 1)) continue;
      if (items.some(o => Math.hypot(o.x - x, o.y - y) < 330)) continue;
      const rot = rnd(-25, 25);
      occ.push({x, y, r: r + 4}); items.push({label, icon: icon(fn), x: Math.round(x), y: Math.round(y), r: Math.round(r)});
      ground.push({z: y + r * .6, svg: G(x, y, s, rot, fn())}); return;
    }
    throw new Error('placement impossible : ' + label);
  });
  // 3. objets du bonus
  for (let n = 0, t = 0; n < F.bonusN && t < 20000; t++){
    const inSky = F.bonusSky && R() < .45;
    const x = rnd(60, W - 60), y = inSky ? rnd(60, HZ - 60) : rnd(HZ + 60, H - 50), s = inSky ? rnd(.9, 1.2) : persp(y) * .95, r = 19 * s;
    if (!free(x, y, r + 14, 1)) continue;
    occ.push({x, y, r: r + 4}); (inSky ? sky : ground).push({z: y + r * .6, svg: G(x, y, s, rnd(-10, 10), F.bonusDraw())}); n++;
  }
  // 4. ciel
  for (let n = 0, t = 0; n < 40 && t < 20000; t++){
    const x = rnd(40, W - 40), y = rnd(50, HZ - 40), s = rnd(.9, 1.7), r = 22 * s;
    if (!free(x, y, r, .9)) continue;
    occ.push({x, y, r}); sky.push({z: y, svg: G(x, y, s, rnd(-15, 15), pick(F.sky)(), R() < .5)}); n++;
  }
  // 5. décor au sol, très dense
  let clutter = 0;
  for (let t = 0; t < 120000 && clutter < 900; t++){
    const y = rnd(HZ + 15, H - 15), x = rnd(20, W - 20), s = persp(y) * rnd(.85, 1.6), r = 20 * s;
    if (!free(x, y, r, .72)) continue;
    occ.push({x, y, r}); ground.push({z: y + r * .5, svg: G(x, y, s, rnd(-8, 8), pick(F.clutter)(), R() < .5)}); clutter++;
  }
  sky.sort((a, b) => a.z - b.z); ground.sort((a, b) => a.z - b.z);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${DEFS}${F.bg(W, H, HZ)}${sky.map(o => o.svg).join('')}${ground.map(o => o.svg).join('')}</svg>`;
  fs.mkdirSync(path.join(ROOT, 'img'), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'img', id + '.svg'), svg);
  return {id, n, name: F.name, title: `Niveau ${n} — ${F.name}`, mood: F.mood, w: W, h: H, items,
    count: sky.length + ground.length, bats: F.bonusN, bonus: F.bonus,
    kind: 'faction', sub: F.sub, cat: 'stellaire', img: `img/${id}.svg`, thumb: `img/${id}.svg`, vector: true};
}

const levels = [build(ESS, 's01', 1), build(EXO, 's02', 2), build(HUM, 's03', 3)];
// injection des niveaux dans index.html, entre les repères STELLAIRE-DEBUT / STELLAIRE-FIN
const idx = path.join(ROOT, 'index.html');
const html = fs.readFileSync(idx, 'utf8');
const re = /(\/\/ STELLAIRE-DEBUT[^\n]*\n)[\s\S]*?(\/\/ STELLAIRE-FIN)/;
if (!re.test(html)) throw new Error('repères STELLAIRE introuvables dans index.html');
fs.writeFileSync(idx, html.replace(re, (m, a, b) => a + 'const STELLAIRE = ' + JSON.stringify(levels) + ';\n' + b));
levels.forEach(l => console.log(l.id, l.name, 'objets:', l.items.length, 'bonus:', l.bats, 'éléments:', l.count, 'taille:', fs.statSync(path.join(ROOT, 'img', l.id + '.svg')).size));
