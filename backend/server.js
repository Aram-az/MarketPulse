import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const PORT = 5000;
const BACKBOARD_URL = "https://app.backboard.io/api";
const API_KEY = process.env.BACKBOARD_API_KEY;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assistantIdsPath = path.join(__dirname, "assistant-ids.json");
let ASSISTANT_IDS = {};

if (fs.existsSync(assistantIdsPath)) {
  ASSISTANT_IDS = JSON.parse(fs.readFileSync(assistantIdsPath, "utf8"));
  console.log("✅ Loaded Assistant IDs:", ASSISTANT_IDS);
} else {
  console.error("❌ Error: assistant-ids.json not found.");
}

const app = express();

// 1. Allow Frontend to connect
app.use(cors({ origin: "*" })); 
app.use(express.json());

// 2. Logging Middleware (SEE REQUESTS IN TERMINAL)
app.use((req, res, next) => {
  console.log(`\n📥 [${req.method}] ${req.url}`);
  next();
});

const upload = multer({ storage: multer.memoryStorage() });

// --- ROUTES ---

// Start Chat
app.post("/api/chat/start", async (req, res) => {
  try {
    const { agentName } = req.body;
    const targetAgentId = ASSISTANT_IDS[agentName?.toUpperCase()] || ASSISTANT_IDS.NORMAN;

    console.log(`🔹 Creating thread for agent: ${agentName} (${targetAgentId})`);

    const response = await axios.post(
      `${BACKBOARD_URL}/assistants/${targetAgentId}/threads`,
      {},
      { headers: { "X-API-Key": API_KEY } }
    );

    console.log(`✅ Thread Created: ${response.data.thread_id}`);
    res.json({ threadId: response.data.thread_id });

  } catch (error) {
    console.error("❌ Thread Creation Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create thread" });
  }
});

// Send Message
app.post("/api/chat/message", upload.single("file"), async (req, res) => {
  try {
    // Log the raw body to debug
    const threadId = req.body.threadId;
    const message = req.body.message;
    
    console.log(`🔹 Received Message Request -> Thread: ${threadId}`);

    if (!threadId || threadId === "null" || threadId === "undefined") {
      console.warn("⚠️  Request Rejected: Missing Thread ID");
      return res.status(400).json({ error: "Thread ID is required. Please refresh the page." });
    }

    const formData = new FormData();
    formData.append("content", message || "");
    formData.append("stream", "false");
    formData.append("memory", "Auto");

    if (req.file) {
      console.log(`📎 With File: ${req.file.originalname}`);
      formData.append("files", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
    }

    const response = await axios.post(
      `${BACKBOARD_URL}/threads/${threadId}/messages`,
      formData,
      {
        headers: {
          "X-API-Key": API_KEY,
          ...formData.getHeaders(),
        },
      }
    );

    console.log("✅ AI Response received");
    res.json({ response: response.data.content });

  } catch (error) {
    console.error("❌ Message Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to process message" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});