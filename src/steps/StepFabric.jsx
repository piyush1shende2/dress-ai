import { Card, Chip } from "../components/Glass";
import { FABRICS, WEATHER } from "../data/catalog";
export default function StepFabric({ s, set }) {
  const p = s.profile;
  const toggle = (key, id) => { const o = key === "prefer" ? "avoid" : "prefer";
    set({ profile: { ...p, [key]: p[key].includes(id) ? p[key].filter((x) => x !== id) : [...p[key], id], [o]: p[o].filter((x) => x !== id) } }); };
  return (<div className="grid two">
    <Card title="3 · Select the dress material">
      <div className="row">{FABRICS.map((f) => (<Chip key={f.id} active={s.fabric === f.id} onClick={() => set({ fabric: f.id })}>
        <span className="dot" style={{ background: f.color }} /> {f.label}</Chip>))}</div>
    </Card>
    <Card title="Comfort profile (optional)">
      <p className="muted">Fabrics you love</p>
      <div className="row">{FABRICS.map((f) => (<Chip key={f.id} active={p.prefer.includes(f.id)} onClick={() => toggle("prefer", f.id)}>{f.label}</Chip>))}</div>
      <p className="muted">Fabrics you avoid</p>
      <div className="row">{FABRICS.map((f) => (<Chip key={f.id} tone="warn" active={p.avoid.includes(f.id)} onClick={() => toggle("avoid", f.id)}>{f.label}</Chip>))}</div>
      <p className="muted">Weather</p>
      <div className="row">{WEATHER.map((w) => (<Chip key={w.id} active={p.weather === w.id} onClick={() => set({ profile: { ...p, weather: w.id } })}>{w.label}</Chip>))}</div>
    </Card>
  </div>);
}
