import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator'
import { UserRole } from '@prisma/client'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @MinLength(2)
  firstName: string

  @IsString()
  @MinLength(2)
  lastName: string

  @IsEnum(UserRole)
  role: UserRole
}
