import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface JwtPayload {
  sub: number
  email: string
  role: string
  gymId: number
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): JwtPayload => {
  const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>()
  return request.user
})
