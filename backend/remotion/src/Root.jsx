import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./MainVideo.jsx";
import { FPS, WIDTH, HEIGHT } from "../../shared/videoConfig.mjs";

const defaultProps = {
  scenes: [
    {
      text: "Sample scene",
      words: ["Sample", "scene"],
      durationInFrames: 90,
      audioFile: null,
    },
  ],
};

function calculateMetadata({ props }) {
  const total = props.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
  return { durationInFrames: Math.max(total, 1) };
}

export function RemotionRoot() {
  return (
    <Composition
      id="MainVideo"
      component={MainVideo}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      durationInFrames={90}
      defaultProps={defaultProps}
      calculateMetadata={calculateMetadata}
    />
  );
}
