export function Curve({ flip = false }: { flip?: boolean }) {
  return (
    <svg width="33" height="40" viewBox="0 0 33 40" fill="none" className="absolute left-4"
      style={flip ? { bottom: 0 } : { top: -8 }}>
      <path
        d={flip ? "M32.5 0 C32.5 20, 0.5 20, 0.5 40" : "M0.5 0 C0.5 20, 32.5 20, 32.5 40"}
        stroke="#30363d"
      />
    </svg>
  );
}