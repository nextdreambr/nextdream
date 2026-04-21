import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateInstitutionProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  institutionType?: string;

  @IsOptional()
  @IsString()
  institutionResponsibleName?: string;

  @IsOptional()
  @IsString()
  institutionResponsiblePhone?: string;

  @IsOptional()
  @IsString()
  institutionDescription?: string;
}
