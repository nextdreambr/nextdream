import { IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class ResetUserPasswordDto {
  @IsIn(['manual', 'reset-link'])
  mode!: 'manual' | 'reset-link';

  @IsOptional()
  @ValidateIf((dto: ResetUserPasswordDto) => dto.mode === 'manual')
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
