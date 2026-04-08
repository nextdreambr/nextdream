import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProposalStatus } from '../../../entities/proposal.entity';

export class UpdateProposalStatusDto {
  @IsIn(['enviada', 'em-analise', 'aceita', 'recusada', 'expirada'])
  status!: ProposalStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
