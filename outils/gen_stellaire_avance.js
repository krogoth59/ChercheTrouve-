// Guerre stellaire, niveaux 4 à 13 : planches très denses, de plus en plus difficiles.
// Chaque niveau mélange les unités des trois factions (découpées dans les planches de concept),
// des objets futuristes et des leurres (objets d'autres listes), sur un décor spatial différent.
// Les planches sont composées en SVG puis rendues en JPEG avec le Chromium de Playwright.
// Appelé par outils/gen_stellaire.js : node outils/gen_stellaire.js .
const fs = require('fs'), path = require('path'), os = require('os');
const A = require('./gen_stellaire.js');
const {rnd, ri, pick, f1, OUT, ol, st, op, P, C, E, Rc, L, LO, PO, T, ROT, G, blob, poly, shade, star, stars, bolt, DEFS, boom, smoke, U, UDEFS, USED, icon, XAROTH, AELYS, VALNIR} = A;
const K = A.colors;

// =====================================================================================
// Nouveaux objets à trouver (thème spatial)
// =====================================================================================
const SPACE_TARGETS = [
  ['une fusée rouge', () => P('M0 -21 Q9 -10 8 8 L-8 8 Q-9 -10 0 -21Z', '#f4f1ea', ol()) + P('M0 -21 Q6 -14 7 -8 H-7 Q-6 -14 0 -21Z', '#e0302a', ol(1.2)) + C(0, -1, 3.6, '#5fd0ff', ol(1.2)) + P('M-8 0 L-15 12 L-8 9Z M8 0 L15 12 L8 9Z', '#e0302a', ol(1.2)) + P('M-5 8 L0 20 L5 8Z', '#ffb030', ol(1)) + P('M-2.5 8 L0 15 L2.5 8Z', '#fff2a0')],
  ['un satellite doré', () => Rc(-20, -6, 12, 12, '#2a5ad6', 1, ol(1.2)) + Rc(8, -6, 12, 12, '#2a5ad6', 1, ol(1.2)) + L(-14, -6, -14, 6, '#9fc8ff', 1) + L(14, -6, 14, 6, '#9fc8ff', 1) + LO(-8, 0, 8, 0, '#9aa4a8', 1.6) + Rc(-6, -8, 12, 16, K.GOLD, 2, ol()) + LO(0, -8, 0, -15, '#9aa4a8', 1.4) + C(0, -16, 2.4, '#ff4040', ol(.8))],
  ['une planète à anneaux', () => E(0, 0, 21, 6, 'none', st(OUT, 5)) + E(0, 0, 21, 6, 'none', st('#f0d890', 3)) + C(0, 0, 12, '#ff9a4a', ol()) + P('M-11 -3 Q0 -6 11 -3', 'none', st('#c8622a', 2)) + P('M-10 4 Q0 2 10 4', 'none', st('#ffd0a0', 1.6)) + P('M-21 0 Q0 9 21 0', 'none', st(OUT, 5)) + P('M-21 0 Q0 9 21 0', 'none', st('#f0d890', 3))],
  ['un pistolet laser', () => P('M-16 -8 H10 L14 -4 H18 V0 H10 L6 2 H-4 L-8 14 H-15 L-12 2 H-16Z', '#e8eef2', ol()) + Rc(-12, -6, 14, 3, '#ff4fd8') + C(18, -2, 4, 'url(#gP)') + C(-10, 6, 2, '#2a2f38')],
  ['une soucoupe verte', () => C(0, -4, 10, '#c8f6ff', ol() + ' fill-opacity=".85"') + C(0, -3, 4, '#5ae05a', ol(1)) + E(0, 3, 21, 7, '#9aa4ad', ol()) + E(0, 1, 18, 3.5, '#c8d0d6') + C(-12, 5, 1.8, '#5ae05a') + C(0, 7, 1.8, '#5ae05a') + C(12, 5, 1.8, '#5ae05a')],
  ["un casque d'astronaute", () => C(0, 0, 17, '#f6f6f2', ol()) + P('M-12 -2 Q-12 -12 0 -12 Q12 -12 12 -2 Q12 8 0 8 Q-12 8 -12 -2Z', '#e8a020', ol(1.3)) + P('M-8 -6 Q-6 -10 -1 -10', 'none', st('#fff1c0', 2.4)) + Rc(-10, 12, 20, 6, '#c8ccd0', 2, ol(1.2))],
  ["un cube d'énergie", () => C(0, 0, 20, 'url(#gC)') + P('M0 -16 L14 -8 L0 0 L-14 -8Z', '#9ff6ff', ol(1.3)) + P('M-14 -8 L0 0 V17 L-14 9Z', '#3fc8e0', ol(1.3)) + P('M14 -8 L0 0 V17 L14 9Z', '#1f8aa8', ol(1.3)) + C(0, -8, 3, '#fff')],
  ['un ours en peluche', () => C(-9, -12, 5, '#b8783a', ol()) + C(9, -12, 5, '#b8783a', ol()) + E(0, 9, 11, 10, '#b8783a', ol()) + C(0, -5, 10, '#b8783a', ol()) + E(0, -2, 5, 3.5, '#f0d0a0') + C(-4, -7, 1.5, OUT) + C(4, -7, 1.5, OUT) + C(0, -3, 1.6, OUT) + E(0, 10, 5, 5, '#f0d0a0') + P('M-6 1 Q0 4 6 1', 'none', st('#e04a6a', 3))],
  ['une comète', () => P('M6 -6 L-20 18 L2 -2Z', '#9fe8ff', op('.55')) + P('M8 -4 L-14 20 L4 0Z', '#e8fbff', op('.7')) + C(8, -8, 11, 'url(#gC)') + P(star(6, 9, 4), '#ffffff', ol(1)) + C(8, -8, 3, '#bff8ff')],
  ['une part de pizza', () => P('M0 18 L-15 -12 Q0 -19 15 -12Z', '#f2c45a', ol()) + P('M-15 -12 Q0 -19 15 -12 L13 -8 Q0 -14 -13 -8Z', '#c8822a') + C(-4, -4, 3, '#d8322b', ol(.8)) + C(5, -2, 3, '#d8322b', ol(.8)) + C(0, 7, 2.6, '#d8322b', ol(.8)) + C(-6, 4, 1.4, '#3a8a2a') + C(6, -8, 1.4, '#3a8a2a')],
  ['un télescope', () => LO(0, 2, -11, 18, '#5a5048', 1.6) + LO(0, 2, 11, 18, '#5a5048', 1.6) + LO(0, 2, 0, 18, '#5a5048', 1.6) + ROT(-30, 0, 0, Rc(-17, -5, 30, 10, '#2a4fd0', 3, ol()) + Rc(9, -7, 6, 14, '#c8ccd0', 1, ol(1)) + Rc(-20, -3, 4, 6, '#c8ccd0', 1, ol(1)))],
  ['un hologramme de cœur', () => E(0, 15, 12, 4, '#3a3f48', ol()) + P('M-10 13 L-14 -14 H14 L10 13Z', '#5fe8ff', op('.18')) + P('M0 6 Q-15 -4 -9 -12 Q-4 -16 0 -9 Q4 -16 9 -12 Q15 -4 0 6Z', '#ff5ab0', ol(1.1) + ' fill-opacity=".85"') + E(-5, -9, 2, 3, '#ffd0ea')],
];
const POOL = [...XAROTH.targets, ...AELYS.targets, ...VALNIR.targets, ...SPACE_TARGETS];

