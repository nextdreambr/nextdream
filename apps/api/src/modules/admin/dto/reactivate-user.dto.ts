import { IsString, MaxLength, MinLength } from 'class-validator';

export class ReactivateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
