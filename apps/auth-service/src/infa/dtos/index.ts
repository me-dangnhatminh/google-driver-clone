import z from 'zod';

// @Query('size') size: number, // ex: size=10
// @Query('offset') offset: number, // ex: offset=10 or offset=id cursor
// @Query('sort') sort: string, // ex: sort=firstName:asc,lastName:desc
// @Query() filter: string, // ex: age=gte:18,lt:30,name=match:John

export type Pagination = z.infer<typeof Pagination>;
export type Sorting = z.infer<typeof Sorting>;
export type Filter = z.infer<typeof Filter>;

export type QueryResponse = z.infer<typeof QueryResponse>;

export const Pagination = z.object({
  size: z.number().int().min(10).max(100).default(10),
  offset: z.string().optional(),
});
export const Sorting = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']),
});
export const Operator = z.enum(['match', 'gt', 'gte', 'lt', 'lte']);
export const Filter = z.object({
  field: z.string(),
  operator: Operator,
  value: z.string(),
});

export const QueryResponse = z.object({
  data: z.any(),
  total: z.number().int(),
  offset: z.string().optional(),
});
