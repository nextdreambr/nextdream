import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { AdminReportStatus } from '../../../entities/admin-report.entity';

export class UpdateReportStatusDto {
  @IsIn(['aberto', 'em-analise', 'resolvido'])
  status!: AdminReportStatus;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  resolution?: string;
}
