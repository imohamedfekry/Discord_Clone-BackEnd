import { Controller, Get, Put, Delete, Body, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { 
  GetProfileApiDocs, 
} from './decorators';
import { Auth } from '../../common/decorators/auth-user.decorator';

@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('users')
@Auth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @GetProfileApiDocs()
  async getProfile(@Request() request: any) {
    return this.usersService.getProfile(request);
  }
}