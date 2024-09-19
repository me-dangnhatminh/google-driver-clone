import { AppError, TInvalidRequestError } from './app.error';

export class InvalidRequestError extends AppError {
  constructor(
    errors: TInvalidRequestError['errors'] = [],
    public readonly code = 'invalid_request',
    message: string = 'Invalid request data. Please check the errors.',
  ) {}
}
