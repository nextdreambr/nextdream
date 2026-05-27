import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { resolveApiLocale } from './locale';
import { getLocalizedExceptionResponse } from './messages';

@Catch(HttpException)
export class LocalizedExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const locale = resolveApiLocale(request.headers);

    response.status(exception.getStatus()).json(getLocalizedExceptionResponse(exception, locale));
  }
}
