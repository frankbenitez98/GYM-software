import type { PaymentMethod } from './enums'

export interface IDashboardStats {
  activeMembers: number
  totalMembers: number
  todayCheckIns: number
  activeSubscriptions: number
  monthlyRevenue: number
  expiringSubscriptions: IExpiringSubscription[]
  recentPayments: IRecentPayment[]
}

export interface IExpiringSubscription {
  id: number
  memberName: string
  memberCode: string
  planName: string
  endDate: string
  daysRemaining: number
}

export interface IRecentPayment {
  id: number
  memberName: string
  amount: number
  method: PaymentMethod
  paymentDate: string
}
