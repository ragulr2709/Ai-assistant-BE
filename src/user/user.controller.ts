import { Body, Controller, Post, Get, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user-dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("create_user")
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    // req.user is populated by JwtStrategy.validate
    return { user: req.user };
  }
}
