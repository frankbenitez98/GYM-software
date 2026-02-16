import type { UserRole } from './enums'

export interface ILoginDto {
  email: string
  password: string
}

export interface IRegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

export interface IAuthResponse {
  accessToken: string
  user: IUserResponse
}

export interface IUserResponse {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export interface IJwtPayload {
  sub: number
  email: string
  role: UserRole
  gymId: number
}
