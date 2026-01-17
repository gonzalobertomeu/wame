import type { Server } from "bun";
import { v4 } from "uuid";
import { Manager } from "./Manager";
import type { SocketData, WameOptions, Socket } from "./types/WameTypes";
import { WebSockets } from "./Websockets";
import { Router } from "./Router";

/** full websocket server */
export class Wame {
  private server: Server<SocketData>;
  private manager: Manager;
  public constructor(props: WameOptions = {}) {
    const manager = new Manager();
    const router = new Router(manager);
    const ws = new WebSockets(manager, router);
    this.server = Bun.serve<SocketData>({
      port: props.port ?? 3000,
      websocket: WebSockets.config(ws),
      fetch(req, server) {
        const url = new URL(req.url);
        let cid = url.searchParams.get("connectionId") ?? v4();

        if (server.upgrade(req, { data: { connectionId: cid } })) {
          return;
        }
        return Response.json({ error: "Cannot upgrade" });
      },
    });
    this.manager = manager;
  }

  public getServer() {
    return this.server;
  }
  public getManager() {
    return this.manager;
  }
}
