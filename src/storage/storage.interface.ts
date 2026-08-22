export interface CapturedCase {
  // TODO: define shape — method, url, headers, body, query, response, status, duration, error
}

export interface StorageAdapter {
  save(capturedCase: CapturedCase): Promise<void>;
  findById(id: string): Promise<CapturedCase | null>;
  findAll(): Promise<CapturedCase[]>;
}
