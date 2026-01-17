import type { ServerWebSocket } from "bun";
import type { Room } from "./models/Room";
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
  }

  public getRoom(id: string) {
    return this.rooms.find((r) => {
      return r.id == id;
    });
  }

  public connectionHasUser(connectionId: string) {
    const lobbyUser = this.lobby.find(
      (u) => u.getConnectionId() == connectionId,
    );
    if (lobbyUser) {
      return lobbyUser;
    }
    for (const room of this.rooms) {
      const user = room.list().find((u) => {
        return u.getConnectionId() == connectionId;
      });
      if (user) {
        return user;
      }
    }
    throw new Error("User not found");
  }

  public listLobbyUsers() {
    return this.lobby;
  }
}
