import { DynamicModule, Module } from "@nestjs/common";

export interface ReplayLabOptions {
  // TODO: define config options (captureAll, volatileFields, storage, etc.)
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
