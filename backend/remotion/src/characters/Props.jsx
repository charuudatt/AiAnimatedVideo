import React from "react";
import { useCurrentFrame } from "remotion";

function Wrap({ children, size = 90 }) {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.1) * 4;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ transform: `translateY(${bob}px)`, overflow: "visible" }}>
      {children}
    </svg>
  );
}

const PROP_RENDERERS = {
  food: () => (
    <Wrap>
      <ellipse cx={50} cy={65} rx={38} ry={16} fill="#92400e" />
      <ellipse cx={50} cy={58} rx={34} ry={13} fill="#f59e0b" />
      <circle cx={40} cy={54} r={5} fill="#dc2626" />
      <circle cx={55} cy={50} r={5} fill="#16a34a" />
      <circle cx={62} cy={56} r={5} fill="#eab308" />
    </Wrap>
  ),
  water: () => (
    <Wrap>
      <path d="M50,15 C65,40 75,55 75,68 A25,25 0 0,1 25,68 C25,55 35,40 50,15 Z" fill="#38bdf8" />
      <ellipse cx={42} cy={62} rx={6} ry={9} fill="#bae6fd" opacity={0.7} />
    </Wrap>
  ),
  mountain: () => (
    <Wrap>
      <path d="M10,80 L40,30 L58,55 L72,35 L92,80 Z" fill="#78716c" />
      <path d="M40,30 L48,42 L32,42 Z" fill="#f8fafc" />
    </Wrap>
  ),
  tree: () => (
    <Wrap>
      <rect x={44} y={55} width={12} height={30} fill="#78350f" />
      <circle cx={50} cy={40} r={28} fill="#16a34a" />
    </Wrap>
  ),
  sun: () => (
    <Wrap>
      <circle cx={50} cy={50} r={22} fill="#facc15" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = 50 + Math.cos(angle) * 30;
        const y1 = 50 + Math.sin(angle) * 30;
        const x2 = 50 + Math.cos(angle) * 42;
        const y2 = 50 + Math.sin(angle) * 42;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#facc15" strokeWidth={5} strokeLinecap="round" />;
      })}
    </Wrap>
  ),
  moon: () => (
    <Wrap>
      <path d="M62,20 A32,32 0 1 0 62,80 A24,24 0 1 1 62,20 Z" fill="#e2e8f0" />
    </Wrap>
  ),
  fire: () => (
    <Wrap>
      <path d="M50,15 C65,35 62,45 55,50 C60,40 50,35 48,45 C40,40 42,55 50,60 C35,55 30,40 40,25 C38,35 45,30 50,15 Z" fill="#f97316" />
      <path d="M50,45 C56,55 54,62 48,64 C52,58 46,55 50,45 Z" fill="#facc15" />
    </Wrap>
  ),
  house: () => (
    <Wrap>
      <rect x={25} y={50} width={50} height={35} fill="#f59e0b" />
      <path d="M18,52 L50,22 L82,52 Z" fill="#7c2d12" />
      <rect x={45} y={62} width={12} height={23} fill="#78350f" />
    </Wrap>
  ),
};

export function PropIcon({ type, size }) {
  const renderer = PROP_RENDERERS[type];
  if (!renderer) return null;
  return renderer(size);
}
