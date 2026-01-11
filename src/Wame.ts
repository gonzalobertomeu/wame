import type { Server } from "bun";
import { ServerFactory } from "./network/ServerFactory";

export class Wame {
  private server: Server<undefined> | undefined;
  private factory: ServerFactory;
  public constructor() {
    console.log("new wame instance created");
    this.factory = new ServerFactory();
  }

  public serve() {
    this.server = this.factory.create();
  }

  public port() {
    return this.server?.port;
  }

  public config() {}
}
