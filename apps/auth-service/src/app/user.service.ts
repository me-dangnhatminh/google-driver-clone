import { Injectable } from '@nestjs/common';
import { UserInfoClient } from 'auth0';

@Injectable()
export class UserService {
  constructor(private readonly userInfo: UserInfoClient) {}

  update() {}
}
