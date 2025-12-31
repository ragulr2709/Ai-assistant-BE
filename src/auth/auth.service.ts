import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { users } from '../db/schema';
import { DRIZZLE } from '../db/drizzle.module';
import { eq } from 'drizzle-orm';
import { randomUUID, createHash } from 'node:crypto';

type DrizzleDb = import('drizzle-orm/node-postgres').NodePgDatabase;

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
  ) {}

  // Validate user credentials and return user if valid
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length && user[0].password === password) {
      // In production, you should use bcrypt to compare hashed passwords
      const { password: _, ...result } = user[0];
      return result;
    }
    return null;
  }

  // Find user by email (used by JWT strategy)
  async findUserByEmail(email: string): Promise<any> {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length) {
      const { password: _, ...result } = user[0];
      return result;
    }
    return null;
  }

  // Login user and return JWT token
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    // Generate a refresh token and store a hashed version in DB
    const refreshToken = randomUUID();
    const hashed = this.hashToken(refreshToken);

    await this.db
      .update(users)
      .set({ refresh_token: hashed })
      .where(eq(users.id, user.id));

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // Exchange a refresh token for a new access token (and optionally a new refresh token)
  async refresh(email: string, refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token missing');

    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) throw new UnauthorizedException('User not found');

    const storedHashed = user[0].refresh_token;
    if (!storedHashed) throw new UnauthorizedException('No refresh token stored');

    if (this.hashToken(refreshToken) !== storedHashed) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: JwtPayload = { sub: user[0].id, email: user[0].email };
    // Optionally rotate refresh token
    const newRefresh = randomUUID();
    const newHashed = this.hashToken(newRefresh);
    await this.db.update(users).set({ refresh_token: newHashed }).where(eq(users.id, user[0].id));

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: newRefresh,
    };
  }

  // Revoke refresh token (logout)
  async revokeRefreshToken(userId: string) {
    await this.db.update(users).set({ refresh_token: null }).where(eq(users.id, userId));
    return { revoked: true };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
