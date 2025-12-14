import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // Use ConfigService instead of process.env
    });
  }

  async validate(payload: JwtPayload) {
    // Fetch user from database using email from JWT payload
    const user = await this.authService.findUserByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // This user object will be attached to the request object as req.user
    return user;
  }
}
