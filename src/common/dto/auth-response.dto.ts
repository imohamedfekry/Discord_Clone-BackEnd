import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserDto } from './shared-response.dto';

export class AuthResponseDto {
  @Expose()
  @ApiProperty({ description: 'User information', type: UserDto })
  user: UserDto;

  @Expose()
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @Expose()
  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;
}

export class LoginResponseDto {
  @Expose()
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @Expose()
  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;
}
