import { describe, it, expect, mock } from "bun:test";
import { Room } from "../src/models/Room";
import { User } from "../src/models/User";

const createMockSocket = (connectionId: string) => {
  const sendMock = mock(() => {});
  return {
    socket: {
      data: { connectionId },
      send: sendMock,
      readyState: 1,
    } as any,
    sendMock,
  };
};

describe("Room", () => {
  describe("constructor", () => {
    it("should create room with unique id", () => {
      const room1 = new Room();
      const room2 = new Room();

      expect(room1.id).toBeDefined();
      expect(room2.id).toBeDefined();
      expect(room1.id).not.toBe(room2.id);
    });

    it("should start with empty users list", () => {
      const room = new Room();

      expect(room.list()).toEqual([]);
    });
  });

  describe("add", () => {
    it("should add user to room", () => {
      const room = new Room();
      const { socket } = createMockSocket("conn-1");
      const user = new User(socket, "conn-1");

      room.add(user);

      expect(room.list()).toContain(user);
    });

    it("should allow multiple users", () => {
      const room = new Room();
      const { socket: socket1 } = createMockSocket("conn-1");
      const { socket: socket2 } = createMockSocket("conn-2");
      const user1 = new User(socket1, "conn-1");
      const user2 = new User(socket2, "conn-2");

      room.add(user1);
      room.add(user2);

      expect(room.list().length).toBe(2);
      expect(room.list()).toContain(user1);
      expect(room.list()).toContain(user2);
    });
  });

  describe("list", () => {
    it("should return all users in room", () => {
      const room = new Room();
      const { socket: socket1 } = createMockSocket("conn-1");
      const { socket: socket2 } = createMockSocket("conn-2");
      const user1 = new User(socket1, "conn-1");
      const user2 = new User(socket2, "conn-2");

      room.add(user1);
      room.add(user2);

      const users = room.list();

      expect(users.length).toBe(2);
    });
  });

  describe("broadcast", () => {
    it("should send message to all users", () => {
      const room = new Room();
      const { socket: socket1, sendMock: send1 } = createMockSocket("conn-1");
      const { socket: socket2, sendMock: send2 } = createMockSocket("conn-2");
      const user1 = new User(socket1, "conn-1");
      const user2 = new User(socket2, "conn-2");

      room.add(user1);
      room.add(user2);

      room.broadcast("test message");

      expect(send1).toHaveBeenCalledWith("test message");
      expect(send2).toHaveBeenCalledWith("test message");
    });

    it("should not fail with empty room", () => {
      const room = new Room();

      expect(() => room.broadcast("test")).not.toThrow();
    });
  });

  describe("remove", () => {
    it("should remove user from room", () => {
      const room = new Room();
      const { socket } = createMockSocket("conn-1");
      const user = new User(socket, "conn-1");

      room.add(user);
      room.remove(user);

      expect(room.list()).not.toContain(user);
    });

    it("should not fail if user not in room", () => {
      const room = new Room();
      const { socket } = createMockSocket("conn-1");
      const user = new User(socket, "conn-1");

      expect(() => room.remove(user)).not.toThrow();
    });

    it("should only remove specified user", () => {
      const room = new Room();
      const { socket: socket1 } = createMockSocket("conn-1");
      const { socket: socket2 } = createMockSocket("conn-2");
      const user1 = new User(socket1, "conn-1");
      const user2 = new User(socket2, "conn-2");

      room.add(user1);
      room.add(user2);
      room.remove(user1);

      expect(room.list()).not.toContain(user1);
      expect(room.list()).toContain(user2);
    });
  });
});
