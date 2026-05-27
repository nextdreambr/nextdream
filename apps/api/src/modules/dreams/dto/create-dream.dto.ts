import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { DreamFormat, DreamPrivacy, DreamUrgency } from '../../../entities/dream.entity';
import { DreamLanguage, SUPPORTED_DREAM_LANGUAGES } from '../dream-language';

export class CreateDreamDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsIn(SUPPORTED_DREAM_LANGUAGES)
  originalLanguage?: DreamLanguage;

  @IsString()
  category!: string;

  @IsIn(['remoto', 'presencial', 'ambos'])
  format!: DreamFormat;

  @IsIn(['baixa', 'media', 'alta'])
  urgency!: DreamUrgency;

  @IsIn(['publico', 'verificados', 'anonimo'])
  privacy!: DreamPrivacy;

  @IsOptional()
  @IsUUID('4')
  managedPatientId?: string;
}
