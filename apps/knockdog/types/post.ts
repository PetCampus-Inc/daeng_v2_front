export type Params = {
  userId?: number;
};

export type Post = {
  id: number;
  title: string;
  body: string;
};

export type APIResponse<T> = {
  result: T;
};

export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}
