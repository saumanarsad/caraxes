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

// The id is assigned by the storage layer, so callers omit it.
export type NewCase = Omit<CapturedCase, 'id'>;

export interface ReplayLabStorage {
  saveCase(newCase: NewCase): Promise<string>;
  getCase(id: string): Promise<CapturedCase | null>;
  listCases(): Promise<CapturedCase[]>;
}
