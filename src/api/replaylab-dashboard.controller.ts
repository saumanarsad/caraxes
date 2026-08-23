import * as path from "path";
import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

@Controller("replaylab")
export class ReplayLabDashboardController {
  // Handles both GET /replaylab and GET /replaylab/* (e.g. after a client-side navigation).
  // @Res() without passthrough gives full Express response control — we call sendFile ourselves.
  @Get()
  @Get("*")
  serveDashboard(@Res() res: Response): void {
    // __dirname is dist/api at runtime → resolves to dist/dashboard/static/index.html
    res.sendFile(path.join(__dirname, "..", "dashboard", "static", "index.html"));
  }
}
