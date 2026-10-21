import * as THREE from "three";
// Procedural 3D mannequin + garments. Units ~ metres, feet at y=0, front faces +z.
const U = 0.3, F = 0.26, T = 0.44, S = 0.4;
const MALE = [[.88, .15, .1, -.005], [.95, .165, .105, -.01], [1.05, .15, .1, 0], [1.18, .165, .108, .01], [1.3, .185, .115, .015], [1.4, .19, .1, 0], [1.46, .1, .075, 0], [1.5, .055, .055, 0]];
const FEM = [[.86, .15, .105, -.02], [.94, .175, .115, -.03], [1.04, .13, .088, 0], [1.14, .138, .095, .01], [1.26, .152, .105, .02], [1.38, .165, .088, 0], [1.45, .095, .068, 0], [1.49, .052, .052, 0]];
const cr = (p0, p1, p2, p3, t) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
const sampler = (rows) => (y) => {
  y = Math.min(rows.at(-1)[0], Math.max(rows[0][0], y)); let i = 0;
  while (i < rows.length - 2 && y > rows[i + 1][0]) i++;
  const t = (y - rows[i][0]) / (rows[i + 1][0] - rows[i][0]), g = (k) => rows[Math.min(rows.length - 1, Math.max(0, k))];
  return [1, 2, 3].map((c) => cr(g(i - 1)[c], g(i)[c], g(i + 1)[c], g(i + 2)[c], t));
};
// Loft elliptical rings [y, halfWidth, halfDepth, zCentre], bottom to top.
function loft(rows, seg = 36) {
  const pos = [], uv = [], idx = [], y0 = rows[0][0], y1 = rows.at(-1)[0], w = seg + 1;
  rows.forEach(([y, a, b, z]) => { for (let j = 0; j <= seg; j++) { const t = (j / seg) * Math.PI * 2; pos.push(a * Math.sin(t), y, z + b * Math.cos(t)); uv.push(j / seg, (y - y0) / (y1 - y0 || 1)); } });
  for (let i = 0; i < rows.length - 1; i++) for (let j = 0; j < seg; j++) { const p = i * w + j; idx.push(p, p + w, p + 1, p + 1, p + w, p + w + 1); }
  [[0, rows[0]], [rows.length - 1, rows.at(-1)]].forEach(([r, row], k) => { const c = pos.length / 3; pos.push(0, row[0], row[3]); uv.push(0.5, k);
    for (let j = 0; j < seg; j++) { const p = r * w + j; k ? idx.push(c, p + 1, p) : idx.push(c, p, p + 1); } });
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}
function pattern(p, color, accent) {
  if (p === "plain") return null;
  const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
  x.fillStyle = color; x.fillRect(0, 0, 128, 128); x.fillStyle = accent;
  if (p === "stripe") { x.globalAlpha = 0.7; x.fillRect(0, 0, 16, 128); } else if (p === "dots") { x.beginPath(); x.arc(64, 64, 12, 0, 7); x.fill(); }
  else if (p === "check") { x.globalAlpha = 0.3; x.fillRect(0, 0, 64, 128); x.fillRect(0, 0, 128, 64); } else x.fillRect(0, 100, 128, 28);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...{ stripe: [10, 1], dots: [12, 10], check: [8, 6], border: [1, 1] }[p]); return t;
}
export function disposeTree(o) { o.traverse((m) => { m.geometry?.dispose(); if (m.material) { m.material.map?.dispose(); m.material.dispose(); } }); }

