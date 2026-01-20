export class Message {
  private constructor(
    public readonly action: string,
    public readonly payload: Record<string, any>,
  ) {}
  public static fromString(raw: string) {
    const json = JSON.parse(raw);
    if (typeof json.action !== "string") {
      throw new Error("action is not a string");
    }
    if (typeof json.payload !== "object" || json.payload === null) {
      throw new Error("payload is not an object");
    }
    return new Message(json.action, json.payload);
  }
}
