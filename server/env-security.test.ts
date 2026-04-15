import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Environment Configuration Security", () => {
  it("should NOT expose ANTHROPIC_API_KEY via VITE_ prefix to client", () => {
    const envPath = path.resolve(__dirname, "../.env.example");
    const content = fs.readFileSync(envPath, "utf-8");
    expect(content).not.toContain("VITE_ANTHROPIC_API_KEY");
    expect(content).toContain("ANTHROPIC_API_KEY");
  });

  it("should use MANUS_APP_ID instead of VITE_APP_ID", () => {
    const envContent = fs.readFileSync(path.resolve(__dirname, "_core/env.ts"), "utf-8");
    expect(envContent).toContain("MANUS_APP_ID");
    expect(envContent).not.toContain("VITE_APP_ID");
  });

  it("should have SUPABASE_URL configured", () => {
    const envPath = path.resolve(__dirname, "../.env.example");
    const content = fs.readFileSync(envPath, "utf-8");
    expect(content).toContain("SUPABASE_URL");
    expect(content).toContain("SUPABASE_ANON_KEY");
  });

  it("should have __pycache__ in .gitignore", () => {
    const gitignorePath = path.resolve(__dirname, "../.gitignore");
    const gitignore = fs.readFileSync(gitignorePath, "utf-8");
    expect(gitignore).toContain("__pycache__");
    expect(gitignore).toContain("*.pyc");
  });
});
