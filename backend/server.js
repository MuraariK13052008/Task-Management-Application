require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { initDb } = require("./db/database");
const { setupSocket } = require("./socket/socketHandler");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ["GET","POST"], credentials: true },
});

setupSocket(io);

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => { req.io = io; next(); });

app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Task Manager API running on port ${PORT}`);
    console.log(`📡 Socket.io ready`);
    console.log(`🌐 Client: ${CLIENT_URL}\n`);
  });
}).catch((err) => {
  console.error("Failed to init database:", err);
  process.exit(1);
});

module.exports = { app, server };
