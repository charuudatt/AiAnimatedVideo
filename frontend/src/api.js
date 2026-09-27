const BASE = "/api";

async function asJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchVoices() {
  const res = await fetch(`${BASE}/voices`);
  return asJson(res);
}

export async function generateVideo({ text, voiceName, rate }) {
  const res = await fetch(`${BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceName, rate }),
  });
  return asJson(res);
}

export async function fetchStatus(jobId) {
  const res = await fetch(`${BASE}/status/${jobId}`);
  return asJson(res);
}

export async function requestFourK(jobId) {
  const res = await fetch(`${BASE}/render4k/${jobId}`, { method: "POST" });
  return asJson(res);
}

export function previewUrl(jobId) {
  return `${BASE}/video/${jobId}/preview`;
}

export function downloadUrl(jobId) {
  return `${BASE}/download/${jobId}`;
}
