/**
 * OCR Backend Server
 * Project: Handwritten Amharic OCR & Smart Text Platform
 * Author: Fatuma Ibrahim
 *
 * Purpose:
 * - Loads environment variables
 * - Connects to MongoDB Atlas
 * - Registers authentication and OCR API routes
 * - Exposes health check endpoint for system verification
 */

console.log("🚀 OCR Backend booting...");

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const ocrRoutes = require("./routes/ocrRoutes");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.send("OCR Backend Running ✅");
});

// Health check endpoint (system verification)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "OCR Backend",
    database: "Connected",
    time: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/ocr", ocrRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(400).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
