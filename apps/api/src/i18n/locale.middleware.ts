import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { resolveApiLocale } from './locale';
import { runWithApiLocale } from './request-locale';

@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(request: Request, _response: Response, next: NextFunction): void {
    runWithApiLocale(resolveApiLocale(request.headers), next);
  }
}
