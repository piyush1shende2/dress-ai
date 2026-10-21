import { useEffect, useRef, useState } from "react";
import { poseLandmarker } from "../services/vision";
// Live camera "filter": MediaPipe Pose finds shoulders/hips/knees/ankles every frame; the cut-out dress is warped onto them in strips.
const ROWS = { // [distance along torso (1 = shoulder->hip), half-width in shoulder-widths, source y fraction]
  top: [[-0.1, 0.7, 0], [0.45, 0.62, 0.5], [1.05, 0.62, 1]],
  dress: [[-0.1, 0.62, 0], [0.5, 0.52, 0.3], [1.0, 0.55, 0.5], [1.5, 0.8, 0.75], ["hem", 0.95, 1]] };
function tri(ctx, im, s, d) { const [[sx0, sy0], [sx1, sy1], [sx2, sy2]] = s, [[x0, y0], [x1, y1], [x2, y2]] = d, den = sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1); if (!den) return;
  const a = (x0 * (sy1 - sy2) + x1 * (sy2 - sy0) + x2 * (sy0 - sy1)) / den, b = (y0 * (sy1 - sy2) + y1 * (sy2 - sy0) + y2 * (sy0 - sy1)) / den, c = (x0 * (sx2 - sx1) + x1 * (sx0 - sx2) + x2 * (sx1 - sx0)) / den,
    e = (y0 * (sx2 - sx1) + y1 * (sx0 - sx2) + y2 * (sx1 - sx0)) / den, f = (x0 * (sx1 * sy2 - sx2 * sy1) + x1 * (sx2 * sy0 - sx0 * sy2) + x2 * (sx0 * sy1 - sx1 * sy0)) / den, g = (y0 * (sx1 * sy2 - sx2 * sy1) + y1 * (sx2 * sy0 - sx0 * sy2) + y2 * (sx0 * sy1 - sx1 * sy0)) / den;
  ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.clip(); ctx.transform(a, b, c, e, f, g); ctx.drawImage(im, 0, 0); ctx.restore(); }
const vis = (L, i, t = 0.35) => (L[i].visibility ?? 1) > t && L[i].x > -0.03 && L[i].x < 1.03 && L[i].y > -0.03 && L[i].y < 1.03;
const euro = (minC = 1.2, beta = 0.02) => { let x = null, dx = 0, t0 = 0; const al = (c, dt) => 1 / (1 + 1 / (2 * Math.PI * c * dt));
  return (v, t) => { if (x === null) { x = v; t0 = t; return v; } const dt = Math.max(0.001, (t - t0) / 1000); t0 = t; dx += al(1, dt) * ((v - x) / dt - dx); x += al(minC + beta * Math.abs(dx), dt) * (v - x); return x; }; };
