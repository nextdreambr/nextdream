import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import ms, { type StringValue } from 'ms';
import { buildLocationLabel } from '../lib/location';
import { getEnvOrDefault, getRequiredEnv } from '../config/env';
import { AuthSessionPayload, AuthUserPayload } from '../modules/auth/auth.service';
import { AcceptAdminInviteDto } from '../modules/auth/dto/accept-admin-invite.dto';
import { AcceptPatientInviteDto } from '../modules/auth/dto/accept-patient-invite.dto';
import { DemoLoginDto } from '../modules/auth/dto/demo-login.dto';
import { LoginDto } from '../modules/auth/dto/login.dto';
import { RegisterDto } from '../modules/auth/dto/register.dto';
import { SandboxStateService } from './sandbox-state.service';
import { SandboxUser } from './sandbox-types';

@Injectable()
export class SandboxAuthService {
  private readonly accessTokenExpiresIn: StringValue = this.readJwtTtl('JWT_ACCESS_EXPIRES_IN', '1h');
  private readonly refreshTokenExpiresIn: StringValue = this.readJwtTtl('JWT_REFRESH_EXPIRES_IN', '7d');
  private readonly jwtService: JwtService;
  private readonly sandboxState: SandboxStateService;

  constructor(
    @Inject(JwtService) jwtService: JwtService,
    @Inject(SandboxStateService) sandboxState: SandboxStateService,
  ) {
    this.jwtService = jwtService;
    this.sandboxState = sandboxState;
  }

  async register(dto: RegisterDto): Promise<AuthSessionPayload> {
    void dto;
    throw new BadRequestException('Cadastro real esta desabilitado no sandbox. Use os acessos demo.');
  }

  async login(dto: LoginDto): Promise<AuthSessionPayload> {
    void dto;
    throw new BadRequestException('Use a tela de acessos demo do sandbox.');
  }

  async demoLogin(dto: DemoLoginDto): Promise<AuthSessionPayload> {
    const session = this.sandboxState.createSession(dto.persona);
    const currentUser = session.users.find((user) => user.id === session.currentUserId);
    if (!currentUser) {
      throw new UnauthorizedException('Sandbox session is invalid');
    }

    return this.buildAuthResponse(session.id, currentUser);
  }

  async acceptAdminInvite(dto: AcceptAdminInviteDto): Promise<AuthSessionPayload> {
    void dto;
    throw new BadRequestException('Convites reais nao estao disponiveis no sandbox.');
  }

  async refresh(refreshToken: string): Promise<AuthSessionPayload> {
    let payload: {
      sub: string;
      role: SandboxUser['role'];
      sandboxSessionId?: unknown;
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: getRequiredEnv('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      if (this.isJwtValidationError(error)) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw error;
    }

    if (typeof payload.sandboxSessionId !== 'string') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const sessionId = payload.sandboxSessionId.trim();
    if (!sessionId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = this.sandboxState.getSession(sessionId);
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = session.users.find((candidate) => candidate.id === payload.sub);
    if (!user || user.suspended) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.buildAuthResponse(session.id, user);
  }

  async acceptPatientInvite(dto: AcceptPatientInviteDto): Promise<AuthSessionPayload> {
    void dto;
    throw new BadRequestException('Convites reais nao estao disponiveis no sandbox.');
  }

  private async buildAuthResponse(sessionId: string, user: SandboxUser): Promise<AuthSessionPayload> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sandboxSessionId: sessionId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: getRequiredEnv('JWT_ACCESS_SECRET'),
        expiresIn: this.accessTokenExpiresIn,
        jwtid: randomUUID(),
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: getRequiredEnv('JWT_REFRESH_SECRET'),
        expiresIn: this.refreshTokenExpiresIn,
        jwtid: randomUUID(),
      }),
      user: this.serializeUser(user),
    };
  }

  private serializeUser(user: SandboxUser): AuthUserPayload {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      state: user.state,
      city: user.city,
      locationLabel: buildLocationLabel(user),
      institutionType: user.institutionType,
      institutionResponsibleName: user.institutionResponsibleName,
      institutionResponsiblePhone: user.institutionResponsiblePhone,
      institutionDescription: user.institutionDescription,
      verified: user.verified,
      approved: user.approved,
      emailNotificationsEnabled: user.emailNotificationsEnabled,
    };
  }

  private readJwtTtl(name: string, fallback: StringValue): StringValue {
    const value = getEnvOrDefault(name, fallback);
    if (/^\d+$/.test(value)) {
      throw new InternalServerErrorException(
        `Invalid JWT TTL value for ${name}: "${value}". Add a time unit suffix such as "1h" or "3600s".`,
      );
    }
    if (ms(value as StringValue) === undefined) {
      throw new InternalServerErrorException(
        `Invalid JWT TTL value for ${name}: "${value}"`,
      );
    }

    return value as StringValue;
  }

  private isJwtValidationError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return [
      'JsonWebTokenError',
      'NotBeforeError',
      'TokenExpiredError',
    ].includes(error.name);
  }
}
