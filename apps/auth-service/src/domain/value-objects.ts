import z from 'zod';
export type UUID = z.infer<typeof UUIDSchema>;
export type ISOString = z.infer<typeof ISOString>;
export type Metadata = z.infer<typeof Metadata>;

export const UUIDSchema = z.string().uuid();
export const ISOString = z.coerce.date().transform((d) => d.toISOString());
export const Metadata = z.record(z.unknown());
export const Roles = z.string().array();
export const Permissions = z.string().array();
