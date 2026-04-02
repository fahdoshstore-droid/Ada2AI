import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerChatRoutes } from "./chat";
import { registerScoutAnalysisRoutes } from "../scoutAnalysis";
import { setupStorageStatic } from "../storage";
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
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Chat API with streaming and tool calling
  registerChatRoutes(app);
  registerScoutAnalysisRoutes(app);
  setupStorageStatic(app);

  // ── YOLO Backend Proxy ──────────────────────────────────────────────────────
  const YOLO_BACKEND = process.env.YOLO_BACKEND_URL || "http://localhost:5001";
  app.use("/yolo", async (req, res) => {
    const targetUrl = `${YOLO_BACKEND}${req.originalUrl.replace(/^\/yolo/, "")}`;
    try {
      const resp = await fetch(targetUrl, {
        method: req.method,
        headers: { "Content-Type": req.headers["content-type"] || "application/json" },
        body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
      });
      const data = await resp.json();
      res.status(resp.status).json(data);
    } catch (err: any) {
      res.status(502).json({ error: "YOLO backend unavailable", detail: err?.message });
    }
  });
  
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
