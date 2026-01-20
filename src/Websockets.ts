import type { Manager } from "./Manager";
import type { Router } from "./Router";
import { Message } from "./communication/Message";
import { Response } from "./communication/Response";
import type { Socket } from "./types/WameTypes";

export class WebSockets {
  public constructor(
    private manager: Manager,
    private router: Router,
  ) {}

  public open(ws: Socket) {
    try {
      const user = this.manager.connectionHasUser(ws.data.connectionId);
      user.reconnect(ws);
      console.log(`User ${ws.data.connectionId} reconnected`);
    } catch {
      this.manager.createUser(ws, ws.data.connectionId);
      console.log(`User ${ws.data.connectionId} connected`);
    }
  }

  public message(ws: Socket, message: string) {
    try {
      const msg = Message.fromString(message);
      const { user, room } = this.manager.findUser(ws.data.connectionId);
      const response = this.router.handle(user, room, msg.action, msg.payload);
      if (response) {
        new Response(ws).send(response);
      }
    } catch (error) {
      new Response(ws).error((error as Error).message);
    }
  }

  public close(ws: Socket, code: number, reason: string) {
    console.log(`User ${ws.data.connectionId} disconnected (${code})`);
  }

  public static config(instance: WebSockets) {
    return {
      open: instance.open.bind(instance),
      message: instance.message.bind(instance),
      close: instance.close.bind(instance),
    };
  }
}
