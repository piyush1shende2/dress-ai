import { Card, Chip } from "../components/Glass";
import { DRESS_TYPES, SIZES, FITS } from "../data/catalog";
import { predictSize } from "../utils/recommend";
export default function StepDress({ s, set }) {
  const p = s.profile, pred = predictSize(p.chest, p.fit);
  return (<div className="grid two">
    <Card title="1 · Choose a dress type">
      <div className="row">{DRESS_TYPES.map((d) => (
        <Chip key={d.id} active={s.type === d.id} onClick={() => set({ type: d.id })}>{d.icon} {d.label}</Chip>))}</div>
    </Card>
    <Card title="2 · Pick a size">
      <div className="row">{SIZES.map((z) => (
        <Chip key={z.id} active={s.size === z.id} onClick={() => set({ size: z.id })}>{z.id}</Chip>))}</div>
      <p className="muted">Your chest: {p.chest} cm</p>
      <input type="range" min="80" max="115" value={p.chest} onChange={(e) => set({ profile: { ...p, chest: +e.target.value } })} />
      <div className="row">{FITS.map((f) => (<Chip key={f} active={p.fit === f} onClick={() => set({ profile: { ...p, fit: f } })}>{f}</Chip>))}</div>
      <p className="muted">Suggested size: <b>{pred.id}</b>. Check the brand's own size chart before buying.</p>
    </Card>
  </div>);
}
