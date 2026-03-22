const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const chatRoutes = require("./routes/chat");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Make io accessible in routes
app.set("io", io);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/listings", require("./routes/listings"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/negotiations", require("./routes/negotiations"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/users", require("./routes/users"));
app.use("/api/ai", require("./routes/ai"));
app.use('/api/chat', require('./routes/chat'))

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Socket.io
const connectedUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    connectedUsers[userId] = socket.id;
    socket.userId = userId;
  });

  socket.on("join_negotiation", (negotiationId) => {
    socket.join(`negotiation_${negotiationId}`);
  });

  socket.on("send_message", async (data) => {
    const { negotiationId, message } = data;
    io.to(`negotiation_${negotiationId}`).emit("new_message", message);
  });

  socket.on("order_update", (data) => {
    const { buyerId, farmerId, order } = data;
    [buyerId, farmerId].forEach((uid) => {
      const sid = connectedUsers[uid];
      if (sid) io.to(sid).emit("order_status_changed", order);
    });
  });

  socket.on("disconnect", () => {
    if (socket.userId) delete connectedUsers[socket.userId];
    console.log("User disconnected:", socket.id);
  });
});

// MongoDB connection + server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
