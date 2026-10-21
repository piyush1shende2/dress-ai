import { useEffect, useState } from "react";
import * as THREE from "three";
import DropBox from "./DropBox";
import LiveTryOn from "./LiveTryOn";
import { analyseFace, cutoutDress, loadImage } from "../services/vision";
import { HAIR_STYLES, SKIN_TONES } from "../three/mannequin";
// Opaque texture for the podium garment: cut-out dress flattened onto its own average colour.
function texture(cut) { const c = document.createElement("canvas"); c.width = cut.canvas.width; c.height = cut.canvas.height; const x = c.getContext("2d"); x.fillStyle = cut.color; x.fillRect(0, 0, c.width, c.height); x.drawImage(cut.canvas, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
export default function TryOnStudio({ onShow, studio, setStudio, group }) {
  const [face, setFace] = useState(null), [dress, setDress] = useState(null), [busy, setBusy] = useState(""), [err, setErr] = useState({}), [live, setLive] = useState(false), [kind, setKind] = useState("dress"), [sleeves, setSleeves] = useState(false);
  const patch = (p) => setStudio((s) => ({ ...s, ...p }));
  useEffect(() => () => { face && URL.revokeObjectURL(face.url); }, [face]);
  async function onFace(f) { setBusy("face"); setErr((e) => ({ ...e, face: "" })); try { const img = await loadImage(f), a = await analyseFace(img); setFace({ url: img.src, ...a }); } catch (e) { setErr((x) => ({ ...x, face: e.message })); } setBusy(""); }
  async function onDress(f) { setBusy("dress"); setErr((e) => ({ ...e, dress: "" })); try { const img = await loadImage(f), cut = cutoutDress(img); setDress({ url: cut.canvas.toDataURL(), cut }); setKind(cut.aspect > 1.35 ? "dress" : "top"); } catch (e) { setErr((x) => ({ ...x, dress: e.message })); } setBusy(""); }
  const ready = face && dress && group !== "k";
  const apply = () => { onShow(); patch({ realistic: true, skin: face.skin, hair: face.hair, hairColor: face.hairColor, garment: { kind, sleeves, tex: texture(dress.cut) } }); };
  return (
    <div className="studio">
      <div className="boxes">
        <div><DropBox label="Face photo" hint="Front-facing, good light" preview={face?.url} busy={busy === "face"} error={err.face} onFile={onFace} onClear={() => setFace(null)} />
          {face && <p className="mut dk">Detected skin <i className="chip" style={{ background: face.skin }} /> · hair {face.hairFound ? face.hair : "not clear"} {face.hairFound && <i className="chip" style={{ background: face.hairColor }} />}</p>}</div>
        <div><DropBox label="Dress photo" hint="Product photo on a plain background" preview={dress?.url} busy={busy === "dress"} error={err.dress} onFile={onDress} onClear={() => setDress(null)} />
          {dress && <div className="row"><button className={`pill sm dk ${kind === "dress" ? "on" : ""}`} onClick={() => setKind("dress")}>Dress</button><button className={`pill sm dk ${kind === "top" ? "on" : ""}`} onClick={() => setKind("top")}>Top</button>
            <button className={`pill sm dk ${sleeves ? "on" : ""}`} onClick={() => setSleeves(!sleeves)}>Sleeves</button></div>}</div>
      </div>
      <div className="row">
        <button className="cta" disabled={!ready} onClick={apply} title={ready ? "" : "Add a face photo and a dress photo first"}>Try on podium</button>
        <button className="cta light" disabled={!dress} onClick={() => setLive(true)} title={dress ? "" : "Add a dress photo first"}>Try on me</button>
      </div>
      {group === "k" && <p className="mut dk">Realistic mannequins are available for Men and Women models.</p>}
      <div className="opts">
        <label><input type="checkbox" checked={!!studio.realistic} onChange={(e) => patch({ realistic: e.target.checked })} /> Realistic mannequin</label>
        <div className="row">Skin {SKIN_TONES.map((t) => <button key={t} aria-label={`Skin ${t}`} className={`sw ${studio.skin === t ? "on" : ""}`} style={{ background: t }} onClick={() => patch({ skin: t, realistic: true })} />)}</div>
        <div className="row">Hair {HAIR_STYLES.map(([k, l]) => <button key={k} className={`pill sm dk ${studio.hair === k ? "on" : ""}`} onClick={() => patch({ hair: k, realistic: true })}>{l}</button>)}
          <input type="color" aria-label="Hair colour" value={studio.hairColor} onChange={(e) => patch({ hairColor: e.target.value })} /></div>
        <label>Height {Math.round(studio.height * 100)} cm <input type="range" min="1.45" max="1.95" step="0.01" value={studio.height} onChange={(e) => patch({ height: +e.target.value })} /></label>
      </div>
      {live && dress && <LiveTryOn cut={dress.cut} kind={kind} onClose={() => setLive(false)} />}
    </div>);
}
