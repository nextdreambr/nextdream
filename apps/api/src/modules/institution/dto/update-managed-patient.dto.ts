import { IsOptional, IsString } from 'class-validator';

export class UpdateManagedPatientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
