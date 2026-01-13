import { Controller, Get, Post, Put, Delete, Body, Request, Query, Param, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  GetProfileApiDocs,
} from './decorators/user-api.decorators';
import { Auth } from '../../../common/decorators/auth-user.decorator';
import {
  // Profile DTOs
  UpdatePasswordDto,
  UpdateglobalnameDto,
  UpdateCustomStatusDto,
  UpdateUsernameDto,
  UpdatePresenceStatusDto,
  // Friendship DTOs
  SendFriendRequestDto,
  RespondToFriendRequestDto,
  RemoveFriendDto,
  GetFriendsQueryDto,
  GetMutualFriendsDto,
  CancelFriendRequestDto,
  // User Relation DTOs
  UserRelationDto,
  RemoveUserRelationDto,
  GetUserRelationsQueryDto,
  CreateUserNoteDto,
  CreateDMDto,
} from './dto/user.dto';

@ApiTags('User Profile')
@Controller({
  path: 'users',
  version: '1',
})
@Auth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  // Start Profile Cruds Endpoints
  @Get('@me')
  @GetProfileApiDocs()
  async getProfile(@Request() request: any) {
    return this.usersService.getProfile(request.user);
  }

  @Put('@me/update/password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePassword(@Request() request: any, @Body() dto: UpdatePasswordDto) {
    return this.usersService.updatePassword(request.user, dto);
  }

  @Put('@me/update/globalname')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateglobalname(@Request() request: any, @Body() dto: UpdateglobalnameDto) {
    return this.usersService.updateglobalname(request.user, dto);
  }

  @Put('@me/update/username')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUsername(@Request() request: any, @Body() dto: UpdateUsernameDto) {

    return this.usersService.updateUsername(request.user, dto);
  }

  @Put('@me/update/customstatus')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCustomStatus(@Request() request: any, @Body() dto: UpdateCustomStatusDto) {
    // custom status like emoji and text
    return this.usersService.updateCustomStatus(request.user, dto);
  }
  @Put('@me/update/presenceStatus')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePresenceStatus(@Request() request: any, @Body() dto: UpdatePresenceStatusDto) {
    // status like online, idle, dnd, invisible
    return this.usersService.updatePresenceStatus(request.user, dto);
  }
  // End Profile Cruds Endpoints

  // Friendship endpoints
  // ==================== FRIENDSHIP ====================
  // Send friend request
  @Post('friends/request')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendFriendRequest(@Request() request: any, @Body() dto: SendFriendRequestDto) {
    return this.usersService.sendFriendRequest(request.user, dto);
  }

  @Put('friends/respond')
  async respondToFriendRequest(@Request() request: any, @Body() dto: RespondToFriendRequestDto) {
    return this.usersService.respondToFriendRequest(request.user, dto);
  }

  @Delete('friends/cancel')
  async cancelFriendRequest(@Request() request: any, @Body() dto: CancelFriendRequestDto) {
    return this.usersService.cancelFriendRequest(request.user, dto);
  }

  @Delete('friends/remove')
  async removeFriend(@Request() request: any, @Body() dto: RemoveFriendDto) {
    return this.usersService.removeFriend(request.user, dto);
  }

  @Get('friends')
  async getFriends(@Request() request: any, @Query() query: GetFriendsQueryDto) {
    return this.usersService.getFriends(request.user, query);
  }

  @Get('friends/requests')
  async getFriendRequests(@Request() request: any) {
    return this.usersService.getFriendRequests(request.user);
  }

  @Get('friends/mutual/:userId')
  async getMutualFriends(@Request() request: any, @Param() params: GetMutualFriendsDto) {
    return this.usersService.getMutualFriends(request.user, params);
  }

  @Put('@me/notes')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUserRelationNote(@Request() request: any, @Body() dto: CreateUserNoteDto) {
    return this.usersService.updateUserNote(request.user, dto);
  }
  @Delete('@me/notes')
  async deleteUserRelationNote(@Request() request: any, @Body() dto: CreateUserNoteDto) {
    return this.usersService.deleteUserNote(request.user, dto);
  }
  // ==================== USER RELATIONS ====================

  @Put('relations')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userRelation(@Request() request: any, @Body() dto: UserRelationDto) {
    return this.usersService.UpsertUserRelation(request.user, dto);
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



  // ==================== USER DMS ====================

  @Post('@me/channels')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createDM(@Request() request: any, @Body() dto: CreateDMDto) {
    return this.usersService.createDM(request.user, dto);
  }
  @Get('@me/channels')
  async getDMs(@Request() request: any) {
    return this.usersService.getDMs(request.user);
  }
}