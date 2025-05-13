import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { roomRoutes } from "./routes/room.routes";
import { setupSocketHandlers } from "./socket/socket.handlers";
import { swaggerSpec } from "./config/swagger";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/rooms", roomRoutes);

// Socket.io setup
setupSocketHandlers(io);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

httpServer.listen(
  {
    port: PORT,
    host: HOST,
  },
  () => {
    console.log(`Server running on ${HOST}:${PORT}`);
    console.log(
      `API Documentation available at http://${HOST}:${PORT}/api-docs`
    );
  }
);
