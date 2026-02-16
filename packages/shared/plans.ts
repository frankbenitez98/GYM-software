import type { PlanStatus } from './enums'

export interface ICreatePlanDto {
  name: string
  description?: string
  durationDays: number
  price: number
}

export interface IUpdatePlanDto extends Partial<ICreatePlanDto> {
  status?: PlanStatus
}

export interface IPlanResponse {
  id: number
  name: string
  description: string | null
  durationDays: number
  price: number
  status: PlanStatus
  createdAt: string
}
