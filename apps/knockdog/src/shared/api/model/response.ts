export interface ApiResponse<T = null, C = string> {
  status: number;
  code: C;
  message: string;
  data: T;
}
