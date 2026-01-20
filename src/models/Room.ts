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

  public remove(user: User) {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}

