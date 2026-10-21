import { Card, Bars } from "../components/Glass";
import Garment from "../components/Garment";
import { scoreGarment } from "../utils/recommend";
import { SIZES } from "../data/catalog";
export default function StepResult({ s }) {
  const r = scoreGarment({ size: s.size, fabricId: s.fabric, profile: s.profile });
  const size = SIZES.find((z) => z.id === s.size);
  const scale = Math.min(1.25, Math.max(0.8, size.chest / (s.profile.chest + 8)));
  return (<div className="grid two">
    <Card title="5 · How it looks on you">
      <div className="stage" style={s.photo ? { backgroundImage: `url(${s.photo})` } : {}}>
        {!s.photo && <span className="muted">Add a photo in step 4 to preview on yourself.</span>}
        <Garment type={s.type} color={r.fabric.color} scale={scale} style={{ position: "absolute", left: "25%", top: "30%", width: "50%" }} />
      </div>
      <p className="muted">Approximate overlay preview. Connect a try-on model in src/services/tryOn.js for realistic rendering.</p>
    </Card>
    <Card title="Comfort & fit score">
      <div className="score"><b>{r.total}</b><span>/100</span></div>
      <Bars parts={r.parts} />
      <ul>{r.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
      <p className="muted">A recommendation, not a guarantee of comfort.</p>
    </Card>
  </div>);
}
