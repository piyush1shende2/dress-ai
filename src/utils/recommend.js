import { SIZES, FABRICS } from "../data/catalog";
// Transparent scoring: fit 30, fabric 25, comfort 20, weather 15, budget 10 (initial weights, not validated).
export function predictSize(chestCm, fit = "Regular") {
  const ease = { Slim: 4, Regular: 8, Relaxed: 14 }[fit];
  const target = chestCm + ease;
  return SIZES.reduce((b, s) => (Math.abs(s.chest - target) < Math.abs(b.chest - target) ? s : b));
}
export function fitFeel(sizeId, chestCm) {
  const s = SIZES.find((x) => x.id === sizeId);
  const d = s.chest - chestCm;
  return d < 4 ? "may feel tight" : d < 14 ? "should feel regular" : "may feel loose";
}
export function scoreGarment({ size, fabricId, profile }) {
  const f = FABRICS.find((x) => x.id === fabricId);
  const s = SIZES.find((x) => x.id === size);
  const reasons = [];
  const ideal = predictSize(profile.chest, profile.fit);
  const fit = Math.max(0, 100 - Math.abs(s.chest - ideal.chest) * 4);
  reasons.push(`Size ${size} vs. suggested ${ideal.id} for a ${profile.fit.toLowerCase()} fit (${fitFeel(size, profile.chest)}).`);
  const blocked = profile.avoid.includes(fabricId);
  const fabric = blocked ? 0 : profile.prefer.includes(fabricId) ? 100 : 60;
  reasons.push(blocked ? `${f.label} is on your avoid list.` : profile.prefer.includes(fabricId) ? `${f.label} matches your preferred fabrics.` : `${f.label} is neutral for your preferences.`);
  const comfort = ((f.soft + f.breath + f.stretch) / 30) * 100;
  const wantWarm = { hot: 0, mild: 5, cold: 10 }[profile.weather];
  const weather = 100 - Math.abs(f.warm - wantWarm) * 10;
  reasons.push(profile.weather === "hot" && f.breath >= 8 ? "Breathable fabric suits hot weather." : `Warmth level ${f.warm}/10 vs. your ${profile.weather} climate.`);
  const budget = 80;
  const total = Math.round(fit * 0.3 + fabric * 0.25 + comfort * 0.2 + weather * 0.15 + budget * 0.1);
  return { total: blocked ? Math.min(total, 35) : total, parts: { fit, fabric, comfort, weather }, reasons, fabric: f };
}