export function buildFigure({ model, kind, color, accent, pattern: pat, mat, pose }) {
  const g = new THREE.Group(), female = model.group === "f", kid = model.group === "k", rows = female ? FEM : MALE, at = sampler(rows);
  const std = (c, r = 0.8, map = null) => new THREE.MeshStandardMaterial({ color: map ? 0xffffff : c, map, roughness: r, side: THREE.DoubleSide });
  const rough = { cotton: 0.8, linen: 0.95, silk: 0.3, wool: 0.9 }[mat] ?? 0.8;
  const bodyM = std(model.finish, 0.42), limbM = model.wood ? std("#d9b184", 0.6) : bodyM;
  const fm = std(color, rough, pattern(pat, color, accent)), am = std(accent, rough), tee = std("#ece7df"), jean = std("#262630"), pale = std("#e8e2d6");
  const mesh = (geo, m, p = [0, 0, 0], parent = g, s) => { const o = new THREE.Mesh(geo, m); o.position.set(...p); if (s) o.scale.set(...s); parent.add(o); return o; };
  const ball = (r) => new THREE.SphereGeometry(r, 20, 14), cyl = (a, b, h) => new THREE.CylinderGeometry(a, b, h, 24, 1);
  // body
  mesh(loft(rows), bodyM);
  if (female) [-1, 1].forEach((s) => mesh(ball(1), bodyM, [s * 0.07, 1.265, 0.085], g, [0.062, 0.062, 0.07]));
  mesh(cyl(0.036, 0.04, 0.14), bodyM, [0, 1.53, 0]);
  const head = new THREE.Group(); head.position.set(0, kid ? 1.7 : 1.67, 0); head.scale.setScalar(kid ? 1.35 : female ? 0.95 : 1); g.add(head);
  mesh(ball(1), bodyM, [0, 0, 0], head, [0.085, 0.115, 0.1]); mesh(ball(1), bodyM, [0, -0.07, 0.03], head, [0.06, 0.055, 0.065]);
  // garment helpers
  const torsoG = (top, hem, off, extra = []) => { const rs = [];
    for (let i = 0; i <= 14; i++) { const y = hem + ((top - hem) * i) / 14, [a, b, z] = at(y), bust = female && y > 1.18 && y < 1.34 ? 0.032 : 0;
      rs.push([y, a + off, b + off + bust, z + (bust ? 0.015 : 0)]); }
    return loft([...extra, ...rs].sort((p, q) => p[0] - q[0])); };
  const tube = (pts, r, m) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 24, r, 8), m);
  const collar = (m) => { const o = mesh(new THREE.TorusGeometry(0.06, 0.013, 8, 24), m, [0, 1.5, 0.002]); o.rotation.x = Math.PI / 2; };
  const SLEEVE = { tshirt: [0.45, fm], shirt: [2, fm], kurta: [1.5, fm], sherwani: [2, fm], dress: [0.35, fm], lehenga: [0.45, am], saree: [0.45, am], pants: [0.45, tee] };
  const [cover, sm] = SLEEVE[kind], legGar = { pants: fm, tshirt: jean, shirt: jean, kurta: pale, sherwani: pale }[kind];
  if (kind === "pants") mesh(torsoG(1.46, 0.9, 0.014), tee);
  if (kind === "tshirt" || kind === "shirt") mesh(torsoG(1.46, 0.86, 0.016), fm);
  if (kind === "shirt") collar(std("#ffffff"));
  if (kind === "kurta") { mesh(torsoG(1.47, 0.88, 0.016, [[.58, .225, .165, 0], [.72, .205, .15, 0]]), fm); mesh(new THREE.BoxGeometry(0.016, 0.3, 0.01), am, [0, 1.3, 0.135]); collar(am); }
  if (kind === "sherwani") { mesh(torsoG(1.49, 0.88, 0.018, [[.5, .23, .17, 0], [.7, .21, .155, 0]]), fm); mesh(new THREE.BoxGeometry(0.014, 0.9, 0.01), am, [0, 1.0, 0.14]); collar(am); }
  if (kind === "dress") mesh(torsoG(1.47, 1.04, 0.015, [[.38, .36, .33, 0], [.55, .31, .27, 0], [.75, .24, .2, 0], [.92, .19, .15, 0]]), fm);
  if (kind === "lehenga") { mesh(torsoG(1.45, 1.2, 0.016), am); mesh(loft([[.03, .56, .55, 0], [.35, .46, .44, 0], [.7, .31, .29, 0], [.95, .2, .16, 0], [1.06, .145, .1, 0]]), fm);
    tube([[-.17, 1.47, .05], [0, 1.37, .14], [.17, 1.2, .13], [.21, .98, .1]], 0.03, am); }
  if (kind === "saree") { mesh(torsoG(1.45, 1.18, 0.016), am); mesh(loft([[.03, .15, .11, 0], [.3, .165, .125, 0], [.6, .19, .15, 0], [.88, .205, .165, -.01], [1.0, .17, .12, -.005], [1.08, .145, .1, 0]]), fm);
    tube([[-.17, 1.47, .06], [0, 1.37, .15], [.17, 1.2, .14], [.21, .98, .12]], 0.036, fm); tube([[.17, 1.47, -.06], [.2, 1.2, -.13], [.18, .9, -.15], [.15, .55, -.12]], 0.03, fm); }
  if (kind === "pants") mesh(torsoG(1.07, 0.86, 0.02), fm); else if (legGar) mesh(torsoG(1.0, 0.86, 0.02), legGar);
  // limbs (posed)
  const sx = female ? 0.18 : 0.195, walkK = kind === "lehenga" || kind === "saree" ? 0.2 : kind === "dress" ? 0.55 : 1;
  [-1, 1].forEach((side, i) => {
    const [s, ab, eb, ez] = pose.a[i], sh = new THREE.Group(); sh.position.set(side * sx, 1.4, 0); sh.rotation.set(s, 0, side * ab); g.add(sh);
    mesh(ball(0.05), limbM, [0, 0, 0], sh); mesh(cyl(0.043, 0.036, U), limbM, [0, -U / 2, 0], sh);
    const el = new THREE.Group(); el.position.y = -U; el.rotation.set(eb, 0, -side * ez); sh.add(el);
    mesh(ball(0.038), limbM, [0, 0, 0], el); mesh(cyl(0.036, 0.027, F), limbM, [0, -F / 2, 0], el); mesh(ball(1), limbM, [0, -F - 0.04, 0], el, [0.03, 0.055, 0.018]);
    if (cover > 0) { const ul = Math.min(cover, 1) * U; mesh(ball(0.058), sm, [0, 0, 0], sh); mesh(cyl(0.056, 0.049, ul), sm, [0, -ul / 2, 0], sh);
      if (cover > 1) { const fl = (cover - 1) * F; mesh(cyl(0.048, 0.041, fl), sm, [0, -fl / 2, 0], el); mesh(ball(0.047), sm, [0, 0, 0], el); } }
    const [ls, lab, kn] = pose.l[i], h = new THREE.Group(); h.position.set(side * 0.085, 0.9, 0); h.rotation.set(ls * walkK, 0, side * lab * walkK); g.add(h);
    mesh(ball(0.09), limbM, [0, 0, 0], h); mesh(cyl(0.088, 0.066, T), limbM, [0, -T / 2, 0], h);
    const k = new THREE.Group(); k.position.y = -T; k.rotation.x = kn * walkK; h.add(k);
    mesh(ball(0.062), limbM, [0, 0, 0], k); mesh(cyl(0.06, 0.04, S), limbM, [0, -S / 2, 0], k); mesh(ball(1), limbM, [0, -S - 0.025, 0.05], k, [0.045, 0.035, 0.12]);
    if (legGar) { mesh(ball(0.1), legGar, [0, 0, 0], h); mesh(cyl(0.1, 0.078, T), legGar, [0, -T / 2, 0], h); mesh(ball(0.078), legGar, [0, 0, 0], k); mesh(cyl(0.076, 0.052, S), legGar, [0, -S / 2, 0], k); }
  });
  const k = kid ? 0.66 : 1; g.scale.set(model.build * k, model.h * k, model.build * k);
  const root = new THREE.Group(); root.add(g); return root;
}
