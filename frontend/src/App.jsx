import { useEffect, useRef, useState } from "react";
import "./App.css";
import { fetchVoices, generateVideo, fetchStatus, requestFourK, previewUrl, downloadUrl } from "./api";

const STAGE_LABELS = {
  queued: "Queued…",
  scripting: "Splitting your script into scenes…",
  narrating: "Generating narration audio…",
  "generating-cinematics": "Generating AI cinematic scenes (can take a minute per scene)…",
  "rendering-preview": "Rendering your animated video…",
  done: "Preview ready",
  error: "Something went wrong",
};

const EXAMPLE_TEXT =
  "Welcome to our AI animated video generator. Type any story, lesson, or announcement, and watch it turn into a narrated animated video in seconds. Then download it in full 4K quality.";

export default function App() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const [rate, setRate] = useState(0);

  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pollRef = useRef(null);

  useEffect(() => {
    fetchVoices()
      .then((data) => setVoices(data.voices || []))
      .catch(() => setVoices([]));
  }, []);

  useEffect(() => {
    if (!jobId) return undefined;

    const poll = async () => {
      try {
        const data = await fetchStatus(jobId);
        setJob(data);
      } catch (err) {
        setJob((prev) => ({ ...(prev || {}), stage: "error", error: err.message }));
      }
    };

    poll();
    pollRef.current = setInterval(poll, 1000);
    return () => clearInterval(pollRef.current);
  }, [jobId]);

  useEffect(() => {
    if (!job) return;
    const stillGoing = job.stage !== "done" && job.stage !== "error";
    const fourKGoing = job.fourKStage === "rendering-4k";
    if (!stillGoing && !fourKGoing && pollRef.current) {
      clearInterval(pollRef.current);
    }
  }, [job]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!text.trim()) {
      setSubmitError("Please enter some narration text first.");
      return;
    }
    setIsSubmitting(true);
    setJob(null);
    try {
      const { jobId: newJobId } = await generateVideo({ text, voiceName, rate });
      setJobId(newJobId);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    clearInterval(pollRef.current);
    setJobId(null);
    setJob(null);
    setSubmitError("");
  };

  const handleRequest4K = async () => {
    try {
      await requestFourK(jobId);
      setJob((prev) => ({ ...prev, fourKStage: "rendering-4k", fourKProgress: 1 }));
      pollRef.current = setInterval(async () => {
        const data = await fetchStatus(jobId);
        setJob(data);
      }, 1000);
    } catch (err) {
      setJob((prev) => ({ ...prev, fourKError: err.message }));
    }
  };

  const isGenerating = job && job.stage !== "done" && job.stage !== "error";
  const previewReady = job && job.previewReady;
  const fourKGoing = job && job.fourKStage === "rendering-4k";
  const fourKReady = job && job.fourKReady;

  return (
    <div className="page">
      <header className="header">
        <h1>AI Animated Video Studio</h1>
        <p>Turn text into a narrated, animated video — watch it, then download in 4K.</p>
      </header>

      <main className="layout">
        <section className="panel form-panel">
          <form onSubmit={handleSubmit}>
            <label htmlFor="script">Your script</label>
            <textarea
              id="script"
              rows={8}
              maxLength={6000}
              placeholder={EXAMPLE_TEXT}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="char-count">{text.length} / 6000</div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="voice">Narration voice</label>
                <select id="voice" value={voiceName} onChange={(e) => setVoiceName(e.target.value)}>
                  <option value="">Default voice</option>
                  {voices.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="rate">Speaking rate ({rate})</label>
                <input
                  id="rate"
                  type="range"
                  min={-10}
                  max={10}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                />
              </div>
            </div>

            {submitError ? <div className="error-banner">{submitError}</div> : null}

            <div className="actions">
              <button type="submit" disabled={isSubmitting || isGenerating}>
                {isSubmitting ? "Starting…" : "Generate video"}
              </button>
              {job ? (
                <button type="button" className="secondary" onClick={handleReset}>
                  Start over
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel preview-panel">
          {!job && <div className="placeholder">Your generated video will appear here.</div>}

          {job && job.stage === "error" && (
            <div className="error-banner">{job.error || "Generation failed."}</div>
          )}

          {job && isGenerating && (
            <div className="progress-block">
              <div className="progress-label">{STAGE_LABELS[job.stage] || job.stage}</div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${job.progress || 0}%` }} />
              </div>
              <div className="progress-pct">{job.progress || 0}%</div>
            </div>
          )}

          {previewReady && (
            <div className="video-block">
              <video key={jobId} controls src={previewUrl(jobId)} className="video-player" />

              {job.videoGenWarnings && job.videoGenWarnings.length > 0 && (
                <div className="warning-banner">
                  {job.videoGenWarnings.map((w, i) => (
                    <div key={i}>{w}</div>
                  ))}
                </div>
              )}

              <div className="download-block">
                {!fourKReady && !fourKGoing && (
                  <button type="button" onClick={handleRequest4K}>
                    Render 4K for download
                  </button>
                )}

                {fourKGoing && (
                  <div className="progress-block">
                    <div className="progress-label">Rendering 4K video…</div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${job.fourKProgress || 0}%` }}
                      />
                    </div>
                    <div className="progress-pct">{job.fourKProgress || 0}%</div>
                  </div>
                )}

                {job.fourKError && <div className="error-banner">{job.fourKError}</div>}

                {fourKReady && (
                  <a className="download-link" href={downloadUrl(jobId)} download>
                    Download video (4K)
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        Runs fully offline — narration uses your system's built-in speech voices, no API keys
        required.
      </footer>
    </div>
  );
}
