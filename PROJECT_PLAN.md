# Gym Management MVP - Development Plan

## Context

Building an MVP for a gym management web app on the existing monorepo (NestJS API + React/Vite frontend). The goal is a simple but complete system for managing members, subscriptions, payments, and access control for a single gym — architected so multi-tenant SaaS can be added later.

**Decisions taken:**
- **Database**: PostgreSQL + Prisma (cheap, scalable, type-safe)
- **Auth**: Email + Password with JWT
- **Access control**: Manual check-in by staff
- **Payments**: Manual recording (cash/card/transfer)
- **Multi-tenant**: Single gym now, `gymId` on all models for future expansion

---

## Prisma Schema

All models include `gymId` for future multi-tenancy. Full schema at `apps/api/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole { ADMIN  STAFF }
enum MemberStatus { ACTIVE  INACTIVE  SUSPENDED }
enum SubscriptionStatus { ACTIVE  EXPIRED  CANCELLED }
enum PaymentMethod { CASH  CARD  TRANSFER }
enum PlanStatus { ACTIVE  INACTIVE }

model Gym {
  id        String   @id @default(uuid())
  name      String
  address   String?
  phone     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  users               User[]
  members             Member[]
  subscriptionPlans   SubscriptionPlan[]
  memberSubscriptions MemberSubscription[]
  payments            Payment[]
  checkIns            CheckIn[]
  @@map("gyms")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  role      UserRole @default(STAFF)
  gymId     String   @map("gym_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  gym      Gym       @relation(fields: [gymId], references: [id])
  checkIns CheckIn[]
  @@map("users")
}

model Member {
  id               String       @id @default(uuid())
  memberCode       String       @unique @map("member_code")
  firstName        String       @map("first_name")
  lastName         String       @map("last_name")
  email            String?
  phone            String?
  identityDocument String?      @map("identity_document")
  photoUrl         String?      @map("photo_url")
  emergencyContact String?      @map("emergency_contact")
  emergencyPhone   String?      @map("emergency_phone")
  dateOfBirth      DateTime?    @map("date_of_birth")
  enrollmentDate   DateTime     @default(now()) @map("enrollment_date")
  status           MemberStatus @default(ACTIVE)
  notes            String?
  gymId            String       @map("gym_id")
  createdAt        DateTime     @default(now()) @map("created_at")
  updatedAt        DateTime     @updatedAt @map("updated_at")
  gym           Gym                  @relation(fields: [gymId], references: [id])
  subscriptions MemberSubscription[]
  checkIns      CheckIn[]
  @@index([gymId, lastName])
  @@index([gymId, memberCode])
  @@map("members")
}

model SubscriptionPlan {
  id           String     @id @default(uuid())
  name         String
  description  String?
  durationDays Int        @map("duration_days")
  price        Decimal    @db.Decimal(10, 2)
  status       PlanStatus @default(ACTIVE)
  gymId        String     @map("gym_id")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  gym           Gym                  @relation(fields: [gymId], references: [id])
  subscriptions MemberSubscription[]
  @@map("subscription_plans")
}

model MemberSubscription {
  id        String             @id @default(uuid())
  memberId  String             @map("member_id")
  planId    String             @map("plan_id")
  startDate DateTime           @map("start_date")
  endDate   DateTime           @map("end_date")
  status    SubscriptionStatus @default(ACTIVE)
  gymId     String             @map("gym_id")
  createdAt DateTime           @default(now()) @map("created_at")
  updatedAt DateTime           @updatedAt @map("updated_at")
  member   Member           @relation(fields: [memberId], references: [id])
  plan     SubscriptionPlan @relation(fields: [planId], references: [id])
  gym      Gym              @relation(fields: [gymId], references: [id])
  payments Payment[]
  @@index([memberId])
  @@index([gymId, status])
  @@map("member_subscriptions")
}

model Payment {
  id             String        @id @default(uuid())
  subscriptionId String        @map("subscription_id")
  amount         Decimal       @db.Decimal(10, 2)
  method         PaymentMethod
  paymentDate    DateTime      @default(now()) @map("payment_date")
  reference      String?
  notes          String?
  gymId          String        @map("gym_id")
  createdAt      DateTime      @default(now()) @map("created_at")
  subscription MemberSubscription @relation(fields: [subscriptionId], references: [id])
  gym          Gym                @relation(fields: [gymId], references: [id])
  @@index([gymId, paymentDate])
  @@map("payments")
}

model CheckIn {
  id           String   @id @default(uuid())
  memberId     String   @map("member_id")
  registeredBy String   @map("registered_by")
  timestamp    DateTime @default(now())
  gymId        String   @map("gym_id")
  createdAt    DateTime @default(now()) @map("created_at")
  member Member @relation(fields: [memberId], references: [id])
  staff  User   @relation(fields: [registeredBy], references: [id])
  gym    Gym    @relation(fields: [gymId], references: [id])
  @@index([gymId, timestamp])
  @@index([memberId, timestamp])
  @@map("check_ins")
}
```

