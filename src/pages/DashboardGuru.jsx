// src/pages/DashboardGuru.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function DashboardGuru() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Guru</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Materi */}
        <Link
          to="/guru/materials"
          className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:bg-gray-50"
        >
          <span className="text-4xl mb-2">📂</span>
          <span className="text-lg font-semibold">Materi</span>
        </Link>

        {/* Unggah Materi (opsional jika kamu pakai halaman khusus upload) */}
        <Link
          to="/guru/materi/<SUBJECT_ID>"
          className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:bg-gray-50"
        >
          <span className="text-4xl mb-2">⬆️</span>
          <span className="text-lg font-semibold">Upload Materi</span>
        </Link>

        {/* Assignments */}
        <Link
          to="/guru/assignments"
          className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:bg-gray-50"
        >
          <span className="text-4xl mb-2">📝</span>
          <span className="text-lg font-semibold">Assignments</span>
        </Link>

        {/* Submissions */}
        <Link
          to="/guru/submissions"
          className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:bg-gray-50"
        >
          <span className="text-4xl mb-2">📨</span>
          <span className="text-lg font-semibold">Submissions</span>
        </Link>
      </div>
    </div>
)
}
