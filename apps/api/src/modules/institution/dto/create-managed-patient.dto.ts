import { IsOptional, IsString } from 'class-validator';

export class CreateManagedPatientDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
