import { Server, Socket } from "socket.io";

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-room", (roomCode: string) => {
      socket.join(roomCode);
      console.log(`Client ${socket.id} joined room ${roomCode}`);
    });

    socket.on("leave-room", (roomCode: string) => {
      socket.leave(roomCode);
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
      // notify every room (except its own private room) that this user is gone
      for (const room of socket.rooms) {
        if (room === socket.id) continue; // skip the auto‑room
        socket.to(room).emit("user-left", { userId: socket.id });
        console.log(`Client ${socket.id} is leaving room ${room}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};
