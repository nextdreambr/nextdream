import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { MailService } from '../mail/mail.service';
import { JwtPayload } from '../auth/jwt-auth.guard';

@Injectable()
export class NotificationsService {
  private readonly notificationsRepository: Repository<Notification>;
  private readonly usersRepository: Repository<User>;
  private readonly mailService: MailService;

  constructor(
    @InjectRepository(Notification) notificationsRepository: Repository<Notification>,
    @InjectRepository(User) usersRepository: Repository<User>,
    @Inject(MailService) mailService: MailService,
  ) {
    this.notificationsRepository = notificationsRepository;
    this.usersRepository = usersRepository;
    this.mailService = mailService;
  }

  private resolveUserId(actor: string | JwtPayload) {
    return typeof actor === 'string' ? actor : actor.sub;
  }

  async createNotification(input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionPath?: string;
  }) {
    const notification = this.notificationsRepository.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionPath: input.actionPath,
      read: false,
    });

    const saved = await this.notificationsRepository.save(notification);

    const user = await this.usersRepository.findOneBy({ id: input.userId });
    if (user?.emailNotificationsEnabled) {
      await this.mailService.sendNotificationEmail({
        to: user.email,
        name: user.name,
        title: input.title,
        message: input.message,
      });
    }

    return this.serialize(saved);
  }

  async listMine(actor: string | JwtPayload) {
    const userId = this.resolveUserId(actor);
    const notifications = await this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return notifications.map((notification) => this.serialize(notification));
  }

  async markRead(actor: string | JwtPayload, notificationId: string) {
    const userId = this.resolveUserId(actor);
    const notification = await this.notificationsRepository.findOneBy({
      id: notificationId,
      userId,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!notification.read) {
      notification.read = true;
      await this.notificationsRepository.save(notification);
    }

    return this.serialize(notification);
  }

  async markAllRead(actor: string | JwtPayload) {
    const userId = this.resolveUserId(actor);
    await this.notificationsRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where('userId = :userId', { userId })
      .andWhere('read = :read', { read: false })
      .execute();

    return { ok: true };
  }

  async getPreferences(actor: string | JwtPayload) {
    const userId = this.resolveUserId(actor);
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      emailEnabled: user.emailNotificationsEnabled,
    };
  }

  async updatePreferences(actor: string | JwtPayload, emailEnabled: boolean) {
    const userId = this.resolveUserId(actor);
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.emailNotificationsEnabled = emailEnabled;
    await this.usersRepository.save(user);

    return {
      emailEnabled: user.emailNotificationsEnabled,
    };
  }

  private serialize(notification: Notification) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      actionPath: notification.actionPath,
      read: notification.read,
      createdAt: notification.createdAt,
    };
  }
}
