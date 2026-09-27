import React from "react";
import { useCurrentFrame } from "remotion";
import { getHumanoidPose } from "./poseUtils.js";

const VARIANTS = {
  man: { skin: "#f2c396", top: "#3b82f6", bottom: "#1f2937", hair: "#2b2118", crown: false, skirt: false, scale: 1 },
  woman: { skin: "#f2c396", top: "#db2777", bottom: "#db2777", hair: "#241a12", crown: false, skirt: true, scale: 1 },
  child: { skin: "#f6d5ab", top: "#f59e0b", bottom: "#0ea5e9", hair: "#2b2118", crown: false, skirt: false, scale: 0.72 },
  king: { skin: "#e8b487", top: "#f59e0b", bottom: "#7c2d12", hair: "#1a1a1a", crown: true, skirt: false, scale: 1.05 },
  queen: { skin: "#e8b487", top: "#a855f7", bottom: "#a855f7", hair: "#1a1a1a", crown: true, skirt: true, scale: 1.02 },
  generic: { skin: "#e6c19c", top: "#94a3b8", bottom: "#475569", hair: "#3f3f46", crown: false, skirt: false, scale: 1 },
  warrior: { skin: "#e0ac76", top: "#71717a", bottom: "#7f1d1d", hair: "#1a1a1a", crown: false, skirt: false, scale: 1.05, helmet: true },
  sage: { skin: "#d9a066", top: "#ea580c", bottom: "#ea580c", hair: "#e5e7eb", crown: false, skirt: true, scale: 1, beard: true },
};

export function PersonCharacter({ variant = "generic", pose = "idle", mirror = false }) {
  const frame = useCurrentFrame();
  const cfg = VARIANTS[variant] || VARIANTS.generic;
  const p = getHumanoidPose(pose, frame);

  const shoulderL = [72, 96];
  const shoulderR = [128, 96];
  const hipL = [85, 190];
  const hipR = [115, 190];
  const armLen = 74;
  const legLen = p.seated ? 55 : 95;

  return (
    <svg
      viewBox="0 0 200 320"
      width={230 * cfg.scale}
      height={368 * cfg.scale}
      style={{ transform: `translateX(${p.shakeX}px) scaleX(${mirror ? -1 : 1})`, overflow: "visible" }}
    >
      <g transform={`translate(0 ${p.bodyY})`}>
        {!cfg.skirt && (
          <>
            <line x1={hipL[0]} y1={hipL[1]} x2={hipL[0]} y2={hipL[1] + legLen} stroke={cfg.bottom} strokeWidth={20} strokeLinecap="round" transform={`rotate(${p.legL} ${hipL[0]} ${hipL[1]})`} />
            <line x1={hipR[0]} y1={hipR[1]} x2={hipR[0]} y2={hipR[1] + legLen} stroke={cfg.bottom} strokeWidth={20} strokeLinecap="round" transform={`rotate(${p.legR} ${hipR[0]} ${hipR[1]})`} />
          </>
        )}

        <line x1={shoulderL[0]} y1={shoulderL[1]} x2={shoulderL[0]} y2={shoulderL[1] + armLen} stroke={cfg.skin} strokeWidth={16} strokeLinecap="round" transform={`rotate(${p.armL} ${shoulderL[0]} ${shoulderL[1]})`} />

        {cfg.skirt ? (
          <path d="M70,90 L130,90 L150,230 L50,230 Z" fill={cfg.bottom} />
        ) : (
          <rect x={68} y={80} width={64} height={115} rx={26} fill={cfg.top} />
        )}
        {!cfg.skirt && <rect x={68} y={80} width={64} height={60} rx={22} fill={cfg.top} />}

        <line x1={shoulderR[0]} y1={shoulderR[1]} x2={shoulderR[0]} y2={shoulderR[1] + armLen} stroke={cfg.skin} strokeWidth={16} strokeLinecap="round" transform={`rotate(${p.armR} ${shoulderR[0]} ${shoulderR[1]})`} />

        <g transform={`rotate(${p.headTilt} 100 55)`}>
          <circle cx={100} cy={55} r={30} fill={cfg.skin} />
          {!cfg.helmet && (
            <path d="M72,45 Q100,10 128,45 Q128,28 100,25 Q72,28 72,45 Z" fill={cfg.hair} />
          )}
          {cfg.crown && (
            <path d="M76,26 L82,8 L92,22 L100,4 L108,22 L118,8 L124,26 Z" fill="#facc15" stroke="#b45309" strokeWidth={1.5} />
          )}
          {cfg.helmet && (
            <>
              <path d="M70,40 Q100,4 130,40 L130,50 Q100,32 70,50 Z" fill="#a1a1aa" stroke="#52525b" strokeWidth={2} />
              <rect x={97} y={-2} width={6} height={20} fill="#dc2626" />
            </>
          )}
          <circle cx={90} cy={54} r={3.2 * p.eyeScale} fill="#1f2937" />
          <circle cx={110} cy={54} r={3.2 * p.eyeScale} fill="#1f2937" />
          <ellipse cx={100} cy={68} rx={8} ry={2 + p.mouthOpen * 6} fill="#7c2d12" />
          {cfg.beard && <path d="M78,64 Q100,100 122,64 Q100,80 78,64 Z" fill={cfg.hair} />}
        </g>
      </g>
    </svg>
  );
}
