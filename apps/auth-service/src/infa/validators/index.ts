import z from 'zod';

export const TokenValidationSchema = z.object({ token: z.string() });
export type TokenValidationSchema = z.infer<typeof TokenValidationSchema>;
