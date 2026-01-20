import { describe, it, expect } from "bun:test";
import { Router } from "../src/Router";
import { Room } from "../src/models/Room";
import { User } from "../src/models/User";

const mockSocket = {
  data: { connectionId: "test-connection" },
  send: () => {},
  readyState: 1,
} as any;

describe("Router", () => {
  describe("on", () => {
    it("should register a handler for an action", () => {
      const router = new Router();
      router.on("test", () => {});

      expect(router.has("test")).toBe(true);
    });

    it("should throw if action is already defined", () => {
      const router = new Router();
      router.on("test", () => {});

      expect(() => router.on("test", () => {})).toThrow(
        'Action "test" is already defined',
      );
    });

    it("should return this for chaining", () => {
      const router = new Router();
      const result = router.on("test", () => {});

      expect(result).toBe(router);
    });

    it("should allow chaining multiple handlers", () => {
      const router = new Router();

      router.on("action1", () => {}).on("action2", () => {}).on("action3", () => {});

      expect(router.has("action1")).toBe(true);
      expect(router.has("action2")).toBe(true);
      expect(router.has("action3")).toBe(true);
    });
  });

  describe("handle", () => {
    it("should call the handler with user, room, and payload", () => {
      const router = new Router();
      const user = new User(mockSocket, "conn-1");
      const room = new Room();
      const payload = { foo: "bar" };

      let receivedUser: User | null = null;
      let receivedRoom: Room | null = null;
      let receivedPayload: Record<string, any> | null = null;

      router.on("test", (u, r, p) => {
        receivedUser = u;
        receivedRoom = r;
        receivedPayload = p;
      });

      router.handle(user, room, "test", payload);

      expect(receivedUser).toBe(user);
      expect(receivedRoom).toBe(room);
      expect(receivedPayload).toBe(payload);
    });

    it("should return the handler result", () => {
      const router = new Router();
      const user = new User(mockSocket, "conn-1");

      router.on("test", () => ({ message: "success" }));

      const result = router.handle(user, null, "test", {});

      expect(result).toEqual({ message: "success" });
    });

    it("should throw if action is not found", () => {
      const router = new Router();
      const user = new User(mockSocket, "conn-1");

      expect(() => router.handle(user, null, "unknown", {})).toThrow(
        'Action "unknown" not found',
      );
    });

    it("should handle null room for users in lobby", () => {
      const router = new Router();
      const user = new User(mockSocket, "conn-1");

      let receivedRoom: Room | null | undefined = undefined;

      router.on("test", (u, r, p) => {
        receivedRoom = r;
      });

      router.handle(user, null, "test", {});

      expect(receivedRoom).toBeNull();
    });
  });

  describe("has", () => {
    it("should return true if action exists", () => {
      const router = new Router();
      router.on("test", () => {});

      expect(router.has("test")).toBe(true);
    });

    it("should return false if action does not exist", () => {
      const router = new Router();

      expect(router.has("test")).toBe(false);
    });
  });

  describe("setDefault", () => {
    it("should set handler if action does not exist", () => {
      const router = new Router();

      router.setDefault("test", () => ({ default: true }));

      expect(router.has("test")).toBe(true);
    });

    it("should not overwrite existing handler", () => {
      const router = new Router();
      const user = new User(mockSocket, "conn-1");

      router.on("test", () => ({ original: true }));
      router.setDefault("test", () => ({ default: true }));

      const result = router.handle(user, null, "test", {});

      expect(result).toEqual({ original: true });
    });

    it("should return this for chaining", () => {
      const router = new Router();

      const result = router.setDefault("test", () => {});

      expect(result).toBe(router);
    });
  });
});
