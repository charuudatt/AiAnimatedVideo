import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CharacterStage } from "./characters/CharacterStage.jsx";

function AiCinematicBackdrop({ videoFile }) {
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(videoFile)}
        loop
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0) 40%)" }}
      />
    </AbsoluteFill>
  );
}

const PALETTE = [
  ["#1e3a8a", "#7c3aed"],
  ["#065f46", "#0ea5e9"],
  ["#7c2d12", "#f59e0b"],
  ["#831843", "#db2777"],
  ["#111827", "#4f46e5"],
];

function Backdrop({ sceneIndex, durationInFrames }) {
  const frame = useCurrentFrame();
  const [from, to] = PALETTE[sceneIndex % PALETTE.length];
  const angle = interpolate(frame, [0, durationInFrames], [15, 45]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${from}, ${to})`,
      }}
    />
  );
}

function FloatingShapes({ sceneIndex, durationInFrames }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const shapes = [0, 1, 2];

  return (
    <AbsoluteFill>
      {shapes.map((i) => {
        const seed = sceneIndex * 3 + i;
        const baseX = width * (0.15 + 0.35 * i);
        const baseY = height * (0.2 + 0.2 * (i % 2));
        const entrance = spring({
          frame: frame - i * 4,
          fps: 30,
          config: { damping: 14 },
        });
        const drift = Math.sin((frame + seed * 40) / 45) * 25;
        const size = 90 + i * 40;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: baseX + drift,
              top: baseY,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              transform: `scale(${entrance})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

function SceneTitle({ text }) {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: 30, config: { damping: 16 } });
  const translateY = interpolate(enter, [0, 1], [40, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: "12%",
        left: "8%",
        right: "8%",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontSize: 30,
          fontWeight: 600,
          color: "rgba(255,255,255,0.75)",
          letterSpacing: 2,
          textTransform: "uppercase",
          fontFamily: "Segoe UI, Arial, sans-serif",
        }}
      >
        AI Animated Video
      </div>
    </div>
  );
}

function Captions({ words, durationInFrames }) {
  const frame = useCurrentFrame();
  const progressFrames = interpolate(frame, [0, durationInFrames], [0, words.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "8%",
        right: "8%",
        bottom: "9%",
        display: "flex",
        flexWrap: "wrap",
        gap: "0 12px",
        justifyContent: "center",
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: 42,
        fontWeight: 700,
        lineHeight: 1.3,
        textAlign: "center",
      }}
    >
      {words.map((word, i) => {
        const spoken = i < progressFrames;
        const isCurrent = i === Math.floor(progressFrames);
        const scale = isCurrent
          ? interpolate(progressFrames % 1, [0, 0.3], [1, 1.08], { extrapolateRight: "clamp" })
          : 1;

        return (
          <span
            key={i}
            style={{
              color: spoken ? "#ffffff" : "rgba(255,255,255,0.4)",
              textShadow: spoken ? "0 2px 12px rgba(0,0,0,0.45)" : "none",
              transform: `scale(${scale})`,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

function ProgressBar({ totalDurationInFrames, startFrame }) {
  const frame = useCurrentFrame();
  const globalFrame = frame + startFrame;
  const pct = interpolate(globalFrame, [0, totalDurationInFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 6,
          width: `${pct}%`,
          background: "linear-gradient(90deg, #ffffff, #a5b4fc)",
        }}
      />
    </AbsoluteFill>
  );
}

function CameraRig({ children, durationInFrames, sceneIndex }) {
  const frame = useCurrentFrame();
  const direction = sceneIndex % 2 === 0 ? 1 : -1;
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08]);
  const panX = interpolate(frame, [0, durationInFrames], [0, direction * 2]);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${panX}%)`, transformOrigin: "center" }}>
      {children}
    </AbsoluteFill>
  );
}

function Scene({ scene, sceneIndex, totalDurationInFrames, startFrame }) {
  return (
    <AbsoluteFill>
      <CameraRig durationInFrames={scene.durationInFrames} sceneIndex={sceneIndex}>
        {scene.videoFile ? (
          <AiCinematicBackdrop videoFile={scene.videoFile} />
        ) : (
          <>
            <Backdrop sceneIndex={sceneIndex} durationInFrames={scene.durationInFrames} />
            <FloatingShapes sceneIndex={sceneIndex} durationInFrames={scene.durationInFrames} />
            <CharacterStage characters={scene.characters} prop={scene.prop} />
          </>
        )}
      </CameraRig>
      <SceneTitle text={scene.text} />
      <Captions words={scene.words} durationInFrames={scene.durationInFrames} />
      <ProgressBar totalDurationInFrames={totalDurationInFrames} startFrame={startFrame} />
      {scene.audioFile ? <Audio src={staticFile(scene.audioFile)} /> : null}
    </AbsoluteFill>
  );
}

export function MainVideo({ scenes }) {
  let cursor = 0;
  const totalDurationInFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {scenes.map((scene, i) => {
        const startFrame = cursor;
        cursor += scene.durationInFrames;
        return (
          <Sequence key={i} from={startFrame} durationInFrames={scene.durationInFrames}>
            <Scene
              scene={scene}
              sceneIndex={i}
              totalDurationInFrames={totalDurationInFrames}
              startFrame={startFrame}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
