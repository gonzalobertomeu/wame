import type { ServerWebSocket } from "bun";

export type SocketData = {
  connectionId: string;
};

export type Socket = ServerWebSocket<SocketData>;

export interface WameOptions {
  port?: number;
}
