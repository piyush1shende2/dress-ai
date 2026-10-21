// Edit this file to extend dress types, sizes and fabrics.
export const DRESS_TYPES = [
  { id: "tshirt", label: "T-shirt", icon: "👕" },
  { id: "shirt", label: "Shirt", icon: "👔" },
  { id: "hoodie", label: "Hoodie", icon: "🧥" },
  { id: "kurta", label: "Kurta", icon: "🥻" },
];
// chest = garment chest width in cm (illustrative; use real brand size charts)
export const SIZES = [
  { id: "S", chest: 92 }, { id: "M", chest: 98 },
  { id: "L", chest: 104 }, { id: "XL", chest: 110 },
];
// scores 0-10 (illustrative defaults, not lab measurements)
export const FABRICS = [
  { id: "cotton", label: "Cotton", soft: 8, breath: 9, stretch: 4, warm: 3, color: "#f6c89f" },
  { id: "linen", label: "Linen", soft: 6, breath: 10, stretch: 2, warm: 2, color: "#e9d8b4" },
  { id: "polyester", label: "Polyester", soft: 5, breath: 4, stretch: 6, warm: 6, color: "#a99bf0" },
  { id: "modal", label: "Modal", soft: 10, breath: 8, stretch: 7, warm: 4, color: "#f2a6d1" },
  { id: "wool", label: "Wool blend", soft: 4, breath: 5, stretch: 5, warm: 10, color: "#8d7bd8" },
];
export const WEATHER = [
  { id: "hot", label: "Hot & humid" }, { id: "mild", label: "Mild" }, { id: "cold", label: "Cold" },
];
export const FITS = ["Slim", "Regular", "Relaxed"];
