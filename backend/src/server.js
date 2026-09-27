import "dotenv/config";
import express from "express";
import cors from "cors";
import { ensureBrowser } from "@remotion/renderer";
import { router } from "./routes/api.js";

const app = express();
const PORT = process.env.PORT || 4000;

// A flaky network mid-render (e.g. the one-time headless Chrome download)
// must not take the whole server down while a render job is in flight.
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection (ignored, server stays up):", err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception (ignored, server stays up):", err);
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", router);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

async function ensureBrowserWithRetry(attempts = 5) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await ensureBrowser();
      console.log("Headless rendering browser is ready.");
      return;
    } catch (err) {
      console.warn(`Browser setup attempt ${i}/${attempts} failed: ${err.message || err}`);
      if (i < attempts) await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
  console.warn(
    "Could not pre-download the rendering browser. It will be retried on the first video generation."
  );
}

app.listen(PORT, () => {
  console.log(`AI Animated Video backend listening on http://localhost:${PORT}`);
  ensureBrowserWithRetry();
});
