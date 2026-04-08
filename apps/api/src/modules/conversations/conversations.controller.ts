import { Body, Controller, Get, HttpCode, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { CloseConversationDto } from './dto/close-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  private readonly conversationsService: ConversationsService;

  constructor(@Inject(ConversationsService) conversationsService: ConversationsService) {
    this.conversationsService = conversationsService;
  }

  @Get('mine')
  listMine(@CurrentUser() currentUser: JwtPayload) {
    return this.conversationsService.listMine(currentUser);
  }

  @Get(':conversationId/messages')
  listMessages(
    @CurrentUser() currentUser: JwtPayload,
    @Param('conversationId') conversationId: string,
  ) {
    return this.conversationsService.listMessages(currentUser, conversationId);
  }

  @Post(':conversationId/messages')
  sendMessage(
    @CurrentUser() currentUser: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.conversationsService.sendMessage(currentUser, conversationId, dto);
  }

  @Post(':conversationId/close')
  @HttpCode(200)
  closeConversation(
    @CurrentUser() currentUser: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Body() dto: CloseConversationDto,
  ) {
    return this.conversationsService.closeConversation(currentUser, conversationId, dto);
  }
}