const mkTrack = () => ({ f: { x: euro(1.5, 0.03), y: euro(1.5, 0.03), sw: euro(1, 0.02), ang: euro(1.5, 4), T: euro(1, 0.02), hem: euro(1, 0.3) }, seen: 0 });
// Body fit from whatever is visible: shoulders -> hips -> head. Missing parts are estimated from average human proportions (torso = 1.4 shoulder widths).
function fit(L, W, H) {
  const P = (i) => [L[i].x * W, L[i].y * H], d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]), ss = vis(L, 11) && vis(L, 12), hh = vis(L, 23) && vis(L, 24); let c, sw, ang, T;
  if (ss) { const a = P(11), b = P(12); sw = d(a, b); c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; ang = Math.atan2(a[1] - b[1], a[0] - b[0]); if (Math.abs(ang) > Math.PI / 2) ang -= Math.sign(ang) * Math.PI; }
  else if (hh) { const a = P(23), b = P(24); sw = d(a, b) / 0.78; const hc = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; ang = Math.atan2(a[1] - b[1], a[0] - b[0]); if (Math.abs(ang) > Math.PI / 2) ang -= Math.sign(ang) * Math.PI; c = [hc[0] + Math.sin(ang) * sw * 1.4, hc[1] - Math.cos(ang) * sw * 1.4]; }
  else if (vis(L, 0) && (vis(L, 7) || vis(L, 8))) { const e = vis(L, 7) && vis(L, 8) ? d(P(7), P(8)) : Math.abs(P(vis(L, 7) ? 7 : 8)[0] - P(0)[0]) * 2; if (e < 8) return null; sw = e * 2.4; ang = 0; const n = P(0); c = [n[0], n[1] + e * 1.6]; }
  else return null;
  const dv = [-Math.sin(ang), Math.cos(ang)]; T = hh && ss ? d(c, [(P(23)[0] + P(24)[0]) / 2, (P(23)[1] + P(24)[1]) / 2]) : sw * 1.4;
  const along = (i, j) => (vis(L, i) && vis(L, j) ? (((P(i)[0] + P(j)[0]) / 2 - c[0]) * dv[0] + ((P(i)[1] + P(j)[1]) / 2 - c[1]) * dv[1]) / T : null);
  return { x: c[0], y: c[1], sw, ang, T, knee: along(25, 26) ?? 1.9, ankle: along(27, 28) ?? 2.8 };
}
export default function LiveTryOn({ cut, kind, onClose }) {
  const vid = useRef(null), cv = useRef(null), [msg, setMsg] = useState("Starting camera…"), [err, setErr] = useState(""), [facing, setFacing] = useState("user"), [k, setK] = useState(kind);
  const kr = useRef(k); kr.current = k;
  useEffect(() => {
    let stop = false, raf, stream, sm = null; const v = vid.current;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera needs HTTPS or localhost.");
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        v.srcObject = stream; await v.play(); setMsg("Loading body tracker…"); const pose = await poseLandmarker(); if (stop) return; setMsg("");
        const ctx = cv.current.getContext("2d"); let last = -1, tracks = [];
        const loop = () => { raf = requestAnimationFrame(loop); if (v.currentTime === last || v.readyState < 2) return; last = v.currentTime; const now = performance.now();
          const W = (cv.current.width = v.videoWidth), H = (cv.current.height = v.videoHeight); ctx.clearRect(0, 0, W, H);
          const found = pose.detectForVideo(v, now).landmarks.map((L) => fit(L, W, H)).filter(Boolean);
          tracks.forEach((t) => t.seen++); const used = new Set(), draws = [];
          for (const b of found) { let best = null, bd = W * 0.25; tracks.forEach((t) => { if (used.has(t) || !t.last) return; const dd = Math.hypot(t.last.x - b.x, t.last.y - b.y); if (dd < bd) { bd = dd; best = t; } });
            if (!best) { best = mkTrack(); tracks.push(best); } used.add(best); best.seen = 0; best.last = b; const f = best.f;
            draws.push({ x: f.x(b.x, now), y: f.y(b.y, now), sw: f.sw(b.sw, now), ang: f.ang(b.ang, now), T: f.T(b.T, now), hem: f.hem(cut.aspect > 2.1 ? b.ankle * 0.97 : b.knee, now) }); }
          tracks = tracks.filter((t) => t.seen < 8); setMsg(found.length ? "" : "Stand in view - the dress fits automatically");
          draws.sort((p, q) => p.sw - q.sw).forEach((p) => { const u = [Math.cos(p.ang), Math.sin(p.ang)], dv = [-Math.sin(p.ang), Math.cos(p.ang)], w = cut.canvas.width;
            const pts = ROWS[kr.current === "top" ? "top" : "dress"].map(([dd, hw, sy]) => { const t = dd === "hem" ? p.hem : dd, c = [p.x + dv[0] * p.T * t, p.y + dv[1] * p.T * t]; return { L: [c[0] - u[0] * p.sw * hw, c[1] - u[1] * p.sw * hw], R: [c[0] + u[0] * p.sw * hw, c[1] + u[1] * p.sw * hw], sy: sy * cut.canvas.height }; });
            for (let i = 0; i < pts.length - 1; i++) { const A = pts[i], B = pts[i + 1], e = 0.6;
              tri(ctx, cut.canvas, [[0, A.sy], [w, A.sy], [0, B.sy + e]], [A.L, A.R, B.L]); tri(ctx, cut.canvas, [[w, A.sy], [w, B.sy + e], [0, B.sy + e]], [A.R, B.R, B.L]); } }); };
        loop();
      } catch (e) { setErr(e.name === "NotAllowedError" ? "Camera permission was denied. Allow it in your browser and try again." : e.name === "NotFoundError" ? "No camera found." : e.message || "Camera or tracker failed to start."); }
    })();
    return () => { stop = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); };
  }, [facing, cut]);
  const shot = () => { const c = document.createElement("canvas"), v = vid.current; c.width = v.videoWidth; c.height = v.videoHeight; const x = c.getContext("2d"); if (facing === "user") { x.translate(c.width, 0); x.scale(-1, 1); } x.drawImage(v, 0, 0); x.drawImage(cv.current, 0, 0);
    const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = "try-on.png"; a.click(); };
  return (
    <div className="live" role="dialog" aria-label="Live try-on">
      <div className="stage"><video ref={vid} muted playsInline className={facing === "user" ? "mir" : ""} /><canvas ref={cv} className={facing === "user" ? "mir" : ""} />{(msg || err) && <p className="lmsg">{err || msg}</p>}</div>
      <div className="row"><button className={`pill sm dk ${k === "dress" ? "on" : ""}`} onClick={() => setK("dress")}>Dress</button><button className={`pill sm dk ${k === "top" ? "on" : ""}`} onClick={() => setK("top")}>Top</button>
        <button className="pill sm dk" onClick={() => setFacing(facing === "user" ? "environment" : "user")}>Switch camera</button><button className="pill sm dk" onClick={shot}>Save photo</button><button className="pill sm dk on" onClick={onClose}>Close</button></div>
      <p className="mut dk">Fits up to 4 people, even when only your upper body is visible. Video is processed on your device and never uploaded.</p>
    </div>);
}
