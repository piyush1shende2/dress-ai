export function Card({ title, children, className = "" }) {
  return (<section className={`card ${className}`}>{title && <h3>{title}</h3>}{children}</section>);
}
export function Chip({ active, onClick, children, tone }) {
  return (<button type="button" className={`chip ${active ? "on" : ""} ${tone || ""}`} onClick={onClick}>{children}</button>);
}
export function Bars({ parts }) {
  return (<div className="bars">{Object.entries(parts).map(([k, v]) => (
    <div key={k} className="bar"><span>{k}</span><i style={{ width: `${Math.round(v)}%` }} /><b>{Math.round(v)}</b></div>))}</div>);
}
