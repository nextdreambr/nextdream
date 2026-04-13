import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

type PublicRegisterRole = Exclude<UserRole, 'admin'>;

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['paciente', 'apoiador'])
  role!: PublicRegisterRole;

  @IsOptional()
  @IsString()
  city?: string;
}
