import { describe, it, expect } from "bun:test";
import { Manager } from "../src/Manager";
import { createRoomHandlers } from "../src/handlers/RoomHandlers";
import { User } from "../src/models/User";

const createMockSocket = (connectionId: string) =>
  ({
    data: { connectionId },
    send: () => {},
    readyState: 1,
  }) as any;

describe("RoomHandlers", () => {
  describe("LIST_ROOMS", () => {
    it("should return empty array when no rooms", () => {
      const manager = new Manager();
      const handlers = createRoomHandlers(manager);
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");

      const result = handlers.LIST_ROOMS(user, null, {});

      expect(result).toEqual({ rooms: [] });
    });

    it("should return rooms with id and user count", () => {
      const manager = new Manager();
      const handlers = createRoomHandlers(manager);
      const user1 = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const user2 = manager.createUser(createMockSocket("conn-2"), "conn-2");
      const room = manager.createRoom();
      manager.joinRoom(user1, room.id);

      const result = handlers.LIST_ROOMS(user2, null, {});

      expect(result.rooms.length).toBe(1);
      expect(result.rooms[0].id).toBe(room.id);
      expect(result.rooms[0].users).toBe(1);
    });
  });

  describe("CREATE_ROOM", () => {
    it("should create room and add user to it", () => {
      const manager = new Manager();
      const handlers = createRoomHandlers(manager);
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");

      const result = handlers.CREATE_ROOM(user, null, {});

      expect(result.roomId).toBeDefined();
      expect(manager.listRooms().length).toBe(1);
      expect(manager.listLobbyUsers()).not.toContain(user);
    });

    it("should throw if user is already in a room", () => {
      const manager = new Manager();
      const handlers = createRoomHandlers(manager);
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const room = manager.createRoom();
      manager.joinRoom(user, room.id);

      expect(() => handlers.CREATE_ROOM(user, room, {})).toThrow(
        "User is already in a room",
      );
    });
  });

  describe("JOIN_ROOM", () => {
    it("should add user to existing room", () => {
      const manager = new Manager();
      const handlers = createRoomHandlers(manager);
      const user1 = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const user2 = manager.createUser(createMockSocket("conn-2"), "conn-2");
      const room = manager.createRoom();
      manager.joinRoom(user1, room.id);

      const result = handlers.JOIN_ROOM(user2, null, { roomId: room.id });

      expect(result.roomId).toBe(room.id);
      expect(result.users.length).toBe(2);
      expect(room.list()).toContain(user2);
    });

    it("should throw if user is already in a room", () => {
      const manager = new Manager();
      const handlers = createRoomHandlers(manager);
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const room = manager.createRoom();
      manager.joinRoom(user, room.id);

      expect(() => handlers.JOIN_ROOM(user, room, { roomId: "other" })).toThrow(
        "User is already in a room",
      );
    });

    it("should throw if roomId is missing", () => {
      const manager = new Manager();
      const handlers = createRoomHandlers(manager);
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");

      expect(() => handlers.JOIN_ROOM(user, null, {})).toThrow(
        "roomId is required",
      );
    });

    it("should throw if room does not exist", () => {
      const manager = new Manager();
      const handlers = createRoomHandlers(manager);
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");

      expect(() => handlers.JOIN_ROOM(user, null, { roomId: "unknown" })).toThrow(
        'Room "unknown" not found',
      );
    });
  });

  describe("LEAVE_ROOM", () => {
    it("should remove user from room and return to lobby", () => {
      const manager = new Manager();
      const handlers = createRoomHandlers(manager);
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");
      const room = manager.createRoom();
      manager.joinRoom(user, room.id);

      const result = handlers.LEAVE_ROOM(user, room, {});

      expect(result).toEqual({ success: true });
      expect(manager.listLobbyUsers()).toContain(user);
    });

    it("should throw if user is not in a room", () => {
      const manager = new Manager();
      const handlers = createRoomHandlers(manager);
      const user = manager.createUser(createMockSocket("conn-1"), "conn-1");

      expect(() => handlers.LEAVE_ROOM(user, null, {})).toThrow(
        "User is not in a room",
      );
    });
  });
});
