import { ServerDuplexStream } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller()
export class StorageGrpcController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod('StorageService', 'storageDetail')
  storageDetail(request: any, metadata: any) {
    return {
      name: 'My Storage',
      used: 500,
      total: 1000,
    };
  }

  @GrpcStreamMethod('FileService', 'uploadFile')
  async uploadFile(
    request: Observable<{
      fileId: string;
      content: Buffer;
      offset: number;
    }>,
    metadata: any,
    call: ServerDuplexStream<any, any>,
  ) {
    const buffer = Buffer.from([]);

    return new Observable((observer) => {
      request.subscribe({
        next: (chunk) => {
          buffer.write(chunk.content.toString(), chunk.offset);
          console.log('Received chunk', chunk);
        },
        complete: () => {
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }
}
