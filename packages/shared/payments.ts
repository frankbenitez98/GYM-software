import type { PaymentMethod } from './enums'

export interface ICreatePaymentDto {
  subscriptionId: number
  amount: number
  method: PaymentMethod
  paymentDate?: string
  reference?: string
  notes?: string
}

export interface IPaymentResponse {
  id: number
  subscriptionId: number
  subscription: {
    member: {
      id: number
      firstName: string
      lastName: string
      memberCode: string
    }
    plan: {
      name: string
    }
  }
  amount: number
  method: PaymentMethod
  paymentDate: string
  reference: string | null
  notes: string | null
  createdAt: string
}
