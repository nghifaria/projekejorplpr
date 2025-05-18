import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user } = useAuth()

  const menus = {
    admin: [
      { label: 'Dashboard',     path: '/admin' },
      { label: 'Kelola Mapel',  path: '/admin/subjects' },
      { label: 'Kelola User',   path: '/admin/users' },
    ],
    guru: [
      { label: 'Dashboard',             path: '/guru' },
      { label: 'Materi & Tugas',        path: '/guru/materials' },
      { label: 'Lihat Submisi Tugas',   path: '/guru/submissions' },
    ],
    siswa: [
      { label: 'Dashboard',        path: '/siswa' },
      { label: 'Tugas & Materi',   path: '/siswa/assignments' },
      { label: 'Nilai Saya',       path: '/siswa/grades' },
    ],
  }

  if (!user) return null

  return (
    <aside className="w-56 bg-gray-100 min-h-screen p-4">
      <h2 className="mb-4 text-lg font-semibold">Menu</h2>
      <ul className="space-y-2">
        {menus[user.role].map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded hover:bg-gray-200 ${
                  isActive ? 'bg-gray-200 font-medium' : ''
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
