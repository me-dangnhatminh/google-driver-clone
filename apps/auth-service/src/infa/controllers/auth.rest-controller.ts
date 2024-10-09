import {
  Controller,
  Get,
  Inject,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from 'src/config';

@Controller({ path: 'auth', version: '1' })
@ApiTags('auth')
@ApiBearerAuth()
export class AuthRestController {
  constructor(
    private readonly configService: ConfigService,
    @Inject('AuthService') private readonly authService,
  ) {}

  @Get('validate')
  async validate(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const headerName = this.configService.infer('auth.headers');
    const strictConfig = this.configService.infer('auth.strict');

    const strictHeader = req.headers[headerName.strict];
    const strictMode =
      strictHeader == undefined
        ? strictConfig
        : strictHeader == 'true'
          ? true
          : false;

    const authHeader = req.headers.authorization;

    const token = authHeader?.split('Bearer ')[1];
    if (!token && !strictMode) {
      res.setHeader(headerName.anonymous, 'true');
      return;
    }

    if (!token && strictMode) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const user = await this.authService
      .verifyToken({ token })
      .toPromise()
      .catch(() => {
        throw new UnauthorizedException('Invalid token');
      });

    res.setHeader(headerName.userId, user.id);
    res.setHeader(headerName.anonymous, 'false');
    res.setHeader(headerName.roles, JSON.stringify(user.roles));
    res.setHeader(headerName.permissions, JSON.stringify(user.permissions));
    return user;
  }
}
