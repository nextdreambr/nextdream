import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class AcceptAdminInviteDto {
  @IsEmail()
  email!: string;

  @IsString()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'name must contain non-whitespace characters' })
  name!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
