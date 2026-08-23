import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { finalize, tap } from "rxjs/operators";
import { REPLAYLAB_OPTIONS, REPLAYLAB_STORAGE } from "../constants";
import { ReplayLabOptions } from "../replaylab.module";
import { NewCase, ReplayLabStorage } from "../storage/storage.interface";

@Injectable()
export class CaptureInterceptor implements NestInterceptor {
  constructor(
    @Inject(REPLAYLAB_STORAGE) private readonly storage: ReplayLabStorage,
    @Inject(REPLAYLAB_OPTIONS) private readonly options: ReplayLabOptions,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const startedAt = Date.now();

    const method = req.method;
    const url = req.url;
    const headers = normalizeHeaders(req.headers);
    const body = req.body as unknown;
    const queryParams = normalizeQuery(req.query);

    // Capture response body when res.json() is called by exception filter
    let capturedResponseBody: unknown = undefined;
    const originalJson = res.json.bind(res);
    res.json = function (data: unknown) {
      capturedResponseBody = data;
      return originalJson(data);
    };

    let errorHandled = false;

    return next.handle().pipe(
      tap({
        error: (err) => {
          errorHandled = true;
          const status = resolveErrorStatus(err);
          if (this.options.captureAll === true || status >= 400) {
            this.storage
              .saveCase({
                method,
                url,
                headers,
                body,
                queryParams,
                responseStatus: status,
                // Exception filter hasn't run yet so there's no response body to capture;
                // the error field carries the stack/message instead.
                responseBody: null,
                error: resolveErrorString(err),
                durationMs: Date.now() - startedAt,
                capturedAt: new Date(),
              })
              .catch(() => undefined);
          }
        },
      }),
      // For successful responses, NestJS calls res.status(N).json(value) before the
      // observable completes, so res.statusCode and capturedResponseBody are both set
      // by the time finalize() runs.
      finalize(() => {
        if (errorHandled) return;
        const status = res.statusCode;
        if (this.options.captureAll === true || status >= 400) {
          this.storage
            .saveCase({
              method,
              url,
              headers,
              body,
              queryParams,
              responseStatus: status,
              responseBody: capturedResponseBody,
              error: null,
              durationMs: Date.now() - startedAt,
              capturedAt: new Date(),
            })
            .catch(() => undefined);
        }
      }),
    );
  }
}

function normalizeHeaders(raw: Request["headers"]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    out[key] = Array.isArray(value) ? value.join(", ") : value;
  }
  return out;
}

function normalizeQuery(raw: Request["query"]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value != null) {
      out[key] = String(value);
    }
  }
  return out;
}

function resolveErrorStatus(err: unknown): number {
  if (err != null && typeof err === "object") {
    const candidate =
      (err as Record<string, unknown>)["status"] ??
      (err as Record<string, unknown>)["statusCode"];
    if (typeof candidate === "number") return candidate;
  }
  return 500;
}

function resolveErrorString(err: unknown): string {
  if (err instanceof Error) {
    return err.stack ?? err.message;
  }
  return String(err);
}
