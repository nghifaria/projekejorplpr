// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Protected layout & auth
import ProtectedRoute from './components/ProtectedRoute'
import DefaultLayout  from './layouts/DefaultLayout'

// Auth pages
import Login    from './pages/Login.jsx'
import Register from './pages/Register.jsx'

// Admin pages
import DashboardAdmin from './pages/DashboardAdmin.jsx'
import AdminSubjects  from './pages/AdminSubjects.jsx'
import AdminUsers     from './pages/AdminUsers.jsx'

// Guru pages
import DashboardGuru                 from './pages/DashboardGuru.jsx'
import GuruMaterialsAndAssignments   from './pages/GuruMaterialsAndAssignments.jsx'
import GuruSubmissions               from './pages/GuruSubmissions.jsx'

// Siswa pages
import DashboardSiswa   from './pages/DashboardSiswa.jsx'
import SiswaAssignments from './pages/SiswaAssignments.jsx'
import SiswaGrades      from './pages/SiswaGrades.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={['admin']}>
            <DefaultLayout>
              <Routes>
                <Route index             element={<DashboardAdmin />} />
                <Route path="subjects"   element={<AdminSubjects />}  />
                <Route path="users"      element={<AdminUsers />}     />
              </Routes>
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      {/* Guru */}
      <Route
        path="/guru/*"
        element={
          <ProtectedRoute roles={['guru']}>
            <DefaultLayout>
              <Routes>
                <Route index                  element={<DashboardGuru />}               />
                <Route path="materials"       element={<GuruMaterialsAndAssignments />} />
                <Route path="submissions"     element={<GuruSubmissions />}             />
              </Routes>
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      {/* Siswa */}
      <Route
        path="/siswa/*"
        element={
          <ProtectedRoute roles={['siswa']}>
            <DefaultLayout>
              <Routes>
                <Route index                element={<DashboardSiswa />}    />
                <Route path="assignments"   element={<SiswaAssignments />}  />
                <Route path="grades"        element={<SiswaGrades />}       />
              </Routes>
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
