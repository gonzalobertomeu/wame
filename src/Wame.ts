import type { Server } from "bun";
import { ServerFactory } from "./network/ServerFactory";

export class Wame {
  private server: Server<undefined> | undefined;
  private factory: ServerFactory<undefined>;
  public constructor() {
    console.log("new wame instance created");
    this.factory = new ServerFactory();
  }

  public serve() {
    try {
      this.server = this.factory.create();
    } catch (err) {
      console.log(err);
    }
  }

  public port() {
    return this.server?.port;
  }

  public config() {
    return {
      api: this.factory.setApiRoutes,
      events: this.factory.setWebsocketEvents,
    };
  }
}
