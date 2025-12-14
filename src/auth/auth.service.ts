import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { users } from '../db/schema';
import { DRIZZLE } from '../db/drizzle.module';
import { eq } from 'drizzle-orm';

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

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
