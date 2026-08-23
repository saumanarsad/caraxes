import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { REPLAYLAB_STORAGE } from "../constants";
import { CapturedCase, ReplayLabStorage } from "../storage/storage.interface";

@Controller("replaylab/api")
export class ReplayLabController {
  constructor(
    @Inject(REPLAYLAB_STORAGE) private readonly storage: ReplayLabStorage,
  ) {}

  @Get("cases")
  listCases(): Promise<CapturedCase[]> {
    return this.storage.listCases();
  }

  @Get("cases/:id")
  async getCase(@Param("id") id: string): Promise<CapturedCase> {
    const found = await this.storage.getCase(id);
    if (!found) throw new NotFoundException(`Case ${id} not found`);
    return found;
  }

  @Get("cases/:id/curl")
  async getCurl(@Param("id") id: string): Promise<{ curl: string }> {
    const found = await this.storage.getCase(id);
    if (!found) throw new NotFoundException(`Case ${id} not found`);

    const url = `http://localhost:3000${found.url}`;
    const parts = ["curl", `-X ${found.method}`, `'${url}'`];

    for (const [key, value] of Object.entries(found.headers)) {
      parts.push(`-H '${key}: ${value}'`);
    }

    if (found.body !== null && found.body !== undefined) {
      const escaped = JSON.stringify(found.body).replace(/'/g, `'\\''`);
      parts.push(`-d '${escaped}'`);
    }

    return { curl: parts.join(" \\\n  ") };
  }
}
