import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { getRequiredEnv } from '../../config/env';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly usersRepository: Repository<User>;
  private readonly jwtService: JwtService;
  private readonly mailService: MailService;

  constructor(
    @InjectRepository(User) usersRepository: Repository<User>,
    @Inject(JwtService) jwtService: JwtService,
    @Inject(MailService) mailService: MailService,
  ) {
    this.usersRepository = usersRepository;
    this.jwtService = jwtService;
    this.mailService = mailService;
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: dto.role,
      city: dto.city,
      verified: true,
    });

    const saved = await this.usersRepository.save(user);
    await this.mailService.sendWelcomeEmail({
      to: saved.email,
      name: saved.name,
      role: saved.role,
    });
    return this.buildAuthResponse(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: getRequiredEnv('JWT_ACCESS_SECRET'),
        expiresIn: '1h',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: getRequiredEnv('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        verified: user.verified,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
      },
    };
  }
}
