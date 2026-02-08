import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.BACKBOARD_API_KEY;
const BASE_URL = "https://app.backboard.io/api";

if (!API_KEY) {
  console.error(" Error: BACKBOARD_API_KEY is missing from .env file");
  process.exit(1);
}


const assistantsConfig = [
  {
    name: "Norman",
    description: "Behavioral Bias Detector",
    system_prompt: `You are Norman, an expert Behavioral Finance AI for the National Bank Bias Detector Challenge.
    
    Your Goal: Analyze trading history (CSV/Excel) to detect psychological biases.
    
    Specific Biases to Detect:
    1. Overtrading: Look for high frequency of trades, clustering within specific hours, or trading immediately after outcomes.
    2. Loss Aversion: Check if the user holds losing trades significantly longer than winning trades. Look for wide stop-losses vs tight profit taking.
    3. Revenge Trading: Identify increased position sizing or frequency immediately following a significant loss.

    Tone: Professional, observant, and analytical. Use data from the user's uploaded files to back up your claims.`,
    model: "gpt-4o"
  },
  {
    name: "Atlas",
    description: "Data Analyst & Statistician",
    system_prompt: `You are Atlas, a quantitative trading analyst.
    
    Your Goal: Provide raw statistical insights based on trading history.
    
    Metrics to Focus On:
    - Win/Loss Rate
    - Profit Factor (Gross Profit / Gross Loss)
    - Average P/L per trade
    - Drawdown analysis
    
    Tone: Objective, mathematical, and concise. Focus on the numbers. Do not discuss psychology; leave that to Norman.`,
    model: "gpt-4o"
  },
  {
    name: "Sage",
    description: "Trading Psychology Coach",
    system_prompt: `You are Sage, a Trading Psychology Coach.
    
    Your Goal: Provide actionable mitigation strategies to help traders maintain discipline.
    
    How to Help:
    - If Norman detects Overtrading, suggest cooling-off periods (e.g., "The 2-Strike Rule").
    - If Loss Aversion is detected, suggest hard stop-loss automation strategies.
    - Provide journaling prompts to help the trader reflect on their emotional state.
    
    Tone: Empathetic, encouraging, but firm on discipline.`,
    model: "gpt-4o"
  }
];

async function createAssistant(assistant) {
  try {
    console.log(`🤖 Creating ${assistant.name}...`);
    
    const response = await axios.post(
      `${BASE_URL}/assistants`,
      {
        name: assistant.name,
        system_prompt: assistant.system_prompt,
        llm_provider: "openai",
        model_name: assistant.model
      },
      {
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const data = response.data;
    console.log(`✅ ${assistant.name} created! ID: ${data.assistant_id}`);
    return { name: assistant.name, id: data.assistant_id };

  } catch (error) {
    console.error(`❌ Failed to create ${assistant.name}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  const results = {};

  for (const config of assistantsConfig) {
    const result = await createAssistant(config);
    if (result) {
      results[result.name.toUpperCase()] = result.id;
    }
  }


  fs.writeFileSync("assistant-ids.json", JSON.stringify(results, null, 2));
  
  console.log("\n🎉 All assistants created successfully!");
  console.log("IDs saved to backend/assistant-ids.json");
  console.log(results);
}

main();