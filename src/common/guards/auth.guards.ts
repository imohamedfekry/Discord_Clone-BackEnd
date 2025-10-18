import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtHelper } from "../Global/security/jwt.helper";
import { UserRepository } from "../database/repositories/user.repository";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtHelper: JwtHelper,
        private readonly userRepository: UserRepository,
        private readonly configService: ConfigService
    ) {
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = request.headers['authorization'];
        if (!token) {
            throw new UnauthorizedException('Forbidden resource. No token provided');
        }
        const decoded = this.jwtHelper.verifyToken(token);
        if (!decoded) {
            throw new UnauthorizedException('Forbidden resource. Invalid token');
        }
        const user = await this.userRepository.findById(decoded.sub);
        if (!user) {
            throw new UnauthorizedException('Forbidden resource. User not found or invalid');
        }
        request['user'] = user;
        return true;
    }
}