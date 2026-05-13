import { Router } from "express";
import OpenAI from "openai";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/ask", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { prompt } = req.body;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    res.json({
      answer: response.output_text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "AI request failed"
    });
  }
});

export default router;