import fs from "node:fs";
import fsp from "node:fs/promises";

// Serves a video file with HTTP Range support so the <video> tag can seek,
// and optionally as a forced download attachment.
export async function streamVideoFile(req, res, filePath, { download = false, downloadName } = {}) {
  let stat;
  try {
    stat = await fsp.stat(filePath);
  } catch {
    res.status(404).json({ error: "File not found" });
    return;
  }

  const range = req.headers.range;
  const fileSize = stat.size;

  const headers = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
  };
  if (download) {
    headers["Content-Disposition"] = `attachment; filename="${downloadName || "video.mp4"}"`;
  }

  if (!range) {
    res.writeHead(200, { ...headers, "Content-Length": fileSize });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const match = /bytes=(\d*)-(\d*)/.exec(range);
  const start = match[1] ? parseInt(match[1], 10) : 0;
  const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
  const chunkSize = end - start + 1;

  res.writeHead(206, {
    ...headers,
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Content-Length": chunkSize,
  });
  fs.createReadStream(filePath, { start, end }).pipe(res);
}
