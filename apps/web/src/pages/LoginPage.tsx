import { LoginForm } from '../components/auth/LoginForm.js'

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Gestión de Gimnasio</h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Inicia sesión para acceder al panel de administración
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
