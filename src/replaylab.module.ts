import { DynamicModule, Module } from "@nestjs/common";

export interface ReplayLabOptions {
  /** Capture every request, not just errors. Defaults to false (5xx only). */
  captureAll?: boolean;
  // TODO: volatileFields, storage adapter
}

@Module({})
export class ReplayLabModule {
  static forRoot(_options: ReplayLabOptions): DynamicModule {
    return {
      module: ReplayLabModule,
      providers: [],
      controllers: [],
      exports: [],
    };
  }
}
