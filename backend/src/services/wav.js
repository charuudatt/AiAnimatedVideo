import fs from "node:fs/promises";

// Reads the duration (in seconds) of a PCM WAV file from its header,
// without needing ffprobe or any external binary.
export async function getWavDurationSeconds(filePath) {
  const buffer = await fs.readFile(filePath);
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error(`Not a valid WAV file: ${filePath}`);
  }

  let offset = 12;
  let byteRate = null;
  let dataSize = null;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkBodyStart = offset + 8;

    if (chunkId === "fmt ") {
      byteRate = buffer.readUInt32LE(chunkBodyStart + 8);
    } else if (chunkId === "data") {
      dataSize = chunkSize;
    }

    offset = chunkBodyStart + chunkSize + (chunkSize % 2);
  }

  if (!byteRate || !dataSize) {
    throw new Error(`Could not determine duration for WAV file: ${filePath}`);
  }

  return dataSize / byteRate;
}
