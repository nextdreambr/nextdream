import { Controller, HttpCode, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { DreamsService } from '../dreams/dreams.service';

@Controller('proposals')
export class ProposalsController {
  private readonly dreamsService: DreamsService;

  constructor(@Inject(DreamsService) dreamsService: DreamsService) {
    this.dreamsService = dreamsService;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':proposalId/accept')
  @HttpCode(200)
  acceptProposal(
    @CurrentUser() currentUser: JwtPayload,
    @Param('proposalId') proposalId: string,
  ) {
    return this.dreamsService.acceptProposal(currentUser, proposalId);
  }
}
