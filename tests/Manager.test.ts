import { describe, it, expect } from "bun:test";
import { Manager } from "../src/Manager";
import { Room } from "../src/models/Room";
import { User } from "../src/models/User";

const createMockSocket = (connectionId: string) =>
  ({
    data: { connectionId },
    send: () => {},
    readyState: 1,
  }) as any;

describe("Manager", () => {
  describe("createUser", () => {
    it("should create a user and add to lobby", () => {
      const manager = new Manager();
      const socket = createMockSocket("conn-1");

      const user = manager.createUser(socket, "conn-1");

      expect(user).toBeInstanceOf(User);
      expect(manager.listLobbyUsers()).toContain(user);
    });
  });

  describe("findUser", () => {
    it("should find user in lobby with null room", () => {
      const manager = new Manager();
      const socket = createMockSocket("conn-1");
      const user = manager.createUser(socket, "conn-1");

      const result = manager.findUser("conn-1");

      expect(result.user).toBe(user);
      expect(result.room).toBeNull();
    });

    it("should find user in room with room reference", () => {
      const manager = new Manager();
      const socket = createMockSocket("conn-1");
      const user = manager.createUser(socket, "conn-1");

      const room = new Room();
      room.add(user);
      manager.addRoom(room);
      manager.removeFromLobby(user);

      const result = manager.findUser("conn-1");

      expect(result.user).toBe(user);
      expect(result.room).toBe(room);
    });

    it("should throw if user not found", () => {
      const manager = new Manager();

      expect(() => manager.findUser("unknown")).toThrow("User not found");
    });
  });

  describe("connectionHasUser", () => {
    it("should return user for valid connectionId", () => {
      const manager = new Manager();
      const socket = createMockSocket("conn-1");
      const user = manager.createUser(socket, "conn-1");

      const result = manager.connectionHasUser("conn-1");

      expect(result).toBe(user);
    });

    it("should throw if connectionId not found", () => {
      const manager = new Manager();

      expect(() => manager.connectionHasUser("unknown")).toThrow("User not found");
    });
  });

  describe("getRoom", () => {
    it("should return room by id", () => {
      const manager = new Manager();
      const room = new Room();
      manager.addRoom(room);

      const result = manager.getRoom(room.id);

      expect(result).toBe(room);
    });

    it("should return undefined if room not found", () => {
      const manager = new Manager();

      const result = manager.getRoom("unknown");

      expect(result).toBeUndefined();
    });
  });

  describe("addRoom", () => {
    it("should add room to manager", () => {
      const manager = new Manager();
      const room = new Room();

      manager.addRoom(room);

      expect(manager.getRoom(room.id)).toBe(room);
    });
  });

  describe("removeFromLobby", () => {
    it("should remove user from lobby", () => {
      const manager = new Manager();
      const socket = createMockSocket("conn-1");
      const user = manager.createUser(socket, "conn-1");

      expect(manager.listLobbyUsers()).toContain(user);

      manager.removeFromLobby(user);

      expect(manager.listLobbyUsers()).not.toContain(user);
    });

    it("should not throw if user not in lobby", () => {
      const manager = new Manager();
      const socket = createMockSocket("conn-1");
      const user = new User(socket, "conn-1");

      expect(() => manager.removeFromLobby(user)).not.toThrow();
    });
  });

  describe("listLobbyUsers", () => {
    it("should return empty array initially", () => {
      const manager = new Manager();

      expect(manager.listLobbyUsers()).toEqual([]);
    });

    it("should return all lobby users", () => {
      const manager = new Manager();
      const user1 = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const user2 = manager.createUser(createMockSocket("conn-2"), "conn-2");

      const lobbyUsers = manager.listLobbyUsers();

      expect(lobbyUsers).toContain(user1);
      expect(lobbyUsers).toContain(user2);
      expect(lobbyUsers.length).toBe(2);
    });
  });

  describe("listRooms", () => {
    it("should return empty array initially", () => {
      const manager = new Manager();

      expect(manager.listRooms()).toEqual([]);
    });

    it("should return all rooms", () => {
      const manager = new Manager();
      const room1 = manager.createRoom();
      const room2 = manager.createRoom();

      const rooms = manager.listRooms();

      expect(rooms).toContain(room1);
      expect(rooms).toContain(room2);
      expect(rooms.length).toBe(2);
    });
  });

  describe("createRoom", () => {
    it("should create and return a new room", () => {
      const manager = new Manager();

      const room = manager.createRoom();

      expect(room).toBeInstanceOf(Room);
      expect(manager.listRooms()).toContain(room);
    });
  });

  describe("removeRoom", () => {
    it("should remove room by id", () => {
      const manager = new Manager();
      const room = manager.createRoom();

      manager.removeRoom(room.id);

      expect(manager.listRooms()).not.toContain(room);
    });

    it("should not throw if room does not exist", () => {
      const manager = new Manager();

      expect(() => manager.removeRoom("unknown")).not.toThrow();
    });
  });

  describe("joinRoom", () => {
    it("should move user from lobby to room", () => {
      const manager = new Manager();
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const room = manager.createRoom();

      manager.joinRoom(user, room.id);

      expect(manager.listLobbyUsers()).not.toContain(user);
      expect(room.list()).toContain(user);
    });

    it("should return the joined room", () => {
      const manager = new Manager();
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const room = manager.createRoom();

      const result = manager.joinRoom(user, room.id);

      expect(result).toBe(room);
    });

    it("should throw if room does not exist", () => {
      const manager = new Manager();
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");

      expect(() => manager.joinRoom(user, "unknown")).toThrow(
        'Room "unknown" not found',
      );
    });
  });

  describe("leaveRoom", () => {
    it("should move user from room to lobby", () => {
      const manager = new Manager();
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const room = manager.createRoom();
      manager.joinRoom(user, room.id);

      manager.leaveRoom(user, room);

      expect(manager.listLobbyUsers()).toContain(user);
      expect(room.list()).not.toContain(user);
    });

    it("should remove room if empty after leave", () => {
      const manager = new Manager();
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const room = manager.createRoom();
      manager.joinRoom(user, room.id);

      manager.leaveRoom(user, room);

      expect(manager.listRooms()).not.toContain(room);
    });

    it("should not remove room if other users remain", () => {
      const manager = new Manager();
      const user1 = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const user2 = manager.createUser(createMockSocket("conn-2"), "conn-2");
      const room = manager.createRoom();
      manager.joinRoom(user1, room.id);
      manager.joinRoom(user2, room.id);

      manager.leaveRoom(user1, room);

      expect(manager.listRooms()).toContain(room);
      expect(room.list()).toContain(user2);
    });
  });
});
