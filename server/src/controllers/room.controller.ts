import { Request, Response } from "express";
import { RoomService } from "../services/room.service";

export class RoomController {
  private roomService: RoomService;

  constructor() {
    this.roomService = new RoomService();
  }

  createRoom = async (req: Request, res: Response) => {
    try {
      const { name, isPublic } = req.body;
      const room = await this.roomService.createRoom(name, isPublic);
      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to create room" });
    }
  };

  getRoom = async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const room = await this.roomService.getRoom(code);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to get room" });
    }
  };

  getAllRooms = async (req: Request, res: Response) => {
    try {
      const rooms = await this.roomService.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to get rooms" });
    }
  };

  joinRoom = async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const { userId } = req.body;
      const room = await this.roomService.joinRoom(code, userId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to join room" });
    }
  };
}
