import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import fs from "node:fs";
import path from "node:path";

export function getGeminiApiKey(): string | undefined {
  // 1. Try reading .env file from disk first to get the most updated key in development
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/^GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
      if (match && match[1]) {
        process.env.GEMINI_API_KEY = match[1];
        return match[1];
      }
    }
  } catch (err) {
    // Silent fallback
  }

  // 2. Try process.env
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  // 3. Try import.meta.env
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.GEMINI_API_KEY) {
    return (import.meta as any).env.GEMINI_API_KEY;
  }
  
  return undefined;
}

export function createGeminiClient(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

