import { Server, Socket } from "socket.io";

// 20 distinct HEX colors
const USER_COLORS = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#F39C12",
  "#8E44AD",
  "#16A085",
  "#E67E22",
  "#2ECC71",
  "#E74C3C",
  "#3498DB",
  "#1ABC9C",
  "#9B59B6",
  "#34495E",
  "#27AE60",
  "#2980B9",
  "#D35400",
  "#C0392B",
  "#7F8C8D",
  "#F1C40F",
  "#2C3E50",
];

export const roomUsers: Record<
  string,
  Array<{ id: string; nickname: string; color: string }>
> = {};

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-room", (data: { roomCode: string; nickname: string }) => {
      const { roomCode, nickname } = data;
      socket.join(roomCode);
      // Limit to 20 users per room
      if (!roomUsers[roomCode]) roomUsers[roomCode] = [];
      if (roomUsers[roomCode].length >= 20) {
        socket.emit("room-full");
        return;
      }
      // Assign a color not already taken in the room
      const takenColors = roomUsers[roomCode].map((u) => u.color);
      const availableColors = USER_COLORS.filter(
        (c) => !takenColors.includes(c)
      );
      const color =
        availableColors[0] ||
        USER_COLORS[roomUsers[roomCode].length % USER_COLORS.length];
      roomUsers[roomCode].push({ id: socket.id, nickname, color });
      console.log(
        `Client ${socket.id} joined room ${roomCode} as ${nickname} with color ${color}`
      );
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

    socket.on(
      "language-change",
      (data: { roomCode: string; language: string }) => {
        socket.to(data.roomCode).emit("language-change", data.language);
      }
    );

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
