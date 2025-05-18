import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth()

  // belum login → ke “/”
  if (!user) return <Navigate to="/" replace />

  // role mismatch → ke dashboard sendiri
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />
  }

  return children
}
