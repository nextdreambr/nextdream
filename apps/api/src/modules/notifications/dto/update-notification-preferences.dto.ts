import { IsBoolean } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsBoolean()
  emailEnabled!: boolean;
}
