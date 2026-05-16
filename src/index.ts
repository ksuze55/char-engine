import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import aiRoutes from "./routes/aiRoutes";
import adminRoutes from "./routes/adminRoutes";
import conversationRoutes from "./routes/conversationRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.use("/api/conversations", conversationRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "Engine Online"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});