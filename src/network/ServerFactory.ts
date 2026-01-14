import type { Serve, WebSocketHandler } from "bun";
import { Config } from "../shared/Config";

export class ServerFactory<W, R extends string = string> {
  private options: Partial<Serve.Options<W, R>>;

  public constructor() {
    this.options = {};
  }
  public create() {
    let config: Serve.Options<W, R> = {
      port: Config.get<number>("port"),
      fetch() {
        console.log("root called from server factory ");
        return Response.json({
          message: "basic response",
        });
      },
    };
    if (Object.keys(this.options).length > 0) {
      config = {
        ...config,
        ...this.options,
      } as Serve.Options<W, R>;
    }
    return Bun.serve(config);
  }

  public setApiRoutes(routes: Serve.Routes<W, R>) {
    this.options = { ...this.options, routes };
  }

  public setWebsocketEvents(events: WebSocketHandler<W>) {
    this.options = { ...this.options, websocket: events };
  }
}
