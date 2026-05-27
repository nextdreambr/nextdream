import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { DreamFormat, DreamPrivacy, DreamUrgency } from '../../../entities/dream.entity';
import { DreamLanguage, SUPPORTED_DREAM_LANGUAGES } from '../dream-language';

export class UpdateDreamDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(SUPPORTED_DREAM_LANGUAGES)
  originalLanguage?: DreamLanguage;

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
  @IsUUID('4')
  managedPatientId?: string;
}
