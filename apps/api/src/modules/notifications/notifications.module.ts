import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User]), AuthModule, MailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
