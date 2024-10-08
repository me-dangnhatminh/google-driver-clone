import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import z from 'zod';

export const GetStorageQueryInput = z.union([
  z.object({ id: z.string() }),
  z.object({ ref_if: z.string() }),
  z.object({ owner_id: z.string() }),
]);
export type GetStorageQueryInput = z.infer<typeof GetStorageQueryInput>;

export class GetStorageQuery implements IQuery {
  constructor(public readonly input: GetStorageQueryInput) {
    this.input = GetStorageQueryInput.parse(input);
  }
}

@QueryHandler(GetStorageQuery)
export class GetStorageHandler implements IQueryHandler<GetStorageQuery, any> {
  private readonly tx = this.txHost.tx;
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async execute({ input }: GetStorageQuery) {
    if ('id' in input && input.id) {
      return await this.tx.myStorage.findUniqueOrThrow({
        where: { id: input.id },
      });
    }

    if ('ref_if' in input && input.ref_if) {
      return await this.tx.myStorage.findUniqueOrThrow({
        where: { refId: input.ref_if },
      });
    }

    if ('owner_id' in input && input.owner_id) {
      return await this.tx.myStorage.findUniqueOrThrow({
        where: { ownerId: input.owner_id },
      });
    }

    throw new Error('Invalid input');
  }
}
