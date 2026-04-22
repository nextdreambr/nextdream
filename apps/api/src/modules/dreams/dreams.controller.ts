import { Body, Controller, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { DreamsService } from './dreams.service';
import { CreateDreamDto } from './dto/create-dream.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateDreamDto } from './dto/update-dream.dto';

@Controller('dreams')
export class DreamsController {
  private readonly dreamsService: DreamsService;

  constructor(@Inject(DreamsService) dreamsService: DreamsService) {
    this.dreamsService = dreamsService;
  }

  @Get('public')
  listPublicDreams() {
    return this.dreamsService.listPublicDreams();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  listMyDreams(
    @CurrentUser() currentUser: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('query') query?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('format') format?: string,
  ) {
    return this.dreamsService.listMyDreams(currentUser, {
      page,
      pageSize,
      query,
      status,
      category,
      format,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createDream(@CurrentUser() currentUser: JwtPayload, @Body() dto: CreateDreamDto) {
    return this.dreamsService.createDream(currentUser, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':dreamId')
  updateDream(
    @CurrentUser() currentUser: JwtPayload,
    @Param('dreamId') dreamId: string,
    @Body() dto: UpdateDreamDto,
  ) {
    return this.dreamsService.updateDream(currentUser, dreamId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':dreamId')
  getDream(
    @CurrentUser() currentUser: JwtPayload,
    @Param('dreamId') dreamId: string,
  ) {
    return this.dreamsService.getDreamForUser(currentUser, dreamId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':dreamId/proposals')
  createProposal(
    @CurrentUser() currentUser: JwtPayload,
    @Param('dreamId') dreamId: string,
    @Body() dto: CreateProposalDto,
  ) {
    return this.dreamsService.createProposal(currentUser, dreamId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':dreamId/proposals')
  listDreamProposals(
    @CurrentUser() currentUser: JwtPayload,
    @Param('dreamId') dreamId: string,
  ) {
    return this.dreamsService.listDreamProposals(currentUser, dreamId);
  }
}
