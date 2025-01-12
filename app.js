import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

dotenv.config();
const app = express();
const port = process.env.PORT || 4090;

// Use controllers
import getAllStock from "./controllers/getAllStock.js";
import chatAI from "./controllers/chatAI.js";
import { getStockPrice } from "./function/stockServices.js";

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/stocks", getAllStock);
app.use("/api/chat", chatAI);

// Start HTTP server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// WebSocket setup
const wss = new WebSocketServer({ server });

// Track connected clients
wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection established.");

  // Parse query parameters
  const urlParams = new URLSearchParams(req.url.split("?")[1]);
  const code = urlParams.get("code");

  if (!code) {
    ws.send(JSON.stringify({ error: "Missing stock code in query." }));
    ws.close();
    return;
  }

  console.log(`Subscribed to stock code: ${code}`);

  const interval = setInterval(async () => {
    try {
      const data = await getStockPrice(code);
      ws.send(JSON.stringify({ type: "update", price: data.quoteResponse.result[0].regularMarketPrice }));
    } catch (error) {
      console.error("Error fetching stock data:", error);
      ws.send(JSON.stringify({ error: "Failed to fetch stock data." }));
    }
  }, 5000);

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
    clearInterval(interval);
  });
});