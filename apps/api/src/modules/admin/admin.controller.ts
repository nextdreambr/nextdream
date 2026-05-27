import { Body, Controller, Get, HttpCode, Inject, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';
import { CloseChatDto } from './dto/close-chat.dto';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { ReactivateUserDto } from './dto/reactivate-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateAdminSettingsDto } from './dto/update-admin-settings.dto';
import { UpdateDreamStatusDto } from './dto/update-dream-status.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @HttpCode(200)
  updateSettings(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: UpdateAdminSettingsDto,
  ) {
    return this.adminService.updateSettings(currentUser, dto);
  }

  @Put('settings')
  @HttpCode(200)
  replaceSettings(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: UpdateAdminSettingsDto,
  ) {
    return this.adminService.updateSettings(currentUser, dto);
  }

  @Get('users')
  listUsers(@Query() query: Record<string, string | undefined>) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:userId')
  getUserDetail(@Param('userId') userId: string) {
    return this.adminService.getUserDetail(userId);
  }

  @Patch('users/:userId')
  @HttpCode(200)
  updateUser(
    @CurrentUser() currentUser: JwtPayload,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(currentUser, userId, dto);
  }

  @Get('admins')
  listAdmins() {
    return this.adminService.listAdmins();
  }

  @Get('admins/page')
  listAdminsPage(@Query() query: Record<string, string | undefined>) {
    return this.adminService.listAdminsPage(query);
  }

  @Get('admins/invites')
  listAdminInvites() {
    return this.adminService.listAdminInvites();
  }

  @Get('admins/:userId')
  getAdminDetail(@Param('userId') userId: string) {
    return this.adminService.getAdminDetail(userId);
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

  @Post('users/:userId/reactivate')
  @HttpCode(200)
  reactivateUser(
    @CurrentUser() currentUser: JwtPayload,
    @Param('userId') userId: string,
    @Body() dto: ReactivateUserDto,
  ) {
    return this.adminService.reactivateUser(currentUser, userId, dto);
  }

  @Post('users/:userId/password/reset')
  @HttpCode(200)
  resetUserPassword(
    @CurrentUser() currentUser: JwtPayload,
    @Param('userId') userId: string,
    @Body() dto: ResetUserPasswordDto,
  ) {
    return this.adminService.resetUserPassword(currentUser, userId, dto);
  }

  @Get('dreams')
  listDreams(@Query() query: Record<string, string | undefined>) {
    return this.adminService.listDreams(query);
  }

  @Get('dreams/:dreamId')
  getDreamDetail(@Param('dreamId') dreamId: string) {
    return this.adminService.getDreamDetail(dreamId);
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
  listProposals(@Query() query: Record<string, string | undefined>) {
    return this.adminService.listProposals(query);
  }

  @Get('proposals/:proposalId')
  getProposalDetail(@Param('proposalId') proposalId: string) {
    return this.adminService.getProposalDetail(proposalId);
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
  listMessages(@Query() query: Record<string, string | undefined>) {
    return this.adminService.listMessages(query);
  }

  @Get('messages/:messageId')
  getMessageDetail(@Param('messageId') messageId: string) {
    return this.adminService.getMessageDetail(messageId);
  }

  @Get('chats')
  listChats(@Query() query: Record<string, string | undefined>) {
    return this.adminService.listChats(query);
  }

  @Get('chats/:chatId')
  getChatDetail(@Param('chatId') chatId: string) {
    return this.adminService.getChatDetail(chatId);
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
  listReports(@Query() query: Record<string, string | undefined>) {
    return this.adminService.listReports(query);
  }

  @Get('reports/:reportId')
  getReportDetail(@Param('reportId') reportId: string) {
    return this.adminService.getReportDetail(reportId);
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

  @Get('audit/page')
  listAuditPage(@Query() query: Record<string, string | undefined>) {
    return this.adminService.listAuditPage(query);
  }

  @Get('email-templates')
  listEmailTemplates() {
    return this.adminService.listEmailTemplates();
  }
}
