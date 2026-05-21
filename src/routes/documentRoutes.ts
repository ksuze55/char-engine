import { Router } from "express";
import OpenAI from "openai";
import { prisma } from "../lib/prisma";
import {
  authenticateToken,
  AuthRequest
} from "../middleware/authMiddleware";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.use(authenticateToken);

router.post("/", async (req: AuthRequest, res) => {
  const { title, content } = req.body;

  const document = await prisma.document.create({
    data: {
      userId: req.user!.id,
      title,
      content
    }
  });

  res.json(document);
});

router.get("/", async (req: AuthRequest, res) => {
  const documents = await prisma.document.findMany({
    where: {
      userId: req.user!.id
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json(documents);
});

router.post("/:id/summarize", async (req: AuthRequest, res) => {
  const id = Number(req.params.id);

  const document = await prisma.document.findFirst({
    where: {
      id,
      userId: req.user!.id
    }
  });

  if (!document) {
    return res.status(404).json({
      message: "Document not found"
    });
  }

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: `Summarize this document clearly:\n\n${document.content}`
  });

  res.json({
    summary: response.output_text
  });
});

router.post("/:id/ask", async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { question } = req.body;

  const document = await prisma.document.findFirst({
    where: {
      id,
      userId: req.user!.id
    }
  });

  if (!document) {
    return res.status(404).json({
      message: "Document not found"
    });
  }

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: `
Use this document to answer the question.

Document:
${document.content}

Question:
${question}
`
  });

  res.json({
    answer: response.output_text
  });
});

export default router;