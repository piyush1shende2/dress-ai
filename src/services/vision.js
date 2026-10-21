// Browser-side vision: face analysis, dress cut-out (basic CV) and MediaPipe pose/face models (real ML, loaded lazily).
// Files are served from this site (public/mediapipe, public/models) so the app can work offline; the CDN is only a fallback.
const abs = (p) => new URL(import.meta.env.BASE_URL + p, document.baseURI).href;
const WASM = abs("mediapipe/wasm");
const REMOTE = (n, f) => `https://storage.googleapis.com/mediapipe-models/${n}/${f}/float16/1/${f}.task`;
const MODELS = (n, f) => [abs(`models/${f}.task`), REMOTE(n, f)];
let fileset, faceP, poseP;
async function vision() { if (!fileset) { const m = await import("@mediapipe/tasks-vision"); fileset = { m, f: await m.FilesetResolver.forVisionTasks(WASM) }; } return fileset; }
async function firstWorking(paths, make) { let err; for (const path of paths) { try { return await make(path); } catch (e) { err = e; } } throw err; }
export async function faceLandmarker() { return (faceP ||= vision().then(({ m, f }) => firstWorking(MODELS("face_landmarker", "face_landmarker"), (path) => m.FaceLandmarker.createFromOptions(f, { baseOptions: { modelAssetPath: path }, runningMode: "IMAGE", numFaces: 1 })))); }
export async function poseLandmarker() { return (poseP ||= vision().then(({ m, f }) => firstWorking(MODELS("pose_landmarker", "pose_landmarker_full"), async (path) => { const mk = (delegate) => m.PoseLandmarker.createFromOptions(f, { baseOptions: { modelAssetPath: path, delegate }, runningMode: "VIDEO", numPoses: 4, minPoseDetectionConfidence: 0.4, minPosePresenceConfidence: 0.4, minTrackingConfidence: 0.4 }); try { return await mk("GPU"); } catch { return mk("CPU"); } }))); }
export const loadImage = (file) => new Promise((res, rej) => { const u = URL.createObjectURL(file), i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("Could not read that image.")); i.src = u; });
const hex = (r, g, b) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const med = (a) => a.sort((x, y) => x - y)[a.length >> 1];
function patch(ctx, W, H, x, y, r) { const px = [], x0 = Math.max(0, x - r | 0), y0 = Math.max(0, y - r | 0), w = Math.min(W - x0, 2 * r | 0), h = Math.min(H - y0, 2 * r | 0); if (w < 2 || h < 2) return null;
  const d = ctx.getImageData(x0, y0, w, h).data; for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i + 1], d[i + 2], d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11]);
  px.sort((a, b) => a[3] - b[3]); const s = px.slice(px.length * .2 | 0, px.length * .8 | 0 || 1); return [0, 1, 2].map((c) => med(s.map((p) => p[c]))); }
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
// Measured from the photo: skin colour (cheeks/forehead), hair colour + rough length, head tilt. Height cannot be measured from a face photo.
export async function analyseFace(img) {
  const lm = (await faceLandmarker()).detect(img).faceLandmarks[0]; if (!lm) throw new Error("No face found. Use a clear, front-facing photo.");
  const c = document.createElement("canvas"), W = c.width = img.naturalWidth, H = c.height = img.naturalHeight, ctx = c.getContext("2d", { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
  const P = (i) => [lm[i].x * W, lm[i].y * H], top = P(10), chin = P(152), fw = Math.hypot(...[0, 1].map((k) => P(234)[k] - P(454)[k])), fh = Math.hypot(top[0] - chin[0], top[1] - chin[1]);
  const skins = [50, 280, 205, 425, 151].map((i) => patch(ctx, W, H, ...P(i), fw * .04)).filter(Boolean), skin = [0, 1, 2].map((k) => med(skins.map((s) => s[k])));
  const hp = patch(ctx, W, H, top[0], top[1] - fh * .32, fw * .06), hairColor = hp && dist(hp, skin) > 30 ? hp : null;
  let style = "none";
  if (hairColor) { const near = (x, y) => { const p = patch(ctx, W, H, x, y, fw * .04); return p && dist(p, hairColor) < 55; };
    const lx = P(234)[0] - fw * .12, rx = P(454)[0] + fw * .12, jaw = chin[1] - fh * .2, sh = chin[1] + fh * .45;
    style = near(lx, sh) || near(rx, sh) ? "long" : near(lx, jaw) || near(rx, jaw) ? "medium" : top[1] - fh * .32 < 0 ? "short" : "short"; }
  const roll = Math.atan2(P(454)[1] - P(234)[1], P(454)[0] - P(234)[0]) * 180 / Math.PI;
  return { skin: hex(...skin), hairColor: hairColor ? hex(...hairColor) : "#2b1d14", hair: style, rollDeg: roll, hairFound: !!hairColor };
}
// Removes a plain product-photo background: border colour -> Otsu threshold -> keep only fill-connected foreground. Returns {canvas (alpha), color, aspect}.
export function cutoutDress(img, max = 900) {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), W = Math.round(img.naturalWidth * s), H = Math.round(img.naturalHeight * s);
  const c = document.createElement("canvas"); c.width = W; c.height = H; const ctx = c.getContext("2d", { willReadFrequently: true }); ctx.drawImage(img, 0, 0, W, H);
  const im = ctx.getImageData(0, 0, W, H), d = im.data, b = [[], [], []];
  for (let x = 0; x < W; x += 3) for (const y of [0, H - 1]) for (let k = 0; k < 3; k++) b[k].push(d[(y * W + x) * 4 + k]);
  for (let y = 0; y < H; y += 3) for (const x of [0, W - 1]) for (let k = 0; k < 3; k++) b[k].push(d[(y * W + x) * 4 + k]);
  const bg = b.map(med), D = new Float32Array(W * H), hist = new Array(64).fill(0);
  for (let i = 0; i < W * H; i++) { D[i] = Math.hypot(d[i * 4] - bg[0], d[i * 4 + 1] - bg[1], d[i * 4 + 2] - bg[2]); hist[Math.min(63, D[i] >> 3)]++; }
  let sum = 0; hist.forEach((v, i) => (sum += i * v)); let wB = 0, sB = 0, best = 0, th = 4;
  for (let t = 0; t < 64; t++) { wB += hist[t]; if (!wB || wB === W * H) continue; sB += t * hist[t]; const mB = sB / wB, mF = (sum - sB) / (W * H - wB), v = wB * (W * H - wB) * (mB - mF) ** 2; if (v > best) { best = v; th = t; } }
  const T = Math.max(22, Math.min(80, th * 8)), fg = new Uint8Array(W * H).map((_, i) => (D[i] > T ? 1 : 0)), outside = new Uint8Array(W * H), q = [];
  const push = (i) => { if (!fg[i] && !outside[i]) { outside[i] = 1; q.push(i); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); } for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (i >= W) push(i - W); if (i < W * H - W) push(i + W); }
  let x0 = W, x1 = 0, y0 = H, y1 = 0, n = 0; const col = [0, 0, 0];
  for (let i = 0; i < W * H; i++) { if (outside[i]) { d[i * 4 + 3] = 0; continue; } const x = i % W, y = (i / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); n++; for (let k = 0; k < 3; k++) col[k] += d[i * 4 + k]; }
  if (n < W * H * 0.02) throw new Error("Couldn't separate the dress from the background. Use a product photo on a plain background.");
  ctx.putImageData(im, 0, 0); const o = document.createElement("canvas"); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; o.getContext("2d").drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
  return { canvas: o, color: hex(col[0] / n, col[1] / n, col[2] / n), aspect: o.height / o.width };
}
