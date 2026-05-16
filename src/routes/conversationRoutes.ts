import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  authenticateToken,
  AuthRequest
} from "../middleware/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.post("/", async (req: AuthRequest, res) => {
  const { title } = req.body;

  const conversation = await prisma.conversation.create({
    data: {
      userId: req.user!.id,
      title: title || "New Conversation"
    }
  });

  res.json(conversation);
});

router.get("/", async (req: AuthRequest, res) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      userId: req.user!.id
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json(conversations);
});

router.get("/:id/messages", async (req: AuthRequest, res) => {
  const conversationId = Number(req.params.id);

  const messages = await prisma.aiMessage.findMany({
    where: {
      userId: req.user!.id,
      conversationId
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  res.json(messages);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const conversationId = Number(req.params.id);

  await prisma.aiMessage.deleteMany({
    where: {
      userId: req.user!.id,
      conversationId
    }
  });

  await prisma.conversation.delete({
    where: {
      id: conversationId
    }
  });

  res.json({
    message: "Conversation deleted"
  });
});

export default router;