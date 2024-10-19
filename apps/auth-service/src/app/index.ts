import { AuthService } from './auth.service';
import { UserService } from './user.service';

export * from './auth.service';
export * from './user.service';

export const services = [AuthService, UserService];
export default services;
