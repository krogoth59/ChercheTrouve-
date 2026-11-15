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
const G = (x, y, s, rot, inner, flip) => (flip = flip && !inner.includes('<text'), 0) || `<g transform="translate(${f1(x)} ${f1(y)})${rot ? ` rotate(${f1(rot)})` : ''} scale(${(flip ? -s : s).toFixed(3)} ${s.toFixed(3)})">${inner}</g>`;
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
// COMBINE VALNIR — force expéditionnaire (blanc, bleu, noir, lueurs cyan)
// =====================================================================================
const VW = '#e6eaee', VW2 = '#b8c0c8', VB = '#2a4fd0', VB2 = '#1a3290', VK = '#2a2f38', VK2 = '#3e4450', VC = '#3fe0ff', VIS = '#ffb52e', HAZ = '#f2c230';
const V = {
  // Vanguard : exosquelette d'infanterie
  vanguard: () => Rc(-16, -12, 6, 14, VK2, 2, ol(1)) + Rc(-8, 4, 7, 13, VW, 2, ol(1.2)) + Rc(1, 4, 7, 13, VW, 2, ol(1.2)) + Rc(-8, 8, 7, 3, VB) + Rc(1, 8, 7, 3, VB) + Rc(-9, 15, 9, 4, VK, 1.5, ol(1)) + Rc(0, 15, 9, 4, VK, 1.5, ol(1))
    + P('M-11 -9 H11 L12 4 Q0 8 -12 4Z', VW, ol()) + P('M-6 -7 H6 L5 2 H-5Z', VB) + C(0, -3, 1.8, VC) + Rc(-15, -12, 9, 8, VB, 3, ol(1.2)) + Rc(6, -12, 9, 8, VW, 3, ol(1.2)) + Rc(6, -9, 9, 2.4, VB)
    + Rc(-5, -19, 10, 8, VW, 3, ol(1.2)) + Rc(-1, -17, 6, 3, VC, 1) + Rc(-2, -4, 24, 5, VK, 1.5, ol(1.2)) + Rc(8, -3, 8, 2, VC, 1) + Rc(2, 1, 5, 5, VK2, 1, ol(1)),
  // Talon : méca de combat
  talon: () => P('M-10 4 L-14 18 H-5 L-3 4Z', VW, ol()) + P('M3 4 L5 18 H14 L10 4Z', VW, ol()) + C(-9, 11, 2.6, VB, ol(1)) + C(8, 11, 2.6, VB, ol(1)) + Rc(-16, 16, 12, 4, VK, 1.5, ol(1)) + Rc(4, 16, 12, 4, VK, 1.5, ol(1)) + Rc(-10, 0, 20, 6, VK2, 2, ol(1))
    + Rc(-24, -9, 8, 14, VW, 3, ol()) + Rc(-24, -2, 8, 3, VB) + C(-20, 7, 4, VK2, ol(1)) + P('M-14 -16 H14 L12 2 H-12Z', VW, ol()) + P('M-8 -14 H8 L6 -2 H-6Z', VB) + C(0, -8, 6, 'url(#gC)') + C(0, -8, 2.6, VC, ol(.6))
    + Rc(-4, -22, 8, 6, VK2, 2, ol(1)) + Rc(-3, -21, 6, 2, VC) + Rc(-22, -21, 12, 11, VW, 3, ol()) + Rc(-22, -15, 12, 3, VB) + Rc(10, -21, 12, 11, VW, 3, ol()) + TXT(12, -12.5, 5, VB, '07')
    + Rc(10, -8, 17, 8, VK, 2, ol()) + Rc(24, -9, 4, 10, VK2, 1, ol(1)) + Rc(12, -6, 9, 2, VC),
  // Auriga : marcheur d'artillerie
  auriga: () => { let s = ''; for (const [a, b] of [[-6, -18], [-3, -9], [3, 9], [6, 18]]) s += PO(`M${a} -2 L${f1((a + b) / 2)} -10 L${b} 16`, VK2, 2.6) + Rc(b - 3, 15, 6, 3, VW, 1, ol(.8));
    return s + Rc(-12, -10, 24, 12, VW, 3, ol()) + Rc(-12, -4, 24, 3, VB) + C(-6, -6, 1.8, VC) + Rc(-13, -19, 9, 9, VB, 2, ol(1)) + C(-10.5, -16.5, 1.3, VC) + C(-6.5, -16.5, 1.3, VC) + C(-10.5, -12.5, 1.3, VC) + C(-6.5, -12.5, 1.3, VC)
      + Rc(-4, -16, 12, 7, VW, 2, ol(1)) + Rc(6, -15, 22, 4, VK, 1, ol(1)) + Rc(26, -16.5, 4, 7, VK2, 1, ol(1)) + Rc(8, -14, 10, 1.6, VC); },
  // Vexor : porte-missiles à roues
  vexor: () => { let s = ''; for (const x of [-14, -6, 4, 12]) s += C(x, 9, 4.2, VK, ol(1)) + C(x, 9, 1.6, '#6a7280');
    return s + ROT(-28, 4, -3, Rc(0, -14, 18, 10, VK2, 2, ol(1)) + C(4, -11.5, 1.6, VC) + C(9, -11.5, 1.6, VC) + C(14, -11.5, 1.6, VC) + C(4, -7, 1.6, VC) + C(9, -7, 1.6, VC) + C(14, -7, 1.6, VC))
      + P('M-21 6 V-3 L-17 -8 H-7 V-3 H20 V6Z', VW, ol()) + P('M-21 -3 L-17 -8 H-9 V-3Z', VB) + P('M-17 -7 H-11 V-4 H-19Z', VC) + Rc(-6, 0, 26, 2.5, VB) + L(-13, -8, -13, -13, VK, 1) + TXT(-4, 4.6, 3.6, VB, 'M-44'); },
  // Argus : char de siège à chenilles
  argus: () => { let s = Rc(-21, 3, 42, 12, VK, 6, ol()); for (const x of [-15, -7, 1, 9, 16]) s += C(x, 9, 3, '#5a626e');
    return s + P('M-19 3 L-15 -5 H15 L20 3Z', VW, ol()) + Rc(-15, -2, 30, 2.5, VB) + P('M-10 -5 L-8 -13 H8 L10 -5Z', VW, ol()) + Rc(-8, -11, 8, 4, VB) + TXT(1, -7, 3.6, VK, 'T-91') + Rc(8, -12, 22, 4, VK2, 1, ol(1)) + Rc(28, -13.5, 4, 7, VK, 1, ol(1)) + C(30, -10, 1.4, VC) + L(-6, -13, -6, -18, VK, 1); },
  // Rampart : véhicule d'assaut lourd
  rampart: () => { let s = Rc(-22, 4, 44, 10, VK, 4, ol()); for (const x of [-16, -8, 0, 8, 16]) s += C(x, 9, 2.8, '#5a626e');
    return s + P('M-22 4 L-17 -6 H12 L24 4Z', VW, ol()) + P('M12 -6 L24 4 H16 L6 -6Z', VB, ol(1)) + Rc(-14, -11, 16, 6, VK2, 2, ol(1)) + Rc(-12, -9, 4, 2, VC) + Rc(-6, -9, 4, 2, VC) + P('M-20 2 L-16 -3 M-16 2 L-12 -3', 'none', st(VB, 1.6)) + Rc(-2, -3, 10, 2, VC, 1) + TXT(-8, 2.6, 3.4, VB, 'H-98'); },
  // Orbita : drone de reconnaissance
  orbita: () => LO(-5, -1, -11, -4, VK2, 1.4) + LO(5, -1, 11, -4, VK2, 1.4) + fan(-14, -4, 8, 3, VW2, VC) + fan(14, -4, 8, 3, VW2, VC) + C(0, 2, 9, 'url(#gC)') + C(0, 0, 7, VW, ol()) + P('M-7 0 Q0 4 7 0', 'none', st(VB, 1.6)) + C(0, 2, 3, VC, ol(.8)) + L(1, -7, 3, -13, VK, 1),
  // Aeris : éclaireur en vol stationnaire
  aeris: () => fan(-16, 4, 6, 2.4, VW2, VC) + P('M-18 2 L-8 -6 H10 L20 0 L10 4 H-14Z', VW, ol()) + P('M-6 -6 H6 L8 -2 H-4Z', VC, ol(.8)) + Rc(-12, 0, 18, 2, VB) + fan(14, 4, 7, 2.6, VW2, VC) + L(2, -6, 4, -14, VK, 1),
  // Lyra : robot de soutien
  lyra: () => { let s = ''; for (const x of [-9, -3, 3, 9]) s += LO(x, 6, f1(x * 1.2), 15, VK2, 1.8);
    return s + Rc(-11, -8, 22, 16, VW, 3, ol()) + Rc(-7, -5, 14, 8, VK, 2, ol(1)) + Rc(-5, -3, 3, 4, VC) + Rc(2, -3, 3, 4, VC) + Rc(-11, 4, 22, 3, VB) + PO('M8 -8 L12 -18 L20 -16', VK2, 2) + P('M20 -16 L24 -19 M20 -16 L24 -13', 'none', st(VW2, 1.6)) + C(12, -18, 2, VW, ol(.8)); },
  // Ravenix : intercepteur
  ravenix: () => C(-22, 0, 8, 'url(#gC)') + P('M-20 0 L4 -5 L22 0 L4 5Z', VW, ol()) + P('M-6 -3 L-14 -16 L-4 -16 L6 -3Z M-6 3 L-14 16 L-4 16 L6 3Z', VB, ol(1.1)) + P('M-10 -2 L-16 -8 L-12 -2Z M-10 2 L-16 8 L-12 2Z', VW2, ol(.8)) + P('M6 -2 L14 -1 L12 1 L6 1Z', VC) + C(-20, 0, 2, VC),
  // Mantis : canonnière
  mantis: () => fan(-14, 4, 8, 3, VW2, VC) + P('M-12 -2 L-4 -8 H10 L18 -2 L12 4 H-8Z', VW, ol()) + Rc(-6, -6, 12, 3, VB) + P('M10 -6 L16 -2 H10Z', VC) + Rc(10, 2, 14, 2.4, VK, 1, ol(.8)) + L(0, -8, 1, -14, VK, 1) + fan(14, 4, 8, 3, VW2, VC),
  // Bastion : transporteur lourd
  bastion: () => C(24, -4, 10, 'url(#gC)') + Rc(19, -14, 6, 22, VW2, 2, ol(1)) + Rc(20, -10, 4, 3, VC) + P('M-24 4 L-20 -6 L-8 -10 H14 L22 -4 L24 4 L18 10 H-18Z', VW, ol(1.4)) + P('M-14 -9 H0 L-2 -3 H-16Z', VB) + Rc(4, -8, 10, 4, VB) + P('M-18 10 H18 L16 6 H-16Z', VK2) + P('M-22 0 L-19 -5 H-14 L-16 0Z', VC) + L(-8, 2, 14, 2, VC, 1) + Rc(-2, -14, 10, 4, VK2, 1, ol(.8)),
};
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
    V.vanguard, V.vanguard, V.vanguard, V.talon, V.auriga, V.vexor, V.argus, V.rampart, V.orbita, V.aeris, V.lyra,
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
  sky: [V.ravenix, V.ravenix, V.mantis, V.aeris, V.orbita, () => boom(rnd(14, 22)),
    // chasseur ailé Xaroth (ennemi)
    () => P('M-2 -2 Q-14 -24 -26 -14 Q-18 -10 -20 0 Q-10 -6 -2 2Z', '#7a2ac0', ol(1.1)) + P('M2 -2 Q14 -24 26 -14 Q18 -10 20 0 Q10 -6 2 2Z', '#7a2ac0', ol(1.1)) + E(0, 2, 5, 8, '#4a1a7a', ol()) + C(0, -6, 1.2, '#ff5ad8')],
  bonusDraw: () => LO(-6, 18, -6, -18, '#b9c2c6', 1.6) + P('M-5 -17 H13 V-3 H-5Z', VB, ol(1.3)) + T(4, -10, P(star(5, 4, 1.6), '#fff')) + C(-6, -19, 2, HAZ, ol(1)),
  bonusSky: false,
  big: [
    () => E(0, 100, 110, 14, '#2a1a10', op('.4')) + S(0, 10, 5, V.talon()),
    () => E(0, 100, 120, 14, '#2a1a10', op('.4')) + S(0, 24, 4.6, V.argus()),
    () => E(0, 100, 120, 14, '#2a1a10', op('.4')) + S(0, 30, 4.6, V.rampart()),
    () => E(0, 100, 110, 14, '#2a1a10', op('.4')) + S(0, 24, 4.4, V.auriga()),
    () => E(0, 100, 120, 14, '#2a1a10', op('.4')) + S(0, 40, 4.4, V.vexor()),
    // poste de commandement
    () => { let s = E(0, 100, 145, 18, '#2a1a10', op('.45')) + Rc(-118, 70, 22, 30, VK2, 2, ol(2.5)) + Rc(96, 70, 22, 30, VK2, 2, ol(2.5));
      s += P('M-120 90 L-110 20 L-70 -20 H70 L110 20 L120 90Z', VW2, ol(3)) + P('M-110 20 L-70 -20 H70 L110 20Z', VW) + P('M-104 40 H104', 'none', st(VB, 8));
      s += Rc(-60, -80, 120, 62, VK2, 6, ol(3)) + Rc(-60, -80, 120, 12, VB, 4); for (let x = -50; x < 50; x += 22) s += Rc(x, -60, 14, 8, VC, 1);
      s += Rc(-30, 30, 60, 60, VK, 3, ol(3)) + Rc(-30, 30, 60, 8, VB) + LO(40, -80, 40, -130, VK2, 3) + C(40, -132, 5, VC, ol(1.5)) + C(40, -132, 14, 'url(#gC)');
      for (const x of [-90, -60, 60, 90]) s += C(x, 62, 4, VC);
      return s + TXT(-100, 70, 16, VB, 'VALNIR'); },
    // piste avec Bastion posé
    () => E(0, 92, 140, 26, '#6b7478', ol(3)) + E(0, 90, 110, 18, '#7d8a8f') + P('M-40 85 V70 M40 85 V70', 'none', st(HAZ, 5)) + S(0, 40, 5, V.bastion()),
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
    s += S(sx, sy, 13, V.bastion(), true) + T(sx - 80, sy - 40, boom(46)) + T(sx + 140, sy + 50, boom(34));
    for (const [x, y, k] of [[600, 160, 3.2], [760, 240, 2.6], [900, 120, 2.4], [2500, 380, 2.2]]) s += S(x, y, k, V.ravenix(), true);
    s += S(1000, 380, 3.4, V.mantis(), true);
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
const A = {
  // Vecteur : infanterie tactique
  vecteur: () => PO('M-2 4 L-5 12 L-3 19', AW3, 2.4) + PO('M3 4 L6 11 L5 19', AW3, 2.4) + P('M-6 -10 Q-8 4 -3 6 H3 Q8 4 6 -10 Q0 -13 -6 -10Z', AW, ol()) + P('M-4 -6 L0 -2 L4 -6', 'none', st(AO, 1.6))
    + P('M-9 -12 Q-5 -15 -3 -9 Q-7 -8 -9 -12Z M9 -12 Q5 -15 3 -9 Q7 -8 9 -12Z', AW2, ol(1)) + E(0, -15, 3.6, 4, AW, ol(1.1)) + P('M-1 -18 Q-8 -24 -14 -22 Q-7 -19 -2 -13Z', AO, ol(.9)) + L(1, -15, 3.5, -15, AC, 1.6) + LO(-4, -3, 22, -10, AW2, 1.8) + C(22, -10, 1.8, AO),
  // Lame-Éther : combat rapproché
  lame: () => PO('M-3 4 L-6 12 L-3 19', AW3, 2.6) + PO('M3 4 L7 11 L5 19', AW3, 2.6) + P('M-16 -20 Q-10 -16 -4 -15 Q-8 -12 -12 -13Z', AW2, ol(1)) + P('M-8 -10 Q-10 4 -4 6 H4 Q10 4 8 -10 Q0 -14 -8 -10Z', AW, ol()) + C(0, -3, 6, 'url(#gO)') + C(0, -3, 3.2, AO, ol(1))
    + P('M-12 -12 Q-6 -16 -4 -9 Q-9 -8 -12 -12Z M12 -12 Q6 -16 4 -9 Q9 -8 12 -12Z', AW2, ol(1.2)) + E(0, -15, 4, 4.5, AW, ol(1.2)) + L(1, -15, 4, -15, AC, 1.8) + LO(-10, 6, 6, -6, AW3, 1.4) + C(16, -12, 9, 'url(#gO)') + P('M5 -5 L26 -19 L8 -2Z', AO, ol(1)) + P('M7 -4 L22 -16 L8 -3Z', AO2),
  // Protecteur : soutien et contrôle
  protecteur: () => Rc(-9, 4, 7, 14, AW2, 2, ol(1.1)) + Rc(2, 4, 7, 14, AW2, 2, ol(1.1)) + P('M-13 -10 Q-14 8 0 8 Q14 8 13 -10 Q0 -16 -13 -10Z', AW, ol()) + P('M-5 -7 L0 2 L5 -7Z', AO, ol(1))
    + P('M-20 -14 Q-12 -18 -10 -4 Q-16 2 -20 -14Z M20 -14 Q12 -18 10 -4 Q16 2 20 -14Z', AW, ol()) + P('M-17 -12 Q-13 -13 -12 -6 M17 -12 Q13 -13 12 -6', 'none', st(AO, 1.6)) + E(0, -14, 4, 4, AW2, ol(1)) + L(-1.5, -14, 1.5, -14, AC, 1.4),
  // Gardien : unité lourde de front, bulle de bouclier orange
  gardien: () => C(0, -2, 22, 'url(#gO)') + P('M-18 -14 A22 22 0 0 1 18 -14', 'none', st(AO, 2.4) + op('.8')) + PO('M-6 4 L-10 18 M6 4 L10 18', AW3, 3) + P('M-12 -8 Q-12 8 0 8 Q12 8 12 -8 Q0 -16 -12 -8Z', AW, ol()) + C(0, -2, 4, AO, ol(1))
    + P('M-16 -10 Q-10 -18 -6 -10 Q-12 -4 -16 -10Z M16 -10 Q10 -18 6 -10 Q12 -4 16 -10Z', AW2, ol(1)) + E(0, -15, 3.6, 3.6, AW, ol(1)) + L(-1.4, -15, 1.4, -15, AC, 1.3),
  // Agresseur : assaut brise-ligne (quadrupède)
  agresseur: () => { let s = ''; for (const [a, b, c] of [[-8, -18, -16], [-4, -12, -8], [4, 12, 8], [8, 18, 16]]) s += PO(`M${a} 0 Q${b} -10 ${c} 16`, AW2, 2.4);
    return s + P('M-14 2 Q-14 -12 0 -12 Q14 -12 14 2 Q0 8 -14 2Z', AW, ol()) + P('M-10 -4 Q0 -10 10 -4', 'none', st(AO, 2)) + C(-5, -2, 2.2, AO) + C(5, -2, 2.2, AO) + P('M12 -4 L24 -10 L16 0Z M-12 -4 L-24 -10 L-16 0Z', AW, ol(1)) + P('M14 -5 L22 -9 M-14 -5 L-22 -9', 'none', st(AO, 1.2)); },
  // Éliteur : frappe mobile, réacteurs aux jambes
  eliteur: () => C(-5, 18, 6, 'url(#gO)') + C(5, 18, 6, 'url(#gO)') + P('M-7 6 L-5 16 L-3 6Z M3 6 L5 16 L7 6Z', AO2, ol(.8)) + PO('M-4 2 L-5 8 M4 2 L5 8', AW3, 2.4) + P('M-8 -10 Q-10 4 0 5 Q10 4 8 -10 Q0 -14 -8 -10Z', AW, ol()) + C(0, -3, 3, AO, ol(.8))
    + P('M-14 -10 L-8 -16 L-6 -6Z M14 -10 L8 -16 L6 -6Z', AW2, ol(1)) + E(0, -15, 3.4, 3.6, AW, ol(1)) + P('M-1 -18 L-6 -24 L1 -20Z M1 -18 L6 -24 L-1 -20Z', AO, ol(.8)),
  // Sonde : collecte et construction
  sonde: () => C(0, 0, 12, 'url(#gO)') + P('M-12 2 Q-10 -9 2 -9 Q12 -8 13 0 Q6 7 -6 6Z', AW, ol()) + P('M-4 -9 Q2 -16 8 -12 L4 -7Z', AO, ol(1)) + C(6, -2, 2.6, AO2, ol(.8)) + P('M-10 4 L-16 9 L-8 6Z', AW2, ol(.9)),
  // Relais énergétique : sphère verte
  relais: () => C(0, 0, 16, 'url(#gG)') + C(0, 0, 10, AG, ol()) + C(-3, -3, 3, '#c8ffd8') + P('M-4 -12 Q-16 -12 -16 0 Q-16 12 -4 12 Q-10 6 -10 0 Q-10 -6 -4 -12Z', AW, ol()) + P('M4 -12 Q16 -12 16 0 Q16 12 4 12 Q10 6 10 0 Q10 -6 4 -12Z', AW, ol()) + C(-13, 0, 2, AO) + C(13, 0, 2, AO),
  // Bastion de soutien : orbe orange dans deux coques
  soutien: () => E(0, 12, 16, 4, AO, op('.6')) + E(0, 12, 16, 4, 'none', st(OUT, 1.4)) + C(0, 0, 14, 'url(#gO)') + C(0, 0, 8, AO, ol()) + C(-2, -2, 3, AO2) + P('M-16 -14 Q-20 0 -10 10 Q-14 0 -10 -12Z M16 -14 Q20 0 10 10 Q14 0 10 -12Z', AW, ol()) + P('M-8 -16 Q0 -22 8 -16 Q0 -12 -8 -16Z', AW2, ol(1)),
  // Cycleur : unité rapide
  cycleur: () => C(-12, 0, 8, 'url(#gO)') + P('M-14 4 Q-12 -10 6 -10 Q18 -8 16 2 Q6 8 -14 4Z', AW, ol()) + P('M-8 -2 Q2 -8 12 -4', 'none', st(AO, 2.4)) + C(-12, 1, 3, AO2, ol(.8)) + P('M0 -10 L6 -16 L8 -9Z', AW2, ol(.9)),
  // Drone minier
  minier: () => C(0, 10, 8, 'url(#gO)') + E(0, 6, 14, 4, AW2, ol()) + P('M-10 4 Q-10 -6 0 -6 Q10 -6 10 4Z', AW, ol()) + C(0, -1, 3, AO, ol(.8)) + LO(-6, -5, -10, -11, AW3, 1) + C(-10, -12, 1.6, AO),
  // Éclaireur : reconnaissance rapide
  eclaireur: () => C(-20, 2, 7, 'url(#gC)') + P('M-20 2 Q-4 -8 22 0 Q-4 6 -20 2Z', AW, ol()) + P('M-8 -2 L-18 -14 L-2 -4Z M-8 4 L-18 14 L-2 5Z', AW2, ol(1.1)) + P('M0 -3 Q8 -4 14 -1', 'none', st(AO, 1.6)) + C(-18, 2, 2, AC) + C(4, 0, 2.2, AO),
  // Navette Argos : transport
  navette: () => C(-22, 0, 9, 'url(#gC)') + P('M-22 -4 Q-6 -14 24 -4 L18 4 Q-4 10 -22 6Z', AW, ol()) + P('M-12 -9 L-4 -18 L6 -10Z', AW2, ol(1)) + P('M-14 0 Q4 -6 20 -2', 'none', st(AO, 2)) + C(-20, 1, 3, AC) + E(0, -6, 4, 2, AO),
  // Falconneur : interception aérienne
  falconneur: () => P('M-2 -2 L-20 -14 L-14 -2Z M2 -2 L20 -14 L14 -2Z', AW, ol(1.1)) + P('M-14 -10 L-6 -4 M14 -10 L6 -4', 'none', st(AO, 1.4)) + P('M-5 -6 Q0 -10 5 -6 L3 8 H-3Z', AW, ol()) + C(0, -1, 2.4, AO) + PO('M-2 8 L-4 16 M2 8 L4 16', AW3, 1.6) + P('M-1 -8 L0 -14 L1 -8Z', AO),
  // Collecteur orbital : croissant et éclair
  collecteur: () => C(0, -2, 16, 'url(#gC)') + P('M-18 8 Q-24 -12 -4 -20 Q-14 -10 -12 6Z', AW, ol()) + P('M-16 4 Q-20 -10 -6 -17', 'none', st(AO, 1.4)) + P('M18 4 Q22 -14 2 -20 Q14 -8 12 4Z', AW, ol()) + P('M16 0 Q18 -12 4 -17', 'none', st(AO, 1.4)) + P('M0 -6 L-4 -2 L2 -1 L-2 4', 'none', st('#e8ffff', 1.4)) + C(0, -4, 2.2, '#ffffff'),
};
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
    A.vecteur, A.vecteur, A.lame, A.lame, A.protecteur, A.gardien, A.agresseur, A.eliteur, A.sonde, A.relais, A.soutien, A.cycleur, A.minier,
    // plantes lumineuses roses
    () => { let s = ''; for (let i = 0; i < ri(2, 4); i++){ const x = rnd(-12, 12), h = rnd(10, 22); s += PO(`M${f1(x)} 16 Q${f1(x + rnd(-6, 6))} ${f1(16 - h / 2)} ${f1(x)} ${f1(16 - h)}`, '#2a5a5a', 1.6) + C(x, 16 - h, 7, 'url(#gP)') + C(x, 16 - h, 3.2, '#ff7ae0', ol(1)); } return s + P(blob(14, 4, 7, .2, 0, 16), '#1a3a3a', ol(1)); },
    // roche sombre
    () => { const c = pick(['#2c3a48', '#34424e', '#26323e']); return P(blob(rnd(14, 22), rnd(10, 15), 7, .3), c, ol()) + P(blob(7, 4, 6, .3, -4, -5), shade(c, .2)) + (R() < .4 ? C(rnd(-6, 6), rnd(-4, 2), 2.5, AC, ol(.8)) : ''); },
    // roseaux
    () => { let s = ''; for (let i = 0; i < 6; i++){ const x = rnd(-12, 12), h = rnd(14, 26); s += P(`M${f1(x)} 14 Q${f1(x + rnd(-5, 5))} ${f1(14 - h / 2)} ${f1(x + rnd(-6, 6))} ${f1(14 - h)}`, 'none', st(pick(['#2a6a5a', '#1f5a4a', '#3a7a6a']), 2)); } return s; },
    // flaque reflétante
    () => E(0, 0, rnd(16, 22), rnd(5, 7), '#123a4a', ol(1.2)) + E(-4, -1, 8, 1.6, '#7fd8e8', op('.6')),
  ],
  sky: [A.eclaireur, A.eclaireur, A.navette, A.falconneur, A.falconneur, A.sonde, A.collecteur],
  bonusDraw: () => C(0, 0, 13, 'url(#gO)') + P('M0 -12 L8 0 L0 12 L-8 0Z', AW, ol()) + P('M0 -6 L4 0 L0 6 L-4 0Z', AO) + L(0, -12, 0, -17, OUT, 1.4),
  bonusSky: true,
  big: [
    // Nexus d'ancrage : base principale
    () => { let s = E(0, 100, 150, 18, AC, op('.15'));
      for (const x of [-70, 0, 70]) s += P(`M${x - 10} 40 L${x} 100 L${x + 10} 40Z`, AC, op('.45')) + C(x, 60, 24, 'url(#gC)');
      s += C(0, -30, 90, 'url(#gO)') + P('M-150 20 Q-140 -10 -90 -20 L-60 -50 Q0 -70 60 -50 L90 -20 Q140 -10 150 20 Q80 50 0 46 Q-80 50 -150 20Z', AW, ol(3));
      s += P('M-55 -40 Q0 -112 55 -40Z', AO, ol(2.5)) + P('M-40 -44 Q0 -98 40 -44', 'none', st(AO2, 4)) + P('M-20 -46 Q0 -82 20 -46', 'none', st('#fff3c0', 3));
      s += PO('M-50 -40 Q-40 -140 0 -150 Q40 -140 50 -40', AW2, 6) + PO('M-70 -30 Q-80 -110 -30 -128', AW2, 4) + PO('M70 -30 Q80 -110 30 -128', AW2, 4);
      s += P('M-150 20 Q-80 40 0 36 Q80 40 150 20', 'none', st(AW3, 5));
      for (const x of [-130, -95, 95, 130]) s += E(x, 14, 18, 9, 'url(#gO)') + E(x, 14, 14, 6, AW3, ol(2)) + E(x, 14, 9, 3.6, AO);
      return s + P('M-30 46 L0 -20 L30 46Z', AW2, ol(2.5)) + P('M-10 46 L0 10 L10 46Z', AC, ol(1.5)); },
    // Tour sentinelle : défense à longue portée
    () => { let s = E(0, 100, 90, 12, '#000', op('.3'));
      for (const [kx, fx] of [[-60, -90], [0, 10], [60, 92]]) s += PO(`M${f1(fx * .2)} -40 Q${kx} -30 ${fx} 100`, AW2, 7) + P(`M${fx - 8} 100 L${fx} 84 L${fx + 8} 100Z`, AO, ol(2));
      s += Rc(-8, -80, 16, 50, AW3, 4, ol(2.5)) + C(0, -30, 30, 'url(#gO)') + C(0, -30, 14, AO, ol(2.5));
      return s + P('M-28 -130 L-70 -170 L-24 -146Z M28 -130 L70 -170 L24 -146Z', AW, ol(2.5)) + P('M-30 -90 Q-34 -150 0 -170 Q34 -150 30 -90 Q0 -76 -30 -90Z', AW, ol(3)) + P('M-14 -110 Q0 -150 14 -110 Q0 -96 -14 -110Z', AO, ol(2)) + C(0, -116, 6, AO2); },
    // Collecteur orbital au sol
    () => E(0, 100, 100, 12, '#000', op('.3')) + PO('M-30 70 L-50 100 M30 70 L50 100', AW3, 6) + Rc(-40, 60, 80, 22, AW2, 8, ol(3)) + S(0, -20, 5, A.collecteur()) + bolt(0, -40, -60, 20, 5, 14, 2) + bolt(0, -40, 50, 30, 5, 14, 2),
    () => E(0, 100, 100, 12, '#000', op('.3')) + S(0, 20, 5.5, A.gardien()),
    () => E(0, 100, 110, 12, '#000', op('.3')) + S(0, 36, 5, A.agresseur()),
    () => E(0, 100, 100, 12, '#000', op('.3')) + S(0, 40, 5, A.soutien()),
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050c18"/><stop offset=".6" stop-color="#11283c"/><stop offset="1" stop-color="#2a5a68"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3b4a"/><stop offset="1" stop-color="#0c1c26"/></linearGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)') + stars(W, HZ * .5, 140);
    for (let i = 0; i < 34; i++) s += E(rnd(0, W), rnd(20, HZ - 120), rnd(140, 320), rnd(30, 80), pick(['#0e1c2c', '#14263a', '#1a3048']), op(rnd(.5, .85).toFixed(2)));
    // grand collecteur orbital en orbite, éclairs ; navette Argos en approche
    s += C(2150, 230, 280, 'url(#gC)') + S(2150, 260, 11, A.collecteur()) + bolt(2150, 250, 1900, HZ + 40) + bolt(2150, 250, 2290, HZ + 60) + bolt(2110, 220, 1640, HZ - 20) + bolt(400, 0, 560, HZ - 120) + bolt(1200, 0, 1100, 260);
    s += S(900, 200, 7, A.navette()) + S(620, 330, 3, A.eclaireur()) + S(1240, 300, 2.6, A.eclaireur());
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
const purple = () => pick([XP, '#6a2ab0', '#8a3ad0']);
function jawTeeth(){ let s = ''; for (const a of [25, 50, 75, 105, 130, 155]){ const t = a * Math.PI / 180, x = 12 * Math.cos(t), y = -8 + 16 * Math.sin(t); const dx = -x * .35, dy = (-2 - y) * .35; const nx = -Math.sin(t) * 2.2, ny = Math.cos(t) * 2.2; s += P(poly([[x + nx, y + ny], [x - nx, y - ny], [x + dx, y + dy]]), '#fffaf0', ol(1)); } return s; }
const X = {
  // Griffeuse : assaut rapproché
  griffeuse: () => { const c = purple(); return PO('M-10 4 L-14 16 M-4 5 L-6 16 M6 4 L8 16', XG2, 2.4) + P('M-16 16 L-12 16 L-14 13Z M-8 16 L-4 16 L-6 13Z M6 16 L10 16 L8 13Z', XG, ol(.8)) + E(-2, 0, 12, 8, c, ol())
    + P('M-12 -2 Q-4 -12 8 -6 L4 -2 Q-4 -6 -10 2Z', XG, ol(1.2)) + E(10, -1, 6, 5, c, ol()) + C(12, -3, 1.4, XE) + P('M12 2 Q22 0 22 -12 Q24 4 14 6Z', XG, ol(1)) + P('M8 4 Q16 12 22 4 Q16 16 6 8Z', XG, ol(1)) + P('M-6 -8 L-10 -16 L-2 -9Z M2 -8 L2 -16 L6 -8Z', XG, ol(.9)); },
  // Traqueur : unité rapide
  traqueur: () => PO('M-2 4 L-6 12 L-2 19 M3 4 L7 12 L5 19', XG2, 2) + P('M-6 -8 Q-8 6 0 6 Q8 4 6 -8 Q0 -12 -6 -8Z', purple(), ol()) + P('M-4 -6 Q0 -10 4 -6', 'none', st(XM, 1.6)) + E(2, -14, 5, 4, XP, ol(1)) + C(4, -15, 1.2, XE) + P('M0 -17 L-8 -24 L-2 -15Z', XG, ol(.9)) + PO('M5 -4 L12 -10 L16 -4', XG, 1.6) + PO('M-5 -4 L-12 -8 L-14 -2', XG, 1.6),
  // Tisseuse : araignée
  tisseuse: () => { let s = ''; for (const [a, b] of [[-16, 14], [-20, 4], [-18, -8], [-12, -16]]) s += PO(`M-2 0 Q${f1(a * .6)} ${b - 10} ${a} ${b}`, XG2, 1.4) + PO(`M2 0 Q${f1(-a * .6)} ${b - 10} ${-a} ${b}`, XG2, 1.4);
    return s + E(0, 2, 7, 6, purple(), ol()) + E(0, -4, 4, 3.5, XG, ol(1)) + C(-1.4, -4, 1, XE) + C(1.4, -4, 1, XE) + P('M-3 5 Q0 9 3 5', 'none', st(XM, 1.4)); },
  // Mutant : serpent à griffes
  mutant: () => { let s = ''; [[-12, 14], [-10, 7], [-6, 1], [0, -3], [6, -7]].forEach(([x, y], i) => s += E(x, y, 6 - i * .3, 5.5 - i * .3, i % 2 ? XP : XP2, ol(1.1)) + P(`M${x - 2} ${y - 5} L${x} ${y - 10} L${x + 2} ${y - 5}Z`, XG, ol(.8)));
    return s + P('M4 -2 Q12 0 14 8 Q10 2 4 2Z M-2 2 Q4 6 4 14 Q0 8 -4 4Z', XG, ol(1)) + E(12, -10, 6, 5, XP, ol()) + C(14, -12, 1.3, XE) + P('M15 -7 L18 -3 L13 -6Z', XG, ol(.8)); },
  // Dévoreur : régénération
  devoreur: () => P('M-4 -6 Q-8 -20 6 -22 Q0 -14 2 -6Z', XM, ol(1) + op('.85')) + PO('M-10 4 L-12 14 M0 5 L0 14 M8 4 L10 14', XG2, 2.2) + E(-2, 0, 13, 8, XP2, ol()) + P('M-12 -2 Q-2 -10 10 -4', 'none', st(XG, 2.4)) + P('M8 -6 Q22 -10 22 0 Q14 -2 10 2Z', XG, ol(1)) + P('M8 2 Q20 6 20 0 Q14 10 8 6Z', XG, ol(1)) + C(10, -4, 1.4, XE),
  // Embusqueur : infiltration (queue de scorpion)
  embusqueur: () => PO('M-8 0 Q-18 -6 -14 -18 Q-8 -22 -4 -14', XP, 3) + P('M-4 -14 L2 -12 L-3 -9Z', XM, ol(1)) + PO('M-6 4 L-10 12 M0 4 L-2 12 M6 4 L8 12', XG2, 2) + E(0, 1, 10, 6, purple(), ol()) + P('M-8 -2 Q0 -8 8 -2', 'none', st(XG, 2)) + E(10, 0, 5, 4, XP2, ol(1)) + C(12, -1, 1.2, XE) + P('M12 2 L20 -2 L16 4Z', XG, ol(.9)),
  // Essaim rampant : unités jetables
  rampant: () => { let s = ''; for (const [x, y] of [[-8, 4], [8, -4], [2, 10]]) s += T(x, y, PO('M-4 2 L-6 6 M0 2 L0 6 M4 2 L6 6', XG2, 1.2) + E(0, 0, 6, 3.5, pick([XP, XB, XP2]), ol(1)) + P('M-3 -2 L-5 -6 L-1 -3Z', XG, ol(.6)) + C(5, -1, 1, XE)); return s; },
  // Couveuse : œufs dorés
  couveuse: () => { let s = P(blob(16, 8, 8, .2, 0, 8), XP2, ol(1.2)); [[-8, 2], [8, 3], [0, -2], [-4, -10], [5, -9]].forEach(([x, y]) => s += C(x, y, 6, XG, ol(1.1)) + P(`M${x - 3} ${y} Q${x} ${y - 3} ${x + 3} ${y}`, 'none', st(XG2, 1)) + C(x - 2, y - 2, 1.6, '#fff0c8')); return s + P('M-14 6 Q-6 -4 0 4 Q6 -4 14 6', 'none', st(XM, 1.2)); },
  // Terrier : point de passage
  terrier: () => E(0, 2, 20, 9, XP2, ol()) + E(0, 3, 14, 5.5, XD) + E(0, 3, 10, 3, XM, op('.35')) + P('M-18 0 L-24 -12 L-12 -3Z M16 -2 L22 -14 L10 -4Z M-4 -6 L-2 -16 L2 -6Z', XG, ol(1)),
  // Incubateur : sacs verts
  incubateur: () => C(2, 0, 14, 'url(#gG)') + P(blob(16, 4, 7, .2, 0, 10), XP2, ol(1)) + P('M-14 8 Q-16 -10 0 -12 Q-8 -4 -8 8Z', XP, ol()) + C(2, -2, 5, XGr, ol(1)) + C(8, 4, 5, XGr, ol(1)) + C(-2, 5, 5, XGr, ol(1)) + C(0, -3, 1.6, '#d8ffe0') + P('M-12 -8 Q-20 -18 -8 -20 Q-14 -14 -8 -10Z', XG, ol(1)),
  // Extracteur : collecte de ressources
  extracteur: () => C(0, -4, 12, 'url(#gP)') + P(blob(16, 5, 7, .2, 0, 12), XP2, ol(1.2)) + P('M-10 12 L-14 -6 L-6 6Z', XP, ol(1)) + P('M4 12 L12 -10 L10 10Z', XP, ol(1)) + P('M-4 12 L0 -20 L4 12Z', XM, ol(1)) + P('M0 -20 L4 12 L1 12Z', '#ff9af0'),
  // Chasseur ailé
  chasseur: () => P('M-2 -2 Q-14 -24 -26 -14 Q-18 -10 -20 0 Q-10 -6 -2 2Z', XP, ol(1.1)) + P('M2 -2 Q14 -24 26 -14 Q18 -10 20 0 Q10 -6 2 2Z', XP, ol(1.1)) + P('M-4 -4 Q-14 -18 -22 -13 M4 -4 Q14 -18 22 -13', 'none', st(XM, 1.2)) + PO('M0 8 Q-6 16 2 22', XP2, 2) + E(0, 2, 5, 8, XP2, ol()) + P('M-3 -8 Q0 -12 3 -8 L2 -2 H-2Z', XG, ol(1)) + C(0, -6, 1, XE),
  // Ravageur volant
  ravageur: () => P('M-4 0 Q-24 -20 -26 4 Q-16 -4 -6 6Z M4 0 Q24 -20 26 4 Q16 -4 6 6Z', '#5a2ab0', ol(1.1)) + P('M-6 2 L-18 -6 M6 2 L18 -6', 'none', st(XM, 1.2)) + E(0, 2, 6, 7, XP2, ol()) + P('M-4 8 Q-8 16 -4 20 M4 8 Q8 16 4 20', 'none', st(XG, 2)) + P('M-3 -4 L0 -10 L3 -4Z', XG, ol(.9)) + C(0, -1, 1.2, XE),
  // Essaimlon : drone de soutien
  essaimlon: () => P('M-10 0 Q0 -10 12 -2 Q2 4 -10 0Z', XP, ol()) + P('M-4 -4 L-10 -12 L0 -6Z', XM, ol(.8)) + P('M8 -2 L16 -4 L12 2Z', XG, ol(.8)) + C(6, -3, 1, XE),
};
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
    X.griffeuse, X.griffeuse, X.traqueur, X.tisseuse, X.mutant, X.devoreur, X.embusqueur, X.rampant, X.couveuse, X.terrier, X.incubateur, X.extracteur,
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
  sky: [X.chasseur, X.chasseur, X.ravageur, X.essaimlon, X.essaimlon, () => boom(rnd(14, 22)), () => C(0, 0, 14, 'url(#gP)') + C(0, 0, 6, XP, ol()) + C(-2, -2, 2, XM)],
  bonusDraw: () => C(0, 0, 10, '#4ef0ff', op('.3')) + P(star(4, 9, 2.5), '#9ff8ff', ol(1)) + C(0, 0, 4.5, '#4ef0ff', ol(1)) + C(-1.2, -1.2, 1.6, '#fff'),
  bonusSky: true,
  big: [
    // Ver cavernicole : unité de siège
    () => { let s = E(0, 100, 90, 16, XP2, ol(2.5)) + C(0, 96, 70, 'url(#gP)');
      [[0, 90, 40], [10, 60, 38], [16, 30, 36], [14, 0, 34], [4, -30, 32], [-12, -56, 30], [-30, -74, 28]].forEach(([x, y, r], i) => s += E(x, y, r, r * .7, i % 2 ? XP : XP2, ol(3)) + P(`M${f1(x - r * .7)} ${f1(y - r * .3)} Q${x} ${f1(y - r * .9)} ${f1(x + r * .7)} ${f1(y - r * .3)}`, 'none', st(XG, 6)));
      s += P('M30 80 Q40 0 0 -60', 'none', st(XM, 5) + op('.8'));
      return s + E(-48, -82, 30, 22, XP, ol(3)) + P('M-78 -82 Q-64 -60 -44 -70 Q-60 -78 -78 -82Z', XM, ol(2)) + P('M-62 -98 Q-96 -112 -100 -86 Q-82 -96 -68 -88Z M-66 -66 Q-96 -54 -98 -76 Q-82 -64 -68 -72Z', XG, ol(2)) + C(-44, -92, 4, XE) + P('M-30 -100 L-20 -130 L-14 -96Z', XG, ol(2)); },
    // Matriarche larvaire : génération d'unités
    () => { let s = E(0, 100, 110, 16, '#000', op('.3')) + C(0, 30, 70, 'url(#gP)') + C(0, 20, 80, XP2, ol(3)) + C(0, 20, 60, XP, ol(2.5)) + C(0, 20, 38, XP2, ol(2.5)) + C(0, 20, 18, XM, ol(2));
      for (let i = 0; i < 9; i++){ const a = -Math.PI + i * Math.PI / 8, x = Math.cos(a) * 80, y = 20 + Math.sin(a) * 80; s += P(`M${f1(x - 10)} ${f1(y + 4)} L${f1(x * 1.25)} ${f1(20 + Math.sin(a) * 104)} L${f1(x + 10)} ${f1(y + 4)}Z`, XG, ol(2)); }
      return s + E(78, -24, 26, 20, XP2, ol(3)) + P('M66 -40 Q86 -82 116 -62 Q96 -58 82 -36Z', XG, ol(2.5)) + C(86, -28, 4, XE) + P('M96 -14 Q110 -10 104 0 Q94 -2 90 -10Z', MAW, ol(2)); },
    // Colosse bio-mécanique : unité d'élite
    () => { let s = E(0, 100, 120, 14, '#000', op('.3'));
      for (const x of [-60, -20, 30, 70]) s += PO(`M${x} 20 L${x - 16} 60 L${x - 6} 100`, XG2, 8) + P(`M${x - 12} 100 L${x - 6} 88 L${x} 100Z`, XG, ol(1.5));
      s += P('M-80 -10 Q-170 -80 -170 10 Q-150 -50 -84 0Z', '#e8dcc0', ol(2.5)) + P('M-90 30 Q-100 -40 -20 -60 Q60 -70 90 -10 Q90 30 60 40 Q0 50 -90 30Z', XP2, ol(3)) + P('M-80 0 Q-40 -50 40 -56', 'none', st(XG, 10)) + P('M-60 -30 L-70 -70 L-40 -40Z M-20 -50 L-20 -96 L0 -56Z M20 -56 L30 -96 L40 -54Z', XG, ol(2)) + P('M-70 20 Q0 10 70 20', 'none', st(XM, 5));
      return s + E(90, 0, 26, 20, XP, ol(3)) + C(98, -6, 4, XE) + P('M60 -30 Q140 -120 170 -40 Q140 -90 70 -20Z', '#e8dcc0', ol(2.5)) + P('M66 -24 Q130 -96 160 -50', 'none', st(XB, 4) + op('.8')); },
    // Nid principal : structure maîtresse
    () => { let s = E(0, 100, 140, 20, XP2, ol(2.5)) + C(0, 40, 70, 'url(#gP)') + P('M-60 -60 Q-140 -140 -160 -40 Q-120 -100 -70 -40Z M60 -60 Q140 -140 160 -40 Q120 -100 70 -40Z', XP, ol(2.5)) + P('M-20 -90 L-40 -170 L0 -100Z M20 -90 L40 -170 L0 -100Z', XG, ol(2));
      s += P('M-120 100 Q-130 0 -60 -60 Q0 -110 60 -60 Q130 0 120 100Z', XG2, ol(3)) + P('M-100 90 Q-110 0 -50 -50', 'none', st(XG, 8)) + P('M-50 100 Q-50 10 0 0 Q50 10 50 100Z', XD, ol(3)) + P('M-36 100 Q-36 26 0 16 Q36 26 36 100Z', XM, op('.6'));
      for (let i = 0; i < 7; i++){ const t = Math.PI * (i + .5) / 7, x = -Math.cos(t) * 48, y = 100 - Math.sin(t) * 96; s += P(`M${f1(x - 5)} ${f1(y)} L${f1(x * .8)} ${f1(y + 14)} L${f1(x + 5)} ${f1(y)}Z`, XG, ol(1.5)); }
      return s; },
    // Porte-essaim : transport et reproduction
    () => { let s = E(0, 100, 110, 14, '#000', op('.3')); for (const x of [-70, -40, 40, 70]) s += PO(`M${f1(x * .6)} 30 Q${x} 20 ${f1(x * 1.2)} 100`, XG2, 7);
      s += P('M-80 40 Q-90 -50 0 -60 Q90 -50 80 40 Q0 60 -80 40Z', XP2, ol(3)) + C(0, 10, 50, 'url(#gC)');
      for (let i = 0; i < 4; i++) s += C(-36 + i * 24, 10, 13, XB, ol(2)) + C(-40 + i * 24, 6, 4.5, '#bfe0ff');
      return s + P('M-70 -10 Q0 -70 70 -10', 'none', st(XG, 10)) + P('M-50 -30 L-60 -70 L-30 -38Z M0 -50 L0 -94 L16 -50Z M50 -30 L64 -70 L36 -38Z', XG, ol(2)) + E(86, 10, 18, 14, XP, ol(2.5)) + C(92, 6, 3.5, XE); },
    () => E(0, 100, 100, 12, '#000', op('.3')) + S(0, 50, 5, X.couveuse()),
  ],
  bg(W, H, HZ){
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140c22"/><stop offset=".55" stop-color="#4a3a5a"/><stop offset="1" stop-color="#b08aa0"/></linearGradient>
<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2448"/><stop offset="1" stop-color="#160c1e"/></linearGradient>
<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a88b0" stop-opacity="0"/><stop offset="1" stop-color="#b090b8" stop-opacity=".7"/></linearGradient></defs>`;
    s += Rc(0, 0, W, HZ + 80, 'url(#sky)');
    for (let i = 0; i < 40; i++) s += E(rnd(0, W), rnd(20, HZ - 150), rnd(120, 300), rnd(30, 70), pick(['#24182e', '#2e2038', '#3a2a44']), op(rnd(.35, .7).toFixed(2)));
    // colosse géant dans la brume
    s += T(520, HZ - 40, P('M-420 120 Q-380 -160 -160 -250 Q-40 -300 60 -240 Q160 -180 170 -60 Q260 -40 330 40 Q360 100 300 120Z', '#2a1a3a') + P('M-120 -250 Q-260 -420 -420 -380 Q-280 -360 -200 -240Z M20 -250 Q60 -430 230 -460 Q110 -380 90 -240Z', '#3a2a2a') + P('M140 -40 Q330 -200 440 -60 Q320 -140 170 -10Z', '#4a4038') + C(80, -150, 30, 'url(#gP)') + C(80, -150, 10, XE) + C(-10, -170, 24, 'url(#gP)') + C(-10, -170, 8, XE), op('.92'));
    let d = ''; for (let x = 900; x < W; x += rnd(60, 140)){ const w = rnd(50, 110), h = rnd(120, 340); d += `M${f1(x)} ${HZ + 30} V${f1(HZ - h)} L${f1(x + w * .3)} ${f1(HZ - h - rnd(10, 40))} L${f1(x + w * .55)} ${f1(HZ - h + rnd(10, 40))} L${f1(x + w)} ${f1(HZ - h - rnd(-20, 30))} V${HZ + 30}Z `; }
    s += P(d, '#3a3448') + Rc(0, HZ - 220, W, 300, 'url(#mist)');
    d = ''; for (let x = -40; x < W; x += rnd(90, 180)){ const w = rnd(60, 120), h = rnd(60, 200); d += `M${f1(x)} ${HZ + 30} V${f1(HZ - h)} L${f1(x + w * .4)} ${f1(HZ - h - rnd(10, 50))} L${f1(x + w)} ${f1(HZ - h + rnd(0, 40))} V${HZ + 30}Z `; }
    s += P(d, '#2a2436');
    for (const [x, y, r] of [[1700, HZ - 60, 120], [2550, HZ - 30, 90], [1150, HZ - 10, 70]]) s += T(x, y, boom(r)) + T(x, y - r, smoke(5, r * .5, rnd(-20, 20), -r * .45));
    for (let i = 0; i < 9; i++){ const x = rnd(1500, 2000), y = HZ - 60; s += P(`M${f1(x)} ${y} Q${f1(x + rnd(60, 200))} ${f1(y - rnd(150, 300))} ${f1(x + rnd(200, 420))} ${f1(y - rnd(250, 420))}`, 'none', st('#f4eee4', 3) + op('.7')); }
    for (const [x, y, k] of [[1300, 200, 4], [2300, 150, 3.4], [2600, 300, 2.6], [1900, 330, 3]]) s += S(x, y, k, X.chasseur());
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
  // 1. grandes structures et unités géantes
  for (let n = 0, t = 0; n < 10 && t < 5000; t++){
    const x = rnd(170, W - 170), y = rnd(HZ + 90, HZ + 620), s = persp(y) * rnd(.85, 1.1), r = 120 * s;
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
    occ.push({x, y, r}); sky.push({z: y, svg: G(x, y, s, rnd(-12, 12), pick(F.sky)(), R() < .5)}); n++;
  }
  // 5. unités et décor au sol, très denses
  let clutter = 0;
  for (let t = 0; t < 120000 && clutter < 900; t++){
    const y = rnd(HZ + 15, H - 15), x = rnd(20, W - 20), s = persp(y) * rnd(.85, 1.6), r = 20 * s;
    if (!free(x, y, r, .72)) continue;
    occ.push({x, y, r}); ground.push({z: y + r * .5, svg: G(x, y, s, rnd(-6, 6), pick(F.clutter)(), R() < .5)}); clutter++;
  }
  sky.sort((a, b) => a.z - b.z); ground.sort((a, b) => a.z - b.z);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${DEFS}${F.bg(W, H, HZ)}${sky.map(o => o.svg).join('')}${ground.map(o => o.svg).join('')}</svg>`;
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
