const jwt = require("jsonwebtoken");
const { statements } = require("../db/database");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

const setupSocket = (io) => {
  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = statements.getUserById.get(decoded.userId);

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

    // Join user's personal room for targeted events
    socket.join(socket.user.id);

    // Acknowledge connection
    socket.emit("connected", {
      userId: socket.user.id,
      username: socket.user.username,
    });

    // Handle task status quick-update from client
    socket.on("task:status_change", ({ taskId, status }) => {
      // Broadcast to all tabs/devices of same user
      socket.to(socket.user.id).emit("task:status_change", { taskId, status });
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 User disconnected: ${socket.user.username} — ${reason}`);
    });
  });

  return io;
};

module.exports = { setupSocket };
