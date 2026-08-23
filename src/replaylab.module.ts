import { DynamicModule, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ReplayLabController } from "./api/replaylab.controller";
import { REPLAYLAB_OPTIONS, REPLAYLAB_STORAGE } from "./constants";
import { CaptureInterceptor } from "./interceptor/capture.interceptor";
import { InMemoryStorage } from "./storage/in-memory.storage";

export interface ReplayLabOptions {
  /** Capture every request, not just errors. Defaults to false (5xx only). */
  captureAll?: boolean;
  // TODO: volatileFields, storage adapter
}

@Module({})
export class ReplayLabModule {
  static forRoot(options: ReplayLabOptions = {}): DynamicModule {
    return {
      module: ReplayLabModule,
      controllers: [ReplayLabController],
      providers: [
        {
          provide: REPLAYLAB_OPTIONS,
          useValue: options,
        },
        {
          provide: REPLAYLAB_STORAGE,
          useValue: new InMemoryStorage(),
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: CaptureInterceptor,
        },
      ],
      exports: [REPLAYLAB_STORAGE],
    };
  }
}
