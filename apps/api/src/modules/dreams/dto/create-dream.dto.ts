import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { DreamFormat, DreamPrivacy, DreamUrgency } from '../../../entities/dream.entity';

export class CreateDreamDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

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
