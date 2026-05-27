import { IsIn } from 'class-validator';
import {
  DreamLanguage,
  SUPPORTED_DREAM_LANGUAGES,
} from '../dream-language';

export class TranslateDreamDto {
  @IsIn(SUPPORTED_DREAM_LANGUAGES)
  targetLanguage!: DreamLanguage;
}
