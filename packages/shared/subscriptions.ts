import type { SubscriptionStatus } from './enums'

export interface ICreateSubscriptionDto {
  planId: number
  startDate?: string
}

export interface IUpdateSubscriptionDto {
  status?: SubscriptionStatus
}

export interface ISubscriptionResponse {
  id: number
  memberId: number
  planId: number
  plan: {
    name: string
    durationDays: number
    price: number
  }
  startDate: string
  endDate: string
  status: SubscriptionStatus
  createdAt: string
}
