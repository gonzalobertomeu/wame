import type { Manager } from "../Manager";
import type { ActionHandler } from "../Router";

export const createRoomHandlers = (manager: Manager): Record<string, ActionHandler> => ({
  LIST_ROOMS: () => {
    const rooms = manager.listRooms();
    return {
      rooms: rooms.map((r) => ({
        id: r.id,
        users: r.list().length,
      })),
    };
  },

  CREATE_ROOM: (user, room) => {
    if (room !== null) {
      throw new Error("User is already in a room");
    }
    const newRoom = manager.createRoom();
    manager.removeFromLobby(user);
    newRoom.add(user);
    return {
      roomId: newRoom.id,
    };
  },

  JOIN_ROOM: (user, room, payload) => {
    if (room !== null) {
      throw new Error("User is already in a room");
    }
    const { roomId } = payload;
    if (typeof roomId !== "string") {
      throw new Error("roomId is required");
    }
    const joinedRoom = manager.joinRoom(user, roomId);
    return {
      roomId: joinedRoom.id,
      users: joinedRoom.list().map((u) => ({ id: u.id, nick: u.getNick() })),
    };
  },

  LEAVE_ROOM: (user, room) => {
    if (room === null) {
      throw new Error("User is not in a room");
    }
    manager.leaveRoom(user, room);
    return {
      success: true,
    };
  },
});
