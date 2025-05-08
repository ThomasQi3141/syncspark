import { Server, Socket } from "socket.io";

// In-memory room user list: { [roomCode]: Array<{ id: string, nickname: string }> }
const roomUsers: Record<string, Array<{ id: string; nickname: string }>> = {};

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-room", (data: { roomCode: string; nickname: string }) => {
      const { roomCode, nickname } = data;
      socket.join(roomCode);
      // Add user to room
      if (!roomUsers[roomCode]) roomUsers[roomCode] = [];
      roomUsers[roomCode].push({ id: socket.id, nickname });
      console.log(`Client ${socket.id} joined room ${roomCode} as ${nickname}`);
      // Broadcast updated user list
      io.to(roomCode).emit("user-list", roomUsers[roomCode]);
    });

    socket.on("leave-room", (roomCode: string) => {
      socket.leave(roomCode);
      // Remove user from room
      if (roomUsers[roomCode]) {
        roomUsers[roomCode] = roomUsers[roomCode].filter(
          (u) => u.id !== socket.id
        );
        io.to(roomCode).emit("user-list", roomUsers[roomCode]);
      }
      console.log(`Client ${socket.id} left room ${roomCode}`);
    });

    socket.on("code-change", (data: { roomCode: string; code: string }) => {
      socket.to(data.roomCode).emit("code-update", data.code);
    });

    socket.on("cursor-move", (data: { roomCode: string; position: number }) => {
      socket.to(data.roomCode).emit("cursor-update", {
        userId: socket.id,
        position: data.position,
      });
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room === socket.id) continue;
        // Remove user from room
        if (roomUsers[room]) {
          roomUsers[room] = roomUsers[room].filter((u) => u.id !== socket.id);
          io.to(room).emit("user-list", roomUsers[room]);
        }
        socket.to(room).emit("user-left", { userId: socket.id });
        console.log(`Client ${socket.id} is leaving room ${room}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};
