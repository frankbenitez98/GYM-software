import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MembersListPage from './pages/MembersListPage'
import MemberDetailPage from './pages/MemberDetailPage'
import MemberFormPage from './pages/MemberFormPage'
import PlansListPage from './pages/PlansListPage'
import PlanFormPage from './pages/PlanFormPage'
import AssignSubscriptionPage from './pages/AssignSubscriptionPage'
import PaymentsListPage from './pages/PaymentsListPage'
import RecordPaymentPage from './pages/RecordPaymentPage'
import CheckInPage from './pages/CheckInPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/members" element={<MembersListPage />} />
            <Route path="/members/new" element={<MemberFormPage />} />
            <Route path="/members/:id" element={<MemberDetailPage />} />
            <Route path="/members/:id/edit" element={<MemberFormPage />} />
            <Route path="/members/:id/subscriptions/new" element={<AssignSubscriptionPage />} />
            <Route path="/plans" element={<PlansListPage />} />
            <Route path="/plans/new" element={<PlanFormPage />} />
            <Route path="/plans/:id/edit" element={<PlanFormPage />} />
            <Route path="/payments" element={<PaymentsListPage />} />
            <Route path="/payments/new" element={<RecordPaymentPage />} />
            <Route path="/check-in" element={<CheckInPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
