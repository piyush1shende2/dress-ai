import { useRef, useState } from "react";
export default function useCamera() {
  const videoRef = useRef(null), recRef = useRef(null), chunks = useRef([]);
  const [on, setOn] = useState(false), [recording, setRecording] = useState(false);
  const [clip, setClip] = useState(null), [error, setError] = useState("");
  async function start() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      videoRef.current.srcObject = s; await videoRef.current.play(); setOn(true); setError("");
    } catch { setError("Camera blocked. Allow camera access in your browser and try again."); }
  }
  function stop() { recRef.current?.stop(); setRecording(false); }
  function record() {
    const s = videoRef.current.srcObject; chunks.current = [];
    const r = new MediaRecorder(s); recRef.current = r;
    r.ondataavailable = (e) => chunks.current.push(e.data);
    r.onstop = () => setClip(URL.createObjectURL(new Blob(chunks.current, { type: "video/webm" })));
    r.start(); setRecording(true);
    setTimeout(() => recRef.current?.state === "recording" && stop(), 8000);
  }
  function snapshot() {
    const v = videoRef.current, c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d").drawImage(v, 0, 0);
    return c.toDataURL("image/jpeg", 0.9);
  }
  function close() { videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop()); setOn(false); }
  return { videoRef, on, recording, clip, error, start, record, stop, snapshot, close };
}
