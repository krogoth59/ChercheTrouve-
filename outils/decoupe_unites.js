// Découpe les unités des planches de concept (fond sombre) en WebP transparents
// et écrit index.json (largeur, hauteur de chaque unité) pour gen_stellaire.js.
// Usage (nécessite le paquet sharp) : node outils/decoupe_unites.js outils/planches outils/unites
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const [srcDir, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

const SHEETS = {
  valnir: ['valnir.webp', {
    aeris: [90, 100, 325, 248], ravenix: [400, 88, 700, 252], mantis: [752, 38, 1097, 266],
    bastion: [1122, 22, 1632, 256], talon: [32, 302, 382, 590], auriga: [422, 333, 842, 582],
    vexor: [862, 328, 1202, 578], argus: [1252, 366, 1648, 580], vanguard: [82, 648, 258, 853],
    orbita: [378, 652, 638, 802], lyra: [732, 652, 958, 852], rampart: [1008, 648, 1602, 852],
  }],
  aelys: ['aelys.webp', {
    eclaireur: [278, 34, 516, 186], nexus: [548, 8, 1188, 276], collecteur: [1222, 58, 1562, 263],
    navette: [162, 203, 458, 396], sonde: [502, 278, 648, 374], relais: [1028, 310, 1168, 410],
    tour: [1352, 258, 1640, 682], soutien: [46, 458, 302, 662], gardien: [352, 438, 598, 652],
    agresseur: [628, 468, 872, 662], eliteur: [918, 488, 1052, 642], falconneur: [1102, 422, 1298, 647],
    vecteur: [282, 686, 418, 838], cycleur: [512, 738, 658, 836], minier: [758, 728, 868, 832],
    lame: [958, 710, 1142, 838], protecteur: [1242, 702, 1362, 838],
  }],
  xaroth: ['xaroth.webp', {
    ver: [232, 38, 458, 296], matriarche: [482, 82, 728, 292], chasseur: [722, 38, 878, 296],
    ravageur: [868, 72, 1062, 282], predateur: [1078, 68, 1318, 287], porteessaim: [1312, 52, 1538, 292],
    essaimlon: [1542, 68, 1652, 247], griffeuse: [186, 418, 334, 572], traqueur: [376, 398, 484, 572],
    tisseuse: [506, 362, 674, 577], mutant: [686, 392, 842, 577], devoreur: [856, 392, 1038, 577],
    embusqueur: [1052, 382, 1212, 577], colosse: [1236, 342, 1658, 586], terrier: [16, 668, 288, 832],
    couveuse: [288, 678, 462, 832], reserve: [472, 676, 662, 832], nid: [652, 652, 928, 832],
    incubateur: [932, 692, 1138, 832], extracteur: [1142, 662, 1402, 832], rampant: [1406, 676, 1664, 822],
  }],
};

const manifest = {};
(async () => {
  for (const [fac, [file, units]] of Object.entries(SHEETS)) {
    const { data, info } = await sharp(path.join(srcDir, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width;
    const T = { valnir: 16, aelys: 30, xaroth: 26 }[fac];
    for (const [name, [x0, y0, x1, y1]] of Object.entries(units)) {
      const w = x1 - x0, h = y1 - y0, n = w * h;
      const px = i => { const x = x0 + (i % w), y = y0 + ((i / w) | 0), o = (y * W + x) * 4; return [data[o], data[o + 1], data[o + 2]]; };
      // couleur de fond = médiane du bord
      const border = [];
      for (let x = 0; x < w; x++) { border.push(px(x), px((h - 1) * w + x)); }
      for (let y = 0; y < h; y++) { border.push(px(y * w), px(y * w + w - 1)); }
      const med = k => border.map(c => c[k]).sort((a, b) => a - b)[border.length >> 1];
      const bg = [med(0), med(1), med(2)];
      const dist = new Float32Array(n);
      for (let i = 0; i < n; i++) { const c = px(i); dist[i] = Math.hypot(c[0] - bg[0], c[1] - bg[1], c[2] - bg[2]); }
      // premier plan brut, puis fermeture morphologique (recolle les pièces noires)
      let fg = new Uint8Array(n); for (let i = 0; i < n; i++) fg[i] = dist[i] >= T ? 1 : 0;
      const morph = (m, r, isMax) => {
        const a = new Uint8Array(n), b = new Uint8Array(n);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          let v = isMax ? 0 : 1;
          for (let d = -r; d <= r; d++) { const xx = x + d; const p = xx < 0 || xx >= w ? (isMax ? 0 : 1) : m[y * w + xx]; v = isMax ? (v | p) : (v & p); }
          a[y * w + x] = v;
        }
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          let v = isMax ? 0 : 1;
          for (let d = -r; d <= r; d++) { const yy = y + d; const p = yy < 0 || yy >= h ? (isMax ? 0 : 1) : a[yy * w + x]; v = isMax ? (v | p) : (v & p); }
          b[y * w + x] = v;
        }
        return b;
      };
      const R = +(process.env.CLOSE || 3);
      fg = morph(morph(fg, R, true), R, false);
      // remplissage du fond depuis les bords
      const isBg = new Uint8Array(n), st = [];
      const push = i => { if (!isBg[i] && !fg[i]) { isBg[i] = 1; st.push(i); } };
      for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
      for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
      while (st.length) {
        const i = st.pop(), x = i % w;
        if (x > 0) push(i - 1); if (x < w - 1) push(i + 1);
        if (i >= w) push(i - w); if (i < n - w) push(i + w);
      }
      // trous intérieurs : petits -> pleins (pièces sombres), grands -> fond (vides entre les pattes)
      const seen = new Uint8Array(n);
      for (let s = 0; s < n; s++) {
        if (isBg[s] || fg[s] || seen[s]) continue;
        const reg = [s], q = [s]; seen[s] = 1;
        while (q.length) {
          const i = q.pop(), x = i % w;
          for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
            if (j >= 0 && j < n && !isBg[j] && !fg[j] && !seen[j]) { seen[j] = 1; q.push(j); reg.push(j); }
          }
        }
        if (reg.length > (+process.env.HOLE || 1800)) for (const i of reg) isBg[i] = 1;
      }
      // garder la plus grande masse + les masses notables (supprime les poussières)
      const comp = new Int32Array(n).fill(-1), sizes = [];
      for (let s = 0; s < n; s++) {
        if (isBg[s] || comp[s] >= 0) continue;
        const id = sizes.length; let cnt = 0; const q = [s]; comp[s] = id;
        while (q.length) {
          const i = q.pop(), x = i % w; cnt++;
          for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
            if (j >= 0 && j < n && !isBg[j] && comp[j] < 0) { comp[j] = id; q.push(j); }
          }
        }
        sizes.push(cnt);
      }
      const big = Math.max(...sizes), keep = sizes.map(s => s >= Math.max(150, big * 0.05));
      // alpha adouci en bordure
      const out = Buffer.alloc(n * 4);
      let bx0 = w, by0 = h, bx1 = 0, by1 = 0;
      for (let i = 0; i < n; i++) {
        const c = px(i), x = i % w, y = (i / w) | 0;
        let a = 0;
        if (!isBg[i] && keep[comp[i]]) {
          let edge = false;
          for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) if (j < 0 || j >= n || isBg[j]) edge = true;
          a = edge ? Math.min(1, dist[i] / (T * 2.2)) : 1;
        }
        // décontamine le fond dans les pixels semi-transparents
        const k = a > 0 && a < 1 ? a : 1;
        for (let ch = 0; ch < 3; ch++) out[i * 4 + ch] = Math.max(0, Math.min(255, Math.round((c[ch] - bg[ch] * (1 - k)) / k)));
        out[i * 4 + 3] = Math.round(a * 255);
        if (a > 0.1) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
      }
      const img = sharp(out, { raw: { width: w, height: h, channels: 4 } })
        .extract({ left: bx0, top: by0, width: bx1 - bx0 + 1, height: by1 - by0 + 1 });
      const f = path.join(outDir, `${fac}_${name}.webp`);
      await img.clone().webp({ quality: 92, alphaQuality: 100 }).toFile(f);
      if (process.env.PNG) await img.clone().png().toFile(path.join(outDir, `${fac}_${name}.png`));
      manifest[`${fac}_${name}`] = [bx1 - bx0 + 1, by1 - by0 + 1];
      console.log(f, bx1 - bx0 + 1, by1 - by0 + 1, fs.statSync(f).size);
    }
  }
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(manifest, null, 1));
})();
