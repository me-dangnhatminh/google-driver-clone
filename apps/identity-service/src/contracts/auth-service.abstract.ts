import z from 'zod';

export interface Empty {}

export const UserDTO = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
});
export const UpdateUserDTO = UserDTO.partial();
export const CreateUserDTO = UserDTO.omit({ id: true });
export const ListUserDTO = z.object({
  users: z.array(UserDTO),
  cursor: z.string().nullable(),
  limit: z.number().nullable(),
});
export const PaginationDTO = z.object({
  cursor: z.string().nullable(),
  limit: z.number().min(1).max(100).default(10),
});
export type UserDTO = z.infer<typeof UserDTO>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;
export type ListUserDTO = z.infer<typeof ListUserDTO>;
