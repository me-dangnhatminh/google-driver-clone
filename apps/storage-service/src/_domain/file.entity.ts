import z from 'zod';

const UUID = z.string().uuid();
const ISOString = z.coerce.date().transform((date) => date.toISOString());

export const FileSchema = z.object({
  id: UUID,
  name: z.string(),
  owner: z.string(),
  parent_id: UUID.optional(),
  size: z.number().int().positive(),

  access_type: z.enum(['public', 'private']),
  permission: z.string(),
  metadata: z.record(z.unknown()),

  created: ISOString,
  updated: ISOString,
  removed: ISOString.optional(),
});
export type FileSchema = z.infer<typeof FileSchema>;

export class FileEntity {
  protected _props: z.infer<typeof FileSchema>;
  constructor(props: z.infer<typeof FileSchema>) {
    this._props = FileSchema.parse(props);
  }
}
