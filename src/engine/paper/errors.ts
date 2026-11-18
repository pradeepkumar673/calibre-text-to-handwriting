// Raised when a paper template or conversion request has invalid values.
export class PaperGeometryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaperGeometryError';
  }
}
