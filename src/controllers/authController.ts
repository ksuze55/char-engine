import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    return res.json({
      message: "User created",
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d"
      }
    );

    return res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
}