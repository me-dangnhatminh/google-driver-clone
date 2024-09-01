import { Observable } from 'rxjs';

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

export type UserCreateDTO = {
  email: string;
  password: string;
  roles?: string[];
};

export interface IAuthService {
  getById(id: string): Promise<UserDTO>;
  create(dto: UserCreateDTO): Promise<UserDTO>;
  list(cursor?: string, limit?: number): Observable<UserDTO>;
}
