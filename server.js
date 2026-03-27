const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json());

// MongoDB Connection
const mongoURL = process.env.MONGODB_URL || "mongodb://localhost:27017/friendsDB";
mongoose.connect(mongoURL).catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  isOnline: Boolean,
});

const User = mongoose.model("User", userSchema);

// API to get online users
app.get("/online-users", async (req, res) => {
  try {
    const users = await User.find({ isOnline: true });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
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
  console.log(`Server running on port ${port}`);
});
