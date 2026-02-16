import type { MemberStatus } from './enums'

export interface ICreateMemberDto {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  identityDocument?: string
  emergencyContact?: string
  emergencyPhone?: string
  dateOfBirth?: string
  notes?: string
}

export interface IUpdateMemberDto extends Partial<ICreateMemberDto> {
  status?: MemberStatus
}

export interface IMemberResponse {
  id: number
  memberCode: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  identityDocument: string | null
  photoUrl: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  dateOfBirth: string | null
  enrollmentDate: string
  status: MemberStatus
  notes: string | null
  createdAt: string
}
