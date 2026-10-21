import { useRef, useState } from "react";
const OK = ["image/jpeg", "image/png", "image/webp"], MAX = 10 * 1024 * 1024;
// Big click-or-drop box. Calls onFile(File) with a validated image.
export default function DropBox({ label, hint, preview, onFile, onClear, busy, error }) {
  const input = useRef(null), [over, setOver] = useState(false), [err, setErr] = useState("");
  const take = (f) => { if (!f) return; if (!OK.includes(f.type)) return setErr("Use a JPG, PNG or WebP image."); if (f.size > MAX) return setErr("Image is over 10 MB."); setErr(""); onFile(f); };
  return (
    <div className={`drop ${over ? "over" : ""}`} role="button" tabIndex={0} aria-label={label}
      onClick={() => input.current.click()} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); }}>
      <input ref={input} type="file" accept={OK.join(",")} hidden onChange={(e) => { take(e.target.files[0]); e.target.value = ""; }} />
      {preview ? <img src={preview} alt={label} /> : <div className="ph"><b>{label}</b><span>{hint}</span><small>Click to browse or drag &amp; drop</small></div>}
      {busy && <div className="busy">Analysing…</div>}
      {preview && <button className="x" aria-label="Remove image" onClick={(e) => { e.stopPropagation(); onClear(); }}>×</button>}
      {(err || error) && <p className="derr">{err || error}</p>}
    </div>);
}
