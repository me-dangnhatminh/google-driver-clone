import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Controller({ path: 'auth', version: '1' })
export class AuthRestController {
  constructor(@Inject('UserService') private readonly userService: any) {}

  @Get('validate')
  validate(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    console.log('Req', req);
    const auth = req.headers.authorization;
    if (!auth) {
      throw new BadRequestException('Authorization header not found');
    }

    const [type, token] = auth.split(' ');
    if (type !== 'Bearer') {
      throw new BadRequestException('Invalid authorization type');
    }

    const user_id = 'dangnhatminh';
    const AUTHENTICATE_USER_HEADER_NAME = 'x-authenticated-user';
    res.setHeader(AUTHENTICATE_USER_HEADER_NAME, user_id);
  }
}