// =====================================================================================
// Objets futuristes du décor (taille nominale ≈ 40 px, posés sur y = +16)
// =====================================================================================
const PROPS = [
  // caisse de fret
  () => { const c = pick(['#3e4450', '#5a6270', '#2a4fd0', '#c86a2a', '#6a5a8a']); return Rc(-14, -10, 28, 26, c, 2, ol()) + Rc(-14, -10, 28, 5, shade(c, .3)) + L(-9, -2, -9, 13, shade(c, -.3), 2) + L(9, -2, 9, 13, shade(c, -.3), 2) + Rc(-4, 3, 8, 4, pick(['#5fe8ff', '#ffb52e', '#7dff4a']), 1); },
  // conteneur long
  () => { const c = pick(['#b8402a', '#2a7a8a', '#d8a020', '#4a5a7a']); let s = Rc(-20, -6, 40, 22, c, 2, ol()); for (let x = -16; x < 18; x += 5) s += L(x, -4, x, 14, shade(c, -.25), 1.4); return s + Rc(-20, -6, 40, 4, shade(c, .3)); },
  // antenne parabolique
  () => LO(0, 16, 0, -2, '#9aa4ad', 2) + Rc(-7, 12, 14, 5, '#5a6270', 1, ol(1)) + ROT(-25, 0, -6, E(0, -6, 14, 6, '#e6eaee', ol()) + E(0, -7, 10, 3.6, '#b8c0c8')) + LO(0, -6, 5, -16, '#9aa4ad', 1.2) + C(5, -17, 2, '#ff4040', ol(.8)),
  // lampadaire néon
  () => { const c = pick(['#5fe8ff', '#ff5ad8', '#ffd04a', '#7dff8a']); return Rc(-5, 12, 10, 5, '#3e4450', 1, ol(1)) + LO(0, 13, 0, -14, '#5a6270', 1.6) + C(0, -16, 9, c, op('.3')) + Rc(-4, -19, 8, 5, c, 2, ol(1)); },
  // console holographique
  () => Rc(-12, 2, 24, 14, '#3e4450', 2, ol()) + P('M-12 2 L-8 -4 H8 L12 2Z', '#5a6270', ol(1)) + P('M-9 -6 L-13 -20 H13 L9 -6Z', '#5fe8ff', op('.28')) + Rc(-7, -16, 14, 8, 'none', 1, st('#bff8ff', 1)) + Rc(-6, 6, 4, 3, '#ff5a5a') + Rc(0, 6, 6, 3, '#5aff8a'),
  // panneau solaire
  () => LO(0, 16, 0, 4, '#9aa4ad', 2) + P('M-18 -6 L14 -14 L18 2 L-14 10Z', '#1a3a9a', ol()) + P('M-10 -8 L-6 8 M-2 -10 L2 6 M6 -12 L10 4 M-16 2 L16 -6', 'none', st('#6a9aff', 1)),
  // réservoir sphérique
  () => LO(-8, 16, -6, 2, '#5a6270', 2) + LO(8, 16, 6, 2, '#5a6270', 2) + C(0, -4, 13, '#d8dde2', ol()) + E(0, -4, 13, 3, 'none', st('#2a4fd0', 2.4)) + E(-4, -9, 3, 5, '#ffffff', op('.8')),
  // tourelle
  () => Rc(-12, 6, 24, 10, '#4a5260', 2, ol()) + P('M-9 6 Q-9 -8 0 -8 Q9 -8 9 6Z', '#6a7280', ol()) + LO(4, -3, 20, -11, '#3e4450', 3.4) + C(-2, -2, 2.4, '#ff4040'),
  // amas de cristaux
  () => { const c = pick(['#5fe8ff', '#c27aff', '#7dffb0', '#ff7ab8']); let s = C(0, 4, 14, c, op('.15')); for (const [x, h, a] of [[-7, 18, -14], [0, 26, 0], [7, 16, 14]]) s += ROT(a, x, 16, P(`M${x - 4} 16 L${x} ${16 - h} L${x + 4} 16Z`, c, ol(1.1)) + P(`M${x} 16 L${x} ${16 - h} L${x + 4} 16Z`, shade(c, -.3))); return s; },
  // rocher
  () => { const c = pick(['#5a5e6a', '#6a6270', '#4a5058', '#706a64']); return P(blob(rnd(13, 18), rnd(9, 12), 7, .3, 0, 6), c, ol()) + P(blob(6, 3, 6, .3, -4, 1), shade(c, .25)); },
  // borne de recharge
  () => Rc(-6, -14, 12, 30, '#e6eaee', 3, ol()) + Rc(-4, -10, 8, 6, '#2a2f38', 1) + Rc(-3, -9, 6, 4, '#5aff8a') + LO(6, 4, 13, 12, '#2a2f38', 1.6) + Rc(-6, 10, 12, 3, '#2a4fd0'),
  // robot de service
  () => Rc(-8, -2, 16, 14, '#f2f4f7', 4, ol()) + E(0, 14, 9, 3, '#3e4450', ol(1)) + C(0, -9, 7, '#f2f4f7', ol()) + Rc(-5, -11, 10, 4, '#2a2f38', 2) + C(-2, -9, 1.2, '#5fe8ff') + C(2, -9, 1.2, '#5fe8ff') + LO(-8, 2, -13, 8, '#9aa4ad', 1.4) + LO(8, 2, 13, -2, '#9aa4ad', 1.4),
  // astronaute
  () => { const c = pick(['#f2f4f7', '#f2f4f7', '#ffcf6a', '#cfe0ff']); return Rc(-6, 4, 5, 12, c, 2, ol(1)) + Rc(1, 4, 5, 12, c, 2, ol(1)) + Rc(-8, -7, 16, 14, c, 4, ol()) + Rc(-11, -6, 4, 9, '#9aa4ad', 2, ol(1)) + C(0, -12, 7, c, ol()) + P('M-5 -13 Q0 -17 5 -13 Q5 -9 0 -9 Q-5 -9 -5 -13Z', pick(['#ffb030', '#5fd0ff', '#ff5ad8'])) + Rc(-3, -3, 6, 3, '#2a4fd0'); },
  // cône de signalisation
  () => Rc(-9, 13, 18, 4, '#2a2a2a', 1, ol(1)) + P('M-7 13 L-2 -12 H2 L7 13Z', '#ff7a1a', ol()) + Rc(-4, -2, 8, 4, '#fff'),
  // tuyaux
  () => PO('M-18 10 H-4 Q4 10 4 2 V-10', '#8a94a0', 4) + PO('M18 12 H6 Q-2 12 -2 4', '#c8862a', 3) + Rc(1, -14, 6, 5, '#5a6270', 1, ol(1)) + C(-8, 10, 2.6, '#ff4040', ol(.8)),
  // plante extraterrestre
  () => { const c = pick(['#ff5ad8', '#5fe8ff', '#ffd04a', '#7dff8a']); let s = ''; for (let i = 0; i < 3; i++){ const x = rnd(-9, 9), h = rnd(12, 24); s += PO(`M${f1(x)} 16 Q${f1(x + rnd(-8, 8))} ${f1(16 - h / 2)} ${f1(x)} ${f1(16 - h)}`, '#1f6a5a', 1.6) + C(x, 16 - h, 5, c, ol(1)) + C(x - 1, 15 - h, 1.6, '#ffffff', op('.8')); } return s; },
  // dôme d'habitat
  () => Rc(-18, 8, 36, 8, '#5a6270', 2, ol()) + P('M-15 8 Q-15 -14 0 -14 Q15 -14 15 8Z', '#bfefff', ol() + ' fill-opacity=".75"') + P('M-8 -8 Q-4 -12 2 -12', 'none', st('#ffffff', 2)) + Rc(-4, 0, 8, 8, '#2a2f38', 2) + C(10, 3, 1.6, '#ffb52e'),
  // petit drone au sol
  () => E(0, 14, 12, 3, '#000', op('.3')) + Rc(-10, -2, 20, 8, '#3e4450', 3, ol()) + E(-11, -4, 7, 2.5, '#9aa4ad', ol(1)) + E(11, -4, 7, 2.5, '#9aa4ad', ol(1)) + C(0, 2, 2.4, '#ff5a5a'),
  // pylône d'énergie
  () => P('M-9 16 L-3 -18 H3 L9 16Z', 'none', st(OUT, 3.6)) + P('M-9 16 L-3 -18 H3 L9 16Z M-7 8 L6 0 M-6 0 L5 -8 M7 8 L-6 0', 'none', st('#9aa4ad', 1.6)) + C(0, -20, 6, 'url(#gC)') + C(0, -20, 2.4, '#bff8ff'),
];

