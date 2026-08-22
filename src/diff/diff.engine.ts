export interface DiffOptions {
  // TODO: volatile field exclusions (dot-path nested fields, e.g. "data.createdAt")
  volatileFields?: string[];
}

export interface DiffResult {
  // TODO: define diff output shape
}

export function diff(
  _original: unknown,
  _replayed: unknown,
  _options?: DiffOptions,
): DiffResult {
  // TODO: implement structural diff with volatile-field exclusion
  throw new Error('Not implemented');
}
