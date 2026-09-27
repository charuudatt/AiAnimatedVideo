import { spring } from "remotion";

const FPS = 30;

// Central pose solver shared by humanoid characters (person & deity archetypes).
// Returns simple joint angles / offsets that every archetype interprets in its
// own art style, so adding a new pose only means adding one case here.
export function getHumanoidPose(pose, frame) {
  const idleBob = Math.sin(frame * 0.12) * 4;
  const base = {
    bodyY: idleBob,
    armL: 8,
    armR: -8,
    legL: 0,
    legR: 0,
    headTilt: 0,
    mouthOpen: 0,
    eyeScale: 1,
    shakeX: 0,
    seated: false,
  };

  switch (pose) {
    case "walking": {
      const swing = Math.sin(frame * 0.35) * 22;
      return {
        ...base,
        bodyY: Math.abs(Math.sin(frame * 0.35)) * -3,
        armL: -swing * 0.7,
        armR: swing * 0.7,
        legL: swing,
        legR: -swing,
      };
    }
    case "talking": {
      const talk = (Math.sin(frame * 0.5) + 1) / 2;
      return {
        ...base,
        headTilt: Math.sin(frame * 0.2) * 4,
        armR: -8 + Math.sin(frame * 0.25) * 10,
        mouthOpen: talk,
      };
    }
    case "eating": {
      const cycle = (Math.sin(frame * 0.3) + 1) / 2;
      return {
        ...base,
        armR: -8 + cycle * -95,
        mouthOpen: cycle > 0.65 ? (cycle - 0.65) / 0.35 : 0,
        headTilt: cycle * -6,
      };
    }
    case "giving": {
      const s = spring({ frame, fps: FPS, config: { damping: 14 } });
      return { ...base, armR: 8 + s * -100 };
    }
    case "pointing": {
      const s = spring({ frame, fps: FPS, config: { damping: 14 } });
      return { ...base, armR: 8 + s * -70, headTilt: s * -4 };
    }
    case "sitting": {
      return { ...base, legL: 55, legR: -55, bodyY: idleBob + 18, seated: true };
    }
    case "flying": {
      return {
        ...base,
        bodyY: Math.sin(frame * 0.15) * 14 - 10,
        armL: 30 + Math.sin(frame * 0.2) * 10,
        armR: -30 - Math.sin(frame * 0.2) * 10,
      };
    }
    case "scared": {
      return {
        ...base,
        shakeX: Math.sin(frame * 1.4) * 4,
        eyeScale: 1.4,
        mouthOpen: 0.5,
        armL: 20,
        armR: -20,
      };
    }
    case "loving": {
      return { ...base, armL: -130, armR: 130, headTilt: 3 };
    }
    case "thinking": {
      return { ...base, armR: -110, headTilt: -6 };
    }
    case "fighting": {
      const jab = Math.sin(frame * 0.4);
      return { ...base, armL: -70 + jab * 50, armR: -70 - jab * 50, legL: 15, legR: -15, headTilt: jab * 3 };
    }
    case "praying": {
      const bow = ((Math.sin(frame * 0.15) + 1) / 2) * 8;
      return { ...base, armL: -95, armR: 95, headTilt: 10 + bow, bodyY: idleBob + bow * 0.5 };
    }
    case "dancing": {
      const sway = Math.sin(frame * 0.5);
      return {
        ...base,
        armL: -60 + sway * 70,
        armR: 60 - sway * 70,
        legL: sway * 20,
        legR: -sway * 20,
        bodyY: idleBob * 2 - Math.abs(Math.sin(frame * 0.5)) * 10,
        headTilt: sway * 8,
      };
    }
    case "jumping": {
      const hop = Math.max(0, Math.sin(frame * 0.3));
      return {
        ...base,
        bodyY: idleBob - hop * 40,
        legL: -hop * 30,
        legR: hop * 30,
        armL: 8 - hop * 130,
        armR: -8 - hop * 130,
      };
    }
    case "sleeping": {
      return { ...base, headTilt: 20 + Math.sin(frame * 0.05) * 2, bodyY: idleBob * 0.3, armL: 5, armR: -5 };
    }
    case "crying": {
      const sob = Math.sin(frame * 0.6);
      return { ...base, armL: 100, armR: -100, headTilt: 10, shakeX: sob * 2, mouthOpen: 0.2 };
    }
    case "laughing": {
      const laugh = (Math.sin(frame * 0.6) + 1) / 2;
      return {
        ...base,
        headTilt: -8 - laugh * 6,
        mouthOpen: 0.4 + laugh * 0.6,
        bodyY: idleBob - laugh * 6,
        armR: -8 + laugh * 20,
      };
    }
    case "idle":
    default:
      return base;
  }
}

export function idleFloat(frame, amplitude = 8, speed = 0.1) {
  return Math.sin(frame * speed) * amplitude;
}

// Simpler pose solver for four-legged / winged animal archetypes.
export function getAnimalPose(pose, frame) {
  const base = { bodyY: Math.sin(frame * 0.14) * 3, headDip: 0, legSwing: 0, shakeX: 0, tailWag: Math.sin(frame * 0.2) * 10 };

  switch (pose) {
    case "walking":
      return { ...base, legSwing: Math.sin(frame * 0.4) * 14, bodyY: Math.abs(Math.sin(frame * 0.4)) * -3 };
    case "eating":
      return { ...base, headDip: (Math.sin(frame * 0.3) + 1) / 2 * 18 };
    case "flying":
      return { ...base, bodyY: Math.sin(frame * 0.15) * 16 - 12, tailWag: Math.sin(frame * 0.3) * 20 };
    case "scared":
      return { ...base, shakeX: Math.sin(frame * 1.4) * 4 };
    case "talking":
      return { ...base, headDip: Math.sin(frame * 0.4) * -4 };
    default:
      return base;
  }
}
