import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// Realistic mannequin built from the supplied scans (public/models/*.glb, 1.7 m tall, feet on y=0, facing +z).
const cache = {};
const loadGeo = (g) => (cache[g] ||= new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/${g === "f" ? "female" : "male"}.glb`).then((r) => { let geo; r.scene.traverse((o) => { if (o.isMesh) geo = o.geometry; }); return geo; }));
export const HAIR_STYLES = [["none", "Bald / covered"], ["buzz", "Buzz"], ["short", "Short"], ["medium", "Medium"], ["long", "Long"], ["bun", "Bun"]];
export const SKIN_TONES = ["#f6dcc8", "#edc29f", "#d9a577", "#b9805a", "#8c5a3c", "#5e3a27"];
function hair(g, style, color, c, hw, hd) {
  if (style === "none") return;
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.55 }), add = (geo, p, s) => { const o = new THREE.Mesh(geo, m); o.position.set(...p); o.scale.set(...s); g.add(o); return o; };
  const cap = (th) => new THREE.SphereGeometry(1, 40, 28, 0, Math.PI * 2, 0, th);
  const k = style === "buzz" ? 1.015 : 1.07;
  add(cap(Math.PI * (style === "buzz" ? 0.5 : 0.58)), [c.x, c.y + 0.004, c.z - 0.004], [hw * k, hw * 1.12 * k, hd * k]);
  if (style === "bun") add(new THREE.SphereGeometry(1, 20, 16), [c.x, c.y + hw * 1.25, c.z - hd * 0.5], [0.05, 0.05, 0.05]);
  if (style === "medium" || style === "long") { const len = style === "long" ? 0.42 : 0.2;
    add(new THREE.CylinderGeometry(1, 0.8, len, 36, 1, true, Math.PI * 0.2, Math.PI * 1.6), [c.x, c.y - hw * 0.7 - len / 2 + 0.03, c.z - hd * 0.32], [hw * 1.05, 1, hd * 0.9]).material = m.clone(), g.children.at(-1).material.side = THREE.DoubleSide; }
}
function shell(geo, kind, tex, sleeves) {
  const P = geo.attributes.position, N = geo.attributes.normal, I = geo.index.array, ok = (i) => { const x = Math.abs(P.getX(i)), y = P.getY(i);
    if (kind === "top") return y > 0.9 && y < 1.4 && (x < 0.2 || (sleeves && x < 0.46 && y > 1.12));
    if (kind === "dress") return y > 0.8 && y < 1.4 && (x < 0.2 || (sleeves && x < 0.3 && y > 1.15));
    return y > 0.06 && y < 1.02 && x < 0.3 || (y < 0.06 && false); };
  const pos = [], uv = [], idx = [], map = new Map(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
  for (let t = 0; t < I.length; t += 3) if (ok(I[t]) && ok(I[t + 1]) && ok(I[t + 2])) for (let k = 0; k < 3; k++) { const i = I[t + k]; if (!map.has(i)) { map.set(i, pos.length / 3);
    const px = P.getX(i) + N.getX(i) * 0.012, py = P.getY(i) + N.getY(i) * 0.012, pz = P.getZ(i) + N.getZ(i) * 0.012; pos.push(px, py, pz); x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
    idx.push(map.get(i)); }
  for (let i = 0; i < pos.length; i += 3) uv.push((pos[i] - x0) / (x1 - x0), (pos[i + 1] - y0) / (y1 - y0));
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 });
  const out = new THREE.Group(); out.add(new THREE.Mesh(g, mat));
  if (kind === "dress") { const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.42, 0.62, 56, 1, true), mat); sk.position.y = 0.8 - 0.31 + 0.04; sk.scale.z = 0.8; out.add(sk); }
  return out;
}
// opts: { gender:"m"|"f", skin, hair, hairColor, height (m), garment:{kind, tex, sleeves}|null }
export async function buildMannequin({ gender, skin, hair: hs, hairColor, height = 1.7, garment }) {
  const geo = (await loadGeo(gender)).clone(), P = geo.attributes.position, g = new THREE.Group();
  g.add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: skin, roughness: 0.55, sheen: 0.5, sheenRoughness: 0.5, sheenColor: new THREE.Color(skin).offsetHSL(0, 0.1, 0.1), clearcoat: 0.05 })));
  let n = 0, sz = 0, mx = 0; const c = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) if (P.getY(i) > 1.6) { n++; c.z += P.getZ(i); mx = Math.max(mx, Math.abs(P.getX(i))); sz = Math.max(sz, Math.abs(P.getZ(i))); }
  c.set(0, 1.7 - mx * 1.05, c.z / n); hair(g, hs, hairColor, c, mx, mx * 1.1);
  if (garment?.tex) g.add(shell(geo, garment.kind, garment.tex, garment.sleeves));
  const root = new THREE.Group(); root.add(g); root.scale.setScalar(height / 1.7); return root;
}
