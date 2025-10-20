import { Controller, Get, Post, Put, Delete, Body, Request, Query, Param, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { 
  GetProfileApiDocs,
} from './decorators/user-api.decorators';
import { Auth } from '../../../common/decorators/auth-user.decorator';
import { 
  SendFriendRequestDto,
  RespondToFriendRequestDto, 
  RemoveFriendDto, 
  GetFriendsQueryDto,
  GetMutualFriendsDto,
  CheckFriendshipDto,
} from './dto/friendship.dto';
import {
  UpdatePasswordDto,
  UpdateGlobalNameDto,
  UpdateCustomStatusDto,
  UpdateUsernameDto,
} from './dto/profile.dto';
import {
  CreateUserRelationDto,
  UpdateUserRelationDto,
  RemoveUserRelationDto,
  GetUserRelationsQueryDto,
  CheckUserRelationDto,
  UpdateRelationNoteDto,
} from './dto/user-relation.dto';

@ApiTags('User Profile')
@ApiBearerAuth()
@Controller({
  path: 'users',
  version: '1',
})
@Auth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('profile')
  @GetProfileApiDocs()
  async getProfile(@Request() request: any) {
    return this.usersService.getProfile(request.user);
  }

  @Put('profile/password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePassword(@Request() request: any, @Body() dto: UpdatePasswordDto) {
    return this.usersService.updatePassword(request.user, dto);
  }

  @Put('profile/global-name')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateGlobalName(@Request() request: any, @Body() dto: UpdateGlobalNameDto) {
    return this.usersService.updateGlobalName(request.user, dto);
  }

  @Put('profile/custom-status')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCustomStatus(@Request() request: any, @Body() dto: UpdateCustomStatusDto) {
    return this.usersService.updateCustomStatus(request.user, dto);
  }

  @Put('profile/username')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUsername(@Request() request: any, @Body() dto: UpdateUsernameDto) {
    return this.usersService.updateUsername(request.user, dto);
  }

  // Friendship endpoints
  @Post('friends/request')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendFriendRequest(@Request() request: any, @Body() dto: SendFriendRequestDto) {
    return this.usersService.sendFriendRequest(request.user, dto);
  }

  @Put('friends/respond')
  async respondToFriendRequest(@Request() request: any, @Body() dto: RespondToFriendRequestDto) {
    return this.usersService.respondToFriendRequest(request.user, dto);
  }

  @Delete('friends/remove')
  async removeFriend(@Request() request: any, @Body() dto: RemoveFriendDto) {
    return this.usersService.removeFriend(request.user, dto);
  }

  @Get('friends')
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
  async getMutualFriends(@Request() request: any, @Param() params: GetMutualFriendsDto) {
    return this.usersService.getMutualFriends(request.user, params);
  }

  @Get('friends/check/:userId')
  async checkFriendship(@Request() request: any, @Param() params: CheckFriendshipDto) {
    return this.usersService.checkFriendship(request.user, params.userId);
  }

  // ==================== USER RELATIONS ====================

  @Post('relations')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUserRelation(@Request() request: any, @Body() dto: CreateUserRelationDto) {
    return this.usersService.createUserRelation(request.user, dto);
  }

  @Put('relations')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUserRelation(@Request() request: any, @Body() dto: UpdateUserRelationDto) {
    return this.usersService.updateUserRelation(request.user, dto);
  }

  @Delete('relations')
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeUserRelation(@Request() request: any, @Body() dto: RemoveUserRelationDto) {
    return this.usersService.removeUserRelation(request.user, dto);
  }

  @Get('relations')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserRelations(@Request() request: any, @Query() query: GetUserRelationsQueryDto) {
    return this.usersService.getUserRelations(request.user, query);
  }

  @Get('relations/blocked')
  async getBlockedUsers(@Request() request: any) {
    return this.usersService.getBlockedUsers(request.user);
  }

  @Get('relations/ignored')
  async getIgnoredUsers(@Request() request: any) {
    return this.usersService.getIgnoredUsers(request.user);
  }

  @Get('relations/muted')
  async getMutedUsers(@Request() request: any) {
    return this.usersService.getMutedUsers(request.user);
  }

  @Get('relations/check')
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkUserRelation(@Request() request: any, @Query() query: CheckUserRelationDto) {
    return this.usersService.checkUserRelation(request.user, query);
  }

  @Put('relations/note')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateRelationNote(@Request() request: any, @Body() dto: UpdateRelationNoteDto) {
    return this.usersService.updateRelationNote(request.user, dto);
  }

  @Get('relations/stats')
  async getRelationStats(@Request() request: any) {
    return this.usersService.getRelationStats(request.user);
  }
}