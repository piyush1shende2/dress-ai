// Plug a real virtual try-on model/API here (hosted try-on endpoint).
// Input: person photo (data URL) + garment config. Output: image URL/data URL.
// The default UI uses a lightweight SVG overlay preview instead.
export async function generateTryOn(/* photo, garment */) {
  throw new Error("Not configured: connect a virtual try-on API in src/services/tryOn.js");
}
