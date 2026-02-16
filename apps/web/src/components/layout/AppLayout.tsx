import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - will be built in Phase 2 */}
      <aside className="hidden w-64 border-r border-gray-200 bg-white md:block">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">GYM Manager</h1>
        </div>
        <nav className="p-4">
          <p className="text-sm text-gray-400">Navigation coming soon...</p>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
