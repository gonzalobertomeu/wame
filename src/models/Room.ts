import { v4 } from "uuid";
import { User } from "./User";
export class Room {
  public readonly id: string;
  private users: User[];
  public constructor() {
    this.id = v4();
    this.users = [];
  }

  public broadcast(message: string) {
    for (const user of this.users) {
      user.send(message);
    }
  }

  public list() {
    return this.users;
  }

  public add(user: User) {
    this.users.push(user);
  }
}

