import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../database/repositories/user.repository';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class JwtHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate JWT token
   */
  generateToken(payload: any): string {
    const secret = this.configService.get<string>('jwt.accessToken.secret');
    return this.jwtService.sign(payload, { secret });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    const secret = this.configService.get<string>('jwt.accessToken.secret');
    return this.jwtService.verify(token, { secret });
  }

  /**
   * Extract, verify token and return user
   * Handles token extraction, verification, and user lookup in one place
   * Returns user or null
   */
  async extractAndVerifyUser(token: any): Promise<any | null> {
    try {
      if (!token) {
        Logger.warn('No token provided');
        return null;
      }
      
      // Handle Bearer token format
      let cleanToken = token;
      if (typeof token === 'string' && token.startsWith('Bearer ')) {
        cleanToken = token.substring(7);
      }
      
      Logger.log(`Attempting to verify token...`);
      
      const decoded = this.verifyToken(cleanToken);
      if (!decoded || !decoded.sub) {
        Logger.warn('Token decoded but missing sub or decoded is null');
        return null;
      }
      
      Logger.log(`Token decoded successfully for user: ${decoded.sub}`);
      
      // Get user from database
      const user = await this.userRepository.findById(decoded.sub);
      
      if (!user) {
        Logger.warn(`User not found in database: ${decoded.sub}`);
        return null;
      }

      Logger.log(`User found: ${user.id}`);
      return user;
    } catch (error) {
      Logger.error(`Token verification failed: ${error.message}`, error.stack);
      return null;
    }
  }
}
