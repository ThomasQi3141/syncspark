import { v4 as uuidv4 } from "uuid";
import { roomUsers } from "../socket/socket.handlers";

interface Room {
  id: string;
  code: string;
  name: string;
  isPublic: boolean;
  createdAt: Date;
  users: string[];
  language: string;
  theme: string;
  content: string;
}

export class RoomService {
  private rooms: Map<string, Room> = new Map();
  private readonly MAX_ATTEMPTS = 10;

  private generateRoomCode(): string {
    // Generate a 4-character room code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let attempts = 0;

    while (attempts < this.MAX_ATTEMPTS) {
      let code = "";
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if code already exists
      if (!this.rooms.has(code)) {
        return code;
      }

      attempts++;
    }

    // If we've exhausted all attempts, generate a longer code
    // This is extremely unlikely to happen, but just in case
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${timestamp}${random}`;
  }

  async createRoom(name: string, isPublic: boolean): Promise<Room> {
    const code = this.generateRoomCode();
    const room: Room = {
      id: uuidv4(),
      code,
      name,
      isPublic,
      createdAt: new Date(),
      users: [],
      language: "javascript",
      theme: "vs-dark",
      content: "",
    };

    this.rooms.set(code, room);
    return room;
  }

  async getRoom(code: string): Promise<Room | null> {
    const room = this.rooms.get(code) || null;
    return room;
  }

  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values())
      .filter((room) => room.isPublic)
      .map((room) => ({
        ...room,
        users: (roomUsers[room.code] || []).map((u: { id: string }) => u.id),
      }));
  }

  async joinRoom(code: string, userId: string): Promise<Room | null> {
    const room = this.rooms.get(code);
    if (!room) {
      return null;
    }

    if (!room.users.includes(userId)) {
      room.users.push(userId);
      this.rooms.set(code, room);
    }

    return room;
  }

  async updateRoom(code: string, updatedRoom: Room): Promise<void> {
    this.rooms.set(code, updatedRoom);
  }

  async deleteRoom(code: string): Promise<void> {
    this.rooms.delete(code);
  }
}

export const roomServiceSingleton = new RoomService();
