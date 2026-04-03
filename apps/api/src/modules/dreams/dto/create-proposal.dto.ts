import { IsString } from 'class-validator';

export class CreateProposalDto {
  @IsString()
  message!: string;

  @IsString()
  offering!: string;

  @IsString()
  availability!: string;

  @IsString()
  duration!: string;
}
