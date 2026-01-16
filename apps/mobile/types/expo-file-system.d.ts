declare module 'expo-file-system' {
  export enum FileSystemUploadType {
    BINARY_CONTENT = 0,
    MULTIPART = 1,
  }

  export interface UploadOptions {
    httpMethod?: 'POST' | 'PUT';
    uploadType?: FileSystemUploadType;
    headers?: Record<string, string>;
    fieldName?: string;
    mimeType?: string;
    parameters?: Record<string, string>;
    sessionType?: string;
  }

  export interface UploadResult {
    status: number;
    headers: Record<string, string>;
    body: string;
  }

  export interface FileInfo {
    exists: boolean;
    uri: string;
    size?: number;
    modificationTime?: number;
    isDirectory?: boolean;
  }

  export interface GetInfoOptions {
    size?: boolean;
    md5?: boolean;
  }

  export function uploadAsync(url: string, fileUri: string, options?: UploadOptions): Promise<UploadResult>;
  export function getInfoAsync(fileUri: string, options?: GetInfoOptions): Promise<FileInfo>;
}
