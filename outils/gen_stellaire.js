// Génère les planches vectorielles de la catégorie « Guerre stellaire ».
// Trois factions, d'après les planches de concept du projet :
//   - le Combine Valnir (blanc, bleu, noir)      → img/s03.svg
//   - la Confédération Ælys (blanc, orange)      → img/s02.svg
//   - l'Essaim Xaroth (violet, or)               → img/s01.svg
// Usage : node outils/gen_stellaire.js <dossier du jeu>
// Écrit les SVG et injecte la liste des objets dans index.html.
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
const S = (x, y, s, inner, flip) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${flip ? -s : s} ${s})">${inner}</g>`;
const ROT = (a, cx, cy, inner) => `<g transform="rotate(${a} ${cx} ${cy})">${inner}</g>`;
// un dessin qui contient du texte n'est jamais retourné (le texte serait en miroir)
const G = (x, y, s, rot, inner, flip) => (flip = flip && !inner.includes('<text') && !inner.includes('data-nf'), 0) || `<g transform="translate(${f1(x)} ${f1(y)})${rot ? ` rotate(${f1(rot)})` : ''} scale(${(flip ? -s : s).toFixed(3)} ${s.toFixed(3)})">${inner}</g>`;
const TXT = (x, y, size, fill, t) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" font-family="Arial,Helvetica,sans-serif" fill="${fill}">${t}</text>`;
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
// anneau de soufflante (drones, éclaireurs)
const fan = (x, y, rx, ry, rim, glow) => E(x, y, rx, ry, glow, op('.4')) + E(x, y, rx, ry, 'none', st(OUT, 4.4)) + E(x, y, rx, ry, 'none', st(rim, 2.4)) + E(x, y, rx * .35, ry * .35, rim);
const bolt = (x1, y1, x2, y2, n = 9, j = 40, w = 3) => { let d = `M${f1(x1)} ${f1(y1)}`; for (let i = 1; i < n; i++) d += ` L${f1(x1 + (x2 - x1) * i / n + rnd(-j, j))} ${f1(y1 + (y2 - y1) * i / n + rnd(-j / 4, j / 4))}`; d += ` L${f1(x2)} ${f1(y2)}`; return P(d, 'none', st('#5fe8ff', w * 3.3) + op('.35')) + P(d, 'none', st('#e8ffff', w)); };
// dégradés partagés par toutes les planches (feu, lueurs, fumée)
const DEFS = `<defs>
<radialGradient id="gF"><stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="#ffb030"/><stop offset=".7" stop-color="#ff5a1a" stop-opacity=".7"/><stop offset="1" stop-color="#ff3a0a" stop-opacity="0"/></radialGradient>
<radialGradient id="gO"><stop offset="0" stop-color="#ffcf6a" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient>
<radialGradient id="gC"><stop offset="0" stop-color="#bff8ff" stop-opacity=".9"/><stop offset="1" stop-color="#3fe0ff" stop-opacity="0"/></radialGradient>
<radialGradient id="gG"><stop offset="0" stop-color="#c8ffd8" stop-opacity=".9"/><stop offset="1" stop-color="#3ad06a" stop-opacity="0"/></radialGradient>
<radialGradient id="gP"><stop offset="0" stop-color="#ffc8f6" stop-opacity=".9"/><stop offset="1" stop-color="#e04ae0" stop-opacity="0"/></radialGradient>
<radialGradient id="gS"><stop offset="0" stop-color="#5a5650" stop-opacity=".85"/><stop offset=".7" stop-color="#5a5650" stop-opacity=".45"/><stop offset="1" stop-color="#5a5650" stop-opacity="0"/></radialGradient>
</defs>`;
const boom = r => C(0, 0, r, 'url(#gF)') + P(star(9, r * .62, r * .32), '#ffb030', op('.9')) + P(star(7, r * .38, r * .2, 0.3), '#ffe48a') + C(0, 0, r * .16, '#fff8e0');
const smoke = (n, r, dx, dy) => { let s = ''; for (let i = 0; i < n; i++) s += C(dx * i + rnd(-r * .3, r * .3), dy * i, r * (1 + i * .25), 'url(#gS)'); return s; };
const fireCrater = () => E(0, 8, 20, 7, '#2a1a14', ol(1.2)) + C(0, 0, 18, 'url(#gF)') + P('M-10 8 Q-8 -6 -4 0 Q-2 -14 2 -3 Q6 -12 8 1 Q10 -5 12 8Z', '#ff7a1a', ol(1.2)) + P('M-5 8 Q-3 0 0 3 Q2 -4 5 8Z', '#ffe48a');

// =====================================================================================
// Unités : découpées telles quelles dans les planches de concept (outils/planches),
// par outils/decoupe_unites.js -> outils/unites/*.webp + index.json (largeur, hauteur).
// Chaque planche n'embarque qu'une copie de chaque image, réutilisée avec <use>.
// =====================================================================================
const UDIR = path.join(__dirname, 'unites');
const UMAN = JSON.parse(fs.readFileSync(path.join(UDIR, 'index.json'), 'utf8'));
const USED = new Set();
// unités dont les marquages (07, M-44, T-91, H-98…) ne doivent pas être vus en miroir
const NOFLIP = new Set(['valnir_talon', 'valnir_vexor', 'valnir_argus', 'valnir_rampart', 'valnir_lyra']);
// U(clé, plus grande dimension, base) : base = y du sol dans le repère local (null = centrée, pour le ciel)
function U(key, dim, base = 16){
  if (!UMAN[key]) throw new Error('unité inconnue : ' + key);
  const [w, h] = UMAN[key], k = dim / Math.max(w, h), w2 = w * k, h2 = h * k;
  const y0 = base === null ? -h2 / 2 : base - h2;
  const fn = () => { USED.add(key); return `<use href="#u-${key}" transform="translate(${f1(-w2 / 2)} ${f1(y0)}) scale(${k.toFixed(4)})"${NOFLIP.has(key) ? ' data-nf="1"' : ''}/>`; };
  fn.box = [-w2 / 2, y0, w2 / 2, y0 + h2];
  return fn;
}
// grande unité ou structure : ombre portée, dessous facultatif, image posée sur y=base, dessus facultatif
function B(key, dim, o = {}){
  const u = U(key, dim, o.base || 104);
  const fn = () => (o.under ? o.under() : E(0, 100, dim * .4, 14, '#000', op('.3'))) + u() + (o.over ? o.over() : '');
  fn.box = u.box;
  return fn;
}
// unité placée dans le décor de fond, centrée en (x, y)
const UP = (key, x, y, dim, flip = false, attrs = '') => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${flip && !NOFLIP.has(key) ? -1 : 1} 1)"${attrs}>${U(key, dim, null)()}</g>`;
const UDEFS = () => '<defs>' + [...USED].sort().map(k => `<image id="u-${k}" width="${UMAN[k][0]}" height="${UMAN[k][1]}" href="data:image/webp;base64,${fs.readFileSync(path.join(UDIR, k + '.webp')).toString('base64')}"/>`).join('') + '</defs>';

