import { createWriteStream } from "node:fs";
import { pipeline as streamPipeline } from "node:stream/promises";
import { Readable } from "node:stream";

// Calls Replicate's hosted minimax/video-01 (Hailuo) model to generate a real
// AI cinematic video clip per scene. Requires REPLICATE_API_TOKEN — when it's
// not set, or a scene's generation fails/times out, the caller falls back to
// the offline illustrated-character renderer for that scene.

const MODEL = "minimax/video-01";
const POLL_INTERVAL_MS = 4000;
const MAX_WAIT_MS = 6 * 60 * 1000;

export function isVideoGenEnabled() {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

function buildPrompt(sceneText) {
  return `Cinematic animated scene, rich detail, dynamic camera: ${sceneText}`;
}

async function pollUntilDone(getUrl, token) {
  const start = Date.now();
  while (true) {
    const res = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}` } });
    const prediction = await res.json();

    if (prediction.status === "succeeded" || prediction.status === "failed" || prediction.status === "canceled") {
      return prediction;
    }
    if (Date.now() - start > MAX_WAIT_MS) {
      throw new Error("Timed out waiting for AI video generation");
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

export async function generateSceneVideo({ sceneText, outPath }) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  const createRes = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: { prompt: buildPrompt(sceneText) } }),
  });

  if (!createRes.ok) {
    const body = await createRes.text().catch(() => "");
    throw new Error(`Replicate request failed (${createRes.status}): ${body.slice(0, 300)}`);
  }

  const created = await createRes.json();
  const getUrl = created.urls?.get;
  if (!getUrl) {
    throw new Error("Replicate response did not include a status URL");
  }

  const prediction = await pollUntilDone(getUrl, token);
  if (prediction.status !== "succeeded") {
    const detail = prediction.error ? JSON.stringify(prediction.error) : prediction.status;
    throw new Error(`AI video generation ${prediction.status}: ${detail}`);
  }

  const output = prediction.output;
  const videoUrl = Array.isArray(output) ? output[0] : output;
  if (!videoUrl || typeof videoUrl !== "string") {
    throw new Error("AI video generation returned no output URL");
  }

  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok || !videoRes.body) {
    throw new Error(`Failed to download generated video (${videoRes.status})`);
  }

  await streamPipeline(Readable.fromWeb(videoRes.body), createWriteStream(outPath));
  return outPath;
}
