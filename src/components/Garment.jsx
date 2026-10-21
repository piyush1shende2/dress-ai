// Simple SVG garment preview (colour = fabric, width = size).
export default function Garment({ color, scale = 1, type = "tshirt", style }) {
  const longSleeve = type !== "tshirt";
  return (
    <svg viewBox="0 0 200 220" style={{ ...style, transform: `scaleX(${scale})` }}>
      <path d={longSleeve ? "M60 20 L5 70 L22 200 L50 195 L50 205 Q100 215 150 205 L150 195 L178 200 L195 70 L140 20 Q100 40 60 20Z"
        : "M60 20 L10 55 L30 90 L50 78 L50 205 Q100 215 150 205 L150 78 L170 90 L190 55 L140 20 Q100 40 60 20Z"}
        fill={color} fillOpacity=".82" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
    </svg>);
}
