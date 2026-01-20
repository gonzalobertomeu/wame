import { describe, it, expect, mock } from "bun:test";
import { User } from "../src/models/User";

const createMockSocket = (connectionId: string, readyState = 1) => {
  const sendMock = mock(() => {});
  return {
    socket: {
      data: { connectionId },
      send: sendMock,
      readyState,
    } as any,
    sendMock,
  };
};

describe("User", () => {
  describe("constructor", () => {
    it("should create user with unique id", () => {
      const { socket: socket1 } = createMockSocket("conn-1");
      const { socket: socket2 } = createMockSocket("conn-2");
      const user1 = new User(socket1, "conn-1");
      const user2 = new User(socket2, "conn-2");

      expect(user1.id).toBeDefined();
      expect(user2.id).toBeDefined();
      expect(user1.id).not.toBe(user2.id);
    });

    it("should store connectionId", () => {
      const { socket } = createMockSocket("conn-1");
      const user = new User(socket, "conn-1");

      expect(user.getConnectionId()).toBe("conn-1");
    });

    it("should use empty string as default nick", () => {
      const { socket } = createMockSocket("conn-1");
      const user = new User(socket, "conn-1");

      expect(user.getNick()).toBe("");
    });

    it("should accept optional nick", () => {
      const { socket } = createMockSocket("conn-1");
      const user = new User(socket, "conn-1", "player1");

      expect(user.getNick()).toBe("player1");
    });
  });

  describe("send", () => {
    it("should send message through socket", () => {
      const { socket, sendMock } = createMockSocket("conn-1");
      const user = new User(socket, "conn-1");

      user.send("hello");

      expect(sendMock).toHaveBeenCalledWith("hello");
    });
  });

  describe("isConnected", () => {
    it("should return socket readyState", () => {
      const { socket } = createMockSocket("conn-1", 1);
      const user = new User(socket, "conn-1");

      expect(user.isConnected()).toBe(1);
    });
  });

  describe("reconnect", () => {
    it("should update socket reference", () => {
      const { socket: oldSocket } = createMockSocket("conn-1", 3); // CLOSED
      const { socket: newSocket, sendMock } = createMockSocket("conn-1", 1);
      const user = new User(oldSocket, "conn-1");

      user.reconnect(newSocket);
      user.send("test");

      expect(sendMock).toHaveBeenCalledWith("test");
    });

    it("should throw if socket is still open", () => {
      const { socket: oldSocket } = createMockSocket("conn-1", 1); // OPEN
      const { socket: newSocket } = createMockSocket("conn-1", 1);
      const user = new User(oldSocket, "conn-1");

      expect(() => user.reconnect(newSocket)).toThrow("Socket is already open");
    });

    it("should allow reconnect when socket is closing", () => {
      const { socket: oldSocket } = createMockSocket("conn-1", 3); // CLOSED
      const { socket: newSocket } = createMockSocket("conn-1", 1);
      const user = new User(oldSocket, "conn-1");

      expect(() => user.reconnect(newSocket)).not.toThrow();
    });
  });
});
