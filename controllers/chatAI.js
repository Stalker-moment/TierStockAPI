import express from "express";
const router = express.Router();

//import file functions
import { chatAI } from "../function/AIService.js";

router.post("/AI", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const response = await chatAI(message);

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;