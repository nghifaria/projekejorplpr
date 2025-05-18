// src/components/Navbar.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth }          from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="bg-base-100 border-b border-base-300 shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <Link
          to={user?.role ? `/${user.role}` : '/'}
          className="text-xl font-bold text-primary"
        >
          LMS SMA
        </Link>

        {/* Nav Links */}
        <div className="flex items-center space-x-6">
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/subjects" className="hover:text-primary transition">
                Mata Pelajaran
              </Link>
              <Link to="/admin/users" className="hover:text-primary transition">
                Users
              </Link>
            </>
          )}

          {user?.role === 'guru' && (
            <>
              <Link to="/guru/materials" className="hover:text-primary transition">
                Materi
              </Link>
              <Link to="/guru/submissions" className="hover:text-primary transition">
                Submissions
              </Link>
            </>
          )}

          {user?.role === 'siswa' && (
            <>
              <Link to="/siswa/materials" className="hover:text-primary transition">
                Materi
              </Link>
              <Link to="/siswa/assignments" className="hover:text-primary transition">
                Assignments
              </Link>
              <Link to="/siswa/grades" className="hover:text-primary transition">
                Grades
              </Link>
            </>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-outline btn-sm btn-primary"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
