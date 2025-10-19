import { Controller, Get, Post, Put, Delete, Body, Request, Query, Param, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { 
  GetProfileApiDocs, 
} from './decorators/user-api.decorators';
import { Auth } from '../../common/decorators/auth-user.decorator';
import { 
  SendFriendRequestDto, 
  RespondToFriendRequestDto, 
  RemoveFriendDto, 
  GetFriendsQueryDto,
  GetMutualFriendsDto,
  CheckFriendshipDto,
} from './dto/friendship.dto';

@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('users')
@Auth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @GetProfileApiDocs()
  async getProfile(@Request() request: any) {
    return this.usersService.getProfile(request.user);
  }

  // Friendship endpoints
  @Post('friends/request')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendFriendRequest(@Request() request: any, @Body() dto: SendFriendRequestDto) {
    return this.usersService.sendFriendRequest(request.user, dto);
  }

  @Put('friends/respond')
  @UsePipes(new ValidationPipe({ transform: true }))
  async respondToFriendRequest(@Request() request: any, @Body() dto: RespondToFriendRequestDto) {
    return this.usersService.respondToFriendRequest(request.user, dto);
  }

  @Delete('friends/remove')
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeFriend(@Request() request: any, @Body() dto: RemoveFriendDto) {
    return this.usersService.removeFriend(request.user, dto);
  }

  @Get('friends')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFriends(@Request() request: any, @Query() query: GetFriendsQueryDto) {
    return this.usersService.getFriends(request.user, query);
  }

  @Get('friends/requests/incoming')
  async getIncomingRequests(@Request() request: any) {
    return this.usersService.getIncomingRequests(request.user);
  }

  @Get('friends/requests/outgoing')
  async getOutgoingRequests(@Request() request: any) {
    return this.usersService.getOutgoingRequests(request.user);
  }

  @Get('friends/mutual/:userId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMutualFriends(@Request() request: any, @Param() params: GetMutualFriendsDto) {
    return this.usersService.getMutualFriends(request.user, params);
  }

  @Get('friends/check/:userId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkFriendship(@Request() request: any, @Param() params: CheckFriendshipDto) {
    return this.usersService.checkFriendship(request.user, params.userId);
  }
}