import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AcceptAdminInviteDto } from './dto/accept-admin-invite.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  private readonly authService: AuthService;

  constructor(@Inject(AuthService) authService: AuthService) {
    this.authService = authService;
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admin-invites/accept')
  @HttpCode(200)
  acceptAdminInvite(@Body() dto: AcceptAdminInviteDto) {
    return this.authService.acceptAdminInvite(dto);
  }
}