// =====================================================================================
// COMBINE VALNIR — force expéditionnaire (blanc, bleu, noir, lueurs cyan)
// =====================================================================================
const VW = '#e6eaee', VW2 = '#b8c0c8', VB = '#2a4fd0', VB2 = '#1a3290', VK = '#2a2f38', VK2 = '#3e4450', VC = '#3fe0ff', VIS = '#ffb52e', HAZ = '#f2c230';
const VALNIR = {
  name: 'Front du Combine Valnir', sub: 'Faction : le Combine Valnir', mood: 'day', bonus: 'drapeaux bleus', bonusN: 7, seed: 7303,
  targets: [
    ['une clé à molette', () => LO(-12, 12, 6, -6, '#c3ccd0', 4.4) + C(9, -9, 8, '#c3ccd0', ol()) + ROT(45, 9, -9, Rc(6, -21, 6, 9, '#a0583a')) + C(-12, 12, 4.5, '#c3ccd0', ol()) + C(-12, 12, 1.8, OUT)],
    ['un extincteur', () => P('M3 -15 Q14 -16 13 -4', 'none', st(OUT, 2.4)) + Rc(-7, -12, 14, 30, '#e0302a', 6, ol()) + Rc(-5, -18, 10, 7, '#2a2a2a', 1, ol(1)) + Rc(-7, -2, 14, 8, '#f4f1e6', 1) + L(-4, 10, -4, -8, '#ff8a80', 1.5)],
    ['une radio', () => L(8, -8, 14, -22, OUT, 2) + C(14, -22, 1.8, OUT) + Rc(-14, -8, 28, 22, '#5f6b3a', 3, ol()) + C(-6, 3, 6, '#2a2f1e', ol(1)) + L(-10, 1, -2, 1, '#6a7448', 1) + L(-10, 5, -2, 5, '#6a7448', 1) + Rc(3, -4, 8, 5, '#9fe870', 1, ol(1)) + C(7, 8, 2.2, '#d8d8d8', ol(.8))],
    ['une tasse de café', () => P('M9 -6 Q18 -6 17 2 Q16 8 9 8', 'none', st(OUT, 3.2)) + Rc(-11, -12, 20, 26, '#f4f1e6', 3, ol()) + E(-1, -11, 9, 2.4, '#5a3a22') + Rc(-7, -2, 12, 6, VB, 1) + P('M-5 -16 Q-8 -20 -4 -24 M2 -16 Q-1 -20 3 -24', 'none', st('#ffffff', 1.6) + op('.8'))],
    ["un bidon d'essence", () => Rc(4, -18, 6, 6, '#2a2a2a', 1, ol(1)) + P('M-13 -12 L4 -12 L13 -4 L13 17 L-13 17Z', '#d8322b', ol()) + P('M-9 -9 H-1 V-5 H-9Z', OUT) + P('M-9 0 L9 14 M9 0 L-9 14', 'none', st('#a8221d', 2.2))],
    ['des jumelles', () => Rc(-12, -12, 9, 14, '#4f565c', 2, ol()) + Rc(3, -12, 9, 14, '#4f565c', 2, ol()) + Rc(-3, -8, 6, 6, '#2a2f33', 1, ol(1)) + C(-7, 4, 8, '#3a3f44', ol()) + C(7, 4, 8, '#3a3f44', ol()) + C(-7, 4, 4.5, '#5fb0ff') + C(7, 4, 4.5, '#5fb0ff') + C(-8.5, 2.5, 1.5, '#fff') + C(5.5, 2.5, 1.5, '#fff')],
    ['une médaille', () => P('M-8 -20 L-2 -4 L2 -4 L8 -20 L3 -20 L0 -12 L-3 -20Z', VB, ol(1.2)) + C(0, 7, 10, '#e8b422', ol()) + T(0, 7, P(star(5, 6, 2.5), '#fff1a8'))],
    ['un cadenas', () => PO('M-7 -2 V-9 Q-7 -18 0 -18 Q7 -18 7 -9 V-2', '#b9c2c6', 2.8) + Rc(-12, -3, 24, 20, '#e8b422', 3, ol()) + C(0, 5, 3, OUT) + Rc(-1, 6, 2, 6, OUT)],
    ['un casque de pilote', () => P('M-15 6 Q-16 -18 0 -18 Q16 -18 15 6 L10 10 H-10Z', VW, ol()) + P('M-11 -8 H11 Q12 2 6 4 H-6 Q-12 2 -11 -8Z', '#ff7a2a', ol(1.2)) + P('M-8 -6 H-1', 'none', st('#ffd0a8', 2)) + P('M-2 -18 V-10 M2 -18 V-10', 'none', st(VB, 2)) + Rc(-16, 2, 6, 6, VW2, 2, ol(1))],
    ['une guitare', () => LO(2, -2, 15, -17, '#7a4a22', 3) + ROT(-48, 17, -19, Rc(13, -23, 8, 6, '#3a2412', 1, ol(1))) + C(-8, 8, 9.8, OUT) + C(-1, 1, 7.8, OUT) + C(-8, 8, 8, '#d07a2a') + C(-1, 1, 6, '#d07a2a') + C(-4, 4, 2.6, '#3a2412') + L(-12, 9, -8, 13, '#3a2412', 2)],
    ['un chat roux', () => PO('M8 14 Q21 12 16 -2', '#e8862a', 2.6) + E(0, 8, 10, 10, '#e8862a', ol()) + P('M-7 -12 L-6 -20 L-1 -14Z M7 -12 L6 -20 L1 -14Z', '#e8862a', ol(1.2)) + C(0, -8, 8, '#e8862a', ol()) + C(-3, -9, 1.4, '#2a5a1a') + C(3, -9, 1.4, '#2a5a1a') + P('M-1 -6 H1 L0 -5Z', '#ff8a9a') + P('M-6 4 H-2 M-7 8 H-2 M2 4 H6 M2 8 H7', 'none', st('#b05a10', 1.4))],
    ['une batterie', () => Rc(-3, -18, 6, 4, '#b9c2c6', 1, ol(1)) + Rc(-8, -14, 16, 30, '#2a2a2a', 3) + Rc(-8, -14, 16, 10, '#e8b422', 3) + Rc(-8, -14, 16, 30, 'none', 3, ol()) + P('M-3 4 H3 M0 1 V7', 'none', st('#fff', 1.8))],
    ["une plaque d'identité", () => P('M0 -20 Q-6 -12 -2 -8', 'none', st('#9aa4a8', 1.4)) + Rc(-9, -8, 18, 24, '#cfd6d9', 6, ol()) + C(0, -4, 1.8, OUT) + L(-5, 2, 5, 2, '#6b7478', 1.4) + L(-5, 6, 4, 6, '#6b7478', 1.4) + L(-5, 10, 3, 10, '#6b7478', 1.4)],
    ['une lampe torche', () => P('M14 -10 L23 -16 L23 16 L14 10Z', '#fff6a0', op('.5')) + Rc(-16, -5, 22, 10, '#3a3f44', 2, ol()) + P('M6 -8 L14 -10 L14 10 L6 8Z', '#5c676c', ol()) + L(-10, -5, -10, 5, '#e8b422', 2)],
  ],
  clutter: [
    U('valnir_vanguard', 44), U('valnir_vanguard', 44), U('valnir_vanguard', 44), U('valnir_talon', 62), U('valnir_auriga', 70), U('valnir_vexor', 66), U('valnir_argus', 76), U('valnir_rampart', 88), U('valnir_orbita', 46), U('valnir_aeris', 56), U('valnir_lyra', 48),
    // caisse de ravitaillement
    () => Rc(-13, -13, 26, 26, VK2, 3, ol()) + Rc(-13, -4, 26, 8, VW2) + Rc(-13, -13, 26, 4, VB) + Rc(-9, 7, 6, 2, VC, 1),
    // barricade
    () => { let s = Rc(-18, -4, 36, 14, '#9aa4ad', 2, ol()) + Rc(-18, -4, 36, 4, VW); for (let i = -14; i < 16; i += 8) s += P(`M${i} 10 L${i + 4} 2 L${i + 7} 2 L${i + 3} 10Z`, VB); return s; },
    fireCrater,
    // carcasse de créature Xaroth
    () => P(blob(16, 8, 8, .2, 0, 4), '#5a2a8a', ol()) + PO('M-6 0 L-10 -10 M0 -1 L1 -12 M6 0 L10 -9', '#8a6a3a', 2) + P('M10 2 Q20 -8 16 -16 Q16 -6 8 -2Z', '#c8a060', ol(1)) + C(-4, 5, 3, '#2a1030'),
    // roche du canyon
    () => { const c = pick(['#a0583a', '#8a4a30', '#b86a44']); return P(blob(rnd(14, 22), rnd(9, 14), 7, .3), c, ol()) + P(blob(7, 4, 6, .3, -4, -5), shade(c, .25)); },
    // fûts
    () => { const c = pick([VB2, VK2, '#c03a2a']); return Rc(-10, -15, 20, 30, c, 4, ol()) + Rc(-10, -7, 20, 2.5, shade(c, -.35)) + Rc(-10, 5, 20, 2.5, shade(c, -.35)) + Rc(-7, -13, 3, 26, shade(c, .3), 1); },
  ],
  sky: [U('valnir_ravenix', 62, null), U('valnir_ravenix', 62, null), U('valnir_mantis', 72, null), U('valnir_aeris', 58, null), U('valnir_orbita', 46, null), () => boom(rnd(14, 22)),
    // chasseur ailé Xaroth (ennemi)
    () => P('M-2 -2 Q-14 -24 -26 -14 Q-18 -10 -20 0 Q-10 -6 -2 2Z', '#7a2ac0', ol(1.1)) + P('M2 -2 Q14 -24 26 -14 Q18 -10 20 0 Q10 -6 2 2Z', '#7a2ac0', ol(1.1)) + E(0, 2, 5, 8, '#4a1a7a', ol()) + C(0, -6, 1.2, '#ff5ad8')],
  bonusDraw: () => LO(-6, 18, -6, -18, '#b9c2c6', 1.6) + P('M-5 -17 H13 V-3 H-5Z', VB, ol(1.3)) + T(4, -10, P(star(5, 4, 1.6), '#fff')) + C(-6, -19, 2, HAZ, ol(1)),
  bonusSky: false,
  big: [
    B('valnir_talon', 240), B('valnir_argus', 300), B('valnir_rampart', 330), B('valnir_auriga', 290), B('valnir_vexor', 270),
    // poste de commandement
    () => { let s = E(0, 100, 145, 18, '#2a1a10', op('.45')) + Rc(-118, 70, 22, 30, VK2, 2, ol(2.5)) + Rc(96, 70, 22, 30, VK2, 2, ol(2.5));
      s += P('M-120 90 L-110 20 L-70 -20 H70 L110 20 L120 90Z', VW2, ol(3)) + P('M-110 20 L-70 -20 H70 L110 20Z', VW) + P('M-104 40 H104', 'none', st(VB, 8));
      s += Rc(-60, -80, 120, 62, VK2, 6, ol(3)) + Rc(-60, -80, 120, 12, VB, 4); for (let x = -50; x < 50; x += 22) s += Rc(x, -60, 14, 8, VC, 1);
      s += Rc(-30, 30, 60, 60, VK, 3, ol(3)) + Rc(-30, 30, 60, 8, VB) + LO(40, -80, 40, -130, VK2, 3) + C(40, -132, 5, VC, ol(1.5)) + C(40, -132, 14, 'url(#gC)');
      for (const x of [-90, -60, 60, 90]) s += C(x, 62, 4, VC);
      return s + TXT(-100, 70, 16, VB, 'VALNIR'); },
    // piste avec Bastion posé
    B('valnir_bastion', 300, {base: 96, under: () => E(0, 92, 140, 26, '#6b7478', ol(3)) + E(0, 90, 110, 18, '#7d8a8f') + P('M-40 85 V70 M40 85 V70', 'none', st(HAZ, 5))}),
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e2230"/><stop offset=".5" stop-color="#7a4a40"/><stop offset="1" stop-color="#f0a868"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a0603c"/><stop offset="1" stop-color="#5a3020"/></linearGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)');
    for (let i = 0; i < 36; i++) s += E(rnd(0, W), rnd(20, HZ - 120), rnd(140, 340), rnd(30, 80), pick(['#3a3440', '#4a3e44', '#5a4848']), op(rnd(.35, .7).toFixed(2)));
    let d = `M0 ${HZ}`; for (let x = 0; x <= W; x += rnd(160, 320)){ const h = rnd(90, 260), w = rnd(100, 200); d += ` L${f1(x)} ${f1(HZ - h + 30)} L${f1(x + 20)} ${f1(HZ - h)} L${f1(x + w)} ${f1(HZ - h)} L${f1(x + w + 20)} ${f1(HZ - h + 40)}`; } d += ` L${W} ${HZ + 40} L0 ${HZ + 40}Z`;
    s += P(d, '#a8603e') + P(d, 'none', st('#c8804e', 3)); for (let i = 0; i < 6; i++) s += P(ridge(W, HZ - 60 + i * 14, 6, 80, 0), 'none', st('#8a4a30', 2) + op('.5'));
    s += P(ridge(W, HZ + 10, 40, 60, .1), '#8a4a30');
    for (let i = 0; i < 7; i++){ const x = rnd(100, W - 100); s += T(x, HZ - rnd(0, 30), C(0, 0, rnd(40, 80), 'url(#gF)') + smoke(5, 30, rnd(-15, 15), -40)); }
    // Bastion géant touché, traînées de fumée, escorte de Ravenix
    const sx = 1550, sy = 240;
    for (const [dx, dy] of [[330, 10], [330, -40], [300, 60]]) s += P(`M${sx + dx} ${sy + dy} Q${sx + 800} ${sy + dy + 60} ${sx + 1300} ${sy + dy + 240}`, 'none', st('#2a2626', 36) + op('.5'));
    s += UP('valnir_bastion', sx, sy, 900) + T(sx - 80, sy - 40, boom(46)) + T(sx + 140, sy + 50, boom(34));
    for (const [x, y, k] of [[600, 160, 3.2], [760, 240, 2.6], [900, 120, 2.4], [2500, 380, 2.2]]) s += UP('valnir_ravenix', x, y, 58 * k);
    s += UP('valnir_mantis', 1000, 380, 230);
    for (let i = 0; i < 8; i++){ const x = sx + rnd(-400, 400); s += P(`M${f1(x)} ${sy + rnd(-60, 60)} L${f1(x + rnd(-300, 300))} ${f1(sy + rnd(200, 320))}`, 'none', st('#5fe8ff', 2) + op('.8')); }
    s += Rc(0, HZ, W, H - HZ, 'url(#gnd)');
    for (const [y, w] of [[HZ + 380, 70], [HZ + 920, 95]]){ let r = `M-20 ${y}`; for (let x = 0; x <= W + 200; x += 200) r += ` Q${x + 100} ${f1(y + rnd(-60, 60))} ${x + 200} ${f1(y + rnd(-20, 20))}`; s += P(r, 'none', st('#4a4448', w)) + P(r, 'none', st('#e8d8a0', 3) + ' stroke-dasharray="30 30"'); }
    for (let i = 0; i < 40; i++){ const y = rnd(HZ + 20, H), x = rnd(0, W), k = .5 + (y - HZ) / (H - HZ); s += P(blob(rnd(40, 120) * k, rnd(10, 26) * k, 9, .25, x, y), pick(['#8a4a30', '#b06a44', '#7a3a24']), op('.6')); }
    return s;
  }
};

