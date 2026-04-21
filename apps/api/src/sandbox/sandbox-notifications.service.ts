import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { SandboxStateService } from './sandbox-state.service';
import { SandboxNotification } from './sandbox-types';

@Injectable()
export class SandboxNotificationsService {
  private readonly sandboxState: SandboxStateService;

  constructor(@Inject(SandboxStateService) sandboxState: SandboxStateService) {
    this.sandboxState = sandboxState;
  }

  async createNotification(
    sessionId: string,
    input: {
      userId: string;
      type: string;
      title: string;
      message: string;
      actionPath?: string;
    },
  ) {
    const session = this.sandboxState.getSessionOrThrow(sessionId);
    const notification: SandboxNotification = {
      id: crypto.randomUUID(),
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionPath: input.actionPath,
      read: false,
      createdAt: new Date(),
    };

    session.notifications.unshift(notification);
    return this.serialize(notification);
  }

  async listMine(actor: string | JwtPayload) {
    const { session, userId } = this.resolveActor(actor);
    return session.notifications
      .filter((notification) => notification.userId === userId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .map((notification) => this.serialize(notification));
  }

  async markRead(actor: string | JwtPayload, notificationId: string) {
    const { session, userId } = this.resolveActor(actor);
    const notification = session.notifications.find(
      (candidate) => candidate.id === notificationId && candidate.userId === userId,
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.read = true;
    return this.serialize(notification);
  }

  async markAllRead(actor: string | JwtPayload) {
    const { session, userId } = this.resolveActor(actor);
    for (const notification of session.notifications) {
      if (notification.userId === userId) {
        notification.read = true;
      }
    }

    return { ok: true };
  }

  async getPreferences(actor: string | JwtPayload) {
    const { session, userId } = this.resolveActor(actor);
    const user = session.users.find((candidate) => candidate.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      emailEnabled: user.emailNotificationsEnabled,
    };
  }

  async updatePreferences(actor: string | JwtPayload, emailEnabled: boolean) {
    const { session, userId } = this.resolveActor(actor);
    const user = session.users.find((candidate) => candidate.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.emailNotificationsEnabled = emailEnabled;
    user.updatedAt = new Date();

    return {
      emailEnabled: user.emailNotificationsEnabled,
    };
  }

  private resolveActor(actor: string | JwtPayload) {
    if (typeof actor === 'string') {
      throw new UnauthorizedException('Sandbox session is required for notifications');
    }

    const session = this.sandboxState.getSessionOrThrow(actor.sandboxSessionId);
    return {
      session,
      userId: actor.sub,
    };
  }

  private serialize(notification: SandboxNotification) {
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
