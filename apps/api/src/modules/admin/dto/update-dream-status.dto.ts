import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { DreamStatus } from '../../../entities/dream.entity';

export class UpdateDreamStatusDto {
  @IsIn(['rascunho', 'publicado', 'em-conversa', 'realizando', 'concluido', 'pausado', 'cancelado'])
  status!: DreamStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
