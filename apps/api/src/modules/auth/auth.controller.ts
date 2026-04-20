import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService, AuthSessionPayload, AuthUserPayload } from './auth.service';
import { getLoginRateLimitConfig } from '../../config/env';
import { AcceptAdminInviteDto } from './dto/accept-admin-invite.dto';
import { AcceptPatientInviteDto } from './dto/accept-patient-invite.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { clearAuthCookies, setAuthCookies } from './auth-cookies';

interface PublicAuthResponse {
  user: AuthUserPayload;
}

function toPublicAuthResponse(auth: AuthSessionPayload): PublicAuthResponse {
  return {
    user: auth.user,
  };
}

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
  ): Promise<PublicAuthResponse> {
    const auth = await this.authService.register(dto);
    setAuthCookies(response, auth);
    return toPublicAuthResponse(auth);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle(loginThrottle)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PublicAuthResponse> {
    const auth = await this.authService.login(dto);
    setAuthCookies(response, auth);
    return toPublicAuthResponse(auth);
  }

  @Post('admin-invites/accept')
  @HttpCode(200)
  @Throttle(loginThrottle)
  async acceptAdminInvite(
    @Body() dto: AcceptAdminInviteDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PublicAuthResponse> {
    const auth = await this.authService.acceptAdminInvite(dto);
    setAuthCookies(response, auth);
    return toPublicAuthResponse(auth);
  }

  @Post('patient-invites/accept')
  @HttpCode(200)
  @Throttle(loginThrottle)
  async acceptPatientInvite(
    @Body() dto: AcceptPatientInviteDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PublicAuthResponse> {
    const auth = await this.authService.acceptPatientInvite(dto);
    setAuthCookies(response, auth);
    return toPublicAuthResponse(auth);
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: Response) {
    clearAuthCookies(response);
  }
}
