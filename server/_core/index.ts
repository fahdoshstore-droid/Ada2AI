import "dotenv/config";
import express from "express";
import { z } from "zod";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerChatRoutes } from "./chat";
import { orchestratorAgent } from "./agents";
import { registerScoutAnalysisRoutes } from "../scoutAnalysis";
import { registerEyeVisionRoutes } from "./eyeVision";
import { registerPlayerRoutes } from "../apiPlayers";
import { registerAcademyRoutes } from "../apiAcademies";
import { registerScoutRoutes } from "../apiScouts";
import { registerTrainingRoutes } from "../apiTrainings";
import { registerFacilityRoutes } from "../apiFacilities";
import { registerAthleteCareerRoutes } from "../apiAthleteCareer";
import { registerAthletePointsRoutes } from "../apiAthletePoints";
import { registerMinistryRoutes } from "../apiMinistry";
import { requireAuth, rateLimit, validateUploadSize } from "./auth";
import { ttsHandler } from "./tts";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // ── Auth + Rate Limit for API routes ────────────────────────────
  // Protected routes require Supabase Auth + rate limiting + upload size check
  app.use("/api/chat", requireAuth, rateLimit);
  app.use("/api/ask", requireAuth, rateLimit);
  app.use("/api/scout", requireAuth, rateLimit, validateUploadSize);
  app.use("/api/eye", requireAuth, rateLimit);
  app.use("/api/v1/football", requireAuth, rateLimit);

  // ── TTS (Text-to-Speech) route ──────────────────────────────────
  app.post("/api/tts", requireAuth, rateLimit, ttsHandler);

  // ── Route registrations ──────────────────────────────────────────
  // Chat API with streaming and tool calling
  registerChatRoutes(app);
  // ── Multi-Agent API Routes ─────────────────────────────────────────
  // /api/ask — Streaming text response (Classifier → Query → Synthesizer pipeline)
  app.post("/api/ask", async (req, res) => {
    try {
      const schema = z.object({
        question: z.string().min(1).max(2000),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const { question } = parsed.data;

      // Use orchestrator's streaming pipeline (A2A architecture)
      await orchestratorAgent.runStreamPipeline(question, res);
    } catch (error) {
      console.error("[/api/ask] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // /api/ask/full — Full pipeline result with trace + metadata (Agenticthon demo)
  app.post("/api/ask/full", requireAuth, rateLimit, async (req, res) => {
    try {
      const schema = z.object({
        question: z.string().min(1).max(2000),
        voice: z.string().optional(),
        language: z.string().optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const { question, voice, language } = parsed.data;

      const includeVoice = !!voice;
      const result = await orchestratorAgent.runPipeline(question, {
        includeVoice,
        voiceName: voice,
        language,
      });

      // Return structured result with agent trace
      res.json({
        traceId: result.traceId,
        classification: result.classification,
        query: result.query,
        synthesis: result.synthesis,
        voice: result.voice ? { format: result.voice.format, sizeBytes: result.voice.sizeBytes } : undefined,
        trace: result.trace,
        totalDurationMs: result.totalDurationMs,
      });
    } catch (error) {
      console.error("[/api/ask/full] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  registerScoutAnalysisRoutes(app);
  // DHEEB Eye Vision — Claude Vision analysis endpoint
  registerEyeVisionRoutes(app);

  // ── Public API routes (rate-limited, no auth required for GET) ──────────
  // SEC-12: POST/DELETE on players requires authentication (handled in apiPlayers.ts)
  app.use("/api/players", rateLimit);
  app.use("/api/academies", rateLimit);
  app.use("/api/scouts", rateLimit);
  registerPlayerRoutes(app);
  registerAcademyRoutes(app);
  registerScoutRoutes(app);
  app.use("/api/trainings", rateLimit);
  registerTrainingRoutes(app);
  
  // ── New API routes (mock fallback until Supabase tables exist) ───
  app.use("/api/facilities", rateLimit);
  app.use("/api/athletes", rateLimit);
  app.use("/api/ministry", rateLimit);
  registerFacilityRoutes(app);
  registerAthleteCareerRoutes(app);
  registerAthletePointsRoutes(app);
  registerMinistryRoutes(app);
  
  // ── Football Video Analysis API ─────────────────────────────────────────────
  // This endpoint is called by CoachDashboard to analyze match videos
  app.post("/api/v1/football/analyze-football", async (req, res) => {
    try {
      const { videoUrl, team_a_name, team_b_name } = req.body;
      
      if (!videoUrl) {
        return res.status(400).json({ error: "videoUrl is required" });
      }
      
      // SEC-08: SSRF Protection - Validate URL to prevent internal network access
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(videoUrl);
      } catch {
        return res.status(400).json({ error: "Invalid video URL format" });
      }
      
      // Only allow HTTPS URLs
      if (parsedUrl.protocol !== "https:") {
        return res.status(400).json({ error: "URL must use HTTPS protocol" });
      }
      
      // Block internal IPs and localhost
      const hostname = parsedUrl.hostname.toLowerCase();
      const blockedPatterns = [
        /^localhost$/,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[01])\./,
        /^192\.168\./,
        /^169\.254\./,
        /^0\./,
        /^::1$/,
        /^fc00:/,
        /^fe80:/,
      ];
      
      if (blockedPatterns.some(pattern => pattern.test(hostname))) {
        return res.status(400).json({ error: "Invalid video URL: internal addresses not allowed" });
      }
      
      // Block file protocol and other dangerous schemes
      if (["file:", "ftp:", "sftp:", "ssh:", "telnet:", "gopher:"].includes(parsedUrl.protocol)) {
        return res.status(400).json({ error: "Invalid URL protocol" });
      }
      
      console.log("[Football Analysis] Starting analysis for:", team_a_name, "vs", team_b_name);
      
      // SEC-13: Call handler directly instead of internal fetch
      const { handleScoutAnalysis } = await import("../scoutAnalysis");
      const report = await handleScoutAnalysis({ imageUrl: videoUrl });
      
      // Return in the format expected by CoachDashboard
      res.json({
        team_0_name: team_a_name || "Team A",
        team_1_name: team_b_name || "Team B",
        team_0_possession: (report.report as any).possession?.team_a || 50,
        team_1_possession: (report.report as any).possession?.team_b || 50,
        team_0_area: (report.report as any).area_control?.team_a || 50,
        team_1_area: (report.report as any).area_control?.team_b || 50,
        team_0_goals: (report.report as any).goals?.team_a || 0,
        team_1_goals: (report.report as any).goals?.team_b || 0,
        team_0_shots: (report.report as any).shots?.team_a || 0,
        team_1_shots: (report.report as any).shots?.team_b || 0,
        full_report: report.report,
      });
    } catch (err) {
      console.error("[Football Analysis] Error:", err);
      res.status(500).json({ error: "Analysis failed" });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
