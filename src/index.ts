import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import aiRoutes from "./routes/aiRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "Engine Online"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});