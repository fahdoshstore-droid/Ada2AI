import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerChatRoutes } from "./chat";
import { handleRAGQuestion } from "./rag";
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
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Chat API with streaming and tool calling
  registerChatRoutes(app);
  // RAG Ask API — intent-classified question answering
  app.post("/api/ask", async (req, res) => {
    try {
      const { question } = req.body;

      if (!question || typeof question !== "string") {
        res.status(400).json({ error: "question (string) is required" });
        return;
      }

      const result = await handleRAGQuestion(question);

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");

      const stream = result.textStream;
      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        reader.releaseLock();
        res.end();
      }
    } catch (error) {
      console.error("[/api/ask] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  registerScoutAnalysisRoutes(app);
  // DHEEB Eye Vision — Claude Vision analysis endpoint
  registerEyeVisionRoutes(app);

  // ── Public API routes (rate-limited, no auth required) ──────────
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
      
      console.log("[Football Analysis] Starting analysis for:", team_a_name, "vs", team_b_name);
      
      // Call the scout analysis internally
      // Use req.hostname to avoid closure bug — 'port' is not yet defined at route registration time
      const serverPort = (server.address() as any)?.port || parseInt(process.env.PORT || "3000");
      const response = await fetch(`http://localhost:${serverPort}/api/scout/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: videoUrl }),
      });
      
      if (!response.ok) {
        throw new Error("Scout analysis failed");
      }
      
      const report = await response.json();
      
      // Return in the format expected by CoachDashboard
      res.json({
        team_0_name: team_a_name || "Team A",
        team_1_name: team_b_name || "Team B",
        team_0_possession: report.possession?.team_a || 50,
        team_1_possession: report.possession?.team_b || 50,
        team_0_area: report.area_control?.team_a || 50,
        team_1_area: report.area_control?.team_b || 50,
        team_0_goals: report.goals?.team_a || 0,
        team_1_goals: report.goals?.team_b || 0,
        team_0_shots: report.shots?.team_a || 0,
        team_1_shots: report.shots?.team_b || 0,
        full_report: report,
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
