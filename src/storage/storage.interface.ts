export interface CapturedCase {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
  queryParams: Record<string, string>;
  responseStatus: number;
  responseBody: unknown;
  error: string | null;
  durationMs: number;
  capturedAt: Date;
}

export interface ReplayLabStorage {
  saveCase(capturedCase: CapturedCase): Promise<string>;
  getCase(id: string): Promise<CapturedCase | null>;
  listCases(): Promise<CapturedCase[]>;
}
