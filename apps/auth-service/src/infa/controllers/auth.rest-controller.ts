import {
  Controller,
  Get,
  Inject,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from 'src/config';

@Controller({ path: 'auth', version: '1' })
export class AuthRestController {
  constructor(
    @Inject('AuthService') private readonly authService,
    @Inject('UserService') private readonly userService,
    private readonly configService: ConfigService,
  ) {}

  @Get('validate')
  async validate(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const headerName = this.configService.get('auth.headers', { infer: true });

    const strictHeader = req.headers[headerName.strict];
    const strictConfig = this.configService.get('auth.strict', { infer: true });
    const strictMode =
      strictHeader == undefined
        ? strictConfig
        : strictHeader == 'true'
          ? true
          : false;

    const authHeader = req.headers.authorization;
    const [type, token] = authHeader ? authHeader.split(' ') : [];

    if (!token && !strictMode) {
      res.setHeader(headerName.anonymous, 'true');
      return;
    }

    if (!token && strictMode) {
      throw new UnauthorizedException();
    }

    const user = await this.authService
      .verifyToken({ token })
      .toPromise()
      .catch(() => {
        throw new UnauthorizedException('Invalid token');
      });
    res.setHeader(headerName.userId, user.id);
    res.setHeader(headerName.anonymous, 'false');
  }
}
