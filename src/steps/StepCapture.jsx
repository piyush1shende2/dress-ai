import { Card } from "../components/Glass";
import useCamera from "../hooks/useCamera";
import { FABRICS } from "../data/catalog";
export default function StepCapture({ s, set }) {
  const cam = useCamera(); const f = FABRICS.find((x) => x.id === s.fabric);
  const upload = (e) => { const file = e.target.files[0]; if (!file) return;
    const r = new FileReader(); r.onload = () => set({ photo: r.result }); r.readAsDataURL(file); };
  return (<div className="grid two">
    <Card title={`4 · Hold your ${f.label.toLowerCase()} fabric in front of the camera`}>
      <video ref={cam.videoRef} className="video" muted playsInline />
      {cam.error && <p className="error">{cam.error}</p>}
      <div className="row">
        {!cam.on ? <button className="btn" onClick={cam.start}>Start camera</button> : <>
          {!cam.recording ? <button className="btn" onClick={cam.record}>Record fabric clip</button> : <button className="btn warn" onClick={cam.stop}>Stop</button>}
          <button className="btn ghost" onClick={() => set({ photo: cam.snapshot() })}>Take photo of me</button>
          <button className="btn ghost" onClick={cam.close}>Close camera</button></>}
      </div>
      <p className="muted">A video can't measure softness or breathability, so the material you picked drives the score. Nothing is uploaded; your clip stays in this browser.</p>
    </Card>
    <Card title="Your clip and photo">
      {cam.clip ? <video src={cam.clip} controls className="video" /> : <p className="muted">No fabric clip yet. This step is optional.</p>}
      {s.photo ? <img src={s.photo} alt="You" className="thumb" /> : <p className="muted">Add a full-body photo for the preview.</p>}
      <div className="row">
        <label className="btn ghost file">Upload a photo<input type="file" accept="image/*" hidden onChange={upload} /></label>
        {s.photo && <button className="btn ghost" onClick={() => set({ photo: null })}>Delete photo</button>}
      </div>
    </Card>
  </div>);
}
