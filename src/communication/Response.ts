import type { Socket } from "../types/WameTypes";

export type ResponseData = {
  success: boolean;
  data: Record<string, any>;
  error?: string;
};
export class Response {
  private responseData: Partial<ResponseData>;
  public constructor(private readonly socket: Socket) {
    this.responseData = {};
  }
  public send(data: Record<string, any>) {
    this.responseData = {
      success: true,
      data,
    };
    this.socket.send(JSON.stringify(this.responseData));
  }

  public error(message: string) {
    this.responseData = {
      success: false,
      data: {},
      error: message,
    };
    this.socket.send(JSON.stringify(this.responseData));
  }
}
