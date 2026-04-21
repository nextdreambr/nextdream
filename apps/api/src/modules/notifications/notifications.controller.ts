import { Body, Controller, Get, HttpCode, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  private readonly notificationsService: NotificationsService;

  constructor(@Inject(NotificationsService) notificationsService: NotificationsService) {
    this.notificationsService = notificationsService;
  }

  @Get('mine')
  listMine(@CurrentUser() currentUser: JwtPayload) {
    return this.notificationsService.listMine(currentUser);
  }

  @Post(':notificationId/read')
  @HttpCode(200)
  markRead(
    @CurrentUser() currentUser: JwtPayload,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationsService.markRead(currentUser, notificationId);
  }

  @Post('read-all')
  @HttpCode(200)
  markAllRead(@CurrentUser() currentUser: JwtPayload) {
    return this.notificationsService.markAllRead(currentUser);
  }

  @Get('preferences')
  getPreferences(@CurrentUser() currentUser: JwtPayload) {
    return this.notificationsService.getPreferences(currentUser);
  }

  @Post('preferences')
  @HttpCode(200)
  updatePreferences(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationsService.updatePreferences(currentUser, dto.emailEnabled);
  }
}
