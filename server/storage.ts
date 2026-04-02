// Local file storage for Ada2AI
// Falls back to local filesystem when Manus Forge is not available

import { ENV } from './_core/env';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';

const UPLOAD_DIR = path.resolve(process.cwd(), '.uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Serve uploaded files statically (called from index.ts)
export function setupStorageStatic(app: any) {
  app.use('/uploads', express.static(UPLOAD_DIR));
}

function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  return { available: !!(baseUrl && apiKey), baseUrl: (baseUrl || '').replace(/\/+$/, ''), apiKey: apiKey || '' };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

// ── Local storage implementation ──────────────────────────────────────────────
async function localPut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const filePath = path.join(UPLOAD_DIR, key);
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const buffer = typeof data === 'string' ? Buffer.from(data, 'base64') : Buffer.from(data);
  fs.writeFileSync(filePath, buffer);
  
  const url = `/uploads/${key}`;
  return { key, url };
}

async function localGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/uploads/${key}` };
}

// ── Forge remote storage ─────────────────────────────────────────────────────
function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

async function ensureTrailingSlash(value: string): Promise<string> {
  return value.endsWith("/") ? value : `${value}/`;
}

async function forgePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = `${baseUrl}/v1/storage/upload?path=${key}`;
  
  const blob = typeof data === "string"
    ? new Blob([data], { type: contentType })
    : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, key.split("/").pop() ?? key);
  
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: form,
  });
  
  if (!response.ok) {
    throw new Error(`Storage upload failed (${response.status})`);
  }
  const url = (await response.json()).url;
  return { key, url };
}

async function forgeGet(relKey: string): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const downloadUrl = `${baseUrl}/v1/storage/downloadUrl?path=${key}`;
  const response = await fetch(downloadUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return { key, url: (await response.json()).url };
}

// ── Exports ──────────────────────────────────────────────────────────────────
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  if (config.available) {
    return forgePut(relKey, data, contentType);
  }
  return localPut(relKey, data, contentType);
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  if (config.available) {
    return forgeGet(relKey);
  }
  return localGet(relKey);
}
