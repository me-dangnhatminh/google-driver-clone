import { PrismaClient } from '@prisma/client';
import { Logger, Module, OnModuleInit } from '@nestjs/common';

// const PrismaCode = {
//   P2025: 'prisma.not_found',
//   P2002: 'prisma.already_exists',
// } as const;

// @Injectable()
// export class PrismaInterceptor implements NestInterceptor {
//   private readonly logger = new Logger(PrismaInterceptor.name);

//   intercept(context: ExecutionContext, next: CallHandler) {
//     return next.handle().pipe(
//       rx.catchError((error) => {
//         this.logger.error(error);
//         const code = error.code;
//         const message = PrismaCode[code];
//         if (message) throw new Error(message);
//         throw error;
//       }),
//     );
//   }
// }

@Module({
  providers: [PrismaClient],
  exports: [PrismaClient],
})
export class PrismaModule implements OnModuleInit {
  private readonly logger = new Logger(PrismaModule.name);
  constructor(private readonly prisma: PrismaClient) {}

  async onModuleInit() {
    await this.prisma.$connect();
    this.logger.log('Connected to database');
  }
}

// =================================
// this is BigInt serialization for JSON (error)
Object.assign(BigInt.prototype, {
  toJSON() {
    return this.toString();
  },
});
