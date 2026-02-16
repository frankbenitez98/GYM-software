import type { ILoginDto, IAuthResponse, IUserResponse } from '@shared/auth'
import { apiFetch } from './client.js'

export async function login(data: ILoginDto): Promise<IAuthResponse> {
  return apiFetch<IAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getProfile(): Promise<IUserResponse> {
  return apiFetch<IUserResponse>('/auth/profile')
}
