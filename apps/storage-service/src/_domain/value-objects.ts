// ==== Files System ====
import z from 'zod';

export type UUID = z.infer<typeof UUID>;
export type ISOString = z.infer<typeof ISOString>;

export const UUID = z.string().uuid();
export const ISOString = z.coerce
  .date()
  .transform((date) => date.toISOString());

// export type ISOString = z.infer<typeof ISOString>;
// export type Metadata = z.infer<typeof Metadata>;
// export type Bytes = z.infer<typeof Bytes>;
// export type User = z.infer<typeof User>;
// export type ActionType = z.infer<typeof ActionType>;
// export type Permission = z.infer<typeof Permission>;
// export type FileSchema = z.infer<typeof FileSchema>;

// export const ISOString = z.coerce
//   .date()
//   .transform((date) => date.toISOString());
// export const Metadata = z.record(z.unknown());
// export const Bytes = z.number().int().positive();
// export const User = z.object({
//   id: UUID,
//   name: z.string(),
//   email: z.string().email(),
//   picture: z.string().optional(),
// });
// export const ActionType = z.enum(['full', 'read', 'write', 'readwrite']);
// export const Permission = z.object({
//   id: UUID,
//   owner: ActionType,
//   group: z.array(
//     z.object({
//       id: UUID,
//       user: z.string().or(User),
//       permission: ActionType,
//     }),
//   ),
//   others: ActionType,
// });

// export const FileSchema = z.object({
//   id: UUID,
//   name: z.string(),
//   owner: z.string().or(User),
//   parent_id: UUID.optional(),
//   size: Bytes,

//   access_type: z.enum(['public', 'private']),
//   permission: z.string().or(Permission),
//   metadata: Metadata,

//   created: ISOString,
//   updated: ISOString,
//   removed: ISOString.optional(),
//   created_by: z.string().or(User),
//   updated_by: z.string().or(User),
//   removed_by: z.string().or(User).optional(),
// });
