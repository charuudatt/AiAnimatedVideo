import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.join(__dirname, "tts.ps1");

// Uses Windows' built-in SAPI speech engine (System.Speech) via PowerShell.
// Fully offline, free, no API key, no network calls.

let cachedVoices = null;

export async function listVoices() {
  if (cachedVoices) return cachedVoices;
  const { stdout } = await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    SCRIPT_PATH,
    "-ListVoices",
  ]);
  cachedVoices = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return cachedVoices;
}

export async function synthesizeToWav({ text, outPath, rate = 0, voiceName = "" }) {
  const tmpTextPath = `${outPath}.txt`;
  await fs.writeFile(tmpTextPath, text, "utf8");
  try {
    const args = [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      SCRIPT_PATH,
      "-TextPath",
      tmpTextPath,
      "-OutPath",
      outPath,
      "-Rate",
      String(rate),
    ];
    if (voiceName) {
      args.push("-VoiceName", voiceName);
    }
    await execFileAsync("powershell.exe", args, { maxBuffer: 1024 * 1024 * 10 });
  } finally {
    await fs.unlink(tmpTextPath).catch(() => {});
  }
  return outPath;
}
