import { Body, Controller, Get, HttpCode, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';
import { CloseChatDto } from './dto/close-chat.dto';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateDreamStatusDto } from './dto/update-dream-status.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  private readonly adminService: AdminService;

  constructor(@Inject(AdminService) adminService: AdminService) {
    this.adminService = adminService;
  }

  @Get('overview')
  overview() {
    return this.adminService.overview();
  }

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get('admins')
  listAdmins() {
    return this.adminService.listAdmins();
  }

  @Patch('admins/:userId')
  @HttpCode(200)
  updateAdmin(
    @CurrentUser() currentUser: JwtPayload,
    @Param('userId') userId: string,
    @Body() dto: UpdateAdminDto,
  ) {
    return this.adminService.updateAdmin(currentUser, userId, dto);
  }

  @Post('admins/invite')
  @HttpCode(200)
  inviteAdmin(@CurrentUser() currentUser: JwtPayload, @Body() dto: InviteAdminDto) {
    return this.adminService.inviteAdmin(currentUser, dto);
  }

  @Post('users/:userId/suspend')
  @HttpCode(200)
  suspendUser(
    @CurrentUser() currentUser: JwtPayload,
    @Param('userId') userId: string,
    @Body() dto: SuspendUserDto,
  ) {
    return this.adminService.suspendUser(currentUser, userId, dto);
  }

  @Post('users/:userId/approve')
  @HttpCode(200)
  approveUser(
    @CurrentUser() currentUser: JwtPayload,
    @Param('userId') userId: string,
  ) {
    return this.adminService.approveUser(currentUser, userId);
  }

  @Get('dreams')
  listDreams() {
    return this.adminService.listDreams();
  }

  @Post('dreams/:dreamId/status')
  @HttpCode(200)
  updateDreamStatus(
    @CurrentUser() currentUser: JwtPayload,
    @Param('dreamId') dreamId: string,
    @Body() dto: UpdateDreamStatusDto,
  ) {
    return this.adminService.updateDreamStatus(currentUser, dreamId, dto);
  }

  @Get('proposals')
  listProposals() {
    return this.adminService.listProposals();
  }

  @Post('proposals/:proposalId/status')
  @HttpCode(200)
  updateProposalStatus(
    @CurrentUser() currentUser: JwtPayload,
    @Param('proposalId') proposalId: string,
    @Body() dto: UpdateProposalStatusDto,
  ) {
    return this.adminService.updateProposalStatus(currentUser, proposalId, dto);
  }

  @Get('messages')
  listMessages() {
    return this.adminService.listMessages();
  }

  @Get('chats')
  listChats() {
    return this.adminService.listChats();
  }

  @Post('chats/:chatId/close')
  @HttpCode(200)
  closeChat(
    @CurrentUser() currentUser: JwtPayload,
    @Param('chatId') chatId: string,
    @Body() dto: CloseChatDto,
  ) {
    return this.adminService.closeChat(currentUser, chatId, dto);
  }

  @Get('reports')
  listReports() {
    return this.adminService.listReports();
  }

  @Post('reports/:reportId/status')
  @HttpCode(200)
  updateReportStatus(
    @CurrentUser() currentUser: JwtPayload,
    @Param('reportId') reportId: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.adminService.updateReportStatus(currentUser, reportId, dto);
  }

  @Get('audit')
  listAudit() {
    return this.adminService.listAudit();
  }

  @Get('email-templates')
  listEmailTemplates() {
    return this.adminService.listEmailTemplates();
  }
}
