import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";

import { prisma } from "../lib/prisma";

import {
  authenticateToken,
  AuthRequest
} from "../middleware/authMiddleware";

import {
  chunkText,
  createEmbedding
} from "../services/embeddingService";

const router = Router();

const upload = multer({
  dest: "uploads/"
});

router.use(authenticateToken);

router.post(
  "/text",
  upload.single("file"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }

      const filePath = path.join(process.cwd(), req.file.path);
      const content = fs.readFileSync(filePath, "utf-8");

      const document = await prisma.document.create({
        data: {
          userId: req.user!.id,
          title: req.file.originalname,
          content
        }
      });

      fs.unlinkSync(filePath);

      res.json(document);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Text upload failed"
      });
    }
  }
);

router.post(
  "/pdf",
  upload.single("file"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }

      const filePath = path.join(process.cwd(), req.file.path);
      const fileBuffer = fs.readFileSync(filePath);

      const parser = new PDFParse({
        data: fileBuffer
      });

      const parsedPdf = await parser.getText();

      const document = await prisma.document.create({
        data: {
          userId: req.user!.id,
          title: req.file.originalname,
          content: parsedPdf.text
        }
      });

      const chunks = chunkText(parsedPdf.text);

      for (const chunk of chunks) {
      await prisma.embedding.create({
        data: {
      documentId: document.id,
      content: chunk,
      vector: []
       }
      });
      }

      fs.unlinkSync(filePath);

      res.json(document);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "PDF upload failed"
      });
    }
  }
);

export default router;