import { describe, it, expect } from "vitest";

function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    if (/\s/.test(expr[i])) { i++; continue; }
    const numMatch = expr.slice(i).match(/^(\d+\.?\d*)/);
    if (numMatch) { tokens.push(numMatch[1]); i += numMatch[1].length; continue; }
    if ("+-*/^%()".includes(expr[i])) { tokens.push(expr[i]); i++; continue; }
    throw new Error(`Invalid character: ${expr[i]}`);
  }
  return tokens;
}

function safeMathEval(expression: string): number {
  const sanitized = expression.replace(/×/g, "*").replace(/÷/g, "/").replace(/\s+/g, " ").trim();
  if (/[a-zA-Z_$]/.test(sanitized)) {
    throw new Error("Expression contains forbidden characters");
  }
  const tokens = tokenize(sanitized);
  let pos = 0;
  function parseExpr(): number {
    let left = parseTerm();
    while (pos < tokens.length && (tokens[pos] === "+" || tokens[pos] === "-")) {
      const op = tokens[pos++];
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }
  function parseTerm(): number {
    let left = parsePower();
    while (pos < tokens.length && (tokens[pos] === "*" || tokens[pos] === "/" || tokens[pos] === "%")) {
      const op = tokens[pos++];
      const right = parsePower();
      if (op === "*") left = left * right;
      else if (op === "/") { if (right === 0) throw new Error("Division by zero"); left = left / right; }
      else left = left % right;
    }
    return left;
  }
  function parsePower(): number {
    let base = parseFactor();
    if (pos < tokens.length && tokens[pos] === "^") { pos++; base = Math.pow(base, parsePower()); }
    return base;
  }
  function parseFactor(): number {
    if (tokens[pos] === "(") { pos++; const val = parseExpr(); if (tokens[pos] !== ")") throw new Error("Missing )"); pos++; return val; }
    const num = parseFloat(tokens[pos++]); if (isNaN(num)) throw new Error("Invalid number"); return num;
  }
  const result = parseExpr();
  if (pos !== tokens.length) throw new Error("Unexpected tokens");
  return result;
}

describe("safeMathEval", () => {
  it("should evaluate basic arithmetic", () => {
    expect(safeMathEval("2 + 3")).toBe(5);
    expect(safeMathEval("10 - 4")).toBe(6);
    expect(safeMathEval("3 * 7")).toBe(21);
    expect(safeMathEval("20 / 4")).toBe(5);
  });
  it("should handle operator precedence", () => {
    expect(safeMathEval("2 + 3 * 4")).toBe(14);
    expect(safeMathEval("(2 + 3) * 4")).toBe(20);
  });
  it("should handle power and modulo", () => {
    expect(safeMathEval("2 ^ 3")).toBe(8);
    expect(safeMathEval("10 % 3")).toBe(1);
  });
  it("should handle decimals and unicode ops", () => {
    expect(safeMathEval("3.14 * 2")).toBeCloseTo(6.28);
    expect(safeMathEval("5 × 3")).toBe(15);
    expect(safeMathEval("10 ÷ 2")).toBe(5);
  });
  it("should REJECT function calls (code injection)", () => {
    expect(() => safeMathEval("Math.pow(2,3)")).toThrow();
    expect(() => safeMathEval("eval('1+1')")).toThrow();
    expect(() => safeMathEval("process.exit()")).toThrow();
  });
  it("should REJECT variable names", () => {
    expect(() => safeMathEval("x + 1")).toThrow();
    expect(() => safeMathEval("$foo")).toThrow();
    expect(() => safeMathEval("_bar")).toThrow();
  });
  it("should REJECT division by zero", () => {
    expect(() => safeMathEval("1 / 0")).toThrow("Division by zero");
  });
  it("should REJECT invalid expressions", () => {
    expect(() => safeMathEval("2 +")).toThrow();
    expect(() => safeMathEval("(2 + 3")).toThrow();
    expect(() => safeMathEval("2 + 3)")).toThrow();
  });
});
