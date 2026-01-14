import type { Serve } from "bun";

export function router<W, R extends string>(routes: Serve.Routes<W, R>) {
  return routes;
}
