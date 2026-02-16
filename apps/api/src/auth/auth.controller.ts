import { Controller, Post, Get, Body } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { LoginDto } from './dto/login.dto.js'
import { RegisterDto } from './dto/register.dto.js'
import { Public } from './decorators/public.decorator.js'
import { Roles } from './decorators/roles.decorator.js'
import { CurrentUser } from './decorators/current-user.decorator.js'
import type { JwtPayload } from './decorators/current-user.decorator.js'
import { UserRole } from '@prisma/client'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Roles(UserRole.ADMIN)
  @Post('register')
  async register(@Body() dto: RegisterDto, @CurrentUser() user: JwtPayload) {
    return this.authService.register(dto, user.gymId)
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.validateUser(user.sub)
  }
}
