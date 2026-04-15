import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService, AuthSessionPayload } from './auth.service';
import { getLoginRateLimitConfig } from '../../config/env';
import { AcceptAdminInviteDto } from './dto/accept-admin-invite.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { clearAuthCookies, setAuthCookies } from './auth-cookies';

const loginThrottle = {
  default: {
    limit: () => getLoginRateLimitConfig().limit,
    ttl: () => getLoginRateLimitConfig().ttl,
  },
};

@Controller('auth')
export class AuthController {
  private readonly authService: AuthService;

  constructor(@Inject(AuthService) authService: AuthService) {
    this.authService = authService;
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionPayload> {
    const auth = await this.authService.register(dto);
    setAuthCookies(response, auth);
    return auth;
  }

  @Post('login')
  @HttpCode(200)
  @Throttle(loginThrottle)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionPayload> {
    const auth = await this.authService.login(dto);
    setAuthCookies(response, auth);
    return auth;
  }

  @Post('admin-invites/accept')
  @HttpCode(200)
  @Throttle(loginThrottle)
  async acceptAdminInvite(
    @Body() dto: AcceptAdminInviteDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionPayload> {
    const auth = await this.authService.acceptAdminInvite(dto);
    setAuthCookies(response, auth);
    return auth;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: Response) {
    clearAuthCookies(response);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionPayload> {
    const auth = await this.authService.refresh(dto.refreshToken);
    setAuthCookies(response, auth);
    return auth;
  }
}
