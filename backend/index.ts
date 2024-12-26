import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for the frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3001"); // Next.js's default port
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST");
  next();
});

// A simple GET endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Hello from Express!" });
});

// Endpoint to receive text
app.post("/submit-text", (req: Request, res: Response) => {
  const { text } = req.body;
  console.log("Received text:", text);
  res.json({ success: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
