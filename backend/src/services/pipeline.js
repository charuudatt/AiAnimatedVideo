import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildScenes } from "./scenes.js";
import { synthesizeToWav } from "./tts.js";
import { getWavDurationSeconds } from "./wav.js";
import { renderVideo, getBundlePublicDir } from "./render.js";
import { updateJob } from "./jobs.js";
import { isVideoGenEnabled, generateSceneVideo } from "./videoGen.js";
import { FPS, TRAILING_PAD_FRAMES } from "../../shared/videoConfig.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "..", "output");

async function synthesizeScenes(jobId, scenes, voiceOptions) {
  const publicDir = await getBundlePublicDir();
  const audioDir = path.join(publicDir, "audio", jobId);
  await fs.mkdir(audioDir, { recursive: true });

  const enriched = [];
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const fileName = `scene${i}.wav`;
    const absPath = path.join(audioDir, fileName);

    await synthesizeToWav({
      text: scene.text,
      outPath: absPath,
      rate: voiceOptions?.rate ?? 0,
      voiceName: voiceOptions?.voiceName ?? "",
    });

    const durationSeconds = await getWavDurationSeconds(absPath);
    const durationInFrames = Math.round(durationSeconds * FPS) + TRAILING_PAD_FRAMES;

    enriched.push({
      text: scene.text,
      words: scene.words,
      characters: scene.characters,
      prop: scene.prop,
      audioFile: `audio/${jobId}/${fileName}`,
      durationInFrames,
    });

    updateJob(jobId, {
      stage: "narrating",
      progress: Math.round(((i + 1) / scenes.length) * 30),
    });
  }

  return enriched;
}

async function generateCinematics(jobId, enrichedScenes) {
  if (!isVideoGenEnabled()) return [];

  const publicDir = await getBundlePublicDir();
  const videoDir = path.join(publicDir, "video", jobId);
  await fs.mkdir(videoDir, { recursive: true });

  const warnings = [];
  for (let i = 0; i < enrichedScenes.length; i++) {
    const scene = enrichedScenes[i];
    const fileName = `scene${i}.mp4`;
    const absPath = path.join(videoDir, fileName);

    updateJob(jobId, {
      stage: "generating-cinematics",
      progress: 32 + Math.round((i / enrichedScenes.length) * 20),
    });

    try {
      await generateSceneVideo({ sceneText: scene.text, outPath: absPath });
      scene.videoFile = `video/${jobId}/${fileName}`;
    } catch (err) {
      warnings.push(`Scene ${i + 1}: fell back to illustrated animation (${err.message || err})`);
    }
  }

  return warnings;
}

export async function runPreviewPipeline(jobId, text, voiceOptions) {
  try {
    updateJob(jobId, { stage: "scripting", progress: 2 });
    const scenes = buildScenes(text);

    const enrichedScenes = await synthesizeScenes(jobId, scenes, voiceOptions);
    const videoGenWarnings = await generateCinematics(jobId, enrichedScenes);

    updateJob(jobId, { stage: "rendering-preview", progress: 52, videoGenWarnings });
    const outputPath = path.join(OUTPUT_DIR, jobId, "preview.mp4");

    await renderVideo({
      inputProps: { scenes: enrichedScenes },
      outputPath,
      scale: 1,
      onProgress: (fraction) => {
        updateJob(jobId, {
          stage: "rendering-preview",
          progress: 52 + Math.round(fraction * 48),
        });
      },
    });

    updateJob(jobId, {
      stage: "done",
      progress: 100,
      previewReady: true,
      scenes: enrichedScenes,
    });
  } catch (err) {
    updateJob(jobId, { stage: "error", error: err.message || String(err) });
  }
}

export async function runFourKPipeline(jobId, enrichedScenes) {
  try {
    updateJob(jobId, { fourKStage: "rendering-4k", fourKProgress: 1, fourKRequested: true });
    const outputPath = path.join(OUTPUT_DIR, jobId, "4k.mp4");

    await renderVideo({
      inputProps: { scenes: enrichedScenes },
      outputPath,
      scale: 2,
      onProgress: (fraction) => {
        updateJob(jobId, {
          fourKStage: "rendering-4k",
          fourKProgress: Math.round(fraction * 100),
        });
      },
    });

    updateJob(jobId, { fourKStage: "done", fourKProgress: 100, fourKReady: true });
  } catch (err) {
    updateJob(jobId, { fourKStage: "error", fourKError: err.message || String(err) });
  }
}

export function previewVideoPath(jobId) {
  return path.join(OUTPUT_DIR, jobId, "preview.mp4");
}

export function fourKVideoPath(jobId) {
  return path.join(OUTPUT_DIR, jobId, "4k.mp4");
}
