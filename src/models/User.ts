import { v4 } from "uuid";
import type { Socket } from "../types/WameTypes";

export class User {
  public readonly id: string;
  private connectionId: string;
  private socket: Socket;
  private nick?: string;
  public constructor(socket: Socket, connectionId: string, nick?: string) {
    this.id = v4();
    this.socket = socket;
    this.nick = nick ?? "";
    this.connectionId = connectionId;
  }

  public send(message: string) {
    this.socket.send(message);
  }

  public getNick() {
    return this.nick;
  }

  public getConnectionId() {
    return this.connectionId;
  }

  public isConnected() {
    return this.socket.readyState;
  }

  public reconnect(socket: Socket) {
    if (this.socket.readyState < 3) {
      throw new Error("Socket is already open");
    }
    this.socket = socket;
  }
}
