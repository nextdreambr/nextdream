import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

type PublicRegisterRole = Exclude<UserRole, 'admin'>;

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'name must contain non-whitespace characters' })
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['paciente', 'apoiador', 'instituicao'])
  role!: PublicRegisterRole;

  @ValidateIf((dto: RegisterDto) => dto.role === 'instituicao')
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'institutionResponsibleName must contain non-whitespace characters' })
  institutionResponsibleName?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === 'instituicao')
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'institutionResponsiblePhone must contain non-whitespace characters' })
  institutionResponsiblePhone?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === 'instituicao')
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'institutionType must contain non-whitespace characters' })
  institutionType?: string;

  @IsOptional()
  @IsString()
  institutionDescription?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
