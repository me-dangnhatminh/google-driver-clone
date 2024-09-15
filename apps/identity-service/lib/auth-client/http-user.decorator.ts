import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const HttpUser = createParamDecorator(
  async (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
