import { IQuery } from '@nestjs/cqrs';
import z from 'zod';

export class GetFolderPermissionQuery implements IQuery {
  constructor(
    public readonly accessorId: string,
    public readonly itemId: string,
  ) {}
}

export class GetFolderPermissionResponse {
  constructor(public readonly permission: string) {}
}
