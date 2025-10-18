import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../common/database/repositories/user.repository';
import { UserProfileResponseDto } from '../../common/dto/shared-response.dto';
import { UserContext } from 'src/common/shared/types';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Get current user profile
   */
  async getProfile(user: UserContext): Promise<UserProfileResponseDto> {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || undefined,
      bio: undefined, // Will be added to database schema later
      status: undefined, // Will be added to database schema later
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}