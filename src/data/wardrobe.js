// Models, dress types, designs and colour suggestions. Extend freely.
export const TONES = { fair: "#f3d2b8", wheat: "#e2b38a", tan: "#b9835a", deep: "#7a4c30" };
const M = (id, name, group, finish, build, h) => ({ id, name, group, finish, build, h, wood: group === "k" });
// Mannequin finishes: white, ivory, pearl grey, graphite, champagne
export const MODELS = [
  M("m1", "Arjun", "m", "#f3f1ed", 1.05, 1), M("m2", "Kabir", "m", "#34343a", 0.95, 1.02), M("m3", "Rohan", "m", "#ece3d3", 1.12, 0.98),
  M("m4", "Imran", "m", "#d8d8dc", 1.0, 1.03), M("m5", "Dev", "m", "#e4d3b8", 0.92, 1),
  M("f1", "Anaya", "f", "#f3f1ed", 0.9, 0.96), M("f2", "Meera", "f", "#e4d3b8", 0.86, 0.94), M("f3", "Sara", "f", "#d8d8dc", 0.95, 0.97),
  M("f4", "Priya", "f", "#34343a", 1.0, 0.95), M("f5", "Isha", "f", "#ece3d3", 0.88, 0.98),
  M("k1", "Aarav", "k", "#e9dfcf", 1, 1), M("k2", "Tara", "k", "#f3f1ed", 1, 1), M("k3", "Vihaan", "k", "#ece3d3", 1.05, 1),
  M("k4", "Zoya", "k", "#d8d8dc", 1, 1), M("k5", "Kiaan", "k", "#e9dfcf", 0.95, 1),
];
// Angles in radians. arm = [swing(x), abduct(z), elbowBend(x), elbowInward(z)] for [side -1, side +1]; leg = [swing, abduct, knee]
export const POSTURES = [
  { id: "stand", label: "Standing", a: [[0.03, 0.12, -0.12, 0], [0.03, 0.12, -0.12, 0]], l: [[0, 0.03, 0], [0, 0.03, 0]] },
  { id: "hips", label: "Hands on hips", a: [[0, 0.62, -0.25, 1.25], [0, 0.62, -0.25, 1.25]], l: [[0, 0.05, 0], [0, 0.05, 0]] },
  { id: "out", label: "Arms out", a: [[0, 0.85, -0.1, 0], [0, 0.85, -0.1, 0]], l: [[0, 0.1, 0], [0, 0.1, 0]] },
  { id: "walk", label: "Walking", a: [[0.45, 0.1, -0.3, 0], [-0.45, 0.1, -0.5, 0]], l: [[-0.4, 0.04, 0.1], [0.35, 0.04, 0.55]] },
  { id: "casual", label: "One hand on hip", a: [[0.03, 0.12, -0.12, 0], [0, 0.62, -0.25, 1.25]], l: [[0, 0.03, 0], [-0.12, 0.14, 0.12]] },
  { id: "wave", label: "Hand raised", a: [[0.03, 0.12, -0.12, 0], [0, 2.55, 0, -0.5]], l: [[0, 0.03, 0], [0, 0.03, 0]] },
];
export const GROUPS = [["m", "Men"], ["f", "Women"], ["k", "Kids"]];
export const PALETTE = [
  { n: "Marigold", h: "#ff9f1c", a: "#fff3d6" }, { n: "Burnt orange", h: "#e8590c", a: "#ffe1c9" },
  { n: "Ivory", h: "#f4efe6", a: "#c9a24b" }, { n: "Black", h: "#1b1b1f", a: "#ff7a00" },
  { n: "Navy", h: "#1d2b53", a: "#f4efe6" }, { n: "Emerald", h: "#0f7b5f", a: "#f6d98a" },
  { n: "Maroon", h: "#7a1230", a: "#f6d98a" }, { n: "Royal blue", h: "#2b4fd8", a: "#ffffff" },
  { n: "Blush pink", h: "#f3b6c4", a: "#7a1230" }, { n: "Mint", h: "#a8dcc5", a: "#0f7b5f" },
  { n: "Sky", h: "#8ec5f2", a: "#1d2b53" }, { n: "Mustard", h: "#d9a406", a: "#1b1b1f" },
  { n: "Teal", h: "#157a8a", a: "#f4efe6" }, { n: "Lavender", h: "#b7a4ea", a: "#3b2a7a" },
  { n: "Olive", h: "#6b7a2a", a: "#f4efe6" }, { n: "Ruby red", h: "#c2123c", a: "#f6d98a" },
];
export const SUGGEST = {
  fair: { names: ["Emerald", "Maroon", "Royal blue", "Navy", "Ruby red", "Teal"], why: "Deep jewel shades add contrast against lighter skin." },
  wheat: { names: ["Teal", "Burnt orange", "Emerald", "Royal blue", "Maroon", "Mint"], why: "Warm undertones glow in earthy and rich cool shades." },
  tan: { names: ["Ivory", "Mustard", "Sky", "Mint", "Blush pink", "Royal blue"], why: "Light and bright shades lift medium-tan skin." },
  deep: { names: ["Marigold", "Ivory", "Blush pink", "Mint", "Lavender", "Sky"], why: "Bright and pastel shades pop beautifully on deeper skin." },
};
export const TYPES = [
  { id: "shirt", label: "Shirt", for: "mfk", seed: 0 }, { id: "tshirt", label: "T-shirt", for: "mfk", seed: 2 },
  { id: "pants", label: "Pants", for: "mfk", seed: 4 }, { id: "kurta", label: "Kurta", for: "mfk", seed: 6 },
  { id: "sherwani", label: "Sherwani", for: "mk", seed: 8 }, { id: "saree", label: "Saree", for: "f", seed: 10 },
  { id: "lehenga", label: "Lehenga", for: "fk", seed: 12 }, { id: "dress", label: "Dress", for: "fk", seed: 14 },
];
const STYLES = [["Classic", "plain"], ["Pinstripe", "stripe"], ["Polka", "dots"], ["Gingham", "check"], ["Zari border", "border"], ["Everyday", "plain"],
  ["Festive", "border"], ["Office", "stripe"], ["Weekend", "dots"], ["Heritage", "check"], ["Modern", "plain"], ["Signature", "border"]];
export const designsFor = (t) => STYLES.map(([name, pattern], i) => ({ id: i, name, pattern, color: PALETTE[(i * 3 + t.seed) % 16].h }));
export const MATERIALS = [
  { id: "cotton", label: "Cotton", note: "Soft and breathable. Great for warm days." },
  { id: "linen", label: "Linen", note: "Very airy, wrinkles easily." },
  { id: "silk", label: "Silk blend", note: "Smooth with a festive shine. Needs gentle care." },
  { id: "wool", label: "Wool blend", note: "Warm. Pick it for cool weather." },
];
export const SIZES = ["XS", "S", "M", "L", "XL"];