---

## API Endpoints

All prefixed with `/api`. Everything requires JWT unless marked public.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/login` | public | Login |
| POST | `/auth/register` | ADMIN | Create staff/admin user |
| GET | `/auth/profile` | any | Get current user |
| POST | `/members` | ADMIN, STAFF | Create member |
| GET | `/members` | ADMIN, STAFF | List members (paginated, searchable) |
| GET | `/members/:id` | ADMIN, STAFF | Get member detail |
| PATCH | `/members/:id` | ADMIN, STAFF | Update member |
| DELETE | `/members/:id` | ADMIN | Soft-delete (set INACTIVE) |
| POST | `/plans` | ADMIN | Create subscription plan |
| GET | `/plans` | ADMIN, STAFF | List plans |
| GET | `/plans/:id` | ADMIN, STAFF | Get plan |
| PATCH | `/plans/:id` | ADMIN | Update plan |
| DELETE | `/plans/:id` | ADMIN | Soft-delete (set INACTIVE) |
| POST | `/members/:memberId/subscriptions` | ADMIN, STAFF | Assign plan to member |
| GET | `/members/:memberId/subscriptions` | ADMIN, STAFF | Member's subscriptions |
| GET | `/subscriptions/:id` | ADMIN, STAFF | Get subscription |
| PATCH | `/subscriptions/:id` | ADMIN, STAFF | Cancel/update |
| POST | `/subscriptions/:subscriptionId/payments` | ADMIN, STAFF | Record payment |
| GET | `/subscriptions/:subscriptionId/payments` | ADMIN, STAFF | Payments for subscription |
| GET | `/payments` | ADMIN, STAFF | All payments (paginated, date filter) |
| GET | `/payments/:id` | ADMIN, STAFF | Get payment |
| POST | `/check-ins` | ADMIN, STAFF | Register check-in |
| GET | `/check-ins` | ADMIN, STAFF | List check-ins (date filter) |
| GET | `/check-ins/validate/:memberId` | ADMIN, STAFF | Validate member can check in |
| GET | `/check-ins/member/:memberId` | ADMIN, STAFF | Member's check-in history |
| GET | `/dashboard/stats` | ADMIN, STAFF | Dashboard metrics |

---

## Frontend Routes

```
/login                          -> LoginPage (public)
/                               -> redirect to /dashboard
/dashboard                      -> DashboardPage
/members                        -> MembersListPage
/members/new                    -> MemberFormPage (create)
/members/:id                    -> MemberDetailPage
/members/:id/edit               -> MemberFormPage (edit)
/plans                          -> PlansListPage
/plans/new                      -> PlanFormPage (create)
/plans/:id/edit                 -> PlanFormPage (edit)
/members/:id/subscriptions/new  -> AssignSubscriptionPage
/payments                       -> PaymentsListPage
/payments/new                   -> RecordPaymentPage
/check-in                       -> CheckInPage (main operational screen)
```

---

## Implementation Phases

### Phase 0: Foundation
**Goal**: Prisma, DB connection, shared types skeleton, web routing skeleton, API base config.

**Install**:
- `apps/api`: `prisma @prisma/client @nestjs/config class-validator class-transformer`
- `apps/web`: `react-router-dom @tanstack/react-query`

**API changes**:
- Run `prisma init`, add full schema, run first migration
- Create `src/prisma/prisma.module.ts` (global) + `prisma.service.ts` (extends PrismaClient)
- Update `src/main.ts`: add `setGlobalPrefix('api')`, `ValidationPipe`, `enableCors`
- Update `src/app.module.ts`: import `ConfigModule.forRoot()` + `PrismaModule`
- Create `prisma/seed.ts`: seed default Gym + ADMIN user + sample plans
- Create `.env` and `.env.example`

**Web changes**:
- Replace `App.tsx` with React Router setup + route tree (placeholder pages)
- Create `api/client.ts` (fetch wrapper with JWT)
- Create `context/AuthContext.tsx` skeleton
- Create `components/layout/AppLayout.tsx` with `<Outlet />`
- Update `main.tsx`: wrap with `QueryClientProvider`
- Add `resolve.alias` for `@shared` in `vite.config.ts`

**Shared types**:
- Restructure `packages/shared/` into: `enums.ts`, `common.ts`, `auth.ts`, `members.ts`, `plans.ts`, `subscriptions.ts`, `payments.ts`, `check-ins.ts`, `dashboard.ts`, `index.ts` (barrel)

---

### Phase 1: Auth Module
**Goal**: JWT login, protected routes, role guards.

**Install** (api): `@nestjs/jwt @nestjs/passport passport passport-jwt bcrypt` + dev types

**API files** (`src/auth/`):
- `auth.module.ts`, `auth.controller.ts`, `auth.service.ts`
- `strategies/jwt.strategy.ts` — extracts JWT from Bearer header
- `guards/jwt-auth.guard.ts` — global guard (checks `@Public()` to skip)
- `guards/roles.guard.ts` — reads `@Roles()` metadata
- `decorators/current-user.decorator.ts`, `roles.decorator.ts`, `public.decorator.ts`
- `dto/login.dto.ts`, `register.dto.ts`
- Unit tests for service + controller

**Web files**:
- `context/AuthContext.tsx` — stores user/token, login/logout, validates on mount
- `api/auth.ts` — login, getProfile API calls
- `components/auth/ProtectedRoute.tsx` — redirects to /login if unauthenticated
- `components/auth/LoginForm.tsx` + `pages/LoginPage.tsx`

**Deliverable**: User can log in, see protected dashboard placeholder, 401 on unauthenticated API calls.

---

### Phase 2: Members Module
**Goal**: Full CRUD for gym members + core UI components.

**API files** (`src/members/`):
- `members.module.ts`, `members.controller.ts`, `members.service.ts`
- `dto/create-member.dto.ts`, `update-member.dto.ts`, `query-members.dto.ts`
- Auto-generated member codes (e.g., `MBR-XXXXXX`)
- Paginated search by name/code
- Unit tests

**Web files**:
- `api/members.ts`, `hooks/useMembers.ts`
- `pages/MembersListPage.tsx` — search + paginated table
- `pages/MemberFormPage.tsx` — create/edit form
- `pages/MemberDetailPage.tsx` — member info + tabs for subscriptions/check-ins (placeholders)
- `components/members/MemberForm.tsx`, `MemberTable.tsx`
- **Core UI components** (built here, reused everywhere):
  - `components/ui/`: Button, Input, Select, Table, Card, Badge, Pagination, SearchInput, StatusBadge, Modal
  - `components/layout/`: AppLayout (sidebar + header), Sidebar, Header

**Deliverable**: Staff can create, search, view, edit, deactivate members. Sidebar navigation works.

---

### Phase 3: Subscription Plans Module
**Goal**: Admin manages subscription plans.

**API files** (`src/plans/`):
- `plans.module.ts`, `plans.controller.ts`, `plans.service.ts`
- `dto/create-plan.dto.ts`, `update-plan.dto.ts`
- ADMIN-only for create/update/delete, both roles for listing
- Unit tests

**Web files**:
- `api/plans.ts`, `hooks/usePlans.ts`
- `pages/PlansListPage.tsx` — table with name, duration, price, status
- `pages/PlanFormPage.tsx` — create/edit form
- `components/plans/PlanForm.tsx`, `PlanTable.tsx`

**Deliverable**: Admin creates/manages plans. Staff can view them.

---

### Phase 4: Member Subscriptions Module
**Goal**: Assign plans to members with auto-calculated end dates.

**API files** (`src/subscriptions/`):
- `subscriptions.module.ts`, `subscriptions.controller.ts`, `subscriptions.service.ts`
- `dto/create-subscription.dto.ts`, `update-subscription.dto.ts`
- `endDate = startDate + plan.durationDays`
- Reactivates INACTIVE members when subscription is assigned
- Unit tests

**Web files**:
- `api/subscriptions.ts`, `hooks/useSubscriptions.ts`
- `pages/AssignSubscriptionPage.tsx` — select plan, pick start date, see calculated end date
- `components/subscriptions/SubscriptionForm.tsx`, `SubscriptionList.tsx`
- Update `MemberDetailPage.tsx` — show subscription history

**Deliverable**: Staff assigns plans to members. End dates auto-calculated. Subscription history on member detail.

---

### Phase 5: Payments Module
**Goal**: Record and track payments.

**API files** (`src/payments/`):
- `payments.module.ts`, `payments.controller.ts`, `payments.service.ts`
- `dto/create-payment.dto.ts`, `query-payments.dto.ts`
- Payments linked to subscriptions, filterable by date range and method
- Unit tests

**Web files**:
- `api/payments.ts`, `hooks/usePayments.ts`
- `pages/PaymentsListPage.tsx` — paginated table with date/method filters
- `pages/RecordPaymentPage.tsx` — search member, select subscription, enter amount/method/reference
- `components/payments/PaymentForm.tsx`, `PaymentTable.tsx`
- Update `MemberDetailPage.tsx` — show payment history

**Deliverable**: Staff records payments, views payment history. Payments visible on member detail.

---

### Phase 6: Access Control (Check-in)
**Goal**: The main operational screen for daily gym access.

**API files** (`src/check-ins/`):
- `check-ins.module.ts`, `check-ins.controller.ts`, `check-ins.service.ts`
- `dto/create-check-in.dto.ts`, `query-check-ins.dto.ts`
- Validates member is ACTIVE + has active (non-expired) subscription before allowing check-in
- Returns validation info (subscription status, days remaining)
- Unit tests (especially validation logic)

**Web files**:
- `api/check-ins.ts`, `hooks/useCheckIns.ts`
- `pages/CheckInPage.tsx` — the key operational screen:
  - Large search bar (by name or member code, debounced)
  - Member validation card: photo, name, subscription status, days remaining
  - Large green "CHECK IN" button (disabled if no active subscription)
  - Yellow warning if subscription expiring within 7 days
  - Success animation after check-in, then auto-reset
  - Today's check-ins log below
- `components/check-in/CheckInSearch.tsx`, `CheckInConfirmation.tsx`, `CheckInHistory.tsx`
- Update `MemberDetailPage.tsx` — show check-in history tab

**Deliverable**: Staff quickly searches + checks in members. System validates subscriptions. Today's log visible.

---

### Phase 7: Dashboard
**Goal**: Overview screen with key metrics.

**API files** (`src/dashboard/`):
- `dashboard.module.ts`, `dashboard.controller.ts`, `dashboard.service.ts`
- Aggregates: active members, today's check-ins, active subscriptions, monthly revenue, expiring subscriptions (7 days), recent payments
- Uses `Promise.all` for parallel Prisma queries
- Unit tests

**Web files**:
- `api/dashboard.ts`, `hooks/useDashboard.ts`
- `pages/DashboardPage.tsx`:
  - 4 stat cards: Active Members, Today's Check-ins, Active Subscriptions, Monthly Revenue
  - Expiring Subscriptions table (next 7 days)
  - Recent Payments table
- `components/dashboard/StatCard.tsx`, `ExpiringSubscriptions.tsx`, `RecentPayments.tsx`

**Deliverable**: Dashboard shows real-time gym metrics. Landing page after login.

---

## Verification

After each phase:
1. `npm run build` — both apps compile without errors
2. `npm run lint` — no linting errors
3. `npm test -w apps/api` — all unit tests pass
4. Manual testing: start both apps (`npm run dev:api` + `npm run dev:web`), test the new feature end-to-end in the browser
5. After Phase 0: verify `npx prisma studio` shows all tables, seed data exists

Full MVP verification:
1. Login as admin -> see dashboard with stats
2. Create subscription plans
3. Create members, search, edit
4. Assign subscriptions to members
5. Record payments
6. Check in a member (validates active subscription)
7. Dashboard reflects all data correctly

---

## 📋 Post-MVP: Backlog de Mejoras

_Funcionalidades y mejoras a considerar después de completar el MVP._

### Gestión de Usuarios del Sistema
- [ ] UI para gestión de usuarios (ADMIN/STAFF)
  - Página para listar usuarios del gimnasio
  - Formulario para crear nuevos usuarios (conectar con `/auth/register`)
  - Editar/desactivar usuarios existentes
  - Ver roles y permisos
- [ ] Endpoint para listar usuarios del gym actual
- [ ] Endpoint para editar/desactivar usuarios

### Multi-Tenancy
- [ ] Endpoints CRUD para Gym
- [ ] Proceso de onboarding para nuevos gimnasios
- [ ] Aislamiento de datos por gimnasio (validar en todos los endpoints)
- [ ] Subdominios o rutas por gimnasio

### Mejoras de Seguridad
- [ ] Implementar refresh tokens
- [ ] Rate limiting en endpoints de auth
- [ ] Logs de auditoría (quién hizo qué y cuándo)

### Reportes y Analytics
- [ ] Reportes de ingresos mensuales/anuales
- [ ] Análisis de retención de miembros
- [ ] Estadísticas de asistencia
- [ ] Exportar datos a Excel/PDF

### Notificaciones
- [ ] Email cuando suscripción está por vencer
- [ ] SMS/WhatsApp para recordatorios
- [ ] Notificaciones de pagos pendientes

### Hardware de Acceso (Futuro)
- [ ] Integración con scanner biométrico (ZKTeco)
- [ ] Control de puerta automático (Shelly 1)
- [ ] API para dispositivos externos

### UX/UI
- [ ] Tema oscuro
- [ ] Internacionalización (i18n) para otros idiomas
- [ ] Versión mobile/responsive mejorada
- [ ] PWA (Progressive Web App)

### Otras Ideas
- [ ] _Agregar aquí nuevas ideas durante el desarrollo..._
