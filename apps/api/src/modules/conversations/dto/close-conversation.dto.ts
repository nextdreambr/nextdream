import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CloseConversationDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
