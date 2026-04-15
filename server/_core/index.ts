import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerChatRoutes } from "./chat";
import { registerScoutAnalysisRoutes } from "../scoutAnalysis";
import { registerEyeVisionRoutes } from "./eyeVision";
import { requireAuth, rateLimit, validateUploadSize } from "./auth";
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
  app.use("/api/scout", requireAuth, rateLimit, validateUploadSize);
  app.use("/api/eye", requireAuth, rateLimit);
  app.use("/api/v1/football", requireAuth, rateLimit);

  // ── Route registrations ──────────────────────────────────────────
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Chat API with streaming and tool calling
  registerChatRoutes(app);
  registerScoutAnalysisRoutes(app);
  // DHEEB Eye Vision — Claude Vision analysis endpoint
  registerEyeVisionRoutes(app);
  
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
      const response = await fetch(`http://localhost:${port}/api/scout/analyze`, {
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
