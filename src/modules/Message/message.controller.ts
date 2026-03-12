import { Controller, Get, Param, Query, Request } from "@nestjs/common";
import { Auth } from "src/common/decorators/auth-user.decorator";
import { MessageService } from "./message.service";
import { ApiTags } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { GetMessagesQueryDto } from "./dto/message.dto";
@ApiTags('message')
@Controller({
    path: 'message',
    version: '1',
})
@Auth()
export class MessageController {
    constructor(private readonly messageService: MessageService) { }
    @Get(':channelId/messages')
    async getMessages(
        @Request() request: any,
        @Param('channelId') channelId: bigint,
        @Query() query: GetMessagesQueryDto,
    ) {
        return this.messageService.getMessages(request.user, channelId, query);
    }
}