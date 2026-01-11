import { Config } from "../shared/Config";

export class ServerFactory {
  public create() {
    return Bun.serve({
      port: Config.get<number>("PORT"),
      fetch() {
        return Response.json({
          message: "basic response",
        });
      },
    });
  }
}
