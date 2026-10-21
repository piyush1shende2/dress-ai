import { useState, useMemo } from "react";
import Podium from "./components/Podium";
import TryOnStudio from "./studio/TryOnStudio";
import { MODELS, GROUPS, TYPES, PALETTE, SUGGEST, MATERIALS, SIZES, POSTURES, TONES, designsFor } from "./data/wardrobe";
const tile = (p, c, a) => ({ background: p === "stripe" ? `repeating-linear-gradient(90deg,${c} 0 6px,${a} 6px 8px)` : p === "dots" ? `radial-gradient(${a} 2px,transparent 2.5px) 0 0/10px 10px,${c}`
  : p === "check" ? `linear-gradient(90deg,${a}55 50%,transparent 50%) 0 0/12px 12px,linear-gradient(${a}55 50%,transparent 50%) 0 0/12px 12px,${c}` : p === "border" ? `linear-gradient(transparent 70%,${a} 70%),${c}` : c });
export default function App() {
  const [group, setGroup] = useState("f"), [modelId, setModelId] = useState("f1"), [typeId, setTypeId] = useState("saree");
  const [di, setDi] = useState(0), [custom, setCustom] = useState(null), [size, setSize] = useState("M"), [mat, setMat] = useState("silk");
  const [pose, setPose] = useState("stand"), [paused, setPaused] = useState(false), [dir, setDir] = useState(-1), [snap, setSnap] = useState({ a: 0, n: 0 }), [tone, setTone] = useState("wheat");
  const [picked, setPicked] = useState(false), [studio, setStudio] = useState({ realistic: true, skin: "#d9a577", hair: "short", hairColor: "#2b1d14", height: 1.7, garment: null });
  const model = MODELS.find((m) => m.id === modelId), types = TYPES.filter((t) => t.for.includes(model.group));
  const type = types.find((t) => t.id === typeId) || types[0], designs = useMemo(() => designsFor(type), [type]);
  const design = designs[di], color = custom || design.color, sw = PALETTE.find((p) => p.h === color), accent = sw ? sw.a : "#ffffff";
  const sug = SUGGEST[tone], sugHex = sug.names.map((n) => PALETTE.find((p) => p.n === n));
  const pickGroup = (g) => { setGroup(g); setModelId(MODELS.find((m) => m.group === g).id); setDi(0); setCustom(null); };
  const colourName = sw ? sw.n : "Custom";
  return (
    <div className="page">
      <header className="top">
        <div className="logo">DRESS<span>IFY</span></div>
        <nav><a className="on" href="#studio">Studio</a><a href="#studio">Models</a><a href="#studio">Colours</a></nav>
        <a className="cta light" href="#studio">Start styling</a>
      </header>
      <section className="hero" id="studio">
        <div className="left">
          <h1>Try the look,<br />skip the awkward selfie.</h1>
          <p className="lead">Pick a model who feels like you, choose a dress, and play with colours on a spinning podium.</p>
          <div className="card">
            <h3><b>01/</b> choose a model</h3>
            <div className="row">{GROUPS.map(([g, l]) => <button key={g} className={`pill ${g === group ? "on" : ""}`} onClick={() => pickGroup(g)}>{l}</button>)}</div>
            <div className="row">{MODELS.filter((m) => m.group === group).map((m) => (
              <button key={m.id} className={`face ${m.id === modelId ? "on" : ""}`} onClick={() => { setModelId(m.id); setPicked(true); }}>
                <i style={{ background: m.finish }} />{m.name}</button>))}</div>
          </div>
          <div className="card">
            <h3><b>02/</b> pick a dress type</h3>
            <div className="row">{types.map((t) => <button key={t.id} className={`pill ${t.id === type.id ? "on" : ""}`} onClick={() => { setTypeId(t.id); setDi(0); setCustom(null); }}>{t.label}</button>)}</div>
            <h3 className="sub">12 {type.label.toLowerCase()} designs</h3>
            <div className="tiles">{designs.map((d, i) => (
              <button key={d.id} className={`tile ${i === di ? "on" : ""}`} onClick={() => { setDi(i); setCustom(null); }} aria-label={d.name}>
                <span style={tile(d.pattern, d.color, (PALETTE.find((p) => p.h === d.color) || {}).a || "#fff")} />{d.name}</button>))}</div>
          </div>
          <div className="card">
            <h3><b>03/</b> choose a colour</h3>
            <p className="mut">Your skin tone, so we can suggest colours</p>
            <div className="row">{Object.entries(TONES).map(([k, h]) => <button key={k} title={k} className={`sw ${tone === k ? "on" : ""}`} style={{ background: h }} onClick={() => setTone(k)} />)}</div>
            <p className="mut">Suggested for you: {sug.why}</p>
            <div className="row">{sugHex.map((p) => <button key={p.n} title={p.n} className={`sw star ${color === p.h ? "on" : ""}`} style={{ background: p.h }} onClick={() => setCustom(p.h)} />)}</div>
            <p className="mut">All colours</p>
            <div className="row">{PALETTE.map((p) => <button key={p.n} title={p.n} className={`sw ${color === p.h ? "on" : ""}`} style={{ background: p.h }} onClick={() => setCustom(p.h)} />)}</div>
            <div className="row">{SIZES.map((s) => <button key={s} className={`pill sm ${s === size ? "on" : ""}`} onClick={() => setSize(s)}>{s}</button>)}</div>
            <div className="row">{MATERIALS.map((m) => <button key={m.id} className={`pill sm ${m.id === mat ? "on" : ""}`} onClick={() => setMat(m.id)}>{m.label}</button>)}</div>
            <p className="mut">{MATERIALS.find((m) => m.id === mat).note}</p>
          </div>
        </div>
        <div className="right">
          <Podium spin={paused ? 0 : dir} snap={snap} pose={POSTURES.find((p) => p.id === pose)} model={model} kind={type.id} color={color} accent={accent} pattern={design.pattern} mat={mat} studio={studio} show={picked}/>
          <TryOnStudio onShow={() => setPicked(true)} studio={studio} setStudio={setStudio} group={group} />
          <div className="ctrl">
            <div className="row">{POSTURES.map((p) => <button key={p.id} className={`pill sm dk ${p.id === pose ? "on" : ""}`} onClick={() => setPose(p.id)}>{p.label}</button>)}</div>
            <div className="row">
              <button className="pill sm dk on" onClick={() => setPaused(!paused)}>{paused ? "Resume podium" : "Stop podium"}</button>
              <button className="pill sm dk" onClick={() => { setDir(-1); setPaused(false); }} aria-label="Rotate clockwise">Clockwise ↻</button>
              <button className="pill sm dk" onClick={() => { setDir(1); setPaused(false); }} aria-label="Rotate anticlockwise">Anticlockwise ↺</button>
              {[["Front", 0], ["Side", 90], ["Back", 180]].map(([l, d]) => <button key={l} className="pill sm dk" onClick={() => { setSnap({ a: d, n: snap.n + 1 }); setPaused(true); }}>{l} view</button>)}
            </div>
          </div>
          <h2 className="big">{picked ? <>{type.label}<br /><em>on {model.name}</em></> : <>Pick a model<br /><em>to start</em></>}</h2>
          <div className="look"><b>{design.name} {type.label.toLowerCase()}</b><span>{colourName}, size {size}, {MATERIALS.find((m) => m.id === mat).label.toLowerCase()}</span></div>
          <div className="orange"><small>colour tip</small>{sug.why}</div>
        </div>
      </section>
    </div>);
}
