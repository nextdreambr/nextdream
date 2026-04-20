import { IsIn, IsOptional, IsString } from 'class-validator';
import { DreamFormat, DreamPrivacy, DreamUrgency } from '../../../entities/dream.entity';

export class UpdateDreamDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['remoto', 'presencial', 'ambos'])
  format?: DreamFormat;

  @IsOptional()
  @IsIn(['baixa', 'media', 'alta'])
  urgency?: DreamUrgency;

  @IsOptional()
  @IsIn(['publico', 'verificados', 'anonimo'])
  privacy?: DreamPrivacy;

  @IsOptional()
  @IsString()
  managedPatientId?: string;
}
