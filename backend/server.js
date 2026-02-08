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
  console.error("❌ Error: assistant-ids.json not found. Run setup-assistants.js first.");
  process.exit(1);
}


const app = express();
app.use(cors());
app.use(express.json());


const upload = multer({ storage: multer.memoryStorage() });




app.post("/api/chat/start", async (req, res) => {
  try {
    const { agentName } = req.body; // 
    
    
    const targetAgentId = ASSISTANT_IDS[agentName?.toUpperCase()] || ASSISTANT_IDS.NORMAN;

    console.log(`Starting thread with ${agentName} (${targetAgentId})...`);

    const response = await axios.post(
      `${BACKBOARD_URL}/assistants/${targetAgentId}/threads`,
      {}, // Empty body
      { headers: { "X-API-Key": API_KEY } }
    );

    res.json({ 
      threadId: response.data.thread_id, 
      agentId: targetAgentId,
      message: "Thread created successfully" 
    });

  } catch (error) {
    console.error("Error creating thread:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create chat thread" });
  }
});


app.post("/api/chat/message", upload.single("file"), async (req, res) => {
  try {
    const { threadId, message } = req.body;
    const file = req.file;

    if (!threadId) {
      return res.status(400).json({ error: "Thread ID is required" });
    }

    console.log(`Sending message to thread ${threadId}...`);

    
    const formData = new FormData();
    formData.append("content", message || ""); 
    
    // Default settings for Backboard
    formData.append("stream", "false"); 
    formData.append("memory", "Auto"); 
    
    
    if (file) {
      console.log(`📎 Attaching file: ${file.originalname} (${file.size} bytes)`);
      formData.append("files", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
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

    
    const botResponse = response.data.content;
    
    res.json({ response: botResponse });

  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to process message" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});