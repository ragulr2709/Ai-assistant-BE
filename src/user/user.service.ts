import { Inject, Injectable } from '@nestjs/common';
import { users } from '../db/schema';
import { DRIZZLE } from '../db/drizzle.module';
import { CreateUserDto } from './dto/create-user-dto';
import { eq } from 'drizzle-orm';

type DrizzleDb = import('drizzle-orm/node-postgres').NodePgDatabase;

@Injectable()
export class UserService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}
  async createUser(dto: CreateUserDto): Promise<any> {
    try {
      const isExistingUser = await this.db
        .select()
        .from(users)
        .where(eq(users.email, dto.email))
        .limit(1);

      if (isExistingUser.length) {
        throw new Error('User with this email already exists');
      }

      const newUser = await this.db
        .insert(users)
        .values({
          name: dto.name,
          email: dto.email,
          password: dto.password,
        })
        .returning();
      return newUser;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }
}
