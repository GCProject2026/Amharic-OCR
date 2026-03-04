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
app.use(express.json({ limit: "5mb" })); 
app.use(express.urlencoded({ extended: true, limit: "5mb" })); 
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.send("OCR Backend Running ✅");
});

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

// Error handler - Modified to catch Multer errors specifically
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:", err.message);
  res.status(err.status || 400).json({ 
    success: false,
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});