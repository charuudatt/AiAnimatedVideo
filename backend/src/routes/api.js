import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { createJob, getJob } from "../services/jobs.js";
import { runPreviewPipeline, runFourKPipeline, previewVideoPath, fourKVideoPath } from "../services/pipeline.js";
import { streamVideoFile } from "../services/streamFile.js";
import { listVoices } from "../services/tts.js";

export const router = Router();

const MAX_TEXT_LENGTH = 6000;

router.get("/voices", async (req, res) => {
  try {
    const voices = await listVoices();
    res.json({ voices });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

router.post("/generate", (req, res) => {
  const { text, voiceName, rate } = req.body || {};

  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "Please provide narration text." });
    return;
  }
  if (text.length > MAX_TEXT_LENGTH) {
    res.status(400).json({ error: `Text is too long (max ${MAX_TEXT_LENGTH} characters).` });
    return;
  }

  const jobId = uuidv4();
  createJob(jobId);

  const parsedRate = Number.isFinite(Number(rate)) ? Math.max(-10, Math.min(10, Number(rate))) : 0;

  runPreviewPipeline(jobId, text, { voiceName, rate: parsedRate });

  res.json({ jobId });
});

router.get("/status/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  const { id, stage, progress, error, previewReady, fourKReady, fourKRequested, fourKStage, fourKProgress, fourKError, videoGenWarnings } = job;
  res.json({ id, stage, progress, error, previewReady, fourKReady, fourKRequested, fourKStage, fourKProgress, fourKError, videoGenWarnings });
});

router.get("/video/:jobId/preview", async (req, res) => {
  await streamVideoFile(req, res, previewVideoPath(req.params.jobId));
});

router.post("/render4k/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  if (!job.previewReady || !job.scenes) {
    res.status(409).json({ error: "Preview must finish rendering first." });
    return;
  }
  if (job.fourKReady) {
    res.json({ status: "ready" });
    return;
  }
  if (job.fourKStage === "rendering-4k") {
    res.json({ status: "already-running" });
    return;
  }

  runFourKPipeline(job.id, job.scenes);
  res.json({ status: "started" });
});

router.get("/download/:jobId", async (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job || !job.fourKReady) {
    res.status(409).json({ error: "4K video is not ready yet." });
    return;
  }
  await streamVideoFile(req, res, fourKVideoPath(req.params.jobId), {
    download: true,
    downloadName: `ai-animated-video-${req.params.jobId}-4k.mp4`,
  });
});
