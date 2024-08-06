const arrayToEnum = <T extends string>(arr: T[]) => {
  return arr.reduce(
    (acc, item) => {
      acc[item] = item;
      return acc;
    },
    {} as Record<T, T>,
  );
};

export const StorageCode = arrayToEnum([
  'invalid_argument',
  'not_found',
  'already_exists',
  'permission_denied',
  'unauthenticated',
  'resource_exhausted',
  'failed_precondition',
  'aborted',
  'out_of_range',
  'unimplemented',
  'internal',
  'unavailable',
  'data_loss',
]);

export const isStorageError = (err: unknown): err is StorageError => {
  return err instanceof StorageError;
};

export class StorageError<T extends string = string> extends Error {
  constructor(
    public readonly code: T,
    message?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends StorageError {
  constructor(message?: string) {
    super(StorageCode.invalid_argument, message);
  }
}