// =====================================================================================
// Objets du bonus (à compter)
// =====================================================================================
const BON = {
  balises: ['balises rouges', () => C(0, -10, 10, '#ff4040', op('.3')) + Rc(-5, -4, 10, 18, '#3e4450', 2, ol()) + C(0, -8, 5, '#ff4040', ol(1.2)) + C(-1.5, -9.5, 1.5, '#ffd0d0')],
  drapeaux: ['drapeaux bleus', VALNIR.bonusDraw],
  cristaux: ['cristaux roses', () => C(0, 0, 12, '#ff7ab8', op('.25')) + P('M0 -15 L7 0 L0 15 L-7 0Z', '#ff7ab8', ol()) + P('M0 -15 L7 0 L0 15Z', '#d8408a')],
  lanternes: ['lanternes flottantes', AELYS.bonusDraw],
  drones: ['drones jaunes', () => E(-9, -6, 6, 2, '#ffe27a', ol(1)) + E(9, -6, 6, 2, '#ffe27a', ol(1)) + LO(-9, -5, 9, -5, '#5a5048', 1) + C(0, 0, 7, '#ffd04a', ol()) + C(0, 0, 3, OUT) + C(0, 0, 1.6, '#ff4040')],
  spores: ['spores bleues', XAROTH.bonusDraw],
  champignons: ['champignons lumineux', () => C(0, -6, 12, '#7dff8a', op('.25')) + Rc(-3, -2, 6, 14, '#f0f0d8', 2, ol(1.2)) + P('M-12 -2 Q-12 -14 0 -14 Q12 -14 12 -2Z', '#5aff8a', ol()) + C(-5, -8, 2, '#e8ffe8') + C(4, -10, 1.6, '#e8ffe8')],
  etoiles: ["étoiles d'or", () => C(0, 0, 13, '#ffd04a', op('.25')) + P(star(5, 13, 5.5), '#ffd04a', ol()) + P(star(5, 6, 2.5), '#fff2a8')],
  satellites: ['satellites', () => Rc(-15, -4, 9, 8, '#2a5ad6', 1, ol(1)) + Rc(6, -4, 9, 8, '#2a5ad6', 1, ol(1)) + Rc(-6, -6, 12, 12, '#e6eaee', 2, ol()) + C(0, 0, 2.4, '#ff4040')],
  capsules: ['capsules dorées', () => P('M-6 -12 H6 L10 8 Q0 14 -10 8Z', K.GOLD, ol()) + C(0, -3, 3.4, '#5fd0ff', ol(1)) + P('M-8 8 L-4 14 H4 L8 8', '#ff9a2e', ol(1))],
};

