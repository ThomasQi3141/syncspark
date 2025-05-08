import { io, Socket } from "socket.io-client";

let socket: Socket;

export function getSocket(): Socket {
  if (!socket) {
    // autoConnect: false so you can control when to open
    socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001", {
      autoConnect: false,
      transports: ["websocket"],
    });
  }
  return socket;
}
