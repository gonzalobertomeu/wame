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
      console.log("user reconnecting");
    } catch (error) {
      const user = this.manager.createUser(ws, ws.data.connectionId);
    }
    console.log(`client ${ws.data.connectionId} connected`);
  }

  public message(ws: Socket, message: string) {
    try {
      const msg = Message.fromString(message);
      const response = this.router.handle(ws, msg);
      if (response) {
        new Response(ws).send(response);
      }
    } catch (error) {
      new Response(ws).error((error as Error).message);
    }
    console.log(`Message: ${message}`);
  }

  public close(ws: Socket, code: number, reason: string) {
    console.log(`Socket ${ws.data.connectionId} has disconnected`);
  }

  public static config(instance: WebSockets) {
    return {
      open: instance.open.bind(instance),
      message: instance.message.bind(instance),
      close: instance.close.bind(instance),
    };
  }
}
