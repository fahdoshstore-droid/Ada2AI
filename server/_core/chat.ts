/**
 * Chat API Handler
 *
 * Express endpoint for AI SDK streaming chat with tool calling support.
 * Uses patched fetch to fix OpenAI-compatible proxy issues.
 */

import { streamText, stepCountIs } from "ai";
import { tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { Express } from "express";
import { z } from "zod/v4";
import { ENV } from "./env";
import { createPatchedFetch } from "./patchedFetch";

/**
 * Creates an OpenAI-compatible provider with patched fetch.
 */
function createLLMProvider() {
  const baseURL = ENV.forgeApiUrl.endsWith("/v1")
    ? ENV.forgeApiUrl
    : `${ENV.forgeApiUrl}/v1`;

  return createOpenAI({
    baseURL,
    apiKey: ENV.forgeApiKey,
    fetch: createPatchedFetch(fetch),
  });
}

/**
 * Example tool registry - customize these for your app.
 */
const tools = {
  getWeather: tool({
    description: "Get the current weather for a location",
    inputSchema: z.object({
      location: z
        .string()
        .describe("The city and country, e.g. 'Tokyo, Japan'"),
      unit: z.enum(["celsius", "fahrenheit"]).optional().default("celsius"),
    }),
    execute: async ({ location, unit }) => {
      // Simulate weather API call
      const temp = Math.floor(Math.random() * 30) + 5;
      const conditions = ["sunny", "cloudy", "rainy", "partly cloudy"][
        Math.floor(Math.random() * 4)
      ] as string;
      return {
        location,
        temperature: unit === "fahrenheit" ? Math.round(temp * 1.8 + 32) : temp,
        unit,
        conditions,
        humidity: Math.floor(Math.random() * 50) + 30,
      };
    },
  }),

  calculate: tool({
    description: "Perform a mathematical calculation",
    inputSchema: z.object({
      expression: z
        .string()
        .describe("The math expression to evaluate, e.g. '2 + 2'"),
    }),
    execute: async ({ expression }) => {
      try {
        // Safe math evaluator — only allows numbers, operators, parentheses, and whitespace
        const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
        // Validate: must contain only safe math tokens (no function calls, no identifiers)
        if (/[a-zA-Z_$]/.test(sanitized)) {
          return { expression, error: "Invalid expression: identifiers not allowed" };
        }
        // Use a secure parser instead of Function() constructor
        const result = safeMathEval(sanitized);
        if (typeof result !== "number" || !isFinite(result)) {
          return { expression, error: "Invalid expression: result is not a finite number" };
        }
        return { expression, result };
      } catch {
        return { expression, error: "Invalid expression" };
      }
    },
  }),
};

/**
 * Secure math expression evaluator.
 * Parses and computes simple arithmetic expressions without Function() or eval().
 * Supports: +, -, *, /, %, parentheses, and numeric literals (including decimals).
 */
function safeMathEval(expr: string): number {
  const tokens = expr.replace(/\s+/g, "").match(/(\d+\.?\d*|\+|\-|\*|\/|%|\(|\))/g);
  if (!tokens) throw new Error("Invalid expression");

  const output: (number | string)[] = [];  // RPN output queue
  const ops: string[] = [];                  // Operator stack
  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2 };
  const isUnary = (i: number): boolean => {
    if (i === 0) return true;
    const prev = tokens[i - 1];
    return prev === "(" || "+-*/%".includes(prev);
  };

  // Shunting-yard algorithm
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (/^\d+(\.\d+)?$/.test(tok)) {
      output.push(parseFloat(tok));
    } else if (tok === "-" && isUnary(i)) {
      // Unary minus: convert next number to negative
      if (i + 1 < tokens.length && /^\d+(\.\d+)?$/.test(tokens[i + 1])) {
        output.push(-parseFloat(tokens[i + 1]));
        i++;  // skip next token (already consumed)
      } else {
        ops.push("!");
      }
    } else if ("+-*/%".includes(tok)) {
      while (ops.length && ops[ops.length - 1] !== "(" && precedence[ops[ops.length - 1]] >= precedence[tok]) {
        output.push(ops.pop()!);
      }
      ops.push(tok);
    } else if (tok === "(") {
      ops.push(tok);
    } else if (tok === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") output.push(ops.pop()!);
      if (ops.pop() !== "(") throw new Error("Mismatched parentheses");
    }
  }
  while (ops.length) {
    const op = ops.pop()!;
    if (op === "(") throw new Error("Mismatched parentheses");
    output.push(op);
  }

  // Evaluate RPN
  const stack: number[] = [];
  for (const item of output) {
    if (typeof item === "number") {
      stack.push(item);
    } else {
      const b = stack.pop(), a = stack.pop();
      if (a === undefined || b === undefined) throw new Error("Invalid expression");
      switch (item) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/": stack.push(a / b); break;
        case "%": stack.push(a % b); break;
        case "!": stack.push(-b); break;
      }
    }
  }
  const result = stack[0];
  if (typeof result !== "number" || !isFinite(result)) throw new Error("Invalid result");
  return result;
}

/**
 * Registers the /api/chat endpoint for streaming AI responses.
 *
 * @example
 * ```ts
 * // In server/_core/index.ts
 * import { registerChatRoutes } from "./chat";
 *
 * registerChatRoutes(app);
 * ```
 */
export function registerChatRoutes(app: Express) {
  const openai = createLLMProvider();

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "messages array is required" });
        return;
      }

      const result = streamText({
        model: openai.chat("gpt-4o"),
        system:
          "You are a helpful assistant. You have access to tools for getting weather and doing calculations. Use them when appropriate.",
        messages,
        tools,
        stopWhen: stepCountIs(5),
      });

      result.pipeUIMessageStreamToResponse(res);
    } catch (error) {
      console.error("[/api/chat] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
}

export { tools };
