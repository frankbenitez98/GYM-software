import type { MemberStatus } from './enums'

export interface ICreateCheckInDto {
  memberId: number
}

export interface ICheckInResponse {
  id: number
  memberId: number
  member: {
    id: number
    firstName: string
    lastName: string
    memberCode: string
    photoUrl: string | null
  }
  registeredBy: number
  staff: {
    firstName: string
    lastName: string
  }
  timestamp: string
}

export interface ICheckInValidation {
  canCheckIn: boolean
  member: {
    id: number
    firstName: string
    lastName: string
    memberCode: string
    photoUrl: string | null
    status: MemberStatus
  }
  activeSubscription: {
    id: number
    planName: string
    endDate: string
    daysRemaining: number
  } | null
  reason?: string
}
