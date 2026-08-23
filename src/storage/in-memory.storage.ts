import { randomUUID } from "crypto";
import { CapturedCase, NewCase, ReplayLabStorage } from "./storage.interface";

export class InMemoryStorage implements ReplayLabStorage {
  private readonly cases = new Map<string, CapturedCase>();

  async saveCase(newCase: NewCase): Promise<string> {
    const id = randomUUID();
    this.cases.set(id, { ...newCase, id });
    return id;
  }

  async getCase(id: string): Promise<CapturedCase | null> {
    return this.cases.get(id) ?? null;
  }

  async listCases(): Promise<CapturedCase[]> {
    return Array.from(this.cases.values());
  }
}
