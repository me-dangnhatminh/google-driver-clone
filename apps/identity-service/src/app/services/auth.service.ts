import { Injectable } from '@nestjs/common';
import { UserInfoClient } from 'auth0';
import { Observable, Subject } from 'rxjs';
import {
  IAuthService,
  UserCreateDTO,
  UserDTO,
} from 'src/contracts/auth-service.abstract';

@Injectable()
export class AuthService implements IAuthService {
  private users: UserDTO[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      roles: ['user'],
    },
    {
      id: '2',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      roles: ['user'],
    },
  ];
  constructor(private readonly userInfo: UserInfoClient) {}

  async create(dto: UserCreateDTO): Promise<UserDTO> {
    throw new Error('Method not implemented.');
  }

  async getById(id: string): Promise<UserDTO> {
    throw new Error('Method not implemented.');
  }

  list(cursor?: string, limit?: number): Observable<UserDTO> {
    const userStream = new Subject<UserDTO>();
    this.users.forEach((user) => userStream.next(user));
    userStream.complete();
    return userStream.asObservable();
  }
}
