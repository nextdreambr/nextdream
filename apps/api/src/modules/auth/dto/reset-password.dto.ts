import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  requestId!: string;

  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
