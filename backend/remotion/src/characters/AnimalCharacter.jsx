import React from "react";
import { useCurrentFrame } from "remotion";
import { getAnimalPose } from "./poseUtils.js";

const SPECIES = {
  elephant: { body: "#9ca3af", accent: "#6b7280", ear: "big", extra: "trunk" },
  cow: { body: "#f5f5f4", accent: "#78350f", ear: "small", extra: "horns" },
  lion: { body: "#d97706", accent: "#78350f", ear: "small", extra: "mane" },
  monkey: { body: "#92400e", accent: "#fde68a", ear: "round", extra: "longtail" },
  dog: { body: "#b45309", accent: "#78350f", ear: "floppy", extra: null },
  cat: { body: "#57534e", accent: "#1c1917", ear: "pointy", extra: null },
  horse: { body: "#78350f", accent: "#292524", ear: "small", extra: null },
  deer: { body: "#d6a77a", accent: "#78350f", ear: "small", extra: "antlers" },
  rabbit: { body: "#e5e5e5", accent: "#a3a3a3", ear: "long", extra: null },
};

function Quadruped({ species, pose, frame, mirror }) {
  const cfg = SPECIES[species] || SPECIES.dog;
  const p = getAnimalPose(pose, frame);

  return (
    <svg viewBox="0 0 240 170" width={260} height={184} style={{ transform: `translateX(${p.shakeX}px) scaleX(${mirror ? -1 : 1})`, overflow: "visible" }}>
      <g transform={`translate(0 ${p.bodyY})`}>
        <path
          d="M200,85 Q230,60 220,95"
          stroke={cfg.accent}
          strokeWidth={10}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(${p.tailWag} 200 85)`}
        />

        <line x1={72} y1={118} x2={72 - p.legSwing * 0.3} y2={155} stroke={cfg.accent} strokeWidth={14} strokeLinecap="round" />
        <line x1={102} y1={120} x2={102 + p.legSwing * 0.3} y2={157} stroke={cfg.accent} strokeWidth={14} strokeLinecap="round" />
        <line x1={158} y1={120} x2={158 - p.legSwing * 0.3} y2={157} stroke={cfg.accent} strokeWidth={14} strokeLinecap="round" />
        <line x1={188} y1={118} x2={188 + p.legSwing * 0.3} y2={155} stroke={cfg.accent} strokeWidth={14} strokeLinecap="round" />

        <ellipse cx={130} cy={95} rx={72} ry={38} fill={cfg.body} />

        {cfg.extra === "mane" && <circle cx={58} cy={72} r={40} fill={cfg.accent} opacity={0.9} />}

        <g transform={`translate(0 ${p.headDip})`}>
          <circle cx={55} cy={72} r={34} fill={cfg.body} />

          {cfg.ear === "big" && (
            <>
              <ellipse cx={30} cy={55} rx={20} ry={26} fill={cfg.accent} opacity={0.85} />
              <ellipse cx={55} cy={40} rx={16} ry={20} fill={cfg.accent} opacity={0.85} />
            </>
          )}
          {cfg.ear === "small" && (
            <>
              <circle cx={38} cy={46} r={9} fill={cfg.accent} />
              <circle cx={68} cy={46} r={9} fill={cfg.accent} />
            </>
          )}
          {cfg.ear === "round" && (
            <>
              <circle cx={30} cy={52} r={12} fill={cfg.accent} />
              <circle cx={72} cy={50} r={12} fill={cfg.accent} />
            </>
          )}
          {cfg.ear === "floppy" && (
            <>
              <ellipse cx={28} cy={70} rx={10} ry={22} fill={cfg.accent} />
              <ellipse cx={76} cy={70} rx={10} ry={22} fill={cfg.accent} />
            </>
          )}
          {cfg.ear === "pointy" && (
            <>
              <path d="M32,50 L22,24 L44,44 Z" fill={cfg.body} />
              <path d="M78,50 L88,24 L66,44 Z" fill={cfg.body} />
            </>
          )}
          {cfg.ear === "long" && (
            <>
              <ellipse cx={38} cy={22} rx={9} ry={34} fill={cfg.body} transform="rotate(-8 38 22)" />
              <ellipse cx={70} cy={22} rx={9} ry={34} fill={cfg.body} transform="rotate(8 70 22)" />
            </>
          )}

          {cfg.extra === "horns" && (
            <>
              <path d="M42,42 L34,20" stroke="#e7e5e4" strokeWidth={6} strokeLinecap="round" />
              <path d="M64,42 L72,20" stroke="#e7e5e4" strokeWidth={6} strokeLinecap="round" />
            </>
          )}
          {cfg.extra === "antlers" && (
            <>
              <path d="M40,42 L30,16 M30,16 L22,10 M30,16 L34,8" stroke={cfg.accent} strokeWidth={4} strokeLinecap="round" fill="none" />
              <path d="M66,42 L76,16 M76,16 L84,10 M76,16 L72,8" stroke={cfg.accent} strokeWidth={4} strokeLinecap="round" fill="none" />
            </>
          )}
          {cfg.extra === "trunk" && (
            <path d="M50,92 Q40,115 52,132 Q58,142 48,150" stroke={cfg.body} strokeWidth={13} strokeLinecap="round" fill="none" />
          )}

          <circle cx={44} cy={70} r={3.4} fill="#1f2937" />
          <circle cx={64} cy={70} r={3.4} fill="#1f2937" />
          <ellipse cx={54} cy={86} rx={7} ry={3} fill={cfg.accent} />
        </g>
      </g>
    </svg>
  );
}

function Bird({ pose, frame, mirror }) {
  const p = getAnimalPose(pose, frame);
  const flap = Math.sin(frame * 0.4) * 24;
  return (
    <svg viewBox="0 0 220 170" width={220} height={170} style={{ transform: `translateX(${p.shakeX}px) scaleX(${mirror ? -1 : 1})`, overflow: "visible" }}>
      <g transform={`translate(0 ${p.bodyY})`}>
        <ellipse cx={110} cy={110} rx={20} ry={38} fill="#f97316" transform={`rotate(${-flap} 110 90)`} />
        <ellipse cx={110} cy={95} rx={44} ry={36} fill="#ef4444" />
        <circle cx={158} cy={80} r={22} fill="#ef4444" />
        <path d="M178,78 L200,84 L178,92 Z" fill="#facc15" />
        <circle cx={165} cy={74} r={3} fill="#1f2937" />
        <path d="M100,150 L100,160 M120,150 L120,160" stroke="#78350f" strokeWidth={4} strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Snake({ pose, frame, mirror }) {
  const p = getAnimalPose(pose, frame);
  const wave = Math.sin(frame * 0.15) * 14;
  return (
    <svg viewBox="0 0 260 160" width={260} height={160} style={{ transform: `translateX(${p.shakeX}px) scaleX(${mirror ? -1 : 1})`, overflow: "visible" }}>
      <g transform={`translate(0 ${p.bodyY})`}>
        <path
          d={`M20,120 Q60,${60 + wave} 100,100 Q140,${140 - wave} 180,90 Q210,60 230,80`}
          stroke="#16a34a"
          strokeWidth={22}
          strokeLinecap="round"
          fill="none"
        />
        <circle cx={230} cy={80} r={16} fill="#16a34a" />
        <circle cx={235} cy={74} r={2.6} fill="#1f2937" />
        <path d="M246,80 L258,74 M246,80 L258,86" stroke="#ef4444" strokeWidth={2} />
      </g>
    </svg>
  );
}

export function AnimalCharacter({ species = "dog", pose = "idle", mirror = false }) {
  const frame = useCurrentFrame();
  if (species === "bird") return <Bird pose={pose} frame={frame} mirror={mirror} />;
  if (species === "snake") return <Snake pose={pose} frame={frame} mirror={mirror} />;
  return <Quadruped species={species} pose={pose} frame={frame} mirror={mirror} />;
}
