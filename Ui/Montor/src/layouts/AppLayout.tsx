import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-bg text-text font-sans">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
