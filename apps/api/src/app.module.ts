import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module.js'
import { AuthModule } from './auth/auth.module.js'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js'
import { RolesGuard } from './auth/guards/roles.guard.js'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
