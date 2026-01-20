import { Room } from "./models/Room";
import { User } from "./models/User";
import type { Socket } from "./types/WameTypes";

export class Manager {
  private rooms: Room[];
  private lobby: User[];

  public constructor() {
    this.rooms = [];
    this.lobby = [];
  }

  public createUser(socket: Socket, connectionId: string) {
    const user = new User(socket, connectionId);
    this.lobby.push(user);
    return user;
  }

  public getRoom(id: string) {
    return this.rooms.find((r) => r.id === id);
  }

  public listRooms() {
    return this.rooms;
  }

  public createRoom(): Room {
    const room = new Room();
    this.rooms.push(room);
    return room;
  }

  public addRoom(room: Room) {
    this.rooms.push(room);
  }

  public removeRoom(roomId: string) {
    const index = this.rooms.findIndex((r) => r.id === roomId);
    if (index !== -1) {
      this.rooms.splice(index, 1);
    }
  }

  public joinRoom(user: User, roomId: string): Room {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room "${roomId}" not found`);
    }
    this.removeFromLobby(user);
    room.add(user);
    return room;
  }

  public leaveRoom(user: User, room: Room) {
    room.remove(user);
    this.lobby.push(user);
    if (room.list().length === 0) {
      this.removeRoom(room.id);
    }
  }

  public findUser(connectionId: string): { user: User; room: Room | null } {
    const lobbyUser = this.lobby.find(
      (u) => u.getConnectionId() === connectionId,
    );
    if (lobbyUser) {
      return { user: lobbyUser, room: null };
    }

    for (const room of this.rooms) {
      const user = room.list().find((u) => u.getConnectionId() === connectionId);
      if (user) {
        return { user, room };
      }
    }

    throw new Error("User not found");
  }

  public connectionHasUser(connectionId: string): User {
    return this.findUser(connectionId).user;
  }

  public listLobbyUsers() {
    return this.lobby;
  }

  public removeFromLobby(user: User) {
    const index = this.lobby.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.lobby.splice(index, 1);
    }
  }
}
