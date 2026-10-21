const P = {
  TORSO: "M66 90 L134 90 L128 208 L72 208Z", KURTA: "M66 90 L134 90 L140 278 L60 278Z", SHER: "M66 90 L134 90 L138 300 L62 300Z",
  LEH: "M74 195 L126 195 L172 392 L28 392Z", DRESS: "M66 90 L134 90 L128 168 L162 345 L38 345 L72 168Z", SAREE: "M72 198 L128 198 L138 392 L62 392Z",
};
const rad = (d) => (d * Math.PI) / 180, L = 52;
const cut = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
function arm(side, [a1, a2]) {
  const s = side < 0 ? [68, 98] : [132, 98];
  const e = [s[0] + side * Math.sin(rad(a1)) * L, s[1] + Math.cos(rad(a1)) * L];
  return { s, e, w: [e[0] + side * Math.sin(rad(a2)) * L, e[1] + Math.cos(rad(a2)) * L] };
}
const pts = (a) => a.map((p) => p.join(",")).join(" ");
const sleeve = (A, cover, c, w = 15) => <polyline points={pts(cover <= 1 ? [A.s, cut(A.s, A.e, cover)] : [A.s, A.e, cut(A.e, A.w, cover - 1)])} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
const SLEEVE = { tshirt: 0.5, shirt: 2, kurta: 1.5, sherwani: 2, dress: 0.45, lehenga: 0.45, saree: 0.45, pants: 0.5 };
export default function Figure({ model, kind, color, accent, pattern, sheen = 1, pose }) {
  const kid = model.group === "k", sx = kid ? 0.74 : 1, sy = kid ? 0.66 : model.h;
  const id = `p${pattern}${color.slice(1)}`, plain = pattern === "plain" || pattern === "border";
  const fill = plain ? color : `url(#${id})`, fin = model.finish, limb = model.wood ? "#d9b184" : fin;
  const [la, ra] = pose.a, [lx, ly, rx, ry] = pose.l, A = [arm(-1, la), arm(1, ra)];
  const bodyT = `translate(100 0) scale(${model.build} 1) translate(-100 0)`;
  const full = ["saree", "lehenga", "dress", "kurta", "sherwani", "tshirt", "shirt"].includes(kind);
  const bottom = ["tshirt", "shirt"].includes(kind) ? "#262630" : ["kurta", "sherwani"].includes(kind) ? "#e8e2d6" : null;
  const legs = (f) => (<g><path d="M72 206 L128 206 L127 232 L73 232Z" fill={f} />
    <line x1="87" y1="222" x2={lx} y2={ly + 2} stroke={f} strokeWidth="24" /><line x1="113" y1="222" x2={rx} y2={ry + 2} stroke={f} strokeWidth="24" /></g>);
  const hem = pattern === "border" ? (y, d = 0) => <path d={`M${60 - d} ${y - 14} L${140 + d} ${y - 14} L${142 + d} ${y} L${58 - d} ${y}Z`} fill={accent} /> : () => null;
  const tee = "#ece7df";
  return (
    <svg viewBox="0 0 200 420" width="100%" height="100%" style={{ filter: `saturate(${sheen})` }}>
      <defs>
        {pattern === "stripe" && <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill={color} /><rect width="2" height="8" fill={accent} opacity=".7" /></pattern>}
        {pattern === "dots" && <pattern id={id} width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill={color} /><circle cx="4.5" cy="4.5" r="1.5" fill={accent} /></pattern>}
        {pattern === "check" && <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill={color} /><rect width="5" height="10" fill={accent} opacity=".3" /><rect width="10" height="5" fill={accent} opacity=".3" /></pattern>}
      </defs>
      <g transform={`translate(100 400) scale(${sx} ${sy}) translate(-100 -400)`}>
        <g transform={bodyT}>
          {[[87, lx, ly], [113, rx, ry]].map(([x, ax, ay]) => (<g key={x}><line x1={x} y1="214" x2={ax} y2={ay} stroke={fin} strokeWidth="19" strokeLinecap="round" />
            <ellipse cx={ax - 3} cy={ay + 10} rx="13" ry="5" fill={model.finish === "#34343a" ? "#16161a" : "#c9c3b8"} /></g>))}
          <rect x="94" y="66" width="12" height="28" fill={limb === fin ? fin : fin} />
          {!full && <path d={P.TORSO} fill={tee} />}
          {bottom && legs(bottom)}{kind === "pants" && legs(fill)}
          {kind === "tshirt" && <><path d={P.TORSO} fill={fill} />{hem(208)}</>}
          {kind === "shirt" && <><path d={P.TORSO} fill={fill} /><path d="M90 90 L100 108 L110 90Z" fill="#fff" />{hem(208)}</>}
          {kind === "kurta" && <><path d={P.KURTA} fill={fill} /><path d="M92 90 L100 120 L108 90Z" fill={accent} />{hem(278, 2)}</>}
          {kind === "sherwani" && <><path d={P.SHER} fill={fill} /><line x1="100" y1="92" x2="100" y2="298" stroke={accent} strokeWidth="2" />{[120, 150, 180, 210, 240].map((y) => <circle key={y} cx="100" cy={y} r="2.6" fill={accent} />)}{hem(300, 2)}</>}
          {kind === "dress" && <><path d={P.DRESS} fill={fill} />{hem(345, 10)}</>}
          {kind === "lehenga" && <><path d={P.LEH} fill={fill} />{pattern === "border" && <path d="M34 372 L166 372 L172 392 L28 392Z" fill={accent} />}<path d="M66 90 L134 90 L130 152 L70 152Z" fill={accent} /><path d="M62 92 L78 92 L98 330 L80 330Z" fill={accent} opacity=".85" /></>}
          {kind === "saree" && <><path d={P.SAREE} fill={fill} />{[90, 100, 110].map((x) => <line key={x} x1={x} y1="204" x2={x + (x - 100) * 0.6} y2="390" stroke={accent} strokeOpacity=".5" />)}{pattern === "border" && <path d="M62 372 L138 372 L138 392 L62 392Z" fill={accent} />}<path d="M66 90 L134 90 L130 150 L70 150Z" fill={accent} /><path d="M64 92 L90 92 L134 200 L132 330 L112 330 L108 214Z" fill={fill} opacity=".95" /></>}
          {A.map((a, i) => (<g key={i}><polyline points={pts([a.s, a.e, a.w])} fill="none" stroke={limb} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" /><ellipse cx={a.w[0]} cy={a.w[1] + 3} rx="6" ry="8" fill={limb} /></g>))}
          {A.map((a, i) => <g key={"s" + i}>{sleeve(a, SLEEVE[kind], kind === "saree" || kind === "lehenga" ? accent : kind === "pants" ? tee : fill, kind === "shirt" || kind === "sherwani" ? 14 : 15)}</g>)}
        </g>
        <g transform={kid ? "translate(100 72) scale(1.25) translate(-100 -72)" : undefined}>
          <ellipse cx="100" cy="48" rx="16.5" ry="23" fill={fin} /><ellipse cx="94" cy="40" rx="4.5" ry="11" fill="#fff" opacity=".3" />
        </g>
      </g>
    </svg>);
}
