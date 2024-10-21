import z from 'zod';

export const ActionType = z.enum(['full', 'read', 'write', 'readwrite']);
export const PermissionSchema = z.object({
  name: z.string().optional(),
  action: ActionType,
});
export type PermissionSchema = z.infer<typeof PermissionSchema>;

export class PermissionVO {
  public readonly props: PermissionSchema;
  constructor(props: PermissionSchema) {
    this.props = PermissionSchema.parse(props);
  }
}
