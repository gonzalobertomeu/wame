import type { Room } from "./models/Room";
import type { User } from "./models/User";

export type ActionHandler = (
  user: User,
  room: Room | null,
  payload: Record<string, any>,
) => any;

export class Router {
  private handlers: Record<string, ActionHandler> = {};

  public on(action: string, handler: ActionHandler): this {
    if (this.handlers[action] !== undefined) {
      throw new Error(`Action "${action}" is already defined`);
    }
    this.handlers[action] = handler;
    return this;
  }

  public handle(
    user: User,
    room: Room | null,
    action: string,
    payload: Record<string, any>,
  ) {
    const handler = this.handlers[action];
    if (!handler) {
      throw new Error(`Action "${action}" not found`);
    }
    return handler(user, room, payload);
  }

  public has(action: string): boolean {
    return this.handlers[action] !== undefined;
  }

  public setDefault(action: string, handler: ActionHandler): this {
    if (!this.has(action)) {
      this.handlers[action] = handler;
    }
    return this;
  }
}
