import type { Manager } from "./Manager";
import type { Message } from "./communication/Message";
import type { User } from "./models/User";
import type { Socket } from "./types/WameTypes";

export type RouterMethod = (user: User) => any;
export class Router {
  private methods: Record<string, RouterMethod> = {
    JOIN_ROOM: (user: User) => {
      console.log("trying to join room");
      console.log(user.getConnectionId());
      return { message: "trying to join!" };
    },
  };
  public constructor(private manager: Manager) {}

  public handle(socket: Socket, message: Message) {
    const user = this.manager.connectionHasUser(socket.data.connectionId);

    const handler = this.methods[message.action] as RouterMethod;
    if (!handler) {
      throw new Error(`action <${message.action}> not found`);
    }
    return handler(user);
  }

  public set(action: string, fn: RouterMethod) {
    if (this.methods[action] !== undefined) {
      throw new Error(`actio <${action}> is already defined`);
    }
    this.methods[action] = fn;
  }
}
