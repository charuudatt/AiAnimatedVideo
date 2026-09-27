const jobs = new Map();

export function createJob(id) {
  const job = {
    id,
    stage: "queued",
    progress: 0,
    error: null,
    previewReady: false,
    fourKReady: false,
    fourKRequested: false,
    fourKStage: "idle",
    fourKProgress: 0,
    fourKError: null,
    videoGenWarnings: [],
    createdAt: Date.now(),
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id) {
  return jobs.get(id);
}

export function updateJob(id, patch) {
  const job = jobs.get(id);
  if (!job) return null;
  Object.assign(job, patch);
  return job;
}