// =====================================================================================
// CONFÉDÉRATION ÆLYS — confédération orbitale (blanc, gris, orange, réacteurs cyan)
// =====================================================================================
const AW = '#f2f4f7', AW2 = '#c4ccd6', AW3 = '#7e8a98', AO = '#ff9a2e', AO2 = '#ffcf6a', AC = '#4fe8ff', AG = '#3ae06a', GOLD = '#f2c14e', GOLD2 = '#b8862b';
const AELYS = {
  name: "Nexus d'Ælys", sub: 'Faction : la Confédération Ælys', mood: 'night', bonus: 'lanternes flottantes', bonusN: 11, seed: 7202,
  targets: [
    ['une amulette dorée', () => P('M-12 -16 Q0 -2 12 -16', 'none', st(GOLD2, 2.2)) + C(0, 4, 13, GOLD, ol()) + C(0, 4, 8, GOLD2) + P('M0 -3 L5 4 L0 11 L-5 4Z', AO, ol(1.2)) + C(-4, 0, 2, '#fff6c8')],
    ['un masque blanc', () => P('M-14 -16 Q0 -22 14 -16 Q16 4 0 20 Q-16 4 -14 -16Z', AW, ol()) + P('M-10 -6 L-3 -4 L-4 -1 L-10 -3Z M10 -6 L3 -4 L4 -1 L10 -3Z', AO) + P('M0 -18 V2', 'none', st(AW3, 1.6)) + P('M-5 10 Q0 13 5 10', 'none', st(OUT, 1.3))],
    ["une lame d'énergie", () => LO(-17, 17, 6, -6, AW2, 3) + C(-17, 17, 3, AW3, ol(1)) + C(13, -12, 10, AO, op('.25')) + P('M4 -4 L21 -21 L12 -1Z', AO, ol(1.3)) + P('M7 -5 L18 -18 L11 -3Z', AO2) + LO(1, -9, 9, -1, AW, 2)],
    ['un cristal violet', () => P('M-6 18 L-15 2 L-10 -2 L-4 10Z', '#c27aff', ol()) + P('M4 18 L10 0 L15 6 L12 18Z', '#8a3ad6', ol()) + P('M-2 18 L-8 -4 L-2 -20 L4 -4 Z', '#a64cff', ol()) + P('M-2 -20 L4 -4 L-2 18Z', '#d6a8ff') + Rc(-17, 16, 34, 5, AW, 2, ol())],
    ['une lyre', () => P('M-12 -16 Q-18 4 -6 14 H6 Q18 4 12 -16 Q8 -8 6 6 H-6 Q-8 -8 -12 -16Z', GOLD, ol()) + L(-3, -10, -3, 6, AO, 1.2) + L(0, -10, 0, 6, AO, 1.2) + L(3, -10, 3, 6, AO, 1.2) + Rc(-7, -12, 14, 3, GOLD2, 1, ol(1))],
    ['un sablier céleste', () => P('M-9 -14 L9 -14 L1 0 L9 14 L-9 14 L-1 0Z', '#e6f6ff', ol(1.3) + ' fill-opacity=".7"') + P('M-6 -11 L6 -11 L0 -2Z', AO) + P('M-7 13 L7 13 L0 6Z', AO) + LO(-11, -14, -11, 14, AW, 2) + LO(11, -14, 11, 14, AW, 2) + Rc(-13, -18, 26, 4, AW2, 1, ol()) + Rc(-13, 14, 26, 4, AW2, 1, ol())],
    ['un bouclier rond', () => C(0, 0, 17, AW, ol()) + C(0, 0, 14.5, 'none', st(AO, 3.5)) + P(star(4, 10, 3), AO, ol(1))],
    ['une étoile à huit branches', () => C(0, 0, 17, '#fff2b0', op('.35')) + P(star(8, 19, 8), '#ffe27a', ol()) + C(0, 0, 5, '#fff')],
    ['un calice', () => P('M-13 -16 H13 Q12 0 2 4 V12 H8 V17 H-8 V12 H-2 V4 Q-12 0 -13 -16Z', GOLD, ol()) + E(0, -14, 11, 2.6, '#7a2a8a') + C(-6, -7, 2, AO) + C(6, -7, 2, AO)],
    ['une sphère armillaire', () => Rc(-2, 9, 4, 7, GOLD2, 0, ol(1)) + Rc(-9, 15, 18, 4, GOLD2, 1, ol(1)) + C(0, -3, 6, AO, ol(1.2)) + E(0, -3, 15, 6, 'none', st(OUT, 3.6)) + E(0, -3, 15, 6, 'none', st(GOLD, 2)) + E(0, -3, 6, 15, 'none', st(OUT, 3.6)) + E(0, -3, 6, 15, 'none', st(GOLD, 2)) + ROT(45, 0, -3, E(0, -3, 15, 4, 'none', st(OUT, 3.2)) + E(0, -3, 15, 4, 'none', st('#ffe9a0', 1.6)))],
    ['une clé ancienne', () => C(-10, -8, 8, 'none', st(OUT, 6.5)) + C(-10, -8, 8, 'none', st('#d9a441', 3.6)) + LO(-4, -2, 15, 17, '#d9a441', 3.4) + LO(10, 12, 15, 7, '#d9a441', 3) + LO(14, 16, 19, 11, '#d9a441', 3) + C(-10, -8, 2.4, AC)],
    ['un œuf de cristal', () => C(0, 2, 20, AC, op('.2')) + E(0, 2, 12, 16, '#9ff6ff', ol() + ' fill-opacity=".85"') + P('M-12 2 L0 -6 L12 2 M0 -6 L0 18 M-8 -10 L0 -6 L8 -10', 'none', st('#2bb5c8', 1.2)) + E(-4, -6, 2.5, 5, '#fff')],
    ['un robot sonde', () => LO(-8, 6, -14, 18, AW3, 1.4) + LO(8, 6, 14, 18, AW3, 1.4) + LO(0, 8, 0, 19, AW3, 1.4) + C(0, -2, 12, AW, ol()) + P('M-12 -1 H12', 'none', st(AW3, 2)) + C(0, -4, 5, OUT) + C(0, -4, 3, '#ff4fd8') + L(0, -14, 0, -20, OUT, 1.6) + C(0, -21, 2, '#ff4fd8')],
    ['une plume blanche', () => P('M-14 16 Q-12 -8 14 -18 Q12 2 -14 16Z', '#f6f3ea', ol()) + P('M-16 18 Q-2 2 12 -15', 'none', st('#b9b2a0', 1.6)) + P('M-6 6 L-2 2 M0 0 L4 -4 M-10 10 L-7 7', 'none', st('#d9d3c3', 1))],
  ],
  clutter: [
    U('aelys_vecteur', 46), U('aelys_vecteur', 46), U('aelys_lame', 58), U('aelys_lame', 58), U('aelys_protecteur', 48), U('aelys_gardien', 62), U('aelys_agresseur', 64), U('aelys_eliteur', 50), U('aelys_sonde', 40), U('aelys_relais', 44), U('aelys_soutien', 56), U('aelys_cycleur', 46), U('aelys_minier', 36),
    // plantes lumineuses roses
    () => { let s = ''; for (let i = 0; i < ri(2, 4); i++){ const x = rnd(-12, 12), h = rnd(10, 22); s += PO(`M${f1(x)} 16 Q${f1(x + rnd(-6, 6))} ${f1(16 - h / 2)} ${f1(x)} ${f1(16 - h)}`, '#2a5a5a', 1.6) + C(x, 16 - h, 7, 'url(#gP)') + C(x, 16 - h, 3.2, '#ff7ae0', ol(1)); } return s + P(blob(14, 4, 7, .2, 0, 16), '#1a3a3a', ol(1)); },
    // roche sombre
    () => { const c = pick(['#2c3a48', '#34424e', '#26323e']); return P(blob(rnd(14, 22), rnd(10, 15), 7, .3), c, ol()) + P(blob(7, 4, 6, .3, -4, -5), shade(c, .2)) + (R() < .4 ? C(rnd(-6, 6), rnd(-4, 2), 2.5, AC, ol(.8)) : ''); },
    // roseaux
    () => { let s = ''; for (let i = 0; i < 6; i++){ const x = rnd(-12, 12), h = rnd(14, 26); s += P(`M${f1(x)} 14 Q${f1(x + rnd(-5, 5))} ${f1(14 - h / 2)} ${f1(x + rnd(-6, 6))} ${f1(14 - h)}`, 'none', st(pick(['#2a6a5a', '#1f5a4a', '#3a7a6a']), 2)); } return s; },
    // flaque reflétante
    () => E(0, 0, rnd(16, 22), rnd(5, 7), '#123a4a', ol(1.2)) + E(-4, -1, 8, 1.6, '#7fd8e8', op('.6')),
  ],
  sky: [U('aelys_eclaireur', 58, null), U('aelys_eclaireur', 58, null), U('aelys_navette', 74, null), U('aelys_falconneur', 58, null), U('aelys_falconneur', 58, null), U('aelys_sonde', 42, null), U('aelys_collecteur', 78, null)],
  bonusDraw: () => C(0, 0, 13, 'url(#gO)') + P('M0 -12 L8 0 L0 12 L-8 0Z', AW, ol()) + P('M0 -6 L4 0 L0 6 L-4 0Z', AO) + L(0, -12, 0, -17, OUT, 1.4),
  bonusSky: true,
  big: [
    B('aelys_nexus', 360), B('aelys_tour', 310),
    B('aelys_collecteur', 250, {over: () => bolt(0, 40, -70, 100, 5, 14, 2) + bolt(0, 40, 60, 100, 5, 14, 2)}),
    B('aelys_gardien', 240), B('aelys_agresseur', 250), B('aelys_soutien', 230),
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050c18"/><stop offset=".6" stop-color="#11283c"/><stop offset="1" stop-color="#2a5a68"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3b4a"/><stop offset="1" stop-color="#0c1c26"/></linearGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)') + stars(W, HZ * .5, 140);
    for (let i = 0; i < 34; i++) s += E(rnd(0, W), rnd(20, HZ - 120), rnd(140, 320), rnd(30, 80), pick(['#0e1c2c', '#14263a', '#1a3048']), op(rnd(.5, .85).toFixed(2)));
    // grand collecteur orbital en orbite, éclairs ; navette Argos en approche
    s += C(2150, 230, 280, 'url(#gC)') + UP('aelys_collecteur', 2150, 250, 820) + bolt(2150, 250, 1900, HZ + 40) + bolt(2150, 250, 2290, HZ + 60) + bolt(2110, 220, 1640, HZ - 20) + bolt(400, 0, 560, HZ - 120) + bolt(1200, 0, 1100, 260);
    s += UP('aelys_navette', 900, 210, 440) + UP('aelys_eclaireur', 620, 330, 170) + UP('aelys_eclaireur', 1240, 300, 150, true);
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
// ESSAIM XAROTH — essaim évolutif (violet, or, lueurs magenta)
// =====================================================================================
const XP = '#7a2ac0', XP2 = '#4a1a7a', XM = '#e04ae0', XG = '#c8a060', XG2 = '#8a6a3a', XD = '#1e1428', XB = '#3a8aff', XGr = '#3ad06a', XE = '#ff5ad8', MAW = '#5a1a2a', BONE = '#f0e6c8';
function jawTeeth(){ let s = ''; for (const a of [25, 50, 75, 105, 130, 155]){ const t = a * Math.PI / 180, x = 12 * Math.cos(t), y = -8 + 16 * Math.sin(t); const dx = -x * .35, dy = (-2 - y) * .35; const nx = -Math.sin(t) * 2.2, ny = Math.cos(t) * 2.2; s += P(poly([[x + nx, y + ny], [x - nx, y - ny], [x + dx, y + dy]]), '#fffaf0', ol(1)); } return s; }
const XAROTH = {
  name: 'Ruche de Xaroth', sub: "Faction : l'Essaim Xaroth", mood: 'night', bonus: 'spores bleues', bonusN: 9, seed: 7101,
  targets: [
    ['un œuf luisant', () => C(0, 2, 21, '#c8f04a', op('.22')) + E(0, 3, 12, 16, '#b9ea3c', ol()) + E(-4, -3, 3.5, 6, '#f3ffb8') + P('M-7 10 Q0 3 7 12', 'none', st('#5f8f12', 1.2))],
    ['une larve', () => { let s = ''; [[-14, 4, 6], [-7, 2, 7], [0, 1, 7.5], [7, 2, 7]].forEach(([x, y, r]) => s += E(x, y, r * .8, r, '#f0dfbf', ol(1.3))); return s + P('M18 -3 L23 -7 M18 3 L23 6', 'none', st(OUT, 1.8)) + C(14, 0, 6.5, '#b07a4e', ol(1.3)) + C(15, -2, 1.4, OUT); }],
    ['un casque Valnir', () => P('M-16 6 Q-17 -17 0 -17 Q17 -17 16 6 Z', VW, ol()) + P('M-16 -2 Q-16 -14 -6 -16 L-4 -6Z', VB) + P('M-12 -6 H12 Q13 2 10 4 H-10 Q-13 2 -12 -6Z', VC, ol(1.2)) + P('M-9 -3 H-2', 'none', st('#e8ffff', 2)) + Rc(-19, 5, 38, 6, VK2, 2, ol())],
    ["une griffe d'or", () => P('M-12 16 Q-16 -4 12 -19 Q4 -4 5 16 Z', XG, ol()) + P('M-6 13 Q-8 0 7 -12', 'none', st('#f0d8a0', 2)) + Rc(-15, 13, 23, 6, XP2, 2, ol())],
    ['un cocon violet', () => P('M0 -21 Q14 -8 0 21 Q-14 -8 0 -21Z', '#9b3fc0', ol()) + P('M-6 -10 Q0 -4 6 -10 M-8 0 Q0 6 8 0 M-6 10 Q0 15 6 10', 'none', st('#d79bf0', 1.6)) + E(-3, -8, 2, 5, '#e6c2f7')],
    ['un œil sur pédoncule', () => PO('M-2 21 Q-8 6 1 -6', XP, 5) + C(2, -11, 9.5, '#fff7e8', ol()) + C(4, -11, 5.5, '#ff8a00') + E(4, -11, 1.5, 4.6, '#140a10') + C(1, -14, 2, '#fff')],
    ['une mâchoire', () => P('M-18 -8 Q-18 18 0 18 Q18 18 18 -8 L12 -8 Q12 8 0 8 Q-12 8 -12 -8Z', BONE, ol()) + jawTeeth()],
    ['un cristal bleu', () => P('M-6 18 L-15 2 L-10 -2 L-4 10Z', '#5aa0ff', ol()) + P('M4 18 L10 0 L15 6 L12 18Z', '#2f6fd6', ol()) + P('M-2 18 L-8 -4 L-2 -20 L4 -4 Z', '#3d8bff', ol()) + P('M-2 -20 L4 -4 L-2 18Z', '#8fc0ff') + Rc(-17, 16, 34, 5, XP2, 2, ol())],
    ['un baril toxique', () => Rc(-12, -17, 24, 34, '#f2c230', 4, ol()) + Rc(-12, -9, 24, 3, '#2a2020') + Rc(-12, 6, 24, 3, '#2a2020') + P(star(3, 5, 1.5), '#2a2020') + Rc(-9, -15, 3, 30, '#fff3b0', 1, op('.5')) + P('M-12 12 Q-15 18 -10 21 Q-7 16 -9 12Z', '#7dff4a', ol(1))],
    ['un scarabée doré', () => { let s = ''; for (const y of [-4, 3, 10]) s += L(-8, y, -17, y - 5, OUT, 2.2) + L(8, y, 17, y - 5, OUT, 2.2); return s + L(-2, -15, -7, -21, OUT, 1.6) + L(2, -15, 7, -21, OUT, 1.6) + C(0, -12, 5.5, '#7a5a10', ol()) + E(0, 3, 10.5, 13.5, '#e8b422', ol()) + L(0, -10, 0, 16, '#7a5a10', 1.4) + E(-4, -2, 2.5, 5, '#fff1a8'); }],
    ["une fiole d'échantillon", () => Rc(-6, 0, 12, 16, '#5de05d', 5) + Rc(-6, -12, 12, 28, '#d9f4ff', 5, ol() + ' fill-opacity=".35"') + Rc(-5, -19, 10, 8, '#9a6a3a', 2, ol()) + L(-3, -8, -3, 12, '#fff', 1.5)],
    ['un crâne', () => P('M-13 2 Q-15 -17 0 -17 Q15 -17 13 2 L9 6 V13 H-9 V6 Z', '#f2ecdc', ol()) + E(-5.5, -3, 4, 4.5, '#2a1a22') + E(5.5, -3, 4, 4.5, '#2a1a22') + P('M0 3 L-2 7 H2Z', '#2a1a22') + L(-4.5, 9, -4.5, 12.5, '#2a1a22', 1.3) + L(0, 9, 0, 12.5, '#2a1a22', 1.3) + L(4.5, 9, 4.5, 12.5, '#2a1a22', 1.3)],
    ['une antenne radio', () => C(0, -20, 7, '#ff3b3b', op('.3')) + LO(-9, 18, 0, 0, '#9aa4a8', 2) + LO(9, 18, 0, 0, '#9aa4a8', 2) + LO(0, 18, 0, -10, '#9aa4a8', 2.5) + P('M-10 -12 Q0 -2 10 -12 Q0 -19 -10 -12Z', '#c9d1d4', ol()) + C(0, -20, 3, '#ff3b3b', ol(1))],
    ['une aile membraneuse', () => P('M-16 14 Q-18 -14 16 -18 Q8 -6 12 4 Q2 2 2 12 Q-6 8 -16 14Z', '#b04ae0', ol() + ' fill-opacity=".92"') + P('M-16 14 L12 -14 M-10 8 L6 -6 M-14 10 L-2 -14 M-8 12 L8 6', 'none', st('#5a1a8a', 1.2))],
  ],
  clutter: [
    U('xaroth_griffeuse', 46), U('xaroth_griffeuse', 46), U('xaroth_traqueur', 50), U('xaroth_tisseuse', 58), U('xaroth_mutant', 52), U('xaroth_devoreur', 56), U('xaroth_embusqueur', 52), U('xaroth_predateur', 62), U('xaroth_rampant', 58), U('xaroth_couveuse', 50), U('xaroth_terrier', 66), U('xaroth_incubateur', 56), U('xaroth_extracteur', 64), U('xaroth_reserve', 52),
    // bulbe de substrat
    () => PO('M0 16 Q-3 6 0 -2', XP2, 3) + C(0, -8, 13, 'url(#gP)') + C(0, -8, 8, XM, ol()) + C(-3, -11, 2.4, '#ffd0f4') + P(blob(16, 5, 7, .2, 0, 15), XP2, ol(1.2)),
    // épave Valnir
    () => Rc(-20, 2, 40, 11, VK, 5, ol()) + P('M-18 2 L-14 -6 H12 L19 2Z', VW2, ol()) + Rc(-14, -3, 26, 2, VB) + P('M-8 -6 Q-8 -13 1 -13 Q9 -13 9 -6Z', VW2, ol()) + LO(7, -10, 20, -18, VK, 2.2) + P('M-14 -2 L-6 -4 L-2 0', 'none', st('#1a1a1a', 2)) + T(4, -16, smoke(3, 6, 3, -9)),
    // gravats de béton
    () => { let s = ''; for (let i = 0; i < 4; i++){ const x = rnd(-12, 12), y = rnd(-6, 8), w = rnd(8, 14), h = rnd(6, 10); s += ROT(f1(rnd(-30, 30)), f1(x), f1(y), Rc(x - w / 2, y - h / 2, w, h, pick(['#7a7e86', '#8a8e96', '#5a5e66']), 1, ol(1.2))); } return s; },
    fireCrater,
    // flaque de substrat
    () => { const c = pick(['#4a2a6a', '#3a1a5a', '#5a2a7a']); let s = P(blob(rnd(18, 24), rnd(8, 11), 9, .18), c, ol()) + P(blob(10, 4, 7, .2, -4, -3), shade(c, .2)); for (let i = 0; i < ri(1, 3); i++) s += C(rnd(-12, 12), rnd(-4, 3), rnd(2, 3.2), XM, ol(1)); return s; },
  ],
  sky: [U('xaroth_chasseur', 66, null), U('xaroth_chasseur', 66, null), U('xaroth_ravageur', 62, null), U('xaroth_essaimlon', 46, null), U('xaroth_essaimlon', 46, null), () => boom(rnd(14, 22)), () => C(0, 0, 14, 'url(#gP)') + C(0, 0, 6, XP, ol()) + C(-2, -2, 2, XM)],
  bonusDraw: () => C(0, 0, 10, '#4ef0ff', op('.3')) + P(star(4, 9, 2.5), '#9ff8ff', ol(1)) + C(0, 0, 4.5, '#4ef0ff', ol(1)) + C(-1.2, -1.2, 1.6, '#fff'),
  bonusSky: true,
  big: [
    B('xaroth_ver', 290), B('xaroth_matriarche', 270), B('xaroth_colosse', 340), B('xaroth_nid', 300),
    B('xaroth_porteessaim', 260), B('xaroth_couveuse', 210), B('xaroth_reserve', 230), B('xaroth_predateur', 250),
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140c22"/><stop offset=".55" stop-color="#4a3a5a"/><stop offset="1" stop-color="#b08aa0"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2448"/><stop offset="1" stop-color="#160c1e"/></linearGradient>
<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a88b0" stop-opacity="0"/><stop offset="1" stop-color="#b090b8" stop-opacity=".7"/></linearGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)');
    for (let i = 0; i < 40; i++) s += E(rnd(0, W), rnd(20, HZ - 150), rnd(120, 300), rnd(30, 70), pick(['#24182e', '#2e2038', '#3a2a44']), op(rnd(.35, .7).toFixed(2)));
    // colosse bio-mécanique géant dans la brume
    s += UP('xaroth_colosse', 560, HZ - 200, 1050, false, op('.8'));
    let d = ''; for (let x = 900; x < W; x += rnd(60, 140)){ const w = rnd(50, 110), h = rnd(120, 340); d += `M${f1(x)} ${HZ + 30} V${f1(HZ - h)} L${f1(x + w * .3)} ${f1(HZ - h - rnd(10, 40))} L${f1(x + w * .55)} ${f1(HZ - h + rnd(10, 40))} L${f1(x + w)} ${f1(HZ - h - rnd(-20, 30))} V${HZ + 30}Z `; }
    s += P(d, '#3a3448') + Rc(0, HZ - 220, W, 300, 'url(#mist)');
    d = ''; for (let x = -40; x < W; x += rnd(90, 180)){ const w = rnd(60, 120), h = rnd(60, 200); d += `M${f1(x)} ${HZ + 30} V${f1(HZ - h)} L${f1(x + w * .4)} ${f1(HZ - h - rnd(10, 50))} L${f1(x + w)} ${f1(HZ - h + rnd(0, 40))} V${HZ + 30}Z `; }
    s += P(d, '#2a2436');
    for (const [x, y, r] of [[1700, HZ - 60, 120], [2550, HZ - 30, 90], [1150, HZ - 10, 70]]) s += T(x, y, boom(r)) + T(x, y - r, smoke(5, r * .5, rnd(-20, 20), -r * .45));
    for (let i = 0; i < 9; i++){ const x = rnd(1500, 2000), y = HZ - 60; s += P(`M${f1(x)} ${y} Q${f1(x + rnd(60, 200))} ${f1(y - rnd(150, 300))} ${f1(x + rnd(200, 420))} ${f1(y - rnd(250, 420))}`, 'none', st('#f4eee4', 3) + op('.7')); }
    for (const [x, y, k] of [[1300, 200, 4], [2300, 150, 3.4], [2600, 300, 2.6], [1900, 330, 3]]) s += UP('xaroth_chasseur', x, y, 62 * k, x > 2000);
    s += Rc(0, HZ, W, H - HZ, 'url(#gnd)');
    for (let i = 0; i < 40; i++){ const x = rnd(0, W), y = rnd(HZ + 30, H), k = .5 + (y - HZ) / (H - HZ); s += P(blob(rnd(80, 200) * k, rnd(20, 50) * k, 10, .25, x, y), pick(['#4a2a6a', '#3a1a5a', '#4a4458', '#3a3448']), op('.7')); }
    for (let i = 0; i < 24; i++){ const x = rnd(0, W), y = rnd(HZ + 40, H), k = .5 + (y - HZ) / (H - HZ); s += P(`M${f1(x)} ${f1(y)} q${f1(60 * k)} ${f1(-30 * k)} ${f1(140 * k)} ${f1(rnd(-20, 20) * k)}`, 'none', st(XM, 4 * k) + op('.45')); }
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
  USED.clear();
  // Rien ne doit recouvrir un objet à trouver ou un objet du bonus : on garde le rectangle
  // de chaque image d'unité et on refuse tout recouvrement dessiné par-dessus (z plus grand).
  const protect = [], rects = [];
  const DEF_BOX = [-20, -20, 20, 20];
  const rectOf = (x, y, s, box, z) => ({x0: x + box[0] * s - 6, x1: x + box[2] * s + 6, y0: y + box[1] * s - 6, y1: y + box[3] * s + 6, z});
  const hits = (p, q) => p.x + p.r > q.x0 && p.x - p.r < q.x1 && p.y + p.r > q.y0 && p.y - p.r < q.y1;
  const coversProtected = q => protect.some(p => p.z < q.z && hits(p, q));
  const coveredByRect = p => rects.some(q => q.z > p.z && hits(p, q));
  // 1. grandes structures et unités géantes
  for (let n = 0, t = 0; n < 10 && t < 5000; t++){
    const x = rnd(190, W - 190), y = rnd(HZ + 90, HZ + 620), s = persp(y) * rnd(.85, 1.1), r = 125 * s;
    if (!free(x, y, r, 1.05)) continue;
    const fn = pick(F.big), z = y + 100 * s;
    occ.push({x, y, r, big: true}); rects.push(rectOf(x, y, s, fn.box || [-150, -150, 150, 100], z));
    ground.push({z, svg: G(x, y, s, 0, fn(), R() < .5)}); n++;
  }
  // 2. objets à trouver
  const items = [];
  F.targets.forEach(([label, fn]) => {
    for (let t = 0; t < 20000; t++){
      const x = rnd(90, W - 90), y = rnd(HZ + 70, H - 60), s = persp(y) * .92, r = 21 * s, z = y + r * .6;
      if (!free(x, y, r + 30, 1)) continue;
      if (items.some(o => Math.hypot(o.x - x, o.y - y) < 330)) continue;
      if (coveredByRect({x, y, r: r + 8, z})) continue;
      const rot = rnd(-25, 25);
      occ.push({x, y, r: r + 4}); protect.push({x, y, r: r + 8, z});
      items.push({label, icon: icon(fn), x: Math.round(x), y: Math.round(y), r: Math.round(r)});
      ground.push({z, svg: G(x, y, s, rot, fn())}); return;
    }
    throw new Error('placement impossible : ' + label);
  });
  // 3. objets du bonus
  for (let n = 0, t = 0; n < F.bonusN && t < 20000; t++){
    const inSky = F.bonusSky && R() < .45;
    const x = rnd(60, W - 60), y = inSky ? rnd(60, HZ - 60) : rnd(HZ + 60, H - 50), s = inSky ? rnd(.9, 1.2) : persp(y) * .95, r = 19 * s, z = y + r * .6;
    if (!free(x, y, r + 14, 1)) continue;
    if (coveredByRect({x, y, r: r + 6, z})) continue;
    occ.push({x, y, r: r + 4}); protect.push({x, y, r: r + 6, z});
    (inSky ? sky : ground).push({z, svg: G(x, y, s, rnd(-10, 10), F.bonusDraw())}); n++;
  }
  // 4. ciel
  for (let n = 0, t = 0; n < 40 && t < 20000; t++){
    const x = rnd(40, W - 40), y = rnd(50, HZ - 40), s = rnd(.9, 1.5), r = 24 * s;
    if (!free(x, y, r, .9)) continue;
    const fn = pick(F.sky), q = rectOf(x, y, s, fn.box || DEF_BOX, y + 1e-3);
    if (coversProtected(q)) continue;
    occ.push({x, y, r}); sky.push({z: q.z, svg: G(x, y, s, rnd(-12, 12), fn(), R() < .5)}); n++;
  }
  // 5. unités et décor au sol, très denses
  let clutter = 0;
  for (let t = 0; t < 160000 && clutter < 900; t++){
    const y = rnd(HZ + 15, H - 15), x = rnd(20, W - 20), fn = pick(F.clutter);
    // les unités des planches sont agrandies pour qu'on voie leurs détails
    const s = persp(y) * rnd(.85, 1.5) * (fn.box ? 1.55 : 1), box = fn.box || DEF_BOX, r = Math.max(20, (box[2] - box[0]) * .3) * s;
    if (!free(x, y, r, .72)) continue;
    const q = rectOf(x, y, s, box, y + r * .5);
    if (coversProtected(q)) continue;
    occ.push({x, y, r}); ground.push({z: q.z, svg: G(x, y, s, rnd(-6, 6), fn(), R() < .5)}); clutter++;
  }
  sky.sort((a, b) => a.z - b.z); ground.sort((a, b) => a.z - b.z);
  const bg = F.bg(W, H, HZ);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${DEFS}${UDEFS()}${bg}${sky.map(o => o.svg).join('')}${ground.map(o => o.svg).join('')}</svg>`;
  fs.mkdirSync(path.join(ROOT, 'img'), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'img', id + '.svg'), svg);
  return {id, n, name: F.name, title: `Niveau ${n} — ${F.name}`, mood: F.mood, w: W, h: H, items,
    count: sky.length + ground.length, bats: F.bonusN, bonus: F.bonus,
    kind: 'faction', sub: F.sub, cat: 'stellaire', img: `img/${id}.svg`, thumb: `img/${id}.svg`, vector: true};
}

const levels = [build(XAROTH, 's01', 1), build(AELYS, 's02', 2), build(VALNIR, 's03', 3)];
// injection des niveaux dans index.html, entre les repères STELLAIRE-DEBUT / STELLAIRE-FIN
const idx = path.join(ROOT, 'index.html');
const html = fs.readFileSync(idx, 'utf8');
const re = /(\/\/ STELLAIRE-DEBUT[^\n]*\n)[\s\S]*?(\/\/ STELLAIRE-FIN)/;
if (!re.test(html)) throw new Error('repères STELLAIRE introuvables dans index.html');
fs.writeFileSync(idx, html.replace(re, (m, a, b) => a + 'const STELLAIRE = ' + JSON.stringify(levels) + ';\n' + b));
levels.forEach(l => console.log(l.id, l.name, 'objets:', l.items.length, 'bonus:', l.bats, 'éléments:', l.count, 'taille:', fs.statSync(path.join(ROOT, 'img', l.id + '.svg')).size));
