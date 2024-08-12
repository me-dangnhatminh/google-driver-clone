export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
  ) {
    super(message);
  }

  static new(code: string, message: string) {
    return new AppError(code, message);
  }
}
