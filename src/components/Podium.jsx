import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildFigure, disposeTree } from "../three/figure";
import { buildMannequin } from "../three/mannequin";
// Real 3D podium: a procedural mannequin you can orbit by dragging. spin: 1 anticlockwise, -1 clockwise, 0 stopped.
export default function Podium({ spin, snap, ...fig }) {
  const box = useRef(null), st = useRef({ ang: -0.3, spin, drag: null }), three = useRef({});
  st.current.spin = spin;
  useEffect(() => { st.current.ang = (snap.a * Math.PI) / 180; }, [snap]);
  useEffect(() => {
    const el = box.current, r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.toneMapping = THREE.ACESFilmicToneMapping; el.prepend(r.domElement);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50), turn = new THREE.Group(); scene.add(turn);
    cam.position.set(0, 1.2, 4.7); cam.lookAt(0, 0.85, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6a3000, 1.1));
    [[0xffffff, 2, [2, 3, 3]], [0xff7a00, 2.2, [-3, 2, -3]], [0xffd2a0, 0.8, [-2, 1, 3]]].forEach(([c, i, p]) => { const l = new THREE.DirectionalLight(c, i); l.position.set(...p); scene.add(l); });
    const side = new THREE.MeshStandardMaterial({ color: 0xff7a00, roughness: 0.4 }), top = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.16, 64), [side, top, side]); pod.position.y = -0.08; turn.add(pod);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: 0xffa13a })); ring.rotation.x = Math.PI / 2; turn.add(ring);
    const size = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); const ro = new ResizeObserver(size); ro.observe(el); let id;
    const tick = () => { const s = st.current; if (s.drag === null) s.ang += 0.006 * s.spin; turn.rotation.y = s.ang; r.render(scene, cam); id = requestAnimationFrame(tick); };
    tick(); three.current = { turn }; 
    return () => { cancelAnimationFrame(id); ro.disconnect(); disposeTree(scene); r.dispose(); r.domElement.remove(); };
  }, []);
  useEffect(() => {
    const t = three.current.turn; if (!t) return; let dead = false, f;
    const s = fig.studio, g = fig.model.group; if (!fig.show) return;
    if (s?.realistic && g !== "k") buildMannequin({ gender: g, skin: s.skin, hair: s.hair, hairColor: s.hairColor, height: s.height, garment: s.garment })
      .then((o) => { if (dead) return disposeTree(o); f = o; t.add(f); }).catch(() => { f = buildFigure(fig); t.add(f); });
    else { f = buildFigure(fig); t.add(f); }
    return () => { dead = true; if (f) { t.remove(f); disposeTree(f); } };
  }, [fig.model, fig.kind, fig.color, fig.accent, fig.pattern, fig.mat, fig.pose, fig.studio, fig.show]);
  const down = (e) => { st.current.drag = e.clientX; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => { const s = st.current; if (s.drag === null) return; s.ang += (e.clientX - s.drag) * 0.012; s.drag = e.clientX; };
  return (
    <div className="scene" ref={box} onPointerDown={down} onPointerMove={move} onPointerUp={() => (st.current.drag = null)} role="img" aria-label="3D podium preview. Drag to rotate.">
      <p className="hint">{fig.show ? "Drag to rotate" : "Choose a model to place it on the podium"}</p>
    </div>);
}
