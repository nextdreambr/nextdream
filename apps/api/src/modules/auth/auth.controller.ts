import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AcceptAdminInviteDto } from './dto/accept-admin-invite.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { clearAuthCookies, setAuthCookies } from './auth-cookies';

@Controller('auth')
export class AuthController {
  private readonly authService: AuthService;

  constructor(@Inject(AuthService) authService: AuthService) {
    this.authService = authService;
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const auth = await this.authService.register(dto);
    setAuthCookies(response, auth);
    return auth;
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const auth = await this.authService.login(dto);
    setAuthCookies(response, auth);
    return auth;
  }

  @Post('admin-invites/accept')
  @HttpCode(200)
  async acceptAdminInvite(@Body() dto: AcceptAdminInviteDto, @Res({ passthrough: true }) response: Response) {
    const auth = await this.authService.acceptAdminInvite(dto);
    setAuthCookies(response, auth);
    return auth;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: Response) {
    clearAuthCookies(response);
  }
}
