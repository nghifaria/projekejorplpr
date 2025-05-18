// src/pages/DashboardSiswa.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function DashboardSiswa() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Siswa</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Materi */}
        <Link
          to="/siswa/materials"
          className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:bg-gray-50"
        >
          <span className="text-4xl mb-2">📂</span>
          <span className="text-lg font-semibold">Materi</span>
        </Link>

        {/* Assignments */}
        <Link
          to="/siswa/assignments"
          className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:bg-gray-50"
        >
          <span className="text-4xl mb-2">📝</span>
          <span className="text-lg font-semibold">Assignments</span>
        </Link>

        {/* Grades */}
        <Link
          to="/siswa/grades"
          className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:bg-gray-50"
        >
          <span className="text-4xl mb-2">📊</span>
          <span className="text-lg font-semibold">Grades</span>
        </Link>
      </div>
    </div>
  )
}