// =====================================================================================
// Éléments de décor partagés
// =====================================================================================
let GID = 0;
const gid = p => p + (++GID);
function lin(stops, x2 = 0, y2 = 1){ const id = gid('l'); return {id, def: `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`}; }
function rad(stops, cx = .5, cy = .5, r = .5){ const id = gid('r'); return {id, def: `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`}; }
// nébuleuse : nuages flous superposés
function nebula(cx, cy, w, h, cols, n = 14){
  const f = gid('f'); let s = `<filter id="${f}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${f1(Math.min(w, h) * .12)}"/></filter><g filter="url(#${f})">`;
  for (let i = 0; i < n; i++) s += E(cx + rnd(-w, w) * .5, cy + rnd(-h, h) * .5, rnd(.15, .4) * w, rnd(.15, .4) * h, pick(cols), op(rnd(.25, .6).toFixed(2)));
  return s + '</g>';
}
function starfield(W, h, n){
  let s = stars(W, h, n);
  for (let i = 0; i < n / 25; i++){ const x = rnd(0, W), y = rnd(0, h), r = rnd(4, 9); s += C(x, y, r * 1.6, '#bfe8ff', op('.15')) + P(`M${f1(x - r)} ${f1(y)} H${f1(x + r)} M${f1(x)} ${f1(y - r)} V${f1(y + r)}`, 'none', st('#ffffff', 1.2) + op('.85')); }
  return s;
}
// planète avec ombre, atmosphère et anneaux éventuels
function planet(cx, cy, r, c1, c2, o = {}){
  const g = rad([[0, shade(c1, .35)], [.6, c1], [1, c2]], .35, .35, .75), sh = rad([[0, '#000', 0], [.55, '#000', 0], [1, '#000', .75]], .25, .25, .9), at = rad([[.8, o.glow || c1, 0], [.9, o.glow || c1, .45], [1, o.glow || c1, 0]]);
  const clip = gid('c');
  let defs = g.def + sh.def + at.def + `<clipPath id="${clip}"><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}"/></clipPath>`;
  let s = C(cx, cy, r * 1.12, `url(#${at.id})`);
  const ring = o.ring ? (half) => { const rr = o.ring; return `<g transform="rotate(${o.tilt || -12} ${f1(cx)} ${f1(cy)})">` + P(`M${f1(cx - r * rr)} ${f1(cy)} A${f1(r * rr)} ${f1(r * rr * .26)} 0 0 ${half ? 0 : 1} ${f1(cx + r * rr)} ${f1(cy)}`, 'none', st(o.ringC || '#e8d8b0', r * .16) + op('.75')) + P(`M${f1(cx - r * rr * .86)} ${f1(cy)} A${f1(r * rr * .86)} ${f1(r * rr * .22)} 0 0 ${half ? 0 : 1} ${f1(cx + r * rr * .86)} ${f1(cy)}`, 'none', st(shade(o.ringC || '#e8d8b0', -.25), r * .05) + op('.6')) + '</g>'; } : null;
  if (ring) s += ring(true);
  s += C(cx, cy, r, `url(#${g.id})`);
  let bands = ''; for (let i = 0; i < (o.bands || 0); i++){ const y = cy - r + (i + .5) * 2 * r / o.bands; bands += E(cx + rnd(-r * .1, r * .1), y, r * 1.1, r * rnd(.03, .07), pick([shade(c1, .25), shade(c1, -.2), c2]), op(rnd(.35, .6).toFixed(2))); }
  for (let i = 0; i < (o.spots || 0); i++) bands += P(blob(r * rnd(.08, .22), r * rnd(.05, .14), 8, .3, cx + rnd(-r, r) * .7, cy + rnd(-r, r) * .7), pick([shade(c2, -.2), shade(c1, .3)]), op('.55'));
  s += `<g clip-path="url(#${clip})">${bands}${C(cx, cy, r, `url(#${sh.id})`)}</g>`;
  if (ring) s += ring(false);
  return {defs, s};
}
// tracé ondulant de gauche à droite (rivières, canaux, routes) : points + chemin
function wave(W, y0, amp, seedPh){
  const pts = []; const ph = [rnd(0, 6), rnd(0, 6), rnd(0, 6)];
  for (let x = -60; x <= W + 60; x += 40) pts.push([x, y0 + amp * (.6 * Math.sin(x / 420 + ph[0]) + .3 * Math.sin(x / 170 + ph[1]) + .1 * Math.sin(x / 70 + ph[2]))]);
  return {pts, d: 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L')};
}
const strokePath = (d, c, w, x = '') => P(d, 'none', st(c, w) + x);

// =====================================================================================
// Les 10 décors
// =====================================================================================
// Chaque décor renvoie {defs, s, blocks} ; blocks = [{pts, w}] zones laissées libres (rivières, canaux…).
const BIOMES = {
  // pont d'une station orbitale, planète bleue et soleil
  station(W, H, HZ){
    const sky = lin([[0, '#02040c'], [.7, '#081a3a'], [1, '#1a4a8a']]), gnd = lin([[0, '#5a6678'], [1, '#262c38']]);
    let defs = sky.def + gnd.def, s = Rc(0, 0, W, HZ + 40, `url(#${sky.id})`) + starfield(W, HZ, 260) + nebula(W * .3, HZ * .35, W * .5, HZ * .6, ['#2a4ab0', '#6a2ab0', '#1a8ab0'], 12);
    const pl = planet(W * .72, HZ * 1.9, HZ * 1.55, '#3a8ad8', '#0a2a5a', {glow: '#7ad0ff', spots: 14}); defs += pl.defs; s += pl.s;
    s += C(W * .12, HZ * .3, 140, 'url(#gO)') + C(W * .12, HZ * .3, 34, '#fff8e0');
    // anneau de la station, à l'horizon
    s += P(`M0 ${HZ - 70} Q${W / 2} ${HZ - 170} ${W} ${HZ - 70} L${W} ${HZ + 10} L0 ${HZ + 10}Z`, '#3a4458') + strokePath(`M0 ${HZ - 70} Q${W / 2} ${HZ - 170} ${W} ${HZ - 70}`, '#5fe8ff', 4, op('.8'));
    for (let x = 60; x < W; x += 140) s += Rc(x, HZ - 120 + Math.pow((x - W / 2) / (W / 2), 2) * 90, 70, 26, '#1a2030', 3) + Rc(x + 6, HZ - 114 + Math.pow((x - W / 2) / (W / 2), 2) * 90, 58, 8, pick(['#5fe8ff', '#ffd04a', '#2a4fd0']), 1, op('.8'));
    s += Rc(0, HZ, W, H - HZ, `url(#${gnd.id})`);
    // plaques du pont en perspective
    for (let y = HZ + 30, k = 0; y < H; y += 40 + k * 7, k++) s += L(0, y, W, y, '#1e2430', 2.4) + L(0, y + 2, W, y + 2, '#7a8698', 1, op('.4'));
    for (let i = -30; i <= 30; i++){ const x0 = W / 2 + i * 70, x1 = W / 2 + i * 240; s += L(x0, HZ, x1, H, '#1e2430', 2.4); }
    // allées lumineuses
    const blocks = [];
    for (const yy of [HZ + (H - HZ) * .38, HZ + (H - HZ) * .76]){ s += Rc(0, yy - 22, W, 44, '#1a2030') + Rc(0, yy - 3, W, 6, '#5fe8ff', 0, op('.9')) + Rc(0, yy - 14, W, 12, '#5fe8ff', 0, op('.15')) + Rc(0, yy + 2, W, 12, '#5fe8ff', 0, op('.15')); for (let x = 20; x < W; x += 90) s += Rc(x, yy - 20, 40, 4, '#ffd04a', 0, op('.8')) + Rc(x, yy + 16, 40, 4, '#ffd04a', 0, op('.8')); blocks.push({pts: Array.from({length: 150}, (_, j) => [j * (W + 80) / 149 - 40, yy]), w: 40}); }
    return {defs, s, blocks};
  },
  // régolithe lunaire, cratères, géante gazeuse à anneaux
  lune(W, H, HZ){
    const sky = lin([[0, '#000004'], [1, '#14142a']]), gnd = lin([[0, '#9a9aa4'], [.5, '#6a6a76'], [1, '#3a3a46']]);
    let defs = sky.def + gnd.def, s = Rc(0, 0, W, HZ + 40, `url(#${sky.id})`) + starfield(W, HZ, 320);
    const pl = planet(W * .3, HZ * .55, HZ * .42, '#e0a060', '#6a3a1a', {ring: 2.1, ringC: '#e8d0a0', tilt: -16, bands: 9}); defs += pl.defs; s += pl.s;
    const pl2 = planet(W * .82, HZ * .3, HZ * .12, '#bfe0ff', '#2a4a7a', {glow: '#bfe0ff'}); defs += pl2.defs; s += pl2.s;
    // montagnes lunaires et dômes de la base
    let d = `M0 ${HZ}`; for (let x = 0; x <= W; x += rnd(60, 160)) d += ` L${f1(x)} ${f1(HZ - rnd(20, 120))}`; s += P(d + ` L${W} ${HZ + 40} L0 ${HZ + 40}Z`, '#4a4a58') + P(d, 'none', st('#8a8a98', 2));
    for (let i = 0; i < 9; i++){ const x = rnd(100, W - 100), r = rnd(30, 70); s += P(`M${f1(x - r)} ${HZ + 6} A${f1(r)} ${f1(r)} 0 0 1 ${f1(x + r)} ${HZ + 6}Z`, '#bfefff', ol(2) + ' fill-opacity=".55"') + C(x, HZ - r * .5, r * .9, 'url(#gC)'); }
    s += Rc(0, HZ, W, H - HZ, `url(#${gnd.id})`);
    for (let i = 0; i < 60 + W / 40; i++){ const x = rnd(0, W), y = rnd(HZ + 30, H), k = .4 + (y - HZ) / (H - HZ), r = rnd(30, 170) * k; s += E(x, y, r, r * .38, '#4a4a56', op('.8')) + E(x, y + r * .05, r * .86, r * .3, '#5a5a66') + P(`M${f1(x - r)} ${f1(y)} A${f1(r)} ${f1(r * .38)} 0 0 0 ${f1(x + r)} ${f1(y)}`, 'none', st('#b8b8c4', 3 * k) + op('.7')); }
    for (let i = 0; i < 1500; i++) s += C(rnd(0, W), rnd(HZ, H), rnd(1, 3), pick(['#5a5a66', '#b0b0ba']), op('.5'));
    // traces de rover
    const blocks = [];
    for (const yy of [.35, .72]){ const w = wave(W, HZ + (H - HZ) * yy, 90); s += strokePath(w.d, '#55555f', 46) + strokePath(w.d, '#7a7a86', 4, ' stroke-dasharray="10 14"'); }
    return {defs, s, blocks};
  },
  // ceinture d'astéroïdes, nébuleuse violette
  asteroides(W, H, HZ){
    const sky = lin([[0, '#06020e'], [1, '#2a0e3a']]), gnd = lin([[0, '#5a4a5a'], [1, '#2a1e2e']]);
    let defs = sky.def + gnd.def, s = Rc(0, 0, W, HZ + 60, `url(#${sky.id})`) + nebula(W * .5, HZ * .45, W * 1.1, HZ, ['#b02ab0', '#5a2ad0', '#ff5a8a', '#2a6ad0'], 22) + starfield(W, HZ, 280);
    for (let i = 0; i < 70; i++){ const x = rnd(0, W), y = rnd(10, HZ + 20), r = rnd(6, 60) * (y / HZ + .2); const c = pick(['#5a4a50', '#6a5a5a', '#4a3e48']); s += P(blob(r, r * rnd(.6, .9), 8, .3, x, y), c, ol(1.5)) + P(blob(r * .4, r * .2, 6, .3, x - r * .25, y - r * .25), shade(c, .25)); }
    let d = `M0 ${HZ + 20}`; for (let x = 0; x <= W; x += 80) d += ` L${x} ${f1(HZ + 20 - rnd(0, 50))}`; s += P(d + ` L${W} ${H} L0 ${H}Z`, `url(#${gnd.id})`);
    for (let i = 0; i < 80 + W / 30; i++){ const x = rnd(0, W), y = rnd(HZ + 30, H), k = .4 + (y - HZ) / (H - HZ), r = rnd(30, 140) * k; s += E(x, y, r, r * .4, '#3a2a3a', op('.75')) + P(`M${f1(x - r)} ${f1(y)} A${f1(r)} ${f1(r * .4)} 0 0 0 ${f1(x + r)} ${f1(y)}`, 'none', st('#8a6a80', 2.5 * k) + op('.7')); }
    // filons de cristaux roses lumineux
    const blocks = [];
    for (const yy of [.3, .62, .9]){ const w = wave(W, HZ + (H - HZ) * yy, 120); s += strokePath(w.d, '#ff5ab0', 30, op('.25')) + strokePath(w.d, '#ff8ad0', 8, op('.8')) + strokePath(w.d, '#ffe0f4', 2.4); blocks.push({pts: w.pts, w: 22}); }
    return {defs, s, blocks};
  },
  // planète de cristal, aurores
  cristal(W, H, HZ){
    const sky = lin([[0, '#020a14'], [.6, '#0a2a3a'], [1, '#1a6a7a']]), gnd = lin([[0, '#2a7a8a'], [1, '#0a2a3a']]);
    let defs = sky.def + gnd.def, s = Rc(0, 0, W, HZ + 40, `url(#${sky.id})`) + starfield(W, HZ * .7, 220);
    for (let i = 0; i < 4; i++){ const g = lin([[0, pick(['#5aff8a', '#5fe8ff', '#c27aff']), 0], [.5, pick(['#5aff8a', '#5fe8ff']), .45], [1, '#5fe8ff', 0]]); defs += g.def; const y0 = rnd(HZ * .1, HZ * .4); let d = `M-50 ${f1(y0)}`; for (let x = 0; x <= W + 100; x += 200) d += ` Q${x + 100} ${f1(y0 + rnd(-80, 80))} ${x + 200} ${f1(y0 + rnd(-40, 40))}`; s += P(d, 'none', ` stroke="url(#${g.id})" stroke-width="${f1(rnd(60, 140))}" opacity=".55"`); }
    const pl = planet(W * .15, HZ * .35, HZ * .2, '#e8f4ff', '#6a8aa8', {glow: '#e8f4ff', spots: 6}); defs += pl.defs; s += pl.s;
    // flèches de cristal géantes à l'horizon
    for (let i = 0; i < 40; i++){ const x = rnd(0, W), h = rnd(80, 380), w = h * rnd(.15, .3), c = pick(['#5fe8ff', '#7dffd0', '#a0c8ff', '#c27aff']); s += P(`M${f1(x - w / 2)} ${HZ + 20} L${f1(x)} ${f1(HZ - h)} L${f1(x + w / 2)} ${HZ + 20}Z`, c, op('.55') + ol(2, '#0a2a3a')) + P(`M${f1(x)} ${HZ + 20} L${f1(x)} ${f1(HZ - h)} L${f1(x + w / 2)} ${HZ + 20}Z`, shade(c, -.35), op('.55')); }
    s += Rc(0, HZ, W, H - HZ, `url(#${gnd.id})`);
    for (let i = 0; i < 260; i++){ const x = rnd(0, W), y = rnd(HZ + 20, H), k = .4 + (y - HZ) / (H - HZ); s += P(poly([[x - 40 * k, y], [x - 10 * k, y - 18 * k], [x + 30 * k, y - 10 * k], [x + 44 * k, y + 8 * k], [x, y + 16 * k]]), pick(['#3a9aaa', '#2a8a9a', '#4aaabb']), op('.6')); }
    const blocks = [];
    const w = wave(W, HZ + (H - HZ) * .55, 160); s += strokePath(w.d, '#bff8ff', 70, op('.25')) + strokePath(w.d, '#5fe8ff', 36, op('.85')) + strokePath(w.d, '#e8ffff', 6, op('.8')); blocks.push({pts: w.pts, w: 46});
    return {defs, s, blocks};
  },
  // mégapole néon
  neon(W, H, HZ){
    const sky = lin([[0, '#05020f'], [.6, '#2a0a3a'], [1, '#8a2a6a']]), gnd = lin([[0, '#1a1428'], [1, '#08060e']]);
    let defs = sky.def + gnd.def, s = Rc(0, 0, W, HZ + 40, `url(#${sky.id})`) + starfield(W, HZ * .5, 120);
    const pl = planet(W * .5, HZ * .35, HZ * .3, '#ff6a8a', '#5a0a3a', {glow: '#ff8ab0', bands: 6}); defs += pl.defs; s += pl.s;
    for (const [col, hmin, hmax, wmin, step] of [['#1e1030', 120, HZ * .85, 50, 50], ['#120a20', 60, HZ * .6, 40, 34]]) for (let x = -20; x < W; x += rnd(step, step * 2)){ const w = rnd(wmin, wmin * 2.2), h = rnd(hmin, hmax); s += Rc(x, HZ + 20 - h, w, h + 20, col); for (let yy = HZ + 10 - h + 12; yy < HZ; yy += 14) for (let xx = x + 6; xx < x + w - 6; xx += 10) if (R2() < .35) s += Rc(xx, yy, 5, 6, pick(['#ffd04a', '#5fe8ff', '#ff5ad8', '#ffe8b0']), 0, op('.8')); if (R2() < .3) s += L(x + w / 2, HZ + 20 - h, x + w / 2, HZ - h - 30, '#9aa4ad', 2) + C(x + w / 2, HZ - h - 32, 4, '#ff4040'); }
    for (let i = 0; i < 18; i++){ const x = rnd(0, W), y = rnd(HZ * .45, HZ * .9); s += Rc(x, y, rnd(40, 90), rnd(14, 24), pick(['#ff5ad8', '#5fe8ff', '#ffd04a']), 3, op('.75')); }
    s += Rc(0, HZ, W, H - HZ, `url(#${gnd.id})`);
    for (let y = HZ + 40, k = 0; y < H; y += 60 + k * 6, k++) s += L(0, y, W, y, '#ff5ad8', 2, op('.5'));
    for (let i = -40; i <= 40; i++) s += L(W / 2 + i * 60, HZ, W / 2 + i * 220, H, '#5fe8ff', 2, op('.45'));
    const blocks = [];
    for (const yy of [.33, .7]){ const y = HZ + (H - HZ) * yy; s += Rc(0, y - 26, W, 52, '#0a0814') + Rc(0, y - 26, W, 3, '#ff5ad8') + Rc(0, y + 23, W, 3, '#ff5ad8'); for (let x = 0; x < W; x += 70) s += Rc(x, y - 2, 34, 4, '#ffd04a', 0, op('.8')); blocks.push({pts: Array.from({length: 140}, (_, j) => [j * (W + 80) / 139 - 40, y]), w: 50}); }
    return {defs, s, blocks};
  },
  // lune de glace
  glace(W, H, HZ){
    const sky = lin([[0, '#020818'], [.6, '#1a3a6a'], [1, '#8ab8e0']]), gnd = lin([[0, '#d8ecf8'], [.5, '#a8cce8'], [1, '#5a8ab8']]);
    let defs = sky.def + gnd.def, s = Rc(0, 0, W, HZ + 40, `url(#${sky.id})`) + starfield(W, HZ * .6, 200);
    const pl = planet(W * .7, HZ * .42, HZ * .36, '#8ab8ff', '#1a2a6a', {ring: 1.9, ringC: '#d8f0ff', tilt: 18, bands: 7}); defs += pl.defs; s += pl.s;
    for (let i = 0; i < 30; i++){ const x = rnd(0, W), h = rnd(60, 260), w = rnd(40, 120); s += P(`M${f1(x - w)} ${HZ + 20} L${f1(x - w * .2)} ${f1(HZ - h)} L${f1(x + w * .1)} ${f1(HZ - h * .8)} L${f1(x + w)} ${HZ + 20}Z`, '#c8e4f8', ol(2, '#5a8ab8')) + P(`M${f1(x - w * .2)} ${f1(HZ - h)} L${f1(x + w * .1)} ${f1(HZ - h * .8)} L${f1(x + w)} ${HZ + 20} L${f1(x)} ${HZ + 20}Z`, '#8ab8e0', op('.7')); }
    s += Rc(0, HZ, W, H - HZ, `url(#${gnd.id})`);
    for (let i = 0; i < 160; i++){ const x = rnd(0, W), y = rnd(HZ + 20, H); let d = `M${f1(x)} ${f1(y)}`; for (let j = 0; j < 5; j++) d += ` l${f1(rnd(-70, 70))} ${f1(rnd(-12, 12))}`; s += strokePath(d, '#6a9ac8', 2, op('.7')); }
    for (let i = 0; i < 50; i++){ const x = rnd(0, W), y = rnd(HZ + 30, H), k = .4 + (y - HZ) / (H - HZ); s += E(x, y, rnd(60, 180) * k, rnd(14, 40) * k, '#eef8ff', op('.6')); }
    const blocks = [];
    const w = wave(W, HZ + (H - HZ) * .48, 140); s += strokePath(w.d, '#e8f8ff', 80) + strokePath(w.d, '#7ac8f0', 60) + strokePath(w.d, '#bfe8ff', 6, ' stroke-dasharray="30 40"'); blocks.push({pts: w.pts, w: 66});
    return {defs, s, blocks};
  },
  // jungle bioluminescente
  jungle(W, H, HZ){
    const sky = lin([[0, '#020a08'], [.6, '#0a2a2a'], [1, '#1a5a4a']]), gnd = lin([[0, '#1a4a3a'], [1, '#08180f']]);
    let defs = sky.def + gnd.def, s = Rc(0, 0, W, HZ + 40, `url(#${sky.id})`) + starfield(W, HZ * .6, 180) + nebula(W * .6, HZ * .3, W * .7, HZ * .5, ['#2ab08a', '#2a6ab0', '#8a2ab0'], 10);
    const pl = planet(W * .2, HZ * .4, HZ * .25, '#7dff8a', '#0a4a2a', {glow: '#b0ffc0', bands: 5}); defs += pl.defs; s += pl.s;
    const pl2 = planet(W * .32, HZ * .2, HZ * .07, '#ffd0a0', '#8a4a2a'); defs += pl2.defs; s += pl2.s;
    for (let i = 0; i < 70; i++){ const x = rnd(-40, W + 40), h = rnd(120, 420), c = pick(['#0f3a2a', '#123f30', '#0a2e22']); s += PO(`M${f1(x)} ${HZ + 30} Q${f1(x + rnd(-60, 60))} ${f1(HZ - h / 2)} ${f1(x + rnd(-30, 30))} ${f1(HZ - h)}`, c, rnd(8, 18)); s += P(blob(rnd(40, 90), rnd(26, 50), 9, .3, x + rnd(-30, 30), HZ - h), c, op('.95')); for (let j = 0; j < 4; j++) s += C(x + rnd(-60, 60), HZ - h + rnd(-30, 30), rnd(3, 7), pick(['#ff5ad8', '#5fe8ff', '#ffd04a', '#7dff8a']), op('.9')); }
    for (let i = 0; i < 6; i++){ const x = rnd(150, W - 150), r = rnd(50, 90); s += P(`M${f1(x - r)} ${HZ + 10} A${f1(r)} ${f1(r)} 0 0 1 ${f1(x + r)} ${HZ + 10}Z`, '#bfffe8', ol(2) + ' fill-opacity=".45"') + C(x, HZ - r * .4, r, 'url(#gG)'); }
    s += Rc(0, HZ, W, H - HZ, `url(#${gnd.id})`);
    for (let i = 0; i < 300; i++){ const x = rnd(0, W), y = rnd(HZ + 20, H), k = .4 + (y - HZ) / (H - HZ); s += P(blob(rnd(30, 90) * k, rnd(10, 26) * k, 8, .3, x, y), pick(['#1f5a40', '#24604a', '#163f30']), op('.75')); if (i % 3 === 0) s += C(x, y, 5 * k, pick(['#ff5ad8', '#5fe8ff', '#7dff8a']), op('.5')); }
    const blocks = [];
    for (const yy of [.4, .82]){ const w = wave(W, HZ + (H - HZ) * yy, 110); s += strokePath(w.d, '#3affc0', 60, op('.25')) + strokePath(w.d, '#1a8a7a', 40) + strokePath(w.d, '#7dffe0', 3, ' stroke-dasharray="8 22"'); blocks.push({pts: w.pts, w: 40}); }
    return {defs, s, blocks};
  },
  // forges volcaniques
  volcan(W, H, HZ){
    const sky = lin([[0, '#0a0204'], [.6, '#3a0a0a'], [1, '#b0401a']]), gnd = lin([[0, '#3a2a28'], [1, '#140c0c']]);
    let defs = sky.def + gnd.def, s = Rc(0, 0, W, HZ + 40, `url(#${sky.id})`) + starfield(W, HZ * .4, 90);
    s += nebula(W * .5, HZ * .55, W, HZ * .5, ['#5a2a2a', '#3a2020', '#7a3a1a'], 16);
    const pl = planet(W * .82, HZ * .28, HZ * .2, '#ff8a3a', '#5a1a0a', {glow: '#ffb070', spots: 8}); defs += pl.defs; s += pl.s;
    for (const [x, h, w] of [[W * .2, HZ * .75, 420], [W * .55, HZ * .55, 360], [W * .9, HZ * .65, 400]]){ s += P(`M${f1(x - w)} ${HZ + 30} L${f1(x - 50)} ${f1(HZ - h)} H${f1(x + 50)} L${f1(x + w)} ${HZ + 30}Z`, '#2a1a1a', ol(2, '#140808')) + C(x, HZ - h, 90, 'url(#gF)') + T(x, HZ - h - 40, smoke(6, 50, rnd(-20, 20), -60)) + PO(`M${f1(x - 20)} ${f1(HZ - h)} Q${f1(x - 60)} ${f1(HZ - h / 2)} ${f1(x - 120)} ${HZ + 20}`, '#ff7a1a', 8); }
    for (let x = 30; x < W; x += rnd(120, 260)){ const h = rnd(80, 200); s += Rc(x, HZ - h, 40, h + 30, '#3a2c2a', 2, ol(2, '#140808')) + Rc(x + 6, HZ - h + 12, 28, 6, '#ffb030', 0, op('.8')) + T(x + 20, HZ - h - 10, smoke(4, 18, rnd(-5, 5), -24)); }
    s += Rc(0, HZ, W, H - HZ, `url(#${gnd.id})`);
    for (let i = 0; i < 260; i++){ const x = rnd(0, W), y = rnd(HZ + 20, H), k = .4 + (y - HZ) / (H - HZ); s += P(blob(rnd(30, 80) * k, rnd(10, 24) * k, 7, .35, x, y), pick(['#2a1c1a', '#3a2622', '#1e1412']), op('.85')); }
    const blocks = [];
    for (const yy of [.3, .6, .9]){ const w = wave(W, HZ + (H - HZ) * yy, 130); s += strokePath(w.d, '#ff5a1a', 70, op('.25')) + strokePath(w.d, '#ff7a1a', 34) + strokePath(w.d, '#ffd04a', 12) + strokePath(w.d, '#fff6c8', 3, op('.8')); blocks.push({pts: w.pts, w: 40}); }
    return {defs, s, blocks};
  },
  // anneau-monde
  anneau(W, H, HZ){
    const sky = lin([[0, '#020614'], [.7, '#1a3a7a'], [1, '#9ad0ff']]), gnd = lin([[0, '#9ac88a'], [.5, '#6aa070'], [1, '#2a5040']]);
    let defs = sky.def + gnd.def, s = Rc(0, 0, W, HZ + 40, `url(#${sky.id})`) + starfield(W, HZ * .7, 200);
    // l'anneau qui monte dans le ciel
    s += P(`M-100 ${HZ + 20} Q${W * .5} ${-HZ * 1.2} ${W + 100} ${HZ + 20}`, 'none', st('#2a3a5a', 120)) + P(`M-100 ${HZ + 20} Q${W * .5} ${-HZ * 1.2} ${W + 100} ${HZ + 20}`, 'none', st('#8ac08a', 80)) + P(`M-100 ${HZ + 20} Q${W * .5} ${-HZ * 1.2} ${W + 100} ${HZ + 20}`, 'none', st('#5a8ac8', 16) + ' stroke-dasharray="60 30"') + P(`M-100 ${HZ - 40} Q${W * .5} ${-HZ * 1.32} ${W + 100} ${HZ - 40}`, 'none', st('#c8d8f0', 6) + op('.8'));
    s += C(W * .5, HZ * .55, 70, 'url(#gO)') + C(W * .5, HZ * .55, 28, '#fff6d8');
    for (let i = 0; i < 26; i++) s += E(rnd(0, W), rnd(HZ * .5, HZ), rnd(120, 260), rnd(20, 40), '#e8f4ff', op(rnd(.25, .5).toFixed(2)));
    for (let x = 40; x < W; x += rnd(160, 300)){ const h = rnd(120, 300); s += P(`M${f1(x)} ${HZ + 20} L${f1(x + 14)} ${f1(HZ - h)} L${f1(x + 28)} ${HZ + 20}Z`, '#e8eef6', ol(2, '#5a6a8a')) + C(x + 14, HZ - h, 8, '#5fe8ff', op('.8')); }
    s += Rc(0, HZ, W, H - HZ, `url(#${gnd.id})`);
    for (let y = HZ + 40, k = 0; y < H; y += 90 + k * 12, k++) s += Rc(0, y, W, 8, '#e8eef6', 0, op('.5'));
    for (let i = 0; i < 220; i++){ const x = rnd(0, W), y = rnd(HZ + 20, H), k = .4 + (y - HZ) / (H - HZ); s += P(blob(rnd(30, 70) * k, rnd(12, 24) * k, 8, .3, x, y), pick(['#7ab07a', '#5a9a6a', '#8ac09a']), op('.7')); }
    const blocks = [];
    for (const yy of [.36, .74]){ const w = wave(W, HZ + (H - HZ) * yy, 70); s += strokePath(w.d, '#e8eef6', 56) + strokePath(w.d, '#3a8ad8', 42) + strokePath(w.d, '#bfe8ff', 4, ' stroke-dasharray="20 30"'); blocks.push({pts: w.pts, w: 50}); }
    return {defs, s, blocks};
  },
  // coque du vaisseau-mère, galaxie
  vaisseau(W, H, HZ){
    const sky = lin([[0, '#000002'], [1, '#0a0a1e']]), gnd = lin([[0, '#3a3e4a'], [1, '#14161e']]);
    let defs = sky.def + gnd.def, s = Rc(0, 0, W, HZ + 40, `url(#${sky.id})`) + starfield(W, HZ, 360);
    // galaxie spirale
    const gx = W * .3, gy = HZ * .45; s += nebula(gx, gy, W * .35, HZ * .35, ['#5a6ad0', '#c08ad0', '#ffd0a0'], 18) + C(gx, gy, 40, '#fff4e0', op('.9')) + C(gx, gy, 100, 'url(#gO)');
    for (let a = 0; a < 2; a++){ let d = ''; for (let t = 0; t < 7; t += .12){ const r = 14 * Math.exp(.32 * t), x = gx + Math.cos(t + a * Math.PI) * r * 1.6, y = gy + Math.sin(t + a * Math.PI) * r * .7; d += (d ? ' L' : 'M') + f1(x) + ' ' + f1(y); } s += strokePath(d, '#c8b8ff', 10, op('.35')); }
    const pl = planet(W * .85, HZ * .55, HZ * .5, '#8a5ad0', '#1a0a3a', {glow: '#c8a0ff', bands: 8, ring: 1.7, ringC: '#c8b8e8', tilt: -20}); defs += pl.defs; s += pl.s;
    // superstructure à l'horizon
    for (let x = -20; x < W; x += rnd(50, 140)){ const h = rnd(40, 220), w = rnd(40, 110); s += Rc(x, HZ + 20 - h, w, h, '#22252e', 2, ol(2, '#0a0b10')) + Rc(x + 4, HZ + 26 - h, w - 8, 4, pick(['#ff4040', '#5fe8ff', '#ffb030']), 0, op('.8')); }
    s += Rc(0, HZ, W, H - HZ, `url(#${gnd.id})`);
    // plaques de coque et conduits lumineux
    for (let y = HZ + 20; y < H; y += 70) for (let x = (y / 70 % 2) * 60; x < W; x += 120) s += Rc(x, y, 116, 66, pick(['#363a46', '#2e323c', '#3e4250']), 2, ol(1.5, '#16181e'));
    for (let i = 0; i < 120; i++) s += C(rnd(0, W), rnd(HZ + 20, H), 2.4, '#16181e');
    const blocks = [];
    for (const yy of [.25, .55, .85]){ const y = HZ + (H - HZ) * yy; s += Rc(0, y - 16, W, 32, '#0e1016') + Rc(0, y - 5, W, 10, pick(['#5fe8ff', '#ff5ad8', '#ffb030']), 0, op('.85')) + Rc(0, y - 14, W, 28, '#5fe8ff', 0, op('.12')); blocks.push({pts: Array.from({length: 150}, (_, j) => [j * (W + 80) / 149 - 40, y]), w: 30}); }
    return {defs, s, blocks};
  },
};
let R2 = () => A.R();

// =====================================================================================
// Les 10 niveaux : de plus en plus grands, denses et petits
// =====================================================================================
const F = {V: VALNIR, Ae: AELYS, X: XAROTH};
const LEVELS = [
  {id: 's04', name: 'Station orbitale Helios', biome: 'station', fac: ['V', 'Ae'], bon: 'balises', mood: 'night', seed: 9404},
  {id: 's05', name: 'Base lunaire de Séléna', biome: 'lune', fac: ['V', 'X'], bon: 'drapeaux', mood: 'night', seed: 9505},
  {id: 's06', name: "Ceinture d'astéroïdes", biome: 'asteroides', fac: ['Ae', 'X'], bon: 'cristaux', mood: 'night', seed: 9606},
  {id: 's07', name: 'Planète de cristal Lumen', biome: 'cristal', fac: ['Ae', 'V'], bon: 'lanternes', mood: 'night', seed: 9707},
  {id: 's08', name: 'Mégapole Néon-9', biome: 'neon', fac: ['V', 'Ae', 'X'], bon: 'drones', mood: 'night', seed: 9808},
  {id: 's09', name: 'Lune de glace Krios', biome: 'glace', fac: ['V', 'X'], bon: 'spores', mood: 'day', seed: 9909},
  {id: 's10', name: "Jungle d'Ophir", biome: 'jungle', fac: ['X', 'Ae'], bon: 'champignons', mood: 'night', seed: 10010},
  {id: 's11', name: 'Forges de Vulcain', biome: 'volcan', fac: ['V', 'X', 'Ae'], bon: 'etoiles', mood: 'night', seed: 10111},
  {id: 's12', name: 'Anneau-monde Orbis', biome: 'anneau', fac: ['Ae', 'V', 'X'], bon: 'satellites', mood: 'day', seed: 10212},
  {id: 's13', name: 'Vaisseau-mère Abyssal', biome: 'vaisseau', fac: ['X', 'V', 'Ae'], bon: 'capsules', mood: 'night', seed: 10313},
];
const FACNAME = {V: 'Valnir', Ae: 'Ælys', X: 'Xaroth'};

// grille spatiale pour tester rapidement les chevauchements
function Grid(cell){ const m = new Map(); return {
  add(o, x0, y0, x1, y1){ for (let i = Math.floor(x0 / cell); i <= Math.floor(x1 / cell); i++) for (let j = Math.floor(y0 / cell); j <= Math.floor(y1 / cell); j++){ const k = i * 100000 + j; (m.get(k) || m.set(k, []).get(k)).push(o); } },
  near(x0, y0, x1, y1, fn){ const seen = new Set(); for (let i = Math.floor(x0 / cell); i <= Math.floor(x1 / cell); i++) for (let j = Math.floor(y0 / cell); j <= Math.floor(y1 / cell); j++){ const a = m.get(i * 100000 + j); if (a) for (const o of a) if (!seen.has(o)){ seen.add(o); if (fn(o)) return true; } } return false; },
}; }
const nominal = fn => fn.box ? Math.max(fn.box[2] - fn.box[0], fn.box[3] - fn.box[1]) : 40;

function build(cfg, k){
  A.seed(cfg.seed); GID = 0; USED.clear();
  const d = k / 9; // difficulté 0 → 1
  const W = Math.round(3400 + 1300 * d), H = Math.round(2300 + 850 * d), HZ = Math.round(H * .25);
  const nT = 15 + Math.round(10 * d), rIt = 17 - 6 * d, nClutter = Math.round(6500 + 19000 * d), nBon = 12 + Math.round(22 * d);
  const persp = y => .82 + .36 * Math.max(0, y - HZ) / (H - HZ);
  const facs = cfg.fac.map(f => F[f]);
  // objets à trouver : tirés au hasard dans le grand réservoir ; les autres servent de leurres
  const pool = POOL.slice(); for (let i = pool.length - 1; i > 0; i--){ const j = Math.floor(A.R() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const targets = pool.slice(0, nT), decoys = pool.slice(nT).map(t => t[1]);
  const [bonusLabel, bonusDraw] = BON[cfg.bon];
  const bg = BIOMES[cfg.biome](W, H, HZ);
  // zones libres (rivières…)
  const blockG = Grid(80); bg.blocks.forEach(b => b.pts.forEach(p => { const o = {x: p[0], y: p[1], r: b.w / 2}; blockG.add(o, p[0] - o.r, p[1] - o.r, p[0] + o.r, p[1] + o.r); }));
  const blocked = (x, y, r) => blockG.near(x - r - 60, y - r - 60, x + r + 60, y + r + 60, o => Math.hypot(o.x - x, o.y - y) < o.r + r * .8);
  const occ = Grid(48), prot = Grid(64), ground = [], sky = [], bigRects = [];
  let maxR = 10;
  const addOcc = (x, y, r) => { maxR = Math.max(maxR, Math.min(r, 60)); occ.add({x, y, r}, x - r, y - r, x + r, y + r); };
  const free = (x, y, r, kk) => !occ.near(x - r - maxR, y - r - maxR, x + r + maxR, y + r + maxR, o => Math.hypot(o.x - x, o.y - y) < (o.r + r) * kk);
  const rectOf = (x, y, s, box, z) => ({x0: x + box[0] * s - 3, x1: x + box[2] * s + 3, y0: y + box[1] * s - 3, y1: y + box[3] * s + 3, z});
  const hits = (p, q) => p.x + p.r > q.x0 && p.x - p.r < q.x1 && p.y + p.r > q.y0 && p.y - p.r < q.y1;
  const coversProt = q => prot.near(q.x0 - 40, q.y0 - 40, q.x1 + 40, q.y1 + 40, p => p.z < q.z && hits(p, q));

  // 1. grandes unités et structures
  const bigs = facs.flatMap(f => f.big);
  const nBig = Math.round(7 + 9 * d);
  for (let n = 0, t = 0; n < nBig && t < 8000; t++){
    const fn = pick(bigs), x = rnd(150, W - 150), y = rnd(HZ + 120, H - 80);
    const s = persp(y) * rIt * rnd(10, 13) / (fn.box ? nominal(fn) : 300), box = fn.box || [-150, -150, 150, 100], r = (box[2] - box[0]) * s * .45;
    if (!free(x, y, r, 1.1) || blocked(x, y, r * .6)) continue;
    const z = y + box[3] * s;
    addOcc(x, y, r); bigRects.push(rectOf(x, y, s, box, z)); ground.push({z, svg: G(x, y, s, 0, fn(), A.R() < .5)}); n++;
  }
  // 2. objets à trouver, répartis sur toute la planche
  const items = [], minD = Math.sqrt(W * (H - HZ) / nT) * .55;
  targets.forEach(([label, fn]) => {
    for (let t = 0; t < 40000; t++){
      const x = rnd(70, W - 70), y = rnd(HZ + 60, H - 50), s = persp(y) * rIt / 21, r = 21 * s, z = y + r * .6;
      if (!free(x, y, r + 6, 1) || blocked(x, y, r)) continue;
      if (items.some(o => Math.hypot(o.x - x, o.y - y) < minD * (t < 20000 ? 1 : .6))) continue;
      if (bigRects.some(q => q.z > z && hits({x, y, r: r + 4}, q))) continue;
      addOcc(x, y, r + 2); const p = {x, y, r: r + 4, z}; prot.add(p, x - p.r, y - p.r, x + p.r, y + p.r);
      items.push({label, icon: icon(fn), x: Math.round(x), y: Math.round(y), r: Math.max(8, Math.round(r))});
      ground.push({z, svg: G(x, y, s, rnd(-25, 25), fn())}); return;
    }
    throw new Error(cfg.id + ' : placement impossible : ' + label);
  });
  // 3. objets du bonus (au sol, et un peu dans le ciel)
  let bon = 0;
  for (let t = 0; bon < nBon && t < 40000; t++){
    const inSky = A.R() < .25, x = rnd(50, W - 50), y = inSky ? rnd(50, HZ - 40) : rnd(HZ + 50, H - 40);
    const s = (inSky ? 1 : persp(y)) * rIt * .9 / 19, r = 19 * s, z = inSky ? y : y + r * .6;
    if (!free(x, y, r + 4, 1) || (!inSky && blocked(x, y, r))) continue;
    if (bigRects.some(q => q.z > z && hits({x, y, r: r + 4}, q))) continue;
    addOcc(x, y, r + 2); const p = {x, y, r: r + 4, z: inSky ? -1e9 + y : z}; prot.add(p, x - p.r, y - p.r, x + p.r, y + p.r);
    (inSky ? sky : ground).push({z: inSky ? y : z, svg: G(x, y, s, rnd(-10, 10), bonusDraw())}); bon++;
  }
  // 4. ciel : vaisseaux et créatures volantes
  const skyFns = facs.flatMap(f => f.sky), nSky = Math.round(40 + 140 * d);
  for (let n = 0, t = 0; n < nSky && t < 40000; t++){
    const fn = pick(skyFns), x = rnd(30, W - 30), y = rnd(30, HZ + 30), s = rIt * rnd(2.2, 3.6) / nominal(fn), box = fn.box || [-20, -20, 20, 20], r = (box[2] - box[0]) * s * .35;
    if (!free(x, y, r, .8)) continue;
    const q = rectOf(x, y, s, box, -1e9 + y + 1e-3); if (coversProt(q)) continue;
    addOcc(x, y, r); sky.push({z: y, svg: G(x, y, s, rnd(-12, 12), fn(), A.R() < .5)}); n++;
  }
  // 5. foule au sol : unités, décor des factions, objets futuristes, leurres
  // les unités se regroupent en armées (une faction par campement)
  const camps = Array.from({length: Math.round(W * (H - HZ) / 220000)}, () => { const f = pick(facs); return {x: rnd(0, W), y: rnd(HZ + 40, H), r: rnd(200, 420), units: f.clutter.filter(c => c.box), decor: f.clutter.filter(c => !c.box)}; });
  const gauss = () => (A.R() + A.R() + A.R() - 1.5) / 1.5;
  let placed = 0;
  for (let t = 0; placed < nClutter && t < nClutter * 50; t++){
    const u = A.R(), c = pick(camps), inCamp = u < .5;
    const [fn, size] = u < .4 ? [pick(c.units), rnd(2.5, 3.5)] : u < .5 ? [pick(c.decor), rnd(2.2, 3)] : u < .84 ? [pick(PROPS), rnd(2.5, 3.4)] : [pick(decoys), rnd(2.1, 2.7)];
    const x = inCamp ? c.x + gauss() * c.r : rnd(15, W - 15), y = inCamp ? c.y + gauss() * c.r * .6 : rnd(HZ + 10, H - 10);
    if (x < 12 || x > W - 12 || y < HZ + 8 || y > H - 8) continue;
    const s = persp(y) * rIt * size / nominal(fn), box = fn.box || [-20, -20, 20, 20];
    const r = Math.max(4, (box[2] - box[0]) * s * .33);
    if (!free(x, y, r, .5) || blocked(x, y, r * .7)) continue;
    const q = rectOf(x, y, s, box, y + (fn.box ? box[3] : 16) * s);
    if (coversProt(q)) continue;
    addOcc(x, y, r); ground.push({z: q.z, svg: G(x, y, s, fn.box ? 0 : rnd(-8, 8), fn(), A.R() < .5)}); placed++;
  }
  sky.sort((a, b) => a.z - b.z); ground.sort((a, b) => a.z - b.z);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${DEFS}${UDEFS()}<defs>${bg.defs}</defs>${bg.s}${sky.map(o => o.svg).join('')}${ground.map(o => o.svg).join('')}</svg>`;
  const n = 4 + k;
  return {svg, level: {id: cfg.id, n, name: cfg.name, title: `Niveau ${n} — ${cfg.name}`, mood: cfg.mood, w: W, h: H, items,
    count: sky.length + ground.length, bats: bon, bonus: bonusLabel, kind: 'faction',
    sub: 'Factions : ' + cfg.fac.map(f => FACNAME[f]).join(', '), cat: 'stellaire', img: `img/${cfg.id}.jpg`, thumb: `img/${cfg.id}_thumb.jpg`}};
}

// rendu des SVG en JPEG (planche + miniature) avec Chromium
module.exports = async function (ROOT){
  const {chromium} = require('playwright');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stellaire-'));
  const browser = await chromium.launch();
  const out = [];
  const only = process.env.NIVEAUX ? process.env.NIVEAUX.split(',') : null;
  for (let k = 0; k < LEVELS.length; k++){
    const cfg = LEVELS[k];
    const {svg, level} = build(cfg, k);
    out.push(level);
    if (only && !only.includes(cfg.id)) continue;
    const f = path.join(tmp, cfg.id + '.svg'); fs.writeFileSync(f, svg);
    const page = await browser.newPage({viewport: {width: level.w, height: level.h}});
    await page.goto('file://' + f, {waitUntil: 'load'});
    await page.waitForTimeout(1500);
    await page.screenshot({path: path.join(ROOT, 'img', cfg.id + '.jpg'), type: 'jpeg', quality: 84});
    await page.close();
    const tw = 480, th = Math.round(level.h * tw / level.w);
    const tp = await browser.newPage({viewport: {width: tw, height: th}});
    const th_ = path.join(tmp, cfg.id + '_thumb.html');
    fs.writeFileSync(th_, `<html><body style="margin:0"><img src="file://${path.join(path.resolve(ROOT), 'img', cfg.id + '.jpg')}" style="width:${tw}px;height:${th}px;display:block"></body></html>`);
    await tp.goto('file://' + th_, {waitUntil: 'load'});
    await tp.screenshot({path: path.join(ROOT, 'img', cfg.id + '_thumb.jpg'), type: 'jpeg', quality: 80});
    await tp.close();
    console.log(cfg.id, cfg.name, level.w + 'x' + level.h, 'objets:', level.items.length, 'bonus:', level.bats, 'éléments:', level.count, 'svg:', (svg.length / 1e6).toFixed(1) + ' Mo', 'jpg:', (fs.statSync(path.join(ROOT, 'img', cfg.id + '.jpg')).size / 1e6).toFixed(1) + ' Mo');
  }
  await browser.close();
  return out;
};
