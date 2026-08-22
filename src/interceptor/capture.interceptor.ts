import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { REPLAYLAB_OPTIONS, REPLAYLAB_STORAGE } from '../constants';
import { ReplayLabOptions } from '../replaylab.module';
import { NewCase, ReplayLabStorage } from '../storage/storage.interface';

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

    return next.handle().pipe(
      tap((responseBody: unknown) => {
        const status = res.statusCode;
        const isError = status >= 400;

        if (this.options.captureAll === true || isError) {
          const newCase: NewCase = {
            method,
            url,
            headers,
            body,
            queryParams,
            responseStatus: status,
            responseBody,
            error: null,
            durationMs: Date.now() - startedAt,
            capturedAt: new Date(),
          };
          // Fire-and-forget — a storage failure must never affect the response.
          this.storage.saveCase(newCase).catch(() => undefined);
        }
      }),
      catchError((err: unknown) => {
        const newCase: NewCase = {
          method,
          url,
          headers,
          body,
          queryParams,
          responseStatus: resolveErrorStatus(err),
          responseBody: null,
          error: resolveErrorString(err),
          durationMs: Date.now() - startedAt,
          capturedAt: new Date(),
        };
        this.storage.saveCase(newCase).catch(() => undefined);

        return throwError(() => err);
      }),
    );
  }
}

function normalizeHeaders(
  raw: Request['headers'],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    out[key] = Array.isArray(value) ? value.join(', ') : value;
  }
  return out;
}

function normalizeQuery(
  raw: Request['query'],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value != null) {
      out[key] = String(value);
    }
  }
  return out;
}

function resolveErrorStatus(err: unknown): number {
  if (err != null && typeof err === 'object') {
    const candidate = (err as Record<string, unknown>)['status'] ??
      (err as Record<string, unknown>)['statusCode'];
    if (typeof candidate === 'number') return candidate;
  }
  return 500;
}

function resolveErrorString(err: unknown): string {
  if (err instanceof Error) {
    return err.stack ?? err.message;
  }
  return String(err);
}
