import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [    PrismaClient
  ],
  exports: [PrismaClient],
})
export class PrismaModule {}

// =================================
// this is BigInt serialization for JSON (error)
Object.assign(BigInt.prototype, {
  toJSON() {
    return this.toString();
  },
});
