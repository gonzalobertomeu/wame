import type { Server } from "bun";
import { v4 } from "uuid";
import { Manager } from "./Manager";
import type { SocketData, WameOptions } from "./types/WameTypes";
import { WebSockets } from "./Websockets";
import { Router } from "./Router";
import { createRoomHandlers } from "./handlers/RoomHandlers";

export class Wame {
  private server: Server<SocketData> | null = null;
  private manager: Manager;
  private router: Router | null = null;
  private options: WameOptions;

  public constructor(options: WameOptions = {}) {
    this.manager = new Manager();
    this.options = options;
  }

  public use(router: Router): this {
    if (this.router !== null) {
      throw new Error("Router is already defined");
    }

    const defaultHandlers = createRoomHandlers(this.manager);
    for (const [action, handler] of Object.entries(defaultHandlers)) {
      router.setDefault(action, handler);
    }

    this.router = router;
    return this;
  }

  public serve(): Server<SocketData> {
    if (this.router === null) {
      throw new Error("Router is not defined. Use wame.use(router) first");
    }

    const ws = new WebSockets(this.manager, this.router);
    this.server = Bun.serve<SocketData>({
      port: this.options.port ?? 3000,
      websocket: WebSockets.config(ws),
      fetch(req, server) {
        const url = new URL(req.url);
        const cid = url.searchParams.get("connectionId") ?? v4();

        if (server.upgrade(req, { data: { connectionId: cid } })) {
          return;
        }
        return Response.json({ error: "Cannot upgrade" });
      },
    });

    return this.server;
  }

  public getServer() {
    return this.server;
  }

  public getManager() {
    return this.manager;
  }
}
