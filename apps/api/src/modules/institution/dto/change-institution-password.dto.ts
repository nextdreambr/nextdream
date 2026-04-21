import { IsString, MinLength } from 'class-validator';

export class ChangeInstitutionPasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
