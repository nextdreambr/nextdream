import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AdminSettingsRuleDto {
  @IsString()
  id!: string;

  @IsString()
  label!: string;

  @IsString()
  description!: string;

  @IsBoolean()
  enabled!: boolean;
}

class AdminSettingsCategoryDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;
}

class AdminInstitutionalTextDto {
  @IsString()
  id!: string;

  @IsString()
  label!: string;

  @IsString()
  text!: string;
}

export class UpdateAdminSettingsDto {
  @IsArray()
  @IsString({ each: true })
  blockedWords!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminSettingsRuleDto)
  @ArrayMinSize(1)
  rules!: AdminSettingsRuleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminSettingsCategoryDto)
  @ArrayMinSize(1)
  categories!: AdminSettingsCategoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminInstitutionalTextDto)
  institutionalTexts!: AdminInstitutionalTextDto[];
}
