import { status as Status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

function errorObject(
  error: string | object,
  code: Status,
): { message: string; code: Status | number } {
  const message = typeof error === 'string' ? error : JSON.stringify(error);
  return { message, code };
}

export class AlreadyExistsRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.ALREADY_EXISTS));
  }
}

export class AbortedRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.ABORTED));
  }
}

export class UnknownRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.UNKNOWN));
  }
}

export class NotFoundRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.NOT_FOUND));
  }
}

export class CancelledRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.CANCELLED));
  }
}

export class InternalRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.INTERNAL));
  }
}

export class InvalidArgumentRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.INVALID_ARGUMENT));
  }
}

export class PermissionDeniedRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.PERMISSION_DENIED));
  }
}

export class ResourceExhaustedRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.RESOURCE_EXHAUSTED));
  }
}

export class UnauthenticatedRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.UNAUTHENTICATED));
  }
}

export class UnavailableRpcException extends RpcException {
  constructor(error: string | object) {
    super(errorObject(error, Status.UNAVAILABLE));
  }
}
