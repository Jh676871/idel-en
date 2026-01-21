
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import * as path from 'path';

// Load env vars manually since we might not have dotenv installed or configured for scripts
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (e) {
    console.error("Error loading .env.local", e);
  }
}

loadEnv();

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Error: GOOGLE_GEMINI_API_KEY not found in environment or .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function checkModels() {
  try {
    console.log("Fetching model list...");
    // @ts-ignore - listModels is available but might not be in the strict types version we have or needs a specific call
    // Actually, looking at docs, it's usually on the class or via a client. 
    // In @google/generative-ai, listModels might not be directly exposed on the client instance in older versions, 
    // but let's try the standard way if available, or fetch via REST if needed.
    // Wait, the SDK usually has a `getGenerativeModel` but listing might be a separate API call.
    // Let's check if `listModels` exists on `genAI` or we need to use the ModelService.
    
    // NOTE: The Node.js SDK for Gemini (GoogleGenerativeAI) mainly focuses on inference. 
    // Listing models is often done via the Google AI Studio or REST API. 
    // However, let's try to see if we can use the `makeRequest` or similar if `listModels` isn't there.
    // Actually, recent versions might support it. Let's try to assume it's there or use a workaround.
    
    // If SDK doesn't support listModels directly, we can use fetch.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (!data.models) {
      console.error("No models found or error in response:", data);
      return;
    }

    const models = data.models;
    console.log(`\nFound ${models.length} models:\n`);

    const tableData = models.map((m: any) => ({
      name: m.name.replace('models/', ''),
      version: m.version,
      displayName: m.displayName
    }));

    console.table(tableData);

    console.log("\n--- Gemini 3.0 Check ---");
    const gemini3Models = models.filter((m: any) => m.name.includes("gemini-3.0")); // Assuming naming convention

    if (gemini3Models.length > 0) {
      console.log("✅ Gemini 3.0 models detected:");
      gemini3Models.forEach((m: any) => {
        console.log(`- ${m.name} (${m.displayName})`);
      });
    } else {
      console.log("❌ No explicit 'gemini-3.0' models found.");
      
      // Fallback check for 2.0 or experimental
      const gemini2Models = models.filter((m: any) => m.name.includes("gemini-2.0"));
      if (gemini2Models.length > 0) {
         console.log("ℹ️ Gemini 2.0 models found (likely latest available):");
         gemini2Models.forEach((m: any) => console.log(`- ${m.name}`));
      }
    }

  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

checkModels();
