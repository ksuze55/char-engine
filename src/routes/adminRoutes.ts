import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  authenticateToken,
  AuthRequest
} from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.use(authenticateToken);
router.use(requireRole("admin"));

router.get("/stats", async (req: AuthRequest, res) => {
  const totalUsers = await prisma.user.count();

  const activeUsers = await prisma.user.count({
    where: {
      isActive: true
    }
  });

  const totalMessages = await prisma.aiMessage.count();

  const totalConversations = await prisma.conversation.count();

  const latestUsers = await prisma.user.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  res.json({
    totalUsers,
    activeUsers,
    totalMessages,
    totalConversations,
    latestUsers
  });
});

router.get("/users", async (req: AuthRequest, res) => {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  res.json(users);
});

router.patch("/users/:id/role", async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { role } = req.body;

  if (!["user", "admin", "agent"].includes(role)) {
    return res.status(400).json({
      message: "Invalid role"
    });
  }

  const user = await prisma.user.update({
    where: {
      id
    },
    data: {
      role
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true
    }
  });

  res.json(user);
});

router.patch("/users/:id/status", async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { isActive } = req.body;

  const user = await prisma.user.update({
    where: {
      id
    },
    data: {
      isActive
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true
    }
  });

  res.json(user);
});

export default router;