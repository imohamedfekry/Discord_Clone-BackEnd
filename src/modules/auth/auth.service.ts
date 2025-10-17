import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../common/database/repositories/user.repository';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtHelper, verifyHash } from '../../common/Global/security';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtHelper: JwtHelper,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if username is taken
    const existingUsername = await this.userRepository.findByUsername(registerDto.username);
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Create user (password will be hashed by middleware)
    const user = await this.userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      phone: registerDto.phone,
    } as any);

    // Generate JWT tokens
    const accessToken = this.jwtHelper.generateToken({ sub: user.id });
    const refreshToken = this.jwtHelper.generateToken({ sub: user.id, type: 'refresh' });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password (you'll need to implement password verification)
    const isPasswordValid = await verifyHash(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Generate JWT tokens
    const accessToken = this.jwtHelper.generateToken({ sub: user.id });
    const refreshToken = this.jwtHelper.generateToken({ sub: user.id, type: 'refresh' });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

}
