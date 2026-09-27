import React from "react";
import { useCurrentFrame } from "remotion";
import { getHumanoidPose } from "./poseUtils.js";

const VARIANTS = {
  elephant: { skin: "#e8b487", robe: "#f59e0b", earFill: "#d97757", halo: "#fde68a" },
  multiarm: { skin: "#93a5e8", robe: "#f97316", earFill: null, halo: "#c7d2fe" },
  generic: { skin: "#f0c68a", robe: "#fbbf24", earFill: null, halo: "#fef3c7" },
};

function InnerArms({ shoulderY, skin, frame }) {
  const sway = Math.sin(frame * 0.15) * 8;
  const l = [82, shoulderY];
  const r = [118, shoulderY];
  return (
    <>
      <line x1={l[0]} y1={l[1]} x2={l[0]} y2={l[1] + 46} stroke={skin} strokeWidth={13} strokeLinecap="round" transform={`rotate(${-34 + sway} ${l[0]} ${l[1]})`} />
      <line x1={r[0]} y1={r[1]} x2={r[0]} y2={r[1] + 46} stroke={skin} strokeWidth={13} strokeLinecap="round" transform={`rotate(${34 - sway} ${r[0]} ${r[1]})`} />
    </>
  );
}

export function DeityCharacter({ variant = "generic", pose = "idle", mirror = false }) {
  const frame = useCurrentFrame();
  const cfg = VARIANTS[variant] || VARIANTS.generic;
  const p = getHumanoidPose(pose, frame);

  const shoulderL = [72, 100];
  const shoulderR = [128, 100];
  const hipL = [85, 195];
  const hipR = [115, 195];
  const armLen = 70;
  const legLen = p.seated ? 50 : 88;

  return (
    <svg
      viewBox="0 0 200 330"
      width={250}
      height={412}
      style={{ transform: `translateX(${p.shakeX}px) scaleX(${mirror ? -1 : 1})`, overflow: "visible" }}
    >
      <circle cx={100} cy={58} r={50} fill={cfg.halo} opacity={0.35} />

      <g transform={`translate(0 ${p.bodyY})`}>
        <line x1={hipL[0]} y1={hipL[1]} x2={hipL[0]} y2={hipL[1] + legLen} stroke={cfg.robe} strokeWidth={22} strokeLinecap="round" transform={`rotate(${p.legL} ${hipL[0]} ${hipL[1]})`} />
        <line x1={hipR[0]} y1={hipR[1]} x2={hipR[0]} y2={hipR[1] + legLen} stroke={cfg.robe} strokeWidth={22} strokeLinecap="round" transform={`rotate(${p.legR} ${hipR[0]} ${hipR[1]})`} />

        <InnerArms shoulderY={112} skin={cfg.skin} frame={frame} />

        <line x1={shoulderL[0]} y1={shoulderL[1]} x2={shoulderL[0]} y2={shoulderL[1] + armLen} stroke={cfg.skin} strokeWidth={17} strokeLinecap="round" transform={`rotate(${p.armL} ${shoulderL[0]} ${shoulderL[1]})`} />
        <rect x={66} y={82} width={68} height={118} rx={28} fill={cfg.robe} />
        <line x1={shoulderR[0]} y1={shoulderR[1]} x2={shoulderR[0]} y2={shoulderR[1] + armLen} stroke={cfg.skin} strokeWidth={17} strokeLinecap="round" transform={`rotate(${p.armR} ${shoulderR[0]} ${shoulderR[1]})`} />

        <g transform={`rotate(${p.headTilt} 100 55)`}>
          {variant === "elephant" ? (
            <>
              <ellipse cx={58} cy={58} rx={24} ry={32} fill={cfg.earFill} />
              <ellipse cx={142} cy={58} rx={24} ry={32} fill={cfg.earFill} />
              <circle cx={100} cy={52} r={34} fill={cfg.skin} />
              <path
                d="M96,74 Q90,100 100,118 Q108,132 98,146"
                stroke={cfg.skin}
                strokeWidth={15}
                strokeLinecap="round"
                fill="none"
              />
              <path d="M84,68 L78,80" stroke="#fff7ed" strokeWidth={4} strokeLinecap="round" />
              <path d="M112,68 L120,78" stroke="#fff7ed" strokeWidth={4} strokeLinecap="round" />
              <circle cx={90} cy={46} r={3} fill="#1f2937" />
              <circle cx={110} cy={46} r={3} fill="#1f2937" />
            </>
          ) : (
            <>
              <circle cx={100} cy={52} r={31} fill={cfg.skin} />
              <path d="M74,42 Q100,14 126,42 Q126,26 100,24 Q74,26 74,42 Z" fill="#1a1a2e" />
              {variant === "multiarm" && (
                <ellipse cx={100} cy={36} rx={5} ry={9} fill="#facc15" transform="rotate(20 100 36)" />
              )}
              <line x1={100} y1={58} x2={100} y2={64} stroke="#4c1d95" strokeWidth={2.5} />
              <circle cx={89} cy={52} r={3.2 * p.eyeScale} fill="#1f2937" />
              <circle cx={111} cy={52} r={3.2 * p.eyeScale} fill="#1f2937" />
              <ellipse cx={100} cy={66} rx={8} ry={2 + p.mouthOpen * 6} fill="#7c2d12" />
            </>
          )}
          <path d="M78,20 L86,2 L96,16 L100,-2 L104,16 L114,2 L122,20 Z" fill="#facc15" stroke="#b45309" strokeWidth={1.5} />
        </g>
      </g>
    </svg>
  );
}
