import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRequiredEnv } from '../../config/env';

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'paciente' | 'apoiador' | 'admin';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtService: JwtService;

  constructor(@Inject(JwtService) jwtService: JwtService) {
    this.jwtService = jwtService;
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: getRequiredEnv('JWT_ACCESS_SECRET'),
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
