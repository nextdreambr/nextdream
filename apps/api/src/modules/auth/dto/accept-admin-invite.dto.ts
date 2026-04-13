import { IsEmail, IsString, MinLength } from 'class-validator';

export class AcceptAdminInviteDto {
  @IsEmail()
  email!: string;

  @IsString()
  token!: string;

  @IsString()
  name!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
