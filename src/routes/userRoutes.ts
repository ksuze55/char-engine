import { Router } from "express";
import {
  authenticateToken,
  AuthRequest
} from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.get("/profile", authenticateToken, (req: AuthRequest, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

router.get(
  "/admin",
  authenticateToken,
  requireRole("admin"),
  (req: AuthRequest, res) => {
    res.json({
      message: "Admin route accessed",
      user: req.user
    });
  }
);

export default router;