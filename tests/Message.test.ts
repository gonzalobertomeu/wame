import { describe, it, expect } from "bun:test";
import { Message } from "../src/communication/Message";

describe("Message", () => {
  describe("fromString", () => {
    it("should parse valid JSON message", () => {
      const raw = JSON.stringify({ action: "test", payload: { foo: "bar" } });

      const message = Message.fromString(raw);

      expect(message.action).toBe("test");
      expect(message.payload).toEqual({ foo: "bar" });
    });

    it("should parse message with empty payload", () => {
      const raw = JSON.stringify({ action: "ping", payload: {} });

      const message = Message.fromString(raw);

      expect(message.action).toBe("ping");
      expect(message.payload).toEqual({});
    });

    it("should throw if action is not a string", () => {
      const raw = JSON.stringify({ action: 123, payload: {} });

      expect(() => Message.fromString(raw)).toThrow("action is not a string");
    });

    it("should throw if action is missing", () => {
      const raw = JSON.stringify({ payload: {} });

      expect(() => Message.fromString(raw)).toThrow("action is not a string");
    });

    it("should throw if payload is not an object", () => {
      const raw = JSON.stringify({ action: "test", payload: "invalid" });

      expect(() => Message.fromString(raw)).toThrow("payload is not an object");
    });

    it("should throw if payload is missing", () => {
      const raw = JSON.stringify({ action: "test" });

      expect(() => Message.fromString(raw)).toThrow("payload is not an object");
    });

    it("should throw if payload is null", () => {
      const raw = JSON.stringify({ action: "test", payload: null });

      expect(() => Message.fromString(raw)).toThrow("payload is not an object");
    });

    it("should throw if JSON is invalid", () => {
      const raw = "invalid json";

      expect(() => Message.fromString(raw)).toThrow();
    });

    it("should handle nested payload objects", () => {
      const raw = JSON.stringify({
        action: "move",
        payload: {
          position: { x: 10, y: 20 },
          data: [1, 2, 3],
        },
      });

      const message = Message.fromString(raw);

      expect(message.action).toBe("move");
      expect(message.payload).toEqual({
        position: { x: 10, y: 20 },
        data: [1, 2, 3],
      });
    });
  });
});
