import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTRY_POINT = path.join(__dirname, "..", "..", "remotion", "src", "index.jsx");

let bundleLocationPromise = null;

// Remotion copies the project's public/ folder into the bundle output once,
// at bundle time. Per-job assets (narration audio) are generated afterwards,
// so they must be written directly into the bundled output's public folder
// rather than the source public folder, or the render can't find them.
export function getServeUrl() {
  if (!bundleLocationPromise) {
    bundleLocationPromise = bundle({ entryPoint: ENTRY_POINT });
  }
  return bundleLocationPromise;
}

export async function getBundlePublicDir() {
  const serveUrl = await getServeUrl();
  return path.join(serveUrl, "public");
}

export async function renderVideo({ inputProps, outputPath, scale = 1, onProgress }) {
  const serveUrl = await getServeUrl();

  const composition = await selectComposition({
    serveUrl,
    id: "MainVideo",
    inputProps,
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    scale,
    onProgress: ({ progress }) => {
      onProgress?.(progress);
    },
  });

  return outputPath;
}
