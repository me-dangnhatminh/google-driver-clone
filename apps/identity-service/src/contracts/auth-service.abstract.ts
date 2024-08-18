import { Observable } from 'rxjs';

export type UserDTO = {
  id: string;
  email: string;
  password: string;
  roles: string[];
};

export type UserCreateDTO = Omit<UserDTO, 'id'>;

export interface IAuthService {
  getById(id: string): Promise<UserDTO>;
  create(dto: UserCreateDTO): Promise<UserDTO>;
  list(): Observable<UserDTO[]>;
}
