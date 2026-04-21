import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../modules/auth/auth.controller';
import { AuthService } from '../modules/auth/auth.service';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';
import { ConversationsController } from '../modules/conversations/conversations.controller';
import { ConversationsService } from '../modules/conversations/conversations.service';
import { DreamsController } from '../modules/dreams/dreams.controller';
import { DreamsService } from '../modules/dreams/dreams.service';
import { InstitutionController } from '../modules/institution/institution.controller';
import { InstitutionService } from '../modules/institution/institution.service';
import { NotificationsController } from '../modules/notifications/notifications.controller';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { ProposalsController } from '../modules/proposals/proposals.controller';
import { SandboxAuthService } from './sandbox-auth.service';
import { SandboxConversationsService } from './sandbox-conversations.service';
import { SandboxDreamsService } from './sandbox-dreams.service';
import { SandboxHealthController } from './sandbox-health.controller';
import { SandboxInstitutionService } from './sandbox-institution.service';
import { SandboxNotificationsService } from './sandbox-notifications.service';
import { SandboxStateService } from './sandbox-state.service';

@Module({
  imports: [
    JwtModule.register({}),
  ],
  controllers: [
    SandboxHealthController,
    AuthController,
    DreamsController,
    ProposalsController,
    ConversationsController,
    NotificationsController,
    InstitutionController,
  ],
  providers: [
    SandboxStateService,
    SandboxAuthService,
    SandboxDreamsService,
    SandboxConversationsService,
    SandboxNotificationsService,
    SandboxInstitutionService,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: AuthService,
      useExisting: SandboxAuthService,
    },
    {
      provide: DreamsService,
      useExisting: SandboxDreamsService,
    },
    {
      provide: ConversationsService,
      useExisting: SandboxConversationsService,
    },
    {
      provide: NotificationsService,
      useExisting: SandboxNotificationsService,
    },
    {
      provide: InstitutionService,
      useExisting: SandboxInstitutionService,
    },
  ],
})
export class SandboxModule {}
