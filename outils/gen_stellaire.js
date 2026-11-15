// Génère les planches vectorielles de la catégorie « Guerre stellaire » (univers original).
// Usage : node outils/gen_stellaire.js <dossier du jeu>
// Écrit img/s01.svg, img/s02.svg, img/s03.svg et outils/stellaire_levels.json
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
const P = (d, f, x = '') => `<path d="${d}" fill="${f}"${x}/>`;
const C = (cx, cy, r, f, x = '') => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${f}"${x}/>`;
const E = (cx, cy, rx, ry, f, x = '') => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${f}"${x}/>`;
const Rc = (x, y, w, h, f, rx = 0, xx = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="${f}"${xx}/>`;
const L = (x1, y1, x2, y2, c, w) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const LO = (x1, y1, x2, y2, c, w) => L(x1, y1, x2, y2, OUT, w + 2.4) + L(x1, y1, x2, y2, c, w); // trait avec contour
const PO = (d, c, w) => P(d, 'none', st(OUT, w + 2.4)) + P(d, 'none', st(c, w)); // chemin avec contour
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
function stars(W, h, n){ let s = ''; for (let i = 0; i < n; i++) s += C(rnd(0, W), rnd(0, h), rnd(.8, 2.4), '#fff', ` opacity="${rnd(.3, .9).toFixed(2)}"`); return s; }

// =====================================================================================
// FACTION 1 : L'ESSAIM (monde organique)
// =====================================================================================
const BONE = '#efe3c4';
function jawTeeth(){ let s = ''; for (const a of [25, 50, 75, 105, 130, 155]){ const t = a * Math.PI / 180, x = 12 * Math.cos(t), y = -8 + 16 * Math.sin(t); const dx = -x * .35, dy = (-2 - y) * .35; const nx = -Math.sin(t) * 2.2, ny = Math.cos(t) * 2.2; s += P(poly([[x + nx, y + ny], [x - nx, y - ny], [x + dx, y + dy]]), '#fffaf0', ol(1)); } return s; }
const ESS = {
  name: "Ruche de l'Essaim", sub: "Faction : l'Essaim", mood: 'night', bonus: 'spores bleues', bonusN: 9, seed: 7101,
  targets: [
    ['un œuf luisant', () => C(0, 2, 21, '#c8f04a', ' opacity=".22"') + E(0, 3, 12, 16, '#b9ea3c', ol()) + E(-4, -3, 3.5, 6, '#f3ffb8') + P('M-7 10 Q0 3 7 12', 'none', st('#5f8f12', 1.2))],
    ['une larve', () => { let s = ''; [[-14, 4, 6], [-7, 2, 7], [0, 1, 7.5], [7, 2, 7]].forEach(([x, y, r]) => s += E(x, y, r * .8, r, '#f0dfbf', ol(1.3))); return s + P('M18 -3 L23 -7 M18 3 L23 6', 'none', st(OUT, 1.8)) + C(14, 0, 6.5, '#b07a4e', ol(1.3)) + C(15, -2, 1.4, OUT); }],
    ['un casque de soldat', () => P('M-16 6 Q-17 -17 0 -17 Q17 -17 16 6 Z', '#8d989c', ol()) + P('M-12 -6 H12 Q13 2 10 4 H-10 Q-13 2 -12 -6Z', '#3fb4ff', ol(1.2)) + P('M-9 -3 H-2', 'none', st('#c8ecff', 2)) + Rc(-19, 5, 38, 6, '#5c676c', 2, ol())],
    ["une griffe d'os", () => P('M-12 16 Q-16 -4 12 -19 Q4 -4 5 16 Z', BONE, ol()) + P('M-6 13 Q-8 0 7 -12', 'none', st('#c9b892', 2)) + Rc(-15, 13, 23, 6, '#8a5a6a', 2, ol())],
    ['un cocon violet', () => P('M0 -21 Q14 -8 0 21 Q-14 -8 0 -21Z', '#9b3fc0', ol()) + P('M-6 -10 Q0 -4 6 -10 M-8 0 Q0 6 8 0 M-6 10 Q0 15 6 10', 'none', st('#d79bf0', 1.6)) + E(-3, -8, 2, 5, '#e6c2f7')],
    ['un œil sur pédoncule', () => PO('M-2 21 Q-8 6 1 -6', '#c45a8a', 5) + C(2, -11, 9.5, '#fff7e8', ol()) + C(4, -11, 5.5, '#ff8a00') + E(4, -11, 1.5, 4.6, '#140a10') + C(1, -14, 2, '#fff')],
    ['une mâchoire', () => P('M-18 -8 Q-18 18 0 18 Q18 18 18 -8 L12 -8 Q12 8 0 8 Q-12 8 -12 -8Z', BONE, ol()) + jawTeeth()],
    ['un cristal bleu', () => P('M-6 18 L-15 2 L-10 -2 L-4 10Z', '#5aa0ff', ol()) + P('M4 18 L10 0 L15 6 L12 18Z', '#2f6fd6', ol()) + P('M-2 18 L-8 -4 L-2 -20 L4 -4 Z', '#3d8bff', ol()) + P('M-2 -20 L4 -4 L-2 18Z', '#8fc0ff') + Rc(-17, 16, 34, 5, '#4a2a3a', 2, ol())],
    ['un baril toxique', () => Rc(-12, -17, 24, 34, '#f2c230', 4, ol()) + Rc(-12, -9, 24, 3, '#2a2020') + Rc(-12, 6, 24, 3, '#2a2020') + P(star(3, 5, 1.5), '#2a2020') + Rc(-9, -15, 3, 30, '#fff3b0', 1, ' opacity=".5"') + P('M-12 12 Q-15 18 -10 21 Q-7 16 -9 12Z', '#7dff4a', ol(1))],
    ['un scarabée doré', () => { let s = ''; for (const y of [-4, 3, 10]) s += L(-8, y, -17, y - 5, OUT, 2.2) + L(8, y, 17, y - 5, OUT, 2.2); return s + L(-2, -15, -7, -21, OUT, 1.6) + L(2, -15, 7, -21, OUT, 1.6) + C(0, -12, 5.5, '#7a5a10', ol()) + E(0, 3, 10.5, 13.5, '#e8b422', ol()) + L(0, -10, 0, 16, '#7a5a10', 1.4) + E(-4, -2, 2.5, 5, '#fff1a8'); }],
    ["une fiole d'échantillon", () => Rc(-6, 0, 12, 16, '#5de05d', 5) + Rc(-6, -12, 12, 28, '#d9f4ff', 5, ol() + ' fill-opacity=".35"') + Rc(-5, -19, 10, 8, '#9a6a3a', 2, ol()) + L(-3, -8, -3, 12, '#fff', 1.5)],
    ['un crâne', () => P('M-13 2 Q-15 -17 0 -17 Q15 -17 13 2 L9 6 V13 H-9 V6 Z', '#f2ecdc', ol()) + E(-5.5, -3, 4, 4.5, '#2a1a22') + E(5.5, -3, 4, 4.5, '#2a1a22') + P('M0 3 L-2 7 H2Z', '#2a1a22') + L(-4.5, 9, -4.5, 12.5, '#2a1a22', 1.3) + L(0, 9, 0, 12.5, '#2a1a22', 1.3) + L(4.5, 9, 4.5, 12.5, '#2a1a22', 1.3)],
    ['une antenne radio', () => C(0, -20, 7, '#ff3b3b', ' opacity=".3"') + LO(-9, 18, 0, 0, '#9aa4a8', 2) + LO(9, 18, 0, 0, '#9aa4a8', 2) + LO(0, 18, 0, -10, '#9aa4a8', 2.5) + P('M-10 -12 Q0 -2 10 -12 Q0 -19 -10 -12Z', '#c9d1d4', ol()) + C(0, -20, 3, '#ff3b3b', ol(1))],
    ['une aile membraneuse', () => P('M-16 14 Q-18 -14 16 -18 Q8 -6 12 4 Q2 2 2 12 Q-6 8 -16 14Z', '#e7a6c9', ol() + ' fill-opacity=".9"') + P('M-16 14 L12 -14 M-10 8 L6 -6 M-14 10 L-2 -14 M-8 12 L8 6', 'none', st('#9b3f6a', 1.2))],
  ],
  clutter: [
    () => { const rx = rnd(18, 26), ry = rx * rnd(.45, .65), c = pick(['#5a2a6e', '#6a2f7a', '#4d2461']); let s = P(blob(rx, ry, 9, .18), c, ol()) + P(blob(rx * .6, ry * .45, 7, .2, -rx * .15, -ry * .35), shade(c, .22)); for (let i = 0; i < ri(1, 3); i++) s += C(rnd(-rx * .6, rx * .6), rnd(-ry * .5, ry * .3), rnd(2, 3.5), '#9cff5a', ol(1)); return s; },
    () => { const c = pick(['#e5d6b5', '#d8c39a']), h = rnd(.8, 1.2); return P(`M-7 14 Q-3 ${f1(-6 * h)} ${f1(rnd(-2, 6))} ${f1(-24 * h)} Q5 ${f1(-4 * h)} 8 14Z`, c, ol()) + P(`M-3 12 Q-1 0 1 ${f1(-12 * h)}`, 'none', st('#fff6dc', 1.6)); },
    () => { const c = pick(['#c45a8a', '#b04d7c', '#9e4a8a']); return E(0, 4, 14, 16, c, ol()) + P('M-8 -2 Q-2 6 -6 16 M6 -6 Q2 4 8 14', 'none', st(shade(c, -.35), 1.6)) + E(0, -10, 6, 3, '#2a0f1e', ol(1.2)) + E(-5, 0, 3, 6, shade(c, .35)); },
    () => { const c = pick(['#4a2a3a', '#5b3346', '#3d2438', '#6b3b4f']); let s = ''; for (const x of [-7, 0, 7]) s += P(`M${x} 2 L${x - 4} 13 L${x - 7} 18 M${x} 2 L${x + 3} 13 L${x + 6} 18`, 'none', st(OUT, 2.2)); return s + E(-2, 0, 14, 8, c, ol()) + C(13, -3, 6.5, shade(c, .15), ol()) + C(15, -5, 1.6, '#ff4040') + C(12, -5, 1.6, '#ff4040') + P('M-12 -4 Q-2 -12 8 -6', 'none', st(shade(c, .4), 2)) + P('M18 -1 L23 2 M17 1 L21 6', 'none', st(OUT, 1.6)); },
    () => { const a = rnd(-8, 8), d = `M-18 12 Q-10 -10 0 4 Q10 18 18 ${f1(-8 + a)}`; return PO(d, pick(['#8a3a9a', '#7a2f8a', '#a04aa0']), 4.4) + C(18, -8 + a, 2.6, '#c77ad6', ol(1)); },
    () => { const c = pick(['#5e4a63', '#4f3f55', '#6c5560']); return P(blob(rnd(14, 22), rnd(10, 15), 7, .3), c, ol()) + P(blob(7, 4, 6, .3, -4, -5), shade(c, .25)); },
    () => { let s = ''; for (let i = 0; i < ri(3, 5); i++){ const x = rnd(-12, 12), y = rnd(-8, 8), r = rnd(3, 6); s += C(x, y, r + 3, '#9cff5a', ' opacity=".25"') + C(x, y, r, '#7ee03a', ol(1.2)) + C(x - r * .3, y - r * .3, r * .35, '#e8ffc8'); } return s; },
    () => E(0, 0, 20, 9, '#7b3a8f', ol()) + E(0, 1, 15, 6, '#14060f') + P('M-12 -2 Q0 -6 12 -2', 'none', st('#a65cb8', 1.5)),
    () => { let s = ''; for (let i = -2; i <= 2; i++){ const d = `M${i * 6} 12 Q${f1(i * 6 + rnd(-4, 4))} -14 ${i * 6 + 8} -10`; s += PO(d, '#e9dcc0', 2.6); } return s + Rc(-16, 10, 32, 5, '#d8c39a', 2, ol()); },
    () => { const c = pick(['#b88a74', '#a0705e', '#c09a7a']); let s = ''; [[-8, 4], [6, 5], [-1, -4]].forEach(([x, y]) => s += E(x, y, 6, 8, c, ol(1.3)) + E(x - 2, y - 3, 1.6, 3, shade(c, .4))); return s; },
    () => { const c = pick(['#3a1a33', '#4a2240']); return P('M-18 10 Q-14 -6 -4 -2 Q0 -16 8 -8 Q16 -10 18 10Z', c, ol()) + C(-6, 2, 3, '#ff8a3d', ol(1)) + C(6, 0, 2.5, '#ff8a3d', ol(1)); },
  ],
  sky: [
    () => { const c = pick(['#6b3b4f', '#7a2f5a', '#5a2a4a']); return E(-9, -4, 13, 5, '#e7b6d6', ol(1.2) + ' fill-opacity=".75" transform="rotate(-25 -9 -4)"') + E(9, -4, 13, 5, '#e7b6d6', ol(1.2) + ' fill-opacity=".75" transform="rotate(25 9 -4)"') + E(0, 3, 5, 12, c, ol()) + C(0, -9, 4.5, shade(c, .2), ol()) + C(-1.6, -10, 1.1, '#ff4040') + C(1.6, -10, 1.1, '#ff4040'); },
    () => { const c = '#4a2240'; return P('M-22 0 Q-10 -12 0 -2 Q10 -12 22 0 Q10 -4 0 6 Q-10 -4 -22 0Z', c, ol()) + C(0, 0, 3, '#ff8a3d'); },
  ],
  bonusDraw: () => C(0, 0, 10, '#4ef0ff', ' opacity=".3"') + P(star(4, 9, 2.5), '#9ff8ff', ol(1)) + C(0, 0, 4.5, '#4ef0ff', ol(1)) + C(-1.2, -1.2, 1.6, '#fff'),
  bonusSky: true,
  big: [
    () => { const c = pick(['#5a2f4a', '#4e2a45', '#633553']); let s = E(0, 100, 125, 22, '#6a2f7a', ol(2.5));
      s += P('M-90 100 Q-100 20 -50 -60 Q-30 -150 0 -170 Q30 -150 50 -60 Q100 20 90 100Z', c, ol(3));
      s += P('M-62 92 Q-72 10 -32 -60 Q-12 -128 0 -150', 'none', st(shade(c, .25), 8));
      [[-100, 34], [-40, 58], [20, 84], [70, 88]].forEach(([y, w]) => s += P(`M${-w} ${y} Q0 ${y + 18} ${w} ${y}`, 'none', st(shade(c, -.35), 4)));
      s += P('M-22 -118 L-46 -168 L-8 -132Z M22 -118 L46 -168 L8 -132Z M-55 -40 L-96 -70 L-50 -20Z M55 -40 L96 -70 L50 -20Z', BONE, ol(2.5));
      [[-28, 0, 12, 16], [32, 42, 10, 13], [6, -84, 8, 11], [-40, 60, 7, 9]].forEach(([x, y, rx, ry]) => s += E(x, y, rx + 6, ry + 6, '#ff8a3d', ' opacity=".25"') + E(x, y, rx, ry, '#ff8a3d', ol(2)) + E(x, y + 2, rx * .55, ry * .6, '#ffd28a'));
      return s; },
    () => { const c = pick(['#5a2f4a', '#6b3550']); let s = E(0, 90, 95, 18, '#6a2f7a', ol(2.5)) + P('M-45 90 Q-38 10 -18 -60 L18 -60 Q38 10 45 90Z', c, ol(3)) + P('M-28 80 Q-24 10 -10 -50', 'none', st(shade(c, .25), 6)) + E(0, -60, 20, 7, '#14060f', ol(2.5));
      for (let i = 0; i < 7; i++) s += C(rnd(-30, 30), -80 - i * 18, 14 + i * 3, '#9cff5a', ` opacity="${(0.32 - i * .035).toFixed(2)}"`);
      return s + P('M-50 60 L-80 40 L-46 74Z M50 40 L84 20 L48 58Z', BONE, ol(2)); },
    () => { let s = E(0, 90, 120, 20, '#5a2a6e', ol(2.5)); for (let i = 0; i < 6; i++){ const x = -80 + i * 32, h = rnd(60, 130); s += P(`M${x - 14} 90 Q${x - 10} ${90 - h * .6} ${x + rnd(-10, 10)} ${90 - h} Q${x + 10} ${90 - h * .6} ${x + 14} 90Z`, pick(['#9e4a8a', '#c45a8a', '#7a3a7a']), ol(2.5)) + E(x, 90 - h + 6, 6, 4, '#2a0f1e'); } return s; },
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14051c"/><stop offset=".55" stop-color="#5a1838"/><stop offset="1" stop-color="#e0683a"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a2a40"/><stop offset="1" stop-color="#2a1020"/></linearGradient>
<radialGradient id="sun"><stop offset="0" stop-color="#ffd9a0"/><stop offset=".6" stop-color="#ff8a4a"/><stop offset="1" stop-color="#ff8a4a" stop-opacity="0"/></radialGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)') + stars(W, HZ * .55, 160);
    s += C(2280, 300, 260, 'url(#sun)') + C(2280, 300, 120, '#ffb070') + E(2280, 300, 230, 34, 'none', st('#ffd9a0', 6) + ' opacity=".7" transform="rotate(-12 2280 300)"');
    s += C(560, 170, 46, '#f3c9a0') + C(548, 160, 46, '#3a1030', ' opacity=".55"');
    s += P(ridge(W, HZ - 40, 140, 60, .25), '#3a1430') + P(ridge(W, HZ, 70, 40, .15), '#2e0f26');
    s += Rc(0, HZ, W, H - HZ, 'url(#gnd)');
    for (let i = 0; i < 46; i++){ const x = rnd(0, W), y = rnd(HZ + 30, H), k = .5 + (y - HZ) / (H - HZ); s += P(blob(rnd(80, 200) * k, rnd(20, 50) * k, 10, .25, x, y), pick(['#5a2a6e', '#6a2f7a', '#4d2461']), ' opacity=".75"'); }
    for (let i = 0; i < 24; i++){ const x = rnd(0, W), y = rnd(HZ + 40, H), k = .5 + (y - HZ) / (H - HZ); s += P(`M${f1(x)} ${f1(y)} q${f1(60 * k)} ${f1(-30 * k)} ${f1(140 * k)} ${f1(rnd(-20, 20) * k)}`, 'none', st('#8a3a9a', 6 * k) + ' opacity=".6"'); }
    return s;
  }
};

// =====================================================================================
// FACTION 2 : LES ÉTHÉRÉS (cité psionique dorée)
// =====================================================================================
const GOLD = '#f2c14e', GOLD2 = '#b8862b', CY = '#5ff3ff', STONE = '#efe6d0';
const ETH = {
  name: 'Sanctuaire des Éthérés', sub: 'Faction : les Éthérés', mood: 'day', bonus: 'lanternes flottantes', bonusN: 11, seed: 7202,
  targets: [
    ['une amulette dorée', () => P('M-12 -16 Q0 -2 12 -16', 'none', st(GOLD2, 2.2)) + C(0, 4, 13, GOLD, ol()) + C(0, 4, 8, GOLD2) + P('M0 -3 L5 4 L0 11 L-5 4Z', CY, ol(1.2)) + C(-4, 0, 2, '#fff6c8')],
    ['un masque doré', () => P('M-14 -16 Q0 -22 14 -16 Q16 4 0 20 Q-16 4 -14 -16Z', GOLD, ol()) + P('M-10 -6 L-3 -4 L-4 -1 L-10 -3Z M10 -6 L3 -4 L4 -1 L10 -3Z', CY) + P('M0 -18 V2', 'none', st(GOLD2, 1.6)) + P('M-5 10 Q0 13 5 10', 'none', st(OUT, 1.3))],
    ["une lance d'énergie", () => LO(-17, 17, 10, -10, '#e8c060', 3) + P('M8 -8 L21 -21 L13 -5Z', CY, ol(1.3)) + C(-17, 17, 3, GOLD2, ol(1)) + LO(3, -9, 9, -3, GOLD2, 2)],
    ['un cristal violet', () => P('M-6 18 L-15 2 L-10 -2 L-4 10Z', '#c27aff', ol()) + P('M4 18 L10 0 L15 6 L12 18Z', '#8a3ad6', ol()) + P('M-2 18 L-8 -4 L-2 -20 L4 -4 Z', '#a64cff', ol()) + P('M-2 -20 L4 -4 L-2 18Z', '#d6a8ff') + Rc(-17, 16, 34, 5, GOLD, 2, ol())],
    ['une lyre', () => P('M-12 -16 Q-18 4 -6 14 H6 Q18 4 12 -16 Q8 -8 6 6 H-6 Q-8 -8 -12 -16Z', GOLD, ol()) + L(-3, -10, -3, 6, CY, 1.2) + L(0, -10, 0, 6, CY, 1.2) + L(3, -10, 3, 6, CY, 1.2) + Rc(-7, -12, 14, 3, GOLD2, 1, ol(1))],
    ['un sablier céleste', () => P('M-9 -14 L9 -14 L1 0 L9 14 L-9 14 L-1 0Z', '#dff6ff', ol(1.3) + ' fill-opacity=".7"') + P('M-6 -11 L6 -11 L0 -2Z', CY) + P('M-7 13 L7 13 L0 6Z', CY) + LO(-11, -14, -11, 14, GOLD, 2) + LO(11, -14, 11, 14, GOLD, 2) + Rc(-13, -18, 26, 4, GOLD2, 1, ol()) + Rc(-13, 14, 26, 4, GOLD2, 1, ol())],
    ['un bouclier rond', () => C(0, 0, 17, '#2b6cd6', ol()) + C(0, 0, 15, 'none', st(GOLD, 3.5)) + P(star(4, 10, 3), GOLD, ol(1))],
    ['une étoile à huit branches', () => C(0, 0, 17, '#fff2b0', ' opacity=".35"') + P(star(8, 19, 8), '#ffe27a', ol()) + C(0, 0, 5, '#fff')],
    ['un calice', () => P('M-13 -16 H13 Q12 0 2 4 V12 H8 V17 H-8 V12 H-2 V4 Q-12 0 -13 -16Z', GOLD, ol()) + E(0, -14, 11, 2.6, '#7a2a8a') + C(-6, -7, 2, CY) + C(6, -7, 2, CY)],
    ['une sphère armillaire', () => Rc(-2, 9, 4, 7, GOLD2, 0, ol(1)) + Rc(-9, 15, 18, 4, GOLD2, 1, ol(1)) + C(0, -3, 6, CY, ol(1.2)) + E(0, -3, 15, 6, 'none', st(OUT, 3.6)) + E(0, -3, 15, 6, 'none', st(GOLD, 2)) + E(0, -3, 6, 15, 'none', st(OUT, 3.6)) + E(0, -3, 6, 15, 'none', st(GOLD, 2)) + `<g transform="rotate(45 0 -3)">${E(0, -3, 15, 4, 'none', st(OUT, 3.2)) + E(0, -3, 15, 4, 'none', st('#ffe9a0', 1.6))}</g>`],
    ['une clé ancienne', () => C(-10, -8, 8, 'none', st(OUT, 6.5)) + C(-10, -8, 8, 'none', st('#d9a441', 3.6)) + LO(-4, -2, 15, 17, '#d9a441', 3.4) + LO(10, 12, 15, 7, '#d9a441', 3) + LO(14, 16, 19, 11, '#d9a441', 3) + C(-10, -8, 2.4, CY)],
    ['un œuf de cristal', () => C(0, 2, 20, CY, ' opacity=".2"') + E(0, 2, 12, 16, '#9ff6ff', ol() + ' fill-opacity=".85"') + P('M-12 2 L0 -6 L12 2 M0 -6 L0 18 M-8 -10 L0 -6 L8 -10', 'none', st('#2bb5c8', 1.2)) + E(-4, -6, 2.5, 5, '#fff')],
    ['un robot sonde', () => LO(-8, 6, -14, 18, '#8a8270', 1.4) + LO(8, 6, 14, 18, '#8a8270', 1.4) + LO(0, 8, 0, 19, '#8a8270', 1.4) + C(0, -2, 12, '#e9e2cf', ol()) + P('M-12 -1 H12', 'none', st(GOLD2, 2)) + C(0, -4, 5, OUT) + C(0, -4, 3, '#ff4fd8') + L(0, -14, 0, -20, OUT, 1.6) + C(0, -21, 2, '#ff4fd8')],
    ['une plume blanche', () => P('M-14 16 Q-12 -8 14 -18 Q12 2 -14 16Z', '#f6f3ea', ol()) + P('M-16 18 Q-2 2 12 -15', 'none', st('#b9b2a0', 1.6)) + P('M-6 6 L-2 2 M0 0 L4 -4 M-10 10 L-7 7', 'none', st('#d9d3c3', 1))],
  ],
  clutter: [
    () => { const h = rnd(26, 38); return Rc(-7, -h, 14, h + 12, STONE, 1, ol()) + L(-3, -h + 2, -3, 9, '#d8ccb0', 1.5) + L(3, -h + 2, 3, 9, '#d8ccb0', 1.5) + Rc(-10, -h - 5, 20, 6, GOLD, 1, ol()) + Rc(-10, 10, 20, 5, '#d9cdb0', 1, ol()); },
    () => P('M-8 14 V-6 L-4 -10 L0 -4 L4 -12 L8 -5 V14Z', STONE, ol()) + Rc(-11, 12, 22, 5, '#d9cdb0', 1, ol()) + `<g transform="rotate(${f1(rnd(-30, 30))} 14 12)">${Rc(8, 6, 14, 9, STONE, 1, ol())}</g>`,
    () => E(0, 24, 10, 3, CY, ' opacity=".4"') + P('M-6 14 L-4 -26 L0 -32 L4 -26 L6 14Z', '#e9e2cf', ol()) + P('M4 -26 L6 14 L1 14 L0 -26Z', '#cfc4aa') + P('M0 -26 V10', 'none', st(CY, 2)),
    () => { const c = pick([CY, '#7fd8ff', '#9ffff0']); return C(0, 0, 18, c, ' opacity=".18"') + P('M-4 14 L-12 -2 L-7 -5 L-1 8Z', shade(c, -.2), ol()) + P('M5 14 L10 -4 L15 2 L12 14Z', shade(c, -.35), ol()) + P('M0 14 L-5 -8 L1 -20 L6 -6Z', c, ol()) + P('M1 -20 L6 -6 L0 14Z', '#e6ffff'); },
    () => P(blob(16, 6, 7, .2, 0, -6), '#d9b07a', ol()) + P('M-14 -4 L-4 16 L2 8 L12 -4Z', '#a8743c', ol()) + E(0, 22, 10, 2.5, CY, ' opacity=".35"'),
    () => { let s = Rc(-14, -10, 28, 20, '#d9cdb0', 2, ol()) + Rc(-14, 6, 28, 4, '#c4b694', 1); const g = ri(0, 2); s += g === 0 ? C(0, -2, 5, 'none', st('#2bb5c8', 2)) + L(0, -9, 0, 5, '#2bb5c8', 2) : g === 1 ? P('M-7 3 L0 -8 L7 3Z', 'none', st('#2bb5c8', 2)) : P('M-8 -4 H8 M-4 -7 V2 M4 -7 V2', 'none', st('#2bb5c8', 2)); return s; },
    () => Rc(-11, 12, 22, 6, '#d9cdb0', 1, ol()) + P('M-10 13 L-7 -6 Q0 -10 7 -6 L10 13Z', '#e9e2cf', ol()) + PO('M-6 -4 L-12 -16 M6 -4 L12 -16', '#e9e2cf', 2.4) + C(0, -13, 5.5, '#e9e2cf', ol()) + P('M-6 -15 Q0 -24 6 -15', GOLD, ol(1)) + C(-2, -13, 1, CY) + C(2, -13, 1, CY),
    () => { const c = pick(['#7a4fd6', '#d64f9a', '#3fbf9f']); return P('M0 12 Q-10 6 -12 -2 Q-4 2 0 10Z', '#6fa05a', ol(1.2)) + PO('M0 16 Q-4 0 2 -12', '#5f8a4a', 2.4) + E(2, -14, 6, 8, c, ol()) + E(0, -16, 2, 3, shade(c, .5)); },
    () => Rc(-18, 4, 36, 10, '#d9cdb0', 1, ol()) + Rc(-12, -4, 24, 9, '#e5dcc4', 1, ol()) + Rc(-6, -12, 12, 9, STONE, 1, ol()),
    () => P('M-3 2 Q0 -10 0 -18 Q4 -8 8 -14 Q8 -4 3 2Z', CY, ol(1.2)) + C(1, -6, 12, CY, ' opacity=".2"') + P('M-12 0 H12 L8 8 H-8Z', GOLD, ol()) + LO(0, 8, 0, 16, GOLD2, 2) + Rc(-6, 15, 12, 3, GOLD2, 1, ol(1)),
    () => E(0, 4, 18, 7, '#d9cdb0', ol()) + E(0, 3, 12, 4, CY, ' opacity=".75"') + E(0, 3, 6, 2, '#e6ffff'),
    () => { const c = pick(['#2b6cd6', '#7a2a8a', '#1f8a8a']); return LO(-8, 18, -8, -20, GOLD2, 2) + P('M-7 -18 H9 V8 L1 3 L-7 8Z', c, ol()) + P(star(4, 4, 1.5), GOLD) .replace('<path', `<path transform="translate(1 -7)"`); },
    () => P(blob(rnd(12, 18), rnd(7, 10), 7, .3), pick(['#d9b07a', '#c99a5a', '#e0bd85']), ol()) + P(blob(6, 3, 6, .3, -3, -3), '#f0d6a8'),
    () => { const c = pick(['#e9e2cf', '#d9cdb0']); return P('M-16 14 V-2 Q-16 -14 0 -14 Q16 -14 16 -2 V14 H10 V0 Q10 -7 0 -7 Q-10 -7 -10 0 V14Z', c, ol()) + P('M-10 14 V0 Q-10 -7 0 -7 Q10 -7 10 0 V14Z', CY, ' opacity=".35"'); },
  ],
  sky: [
    () => P(blob(18, 7, 7, .2, 0, -4), '#d9b07a', ol()) + P('M-16 -2 L-6 18 L2 10 L14 -2Z', '#a8743c', ol()) + P('M-4 -8 L0 -16 L4 -8Z', CY, ol(1)),
    () => E(0, 2, 22, 6, GOLD, ol()) + E(0, -2, 10, 7, '#dff6ff', ol(1.4) + ' fill-opacity=".85"') + C(-12, 3, 1.8, CY) + C(0, 5, 1.8, CY) + C(12, 3, 1.8, CY) + E(0, 12, 8, 3, CY, ' opacity=".35"'),
  ],
  bonusDraw: () => C(0, 0, 13, '#ffd27a', ' opacity=".3"') + P('M0 -12 L8 0 L0 12 L-8 0Z', GOLD, ol()) + P('M0 -6 L4 0 L0 6 L-4 0Z', CY) + L(0, -12, 0, -17, OUT, 1.4),
  bonusSky: true,
  big: [
    () => { let s = E(0, 102, 135, 18, GOLD2, ' opacity=".35"') + Rc(-120, 70, 240, 30, '#d9cdb0', 3, ol(3)) + Rc(-100, 45, 200, 28, '#e5dcc4', 3, ol(3));
      for (const x of [-88, -60, -32, 32, 60, 88]) s += Rc(x - 8, -40, 16, 86, '#f1ead8', 2, ol(2.5)) + L(x - 2, -36, x - 2, 42, '#d8ccb0', 2);
      s += Rc(-104, -58, 208, 20, GOLD, 3, ol(3)) + P('M-90 -58 Q0 -170 90 -58Z', '#e9e2cf', ol(3)) + P('M-60 -58 Q0 -140 60 -58', 'none', st(GOLD, 5)) + P('M-4 -150 L0 -186 L4 -150Z', GOLD, ol(2)) + C(0, -190, 16, CY, ' opacity=".3"') + C(0, -190, 6, CY, ol(2));
      return s + P('M-16 45 V0 Q0 -18 16 0 V45Z', CY, ol(2.5)) + P('M-9 45 V4 Q0 -7 9 4 V45Z', '#c8fbff'); },
    () => E(0, 100, 110, 14, GOLD2, ' opacity=".3"') + Rc(-80, -20, 30, 120, STONE, 3, ol(3)) + Rc(50, -20, 30, 120, STONE, 3, ol(3)) + P('M-86 -20 Q0 -150 86 -20 L56 -20 Q0 -110 -56 -20Z', GOLD, ol(3)) + P('M-50 100 V-10 Q0 -90 50 -10 V100Z', CY, ' opacity=".22"') + C(0, -60, 10, CY, ol(2)) + Rc(-88, 88, 46, 14, '#d9cdb0', 2, ol(2)) + Rc(42, 88, 46, 14, '#d9cdb0', 2, ol(2)),
    () => C(0, -20, 90, CY, ' opacity=".15"') + Rc(-60, 70, 120, 30, GOLD, 4, ol(3)) + P('M-30 72 L-46 -40 L-12 -170 L4 -40Z', '#7fe8ff', ol(3)) + P('M-12 -170 L4 -40 L-30 72Z', '#c8fbff') + P('M6 72 L18 -60 L44 -10 L36 72Z', '#2bb5c8', ol(3)) + P('M-40 72 L-70 0 L-50 -10 L-28 50Z', '#5ff3ff', ol(3)),
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1440"/><stop offset=".55" stop-color="#4a3a8a"/><stop offset="1" stop-color="#f0a868"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c78a"/><stop offset="1" stop-color="#c08a50"/></linearGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)') + stars(W, HZ * .6, 220);
    s += C(700, 250, 150, '#b8c4ff') + C(660, 230, 150, '#4a3a8a', ' opacity=".35"') + E(700, 250, 260, 40, 'none', st('#e6ddff', 8) + ' opacity=".6" transform="rotate(-18 700 250)"');
    s += C(2400, 140, 40, '#ffe9c8');
    for (let i = 0; i < 6; i++){ const x = rnd(1500, 2900), y = rnd(80, 300); s += P(`M${f1(x)} ${f1(y)} l${f1(rnd(90, 160))} ${f1(rnd(30, 60))}`, 'none', st('#ffffff', 2) + ' opacity=".35"'); }
    s += P(ridge(W, HZ - 30, 120, 90, .2), '#8a5a7a') + P(ridge(W, HZ + 10, 50, 50, .1), '#b0705a');
    s += Rc(0, HZ, W, H - HZ, 'url(#gnd)');
    for (let i = 0; i < 70; i++){ const y = rnd(HZ + 20, H), x = rnd(-100, W), k = .5 + (y - HZ) / (H - HZ); s += P(`M${f1(x)} ${f1(y)} q${f1(80 * k)} ${f1(-14 * k)} ${f1(180 * k)} 0`, 'none', st('#f5dca8', 3 * k) + ' opacity=".7"'); }
    let d = `M-20 ${HZ + 300}`; for (let x = 0; x <= W + 100; x += 150) d += ` Q${x + 75} ${f1(HZ + 300 + rnd(-90, 90) + x * .25)} ${x + 150} ${f1(HZ + 300 + rnd(-40, 40) + x * .25)}`;
    s += P(d, 'none', st(CY, 60) + ' opacity=".18"') + P(d, 'none', st(CY, 22) + ' opacity=".55"') + P(d, 'none', st('#e6ffff', 6) + ' opacity=".8"');
    return s;
  }
};

// =====================================================================================
// FACTION 3 : LA COALITION HUMAINE (base militaire industrielle)
// =====================================================================================
const MET = '#8d989c', MET2 = '#5c676c', OLV = '#5f6b3a', HAZ = '#f2c230';
const hazard = (x, y, w, h) => { let s = Rc(x, y, w, h, HAZ, 1, ol(1.2)); for (let i = 0; i < w; i += 6) s += P(`M${f1(x + i)} ${f1(y + h)} L${f1(x + i + 3)} ${f1(y)} L${f1(Math.min(x + w, x + i + 6))} ${f1(y)} L${f1(Math.min(x + w, x + i + 3))} ${f1(y + h)}Z`, '#2a2a2a'); return s; };
const COA = {
  name: 'Avant-poste de la Coalition', sub: 'Faction : la Coalition humaine', mood: 'day', bonus: 'drapeaux bleus', bonusN: 7, seed: 7303,
  targets: [
    ['une clé à molette', () => LO(-12, 12, 6, -6, '#c3ccd0', 4.4) + C(9, -9, 8, '#c3ccd0', ol()) + `<g transform="rotate(45 9 -9)">${Rc(6, -21, 6, 9, '#c9a77a')}</g>` + C(-12, 12, 4.5, '#c3ccd0', ol()) + C(-12, 12, 1.8, OUT)],
    ['un extincteur', () => P('M3 -15 Q14 -16 13 -4', 'none', st(OUT, 2.4)) + Rc(-7, -12, 14, 30, '#e0302a', 6, ol()) + Rc(-5, -18, 10, 7, '#2a2a2a', 1, ol(1)) + Rc(-7, -2, 14, 8, '#f4f1e6', 1) + L(-4, 10, -4, -8, '#ff8a80', 1.5)],
    ['une radio', () => L(8, -8, 14, -22, OUT, 2) + C(14, -22, 1.8, OUT) + Rc(-14, -8, 28, 22, OLV, 3, ol()) + C(-6, 3, 6, '#2a2f1e', ol(1)) + L(-10, 1, -2, 1, '#6a7448', 1) + L(-10, 5, -2, 5, '#6a7448', 1) + Rc(3, -4, 8, 5, '#9fe870', 1, ol(1)) + C(7, 8, 2.2, '#d8d8d8', ol(.8))],
    ['une tasse de café', () => P('M9 -6 Q18 -6 17 2 Q16 8 9 8', 'none', st(OUT, 3.2)) + Rc(-11, -12, 20, 26, '#f4f1e6', 3, ol()) + E(-1, -11, 9, 2.4, '#5a3a22') + Rc(-7, -2, 12, 6, '#3a6fd6', 1) + P('M-5 -16 Q-8 -20 -4 -24 M2 -16 Q-1 -20 3 -24', 'none', st('#ffffff', 1.6) + ' opacity=".8"')],
    ["un bidon d'essence", () => Rc(4, -18, 6, 6, '#2a2a2a', 1, ol(1)) + P('M-13 -12 L4 -12 L13 -4 L13 17 L-13 17Z', '#d8322b', ol()) + P('M-9 -9 H-1 V-5 H-9Z', OUT) + P('M-9 0 L9 14 M9 0 L-9 14', 'none', st('#a8221d', 2.2))],
    ['des jumelles', () => Rc(-12, -12, 9, 14, '#4f565c', 2, ol()) + Rc(3, -12, 9, 14, '#4f565c', 2, ol()) + Rc(-3, -8, 6, 6, '#2a2f33', 1, ol(1)) + C(-7, 4, 8, '#3a3f44', ol()) + C(7, 4, 8, '#3a3f44', ol()) + C(-7, 4, 4.5, '#5fb0ff') + C(7, 4, 4.5, '#5fb0ff') + C(-8.5, 2.5, 1.5, '#fff') + C(5.5, 2.5, 1.5, '#fff')],
    ['une médaille', () => P('M-8 -20 L-2 -4 L2 -4 L8 -20 L3 -20 L0 -12 L-3 -20Z', '#3a6fd6', ol(1.2)) + C(0, 7, 10, '#e8b422', ol()) + P(star(5, 6, 2.5), '#fff1a8').replace('<path', '<path transform="translate(0 7)"')],
    ['un cadenas', () => PO('M-7 -2 V-9 Q-7 -18 0 -18 Q7 -18 7 -9 V-2', '#b9c2c6', 2.8) + Rc(-12, -3, 24, 20, '#e8b422', 3, ol()) + C(0, 5, 3, OUT) + Rc(-1, 6, 2, 6, OUT)],
    ['un casque de soudeur', () => P('M-15 -10 Q-14 -20 0 -20 Q14 -20 15 -10 L13 14 Q0 20 -13 14Z', '#3d4247', ol()) + Rc(-9, -6, 18, 8, '#1a7a3a', 1, ol(1.2)) + Rc(-8, -5, 16, 3, '#6fe08a', 1, ' opacity=".6"') + C(-13, 0, 2.5, '#8a9095', ol(1)) + C(13, 0, 2.5, '#8a9095', ol(1))],
    ['une guitare', () => LO(2, -2, 15, -17, '#7a4a22', 3) + `<g transform="rotate(-48 17 -19)">${Rc(13, -23, 8, 6, '#3a2412', 1, ol(1))}</g>` + C(-8, 8, 9.8, OUT) + C(-1, 1, 7.8, OUT) + C(-8, 8, 8, '#d07a2a') + C(-1, 1, 6, '#d07a2a') + C(-4, 4, 2.6, '#3a2412') + L(-12, 9, -8, 13, '#3a2412', 2)],
    ['un chat roux', () => PO('M8 14 Q21 12 16 -2', '#e8862a', 2.6) + E(0, 8, 10, 10, '#e8862a', ol()) + P('M-7 -12 L-6 -20 L-1 -14Z M7 -12 L6 -20 L1 -14Z', '#e8862a', ol(1.2)) + C(0, -8, 8, '#e8862a', ol()) + C(-3, -9, 1.4, '#2a5a1a') + C(3, -9, 1.4, '#2a5a1a') + P('M-1 -6 H1 L0 -5Z', '#ff8a9a') + P('M-6 4 H-2 M-7 8 H-2 M2 4 H6 M2 8 H7', 'none', st('#b05a10', 1.4))],
    ['une batterie', () => Rc(-3, -18, 6, 4, '#b9c2c6', 1, ol(1)) + Rc(-8, -14, 16, 30, '#2a2a2a', 3) + Rc(-8, -14, 16, 10, '#e8b422', 3) + Rc(-8, -14, 16, 30, 'none', 3, ol()) + P('M-3 4 H3 M0 1 V7', 'none', st('#fff', 1.8))],
    ["une plaque d'identité", () => P('M0 -20 Q-6 -12 -2 -8', 'none', st('#9aa4a8', 1.4)) + Rc(-9, -8, 18, 24, '#cfd6d9', 6, ol()) + C(0, -4, 1.8, OUT) + L(-5, 2, 5, 2, '#6b7478', 1.4) + L(-5, 6, 4, 6, '#6b7478', 1.4) + L(-5, 10, 3, 10, '#6b7478', 1.4)],
    ['une lampe torche', () => P('M14 -10 L23 -16 L23 16 L14 10Z', '#fff6a0', ' opacity=".5"') + Rc(-16, -5, 22, 10, '#3a3f44', 2, ol()) + P('M6 -8 L14 -10 L14 10 L6 8Z', '#5c676c', ol()) + L(-10, -5, -10, 5, '#e8b422', 2)],
  ],
  clutter: [
    () => { const c = pick(['#a8743c', '#946330', '#b5844a']), d = shade(c, -.35); return Rc(-14, -14, 28, 28, c, 2, ol()) + Rc(-11, -11, 22, 22, 'none', 1, ` stroke="${d}" stroke-width="2.4"`) + L(-11, -11, 11, 11, d, 2.4) + L(-11, 11, 11, -11, d, 2.4); },
    () => { const c = pick([MET2, '#6b7478', '#4f5a5e']); return Rc(-16, -11, 32, 22, c, 2, ol()) + hazard(-16, -11, 8, 22) + Rc(-4, -6, 16, 6, shade(c, .3), 1) + L(-4, 4, 12, 4, shade(c, -.3), 2); },
    () => { const c = pick([OLV, MET2, '#3f5a6a', '#7a3a2a']); return Rc(-10, -15, 20, 30, c, 4, ol()) + Rc(-10, -7, 20, 2.5, shade(c, -.35)) + Rc(-10, 5, 20, 2.5, shade(c, -.35)) + Rc(-7, -13, 3, 26, shade(c, .3), 1) + E(0, -15, 10, 2.5, shade(c, .15), ol(1)); },
    () => { let s = ''; [[-12, 8], [0, 8], [12, 8], [-6, 0], [6, 0], [0, -8]].forEach(([x, y]) => s += E(x, y, 7.5, 5, pick(['#c9b07a', '#bfa36a', '#d4bc88']), ol(1.3)) + L(x - 3, y, x + 3, y, '#9a8050', 1)); return s; },
    () => LO(-16, 14, -16, -10, '#7a5c3e', 2.5) + LO(16, 14, 16, -10, '#7a5c3e', 2.5) + P('M-16 -6 Q0 -2 16 -6 M-16 2 Q0 6 16 2 M-16 9 Q0 13 16 9', 'none', st('#4a4a4a', 1.2)) + P('M-8 -4 l2 -2 M4 -3 l2 2 M-4 4 l2 -2 M8 5 l2 2', 'none', st('#4a4a4a', 1.2)),
    () => { const c = pick(['#8a6a4a', '#7a5c3e', '#9a7a55']); return P(blob(rnd(14, 22), rnd(9, 14), 7, .3), c, ol()) + P(blob(7, 4, 6, .3, -4, -5), shade(c, .25)); },
    () => { let s = ''; for (let i = 0; i < 3; i++) s += E(0, 10 - i * 8, 13, 5, '#2a2a2a', ol(1.3)) + E(0, 10 - i * 8, 6, 2.2, '#5a5a5a'); return s; },
    () => LO(0, 18, 0, -16, '#4f5a5e', 2.4) + C(6, -18, 12, '#ffe58a', ' opacity=".35"') + P('M-2 -20 H10 L12 -14 H-2Z', '#3a3f44', ol(1.3)) + E(6, -13, 5, 2, '#ffe58a'),
    () => Rc(-18, -6, 36, 12, MET, 0, ol()) + Rc(-18, -6, 36, 4, '#b9c2c6') + Rc(-20, -8, 5, 16, MET2, 1, ol(1.2)) + Rc(15, -8, 5, 16, MET2, 1, ol(1.2)),
    () => { const c = pick([OLV, '#6b7a44', '#556036']); return LO(-3, 16, -5, 10, '#3a3a2a', 2.6) + LO(3, 16, 4, 10, '#3a3a2a', 2.6) + Rc(-6, -6, 12, 17, c, 3, ol()) + C(0, -11, 5, '#e8b88a', ol(1.2)) + P('M-6 -11 Q-6 -19 0 -19 Q6 -19 6 -11Z', shade(c, -.15), ol(1.2)) + LO(-8, 4, 12, -6, '#2a2a2a', 1.6); },
    () => LO(0, 16, 0, 2, MET2, 2.4) + Rc(-8, 14, 16, 4, MET2, 1, ol(1)) + `<g transform="rotate(-25)">${P('M-15 -4 Q0 12 15 -4 Q0 2 -15 -4Z', '#d9dfe2', ol()) + LO(0, 2, 0, -12, MET2, 1.4) + C(0, -13, 2, '#e0302a')}</g>`,
    () => { const c = pick([OLV, '#7a6a3a', MET2]); return C(-11, 10, 5.5, '#2a2a2a', ol(1.2)) + C(11, 10, 5.5, '#2a2a2a', ol(1.2)) + P('M-19 6 V-2 L-9 -3 L-5 -10 H8 L12 -2 L19 -1 V6Z', c, ol()) + P('M-3 -8 H7 L10 -3 H-4Z', '#9fd6ff', ol(1)) + C(-11, 10, 2, '#888') + C(11, 10, 2, '#888'); },
    () => { const c = pick([OLV, '#6b7a44', MET2]); return Rc(-20, 4, 40, 10, '#2a2a2a', 5, ol()) + C(-14, 9, 3, '#555') + C(-5, 9, 3, '#555') + C(4, 9, 3, '#555') + C(13, 9, 3, '#555') + P('M-18 4 L-14 -4 H14 L18 4Z', c, ol()) + Rc(-8, -11, 16, 8, shade(c, .1), 3, ol()) + LO(6, -8, 22, -10, shade(c, -.3), 2); },
    () => { const c = pick([MET, '#a0a8a0', '#7a8a8f']); return LO(-6, 2, -12, 18, MET2, 3) + LO(6, 2, 12, 18, MET2, 3) + Rc(-16, 16, 8, 3, MET2, 1, ol(1)) + Rc(8, 16, 8, 3, MET2, 1, ol(1)) + Rc(-11, -12, 22, 15, c, 3, ol()) + Rc(-6, -9, 12, 4, '#ff6a3a', 1, ol(1)) + LO(11, -6, 20, -6, MET2, 2) + LO(-11, -6, -20, -6, MET2, 2); },
    () => Rc(-14, -10, 28, 20, MET2, 2, ol()) + hazard(-14, 6, 28, 4) + L(-10, -5, 0, -5, '#3a3f44', 2) + L(-10, -1, 0, -1, '#3a3f44', 2) + C(7, -3, 3, '#7fff7f', ol(1)),
    () => P('M-5 14 L0 -14 L5 14Z', '#ff7a1a', ol()) + Rc(-3, 0, 6, 3, '#fff') + Rc(-8, 12, 16, 4, '#ff7a1a', 1, ol(1)),
  ],
  sky: [
    () => P('M-22 0 L10 -4 L22 0 L10 4Z', '#a9b3b6', ol()) + P('M-4 -2 L-12 -14 L-6 -14 L4 -2Z M-4 2 L-12 14 L-6 14 L4 2Z', MET2, ol(1.2)) + P('M-20 0 L-24 -7 L-18 -1Z', MET2, ol(1)) + P('M8 -2 L14 -2 L12 0Z', '#9fd6ff'),
    () => LO(-20, -10, 20, -10, '#3a3f44', 1.4) + E(0, 0, 13, 7, OLV, ol()) + LO(-12, 0, -24, -2, OLV, 2.4) + P('M4 -3 Q10 -3 11 2 H4Z', '#9fd6ff', ol(1)) + L(-6, 7, 6, 7, OUT, 1.6) + L(0, -7, 0, -10, OUT, 1.6),
    () => P('M-10 0 Q-5 -6 0 0 Q5 -6 10 0', 'none', st('#2a2a2a', 1.8)),
  ],
  bonusDraw: () => LO(-6, 18, -6, -18, '#b9c2c6', 1.6) + P('M-5 -17 H13 V-3 H-5Z', '#2b5fd6', ol(1.3)) + P(star(5, 4, 1.6), '#fff').replace('<path', '<path transform="translate(4 -10)"') + C(-6, -19, 2, HAZ, ol(1)),
  bonusSky: false,
  big: [
    () => E(0, 100, 130, 16, '#5a4a3a', ' opacity=".4"') + P('M-110 100 V20 Q-110 -60 0 -70 Q110 -60 110 20 V100Z', '#9aa094', ol(3)) + P('M-80 0 Q0 -50 80 0', 'none', st('#b8beb2', 6)) + Rc(-70, 10, 40, 10, OUT, 2) + Rc(30, 10, 40, 10, OUT, 2) + Rc(-26, 40, 52, 60, MET2, 3, ol(3)) + hazard(-26, 40, 52, 8) + Rc(-80, 80, 40, 20, '#c9b07a', 4, ol(2)) + Rc(50, 80, 40, 20, '#c9b07a', 4, ol(2)) + LO(60, -55, 60, -100, MET2, 3) + C(60, -102, 5, '#e0302a', ol(1.5)),
    () => { let s = E(0, 100, 145, 16, '#5a4a3a', ' opacity=".4"') + P('M-130 100 V0 Q-130 -90 0 -95 Q130 -90 130 0 V100Z', '#7d8a8f', ol(3)); for (let x = -100; x <= 100; x += 25) s += P(`M${x} 100 V0 Q${x} -70 ${f1(x * .4)} -88`, 'none', st('#6b777c', 2.5)); return s + Rc(-70, 10, 140, 90, '#4f5a5e', 2, ol(3)) + L(0, 10, 0, 100, '#3a3f44', 3) + hazard(-70, 10, 140, 10) + P('M-30 -50 h60 v16 h-60z', '#e8e2c8', ol(2)) + P('M-22 -42 h44', 'none', st('#3a6fd6', 4)); },
    () => Rc(-50, -120, 100, 220, '#a9b3b6', 10, ol(3)) + P('M-50 -110 Q0 -170 50 -110Z', '#c3ccd0', ol(3)) + Rc(-50, -40, 100, 10, '#7d8a8f') + Rc(-50, 30, 100, 10, '#7d8a8f') + Rc(-34, -100, 10, 190, 'none', 0, ` stroke="${MET2}" stroke-width="2"`) + hazard(-50, 85, 100, 12) + P('M10 -80 h28 v18 h-28z', '#2b5fd6', ol(2)),
    () => { let s = Rc(-20, -170, 40, 270, 'none', 0, ol(3)); for (let y = -170; y < 100; y += 22) s += L(-20, y, 20, y + 22, HAZ, 3) + L(20, y, -20, y + 22, HAZ, 3); return s + Rc(-20, -170, 40, 270, 'none', 0, ` stroke="${HAZ}" stroke-width="4"`) + Rc(-30, -188, 180, 16, HAZ, 2, ol(2.5)) + Rc(-90, -188, 60, 16, HAZ, 2, ol(2.5)) + Rc(-110, -200, 30, 32, '#4f5a5e', 3, ol(2.5)) + LO(130, -172, 130, -80, '#3a3f44', 1.5) + Rc(116, -80, 28, 22, '#a8743c', 2, ol(2)) + Rc(-36, 92, 72, 12, MET2, 2, ol(2.5)); },
    () => E(0, 92, 130, 26, '#6b7478', ol(3)) + E(0, 90, 100, 18, '#7d8a8f') + P('M-40 85 V70 M40 85 V70', 'none', st(HAZ, 5)) + P('M-90 70 L-60 30 H60 L100 50 L110 70Z', '#a9b3b6', ol(3)) + P('M30 32 L70 34 L92 50 L40 50Z', '#4fb0ff', ol(2)) + P('M-90 70 L-130 40 L-110 72Z M-40 30 L-70 -10 L-40 -10 L-10 30Z', MET2, ol(2.5)) + C(-96, 60, 10, '#ff8a3a', ' opacity=".6"') + Rc(-30, 50, 50, 8, HAZ, 1, ol(1.5)),
    () => { let s = Rc(-110, -10, 160, 110, '#8a7a6a', 2, ol(3)) + Rc(-110, -20, 160, 14, '#6b5a4a', 2, ol(3)); for (let x = -95; x < 40; x += 30) s += Rc(x, 10, 18, 22, '#ffe58a', 1, ol(1.5)); s += Rc(60, -130, 30, 230, '#7a6a5a', 3, ol(3)) + Rc(60, -110, 30, 8, '#e0302a') + Rc(60, -90, 30, 8, '#e8e2c8'); for (let i = 0; i < 6; i++) s += C(75 + i * 12 + rnd(-6, 6), -150 - i * 22, 16 + i * 5, '#c9c2b8', ` opacity="${(0.75 - i * .1).toFixed(2)}"`); return s + Rc(-60, 50, 50, 50, '#4f5a5e', 2, ol(2.5)); },
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22324a"/><stop offset=".55" stop-color="#7a6a7a"/><stop offset="1" stop-color="#e8a070"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b08a5e"/><stop offset="1" stop-color="#7a5c3e"/></linearGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)') + stars(W, HZ * .4, 90);
    s += C(1900, 330, 110, '#ffd9a0', ' opacity=".9"') + C(1900, 330, 180, '#ffd9a0', ' opacity=".2"');
    s += C(420, 150, 70, '#c9d6e8') + C(400, 140, 12, '#a9b6c8') + C(440, 170, 8, '#a9b6c8');
    s += P(ridge(W, HZ - 50, 200, 120, .2), '#7a5a4e') + P(ridge(W, HZ, 60, 70, .1), '#946a50');
    s += Rc(0, HZ, W, H - HZ, 'url(#gnd)');
    for (const [y, w] of [[HZ + 380, 70], [HZ + 920, 95]]){ let d = `M-20 ${y}`; for (let x = 0; x <= W + 200; x += 200) d += ` Q${x + 100} ${f1(y + rnd(-60, 60))} ${x + 200} ${f1(y + rnd(-20, 20))}`; s += P(d, 'none', st('#6b6058', w)) + P(d, 'none', st('#e8d8a0', 3) + ' stroke-dasharray="30 30"'); }
    for (let i = 0; i < 40; i++){ const y = rnd(HZ + 20, H), x = rnd(0, W), k = .5 + (y - HZ) / (H - HZ); s += P(blob(rnd(40, 120) * k, rnd(10, 26) * k, 9, .25, x, y), pick(['#9a7a55', '#a8875e', '#8a6a4a']), ' opacity=".6"'); }
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
  // 1. grands bâtiments
  for (let n = 0, t = 0; n < 9 && t < 5000; t++){
    const x = rnd(170, W - 170), y = rnd(HZ + 90, HZ + 560), s = persp(y) * rnd(.85, 1.15), r = 120 * s;
    if (!free(x, y, r, 1.05)) continue;
    occ.push({x, y, r, big: true}); ground.push({z: y + 100 * s, svg: G(x, y, s, 0, pick(F.big)(), R() < .5)}); n++;
  }
  // 2. objets à trouver
  const items = [];
  F.targets.forEach(([label, fn], i) => {
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
  for (let n = 0, t = 0; n < 34 && t < 20000; t++){
    const x = rnd(40, W - 40), y = rnd(50, HZ - 40), s = rnd(.8, 1.5), r = 22 * s;
    if (!free(x, y, r, .9)) continue;
    occ.push({x, y, r}); sky.push({z: y, svg: G(x, y, s, rnd(-15, 15), pick(F.sky)(), R() < .5)}); n++;
  }
  // 5. décor au sol, très dense
  let clutter = 0;
  for (let t = 0; t < 120000 && clutter < 900; t++){
    const y = rnd(HZ + 15, H - 15), x = rnd(20, W - 20), s = persp(y) * rnd(.8, 1.55), r = 20 * s;
    if (!free(x, y, r, .72)) continue;
    occ.push({x, y, r}); ground.push({z: y + r * .5, svg: G(x, y, s, rnd(-12, 12), pick(F.clutter)(), R() < .5)}); clutter++;
  }
  sky.sort((a, b) => a.z - b.z); ground.sort((a, b) => a.z - b.z);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${F.bg(W, H, HZ)}${sky.map(o => o.svg).join('')}${ground.map(o => o.svg).join('')}</svg>`;
  fs.mkdirSync(path.join(ROOT, 'img'), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'img', id + '.svg'), svg);
  return {id, n, name: F.name, title: `Niveau ${n} — ${F.name}`, mood: F.mood, w: W, h: H, items,
    count: sky.length + ground.length, bats: F.bonusN, bonus: F.bonus,
    kind: 'faction', sub: F.sub, cat: 'stellaire', img: `img/${id}.svg`, thumb: `img/${id}.svg`, vector: true};
}

const levels = [build(ESS, 's01', 1), build(ETH, 's02', 2), build(COA, 's03', 3)];
// injection des niveaux dans index.html, entre les repères STELLAIRE-DEBUT / STELLAIRE-FIN
const idx = path.join(ROOT, 'index.html');
const html = fs.readFileSync(idx, 'utf8');
const re = /(\/\/ STELLAIRE-DEBUT[^\n]*\n)[\s\S]*?(\/\/ STELLAIRE-FIN)/;
if (!re.test(html)) throw new Error('repères STELLAIRE introuvables dans index.html');
fs.writeFileSync(idx, html.replace(re, (m, a, b) => a + 'const STELLAIRE = ' + JSON.stringify(levels) + ';\n' + b));
levels.forEach(l => console.log(l.id, l.name, 'objets:', l.items.length, 'bonus:', l.bats, 'décor:', l.count, 'taille:', fs.statSync(path.join(ROOT, 'img', l.id + '.svg')).size));
