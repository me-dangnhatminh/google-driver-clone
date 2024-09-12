import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  logger = new Logger(RpcExceptionFilter.name);
  constructor() {}
  catch(exception: RpcException, host: ArgumentsHost) {}
}
