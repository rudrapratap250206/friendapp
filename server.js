const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json());

// MongoDB Connection with Retry Logic
let dbConnected = false;
const mongoURL = process.env.MONGODB_URL || "mongodb://localhost:27017/friendsDB";

mongoose.connect(mongoURL, {
  retryWrites: false,
  serverSelectionTimeoutMS: 5000
}).then(() => {
  dbConnected = true;
  console.log("✓ MongoDB connected successfully");
}).catch(err => {
  dbConnected = false;
  console.warn("⚠ MongoDB connection failed - app will still run");
  console.warn("Error:", err.message);
  // Try to reconnect every 10 seconds
  setInterval(() => {
    mongoose.connect(mongoURL).then(() => {
      dbConnected = true;
      console.log("✓ Reconnected to MongoDB");
    }).catch(err => {
      console.warn("MongoDB still unavailable");
    });
  }, 10000);
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  isOnline: Boolean,
});

const User = mongoose.model("User", userSchema);

// Health Check Endpoint
app.get("/health", (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date(),
    database: dbConnected ? "Connected" : "Disconnected"
  };
  res.status(dbConnected ? 200 : 503).json(health);
});

// API to get online users
app.get("/online-users", async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: "Database not connected", users: [] });
  }
  try {
    const users = await User.find({ isOnline: true });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message, users: [] });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: "Database not connected" });
  }
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    user.isOnline = true;
    await user.save();
    res.json({ message: "Logged in successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout endpoint
app.post("/logout", async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: "Database not connected" });
  }
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    user.isOnline = false;
    await user.save();
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to my friends website!");
});

// Azure Port Configuration
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✓ Server running on port ${port}`);
  console.log(`✓ Visit: http://localhost:${port}`);
  console.log(`✓ Health check: http://localhost:${port}/health`);
});

// Graceful error handling
process.on("unhandledRejection", err => {
  console.error("Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
  console.log("Server still running...");
});
