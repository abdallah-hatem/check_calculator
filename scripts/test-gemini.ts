import * as dotenv from "dotenv";

import { API_KEY } from "../utils/keys";
// Load env vars from .env.local
dotenv.config({ path: ".env.local" });

async function listModelsRaw() {
  const apiKey = API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }

  console.log("Using API Key:", apiKey.substring(0, 5) + "...");
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error);
      return;
    }

    if (!data.models) {
      console.log("⚠️ No models returned. Response:", data);
      return;
    }

    console.log("\n✅ Available Models:");
    data.models.forEach((m: any) => {
      if (m.name.includes("gemini")) {
        console.log(`- ${m.name} (${m.displayName})`);
        console.log(`  Supported: ${m.supportedGenerationMethods.join(", ")}`);
      }
    });
  } catch (error: any) {
    console.error("Fetch error:", error);
  }
}

listModelsRaw();
