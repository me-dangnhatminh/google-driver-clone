import { Catch, ExceptionFilter } from '@nestjs/common';
import { AppError } from 'src/common/app-error';

@Catch(AppError)
export class AppExceptionFilter implements ExceptionFilter<AppError> {
  catch(error: AppError) {
    return error;
  }
}
