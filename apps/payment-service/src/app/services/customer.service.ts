import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { randomUUID as uuid } from 'crypto';

import { Customer } from 'src/domain';

@Injectable()
export class CustomerService {
  private readonly tx: TransactionHost<TransactionalAdapterPrisma>['tx'];
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    this.tx = txHost.tx;
  }

  getUnique(dto: { id: string; by: 'id' | 'email' }) {
    const where = { [dto.by]: dto.id } as any;
    return this.tx.customer
      .findUnique({ where })
      .then((r) => r && Customer.parse(r));
  }

  create(dto: Partial<Customer>) {
    const now = new Date();
    const data = Customer.parse({
      id: uuid(),
      created_at: now,
      updated_at: now,
      status: 'active',
      ...dto,
    });
    return this.tx.customer.create({ data }).then(() => data);
  }

  update(id: string, dto: Partial<Customer>) {
    dto['id'] = undefined;

    return this.tx.customer
      .update({
        where: { id },
        data: Object.assign(dto, { updated_at: new Date() }),
      })
      .then(Customer.parse);
  }
}
