import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

// Build helper: writes sw.js (service worker) so the site keeps working offline after the first visit.
// App files + 3D models are cached up front; the large MediaPipe files are cached the first time they are used.
function offlineCache() {
  const walk = (dir, base = "") =>
    fs.existsSync(dir)
      ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
          e.isDirectory()
            ? e.name === "mediapipe" ? [] : walk(path.join(dir, e.name), base + e.name + "/")
            : e.name.endsWith(".task") ? [] : [base + e.name])
      : [];
  return {
    name: "offline-cache",
    generateBundle(_, bundle) {
      const files = ["./", ...new Set([...Object.keys(bundle), ...walk(path.resolve("public"))])];
      const version = Date.now().toString(36);
      const sw = `const CORE = "dress-core-${version}", RUNTIME = "dress-runtime";
const FILES = ${JSON.stringify(files)};
const scope = (p) => new URL(p, self.registration.scope).href;
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CORE).then((c) => c.addAll(FILES.map(scope))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith("dress-core-") && k !== CORE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match(scope("./"), { ignoreSearch: true })));
    return;
  }
  const same = url.origin === self.location.origin;
  const font = /(^|\\.)fonts\\.(googleapis|gstatic)\\.com$/.test(url.hostname);
  if (!same && !font) return;
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => {
      if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(RUNTIME).then((c) => c.put(req, copy)); }
      return res;
    });
    return hit || net.catch(() => hit);
  }));
});
`;
      this.emitFile({ type: "asset", fileName: "sw.js", source: sw });
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineCache()],
  // Relative base so the built site works on GitHub Pages under any repo name
  base: "./",
});
