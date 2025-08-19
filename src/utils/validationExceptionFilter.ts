import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Response } from 'express';
import { Logger } from 'winston';

const formatErrors = (
  validationErrors: ValidationError[],
  path: string = '',
) => {
  const errors = [];

  for (const error of validationErrors) {
    const currentPath = path ? `${path}.${error.property}` : error.property;

    // Если есть ошибки на текущем уровне
    if (error.constraints) {
      errors.push({
        field: currentPath,
        errors: Object.values(error.constraints),
      });
    }

    // Если есть вложенные ошибки (например, в массиве объектов)
    if (error.children && error.children.length > 0) {
      errors.push(...formatErrors(error.children, currentPath));
    }
  }

  return errors;
};

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const request = ctx.getRequest();
    const exceptionResponse: any = exception.getResponse();

    if (
      Array.isArray(exceptionResponse.message) &&
      exceptionResponse.message[0] instanceof ValidationError
    ) {
      const validationErrors = exceptionResponse.message as ValidationError[];
      const errors = formatErrors(validationErrors);

      this.logger.error(
        'Ошибка валидации',
        JSON.stringify({ url: request.url, method: request.method, errors }),
      );

      return response.status(status).json({
        statusCode: status,
        message: 'Ошибка валидации',
        errors,
      });
    }

    this.logger.error(exception.message, { exception });

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
