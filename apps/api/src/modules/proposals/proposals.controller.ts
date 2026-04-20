import { Controller, Get, HttpCode, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
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
  @Get('mine')
  listMine(@CurrentUser() currentUser: JwtPayload) {
    return this.dreamsService.listSupporterProposals(currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('received')
  listReceived(
    @CurrentUser() currentUser: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('query') query?: string,
    @Query('status') status?: string,
  ) {
    return this.dreamsService.listReceivedProposals(currentUser, { page, pageSize, query, status });
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

  @UseGuards(JwtAuthGuard)
  @Post(':proposalId/reject')
  @HttpCode(200)
  rejectProposal(
    @CurrentUser() currentUser: JwtPayload,
    @Param('proposalId') proposalId: string,
  ) {
    return this.dreamsService.rejectProposal(currentUser, proposalId);
  }
}
