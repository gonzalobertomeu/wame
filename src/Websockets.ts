import type { Manager } from "./Manager";
import type { Socket } from "./types/WameTypes";

export class WebSockets {
  public constructor(private manager: Manager) {}

  public open(ws: Socket) {
    try {
      const user = this.manager.connectionHasUser(ws.data.connectionId);
      user.reconnect(ws);
      console.log("user reconnecting");
    } catch (error) {
      const user = this.manager.createUser(ws, ws.data.connectionId);
    }
    console.log(`client ${ws.data.connectionId} connected`);
  }

  public message(ws: Socket, message: string) {
    console.log(`Message: ${message}`);
  }

  public close(ws: Socket, code: number, reason: string) {
    console.log(`Socket ${ws.data.connectionId} has disconnected`);
  }
}
