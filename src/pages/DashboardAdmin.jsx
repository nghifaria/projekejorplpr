import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import { Link }    from 'react-router-dom'

export default function DashboardAdmin() {
  const [counts, setCounts] = useState({
    users: 0,
    subjects: 0,
    materials: 0,
    assignments: 0
  })

  useEffect(() => {
    async function fetchCounts() {
      const { count: uCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })

      const { count: sCount } = await supabase
        .from('subjects')
        .select('id', { count: 'exact', head: true })

      const { count: mCount } = await supabase
        .from('materials')
        .select('id', { count: 'exact', head: true })

      const { count: aCount } = await supabase
        .from('assignments')
        .select('id', { count: 'exact', head: true })

      setCounts({
        users: uCount || 0,
        subjects: sCount || 0,
        materials: mCount || 0,
        assignments: aCount || 0
      })
    }
    fetchCounts()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Users</h2>
            <p className="text-3xl">{counts.users}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Subjects</h2>
            <p className="text-3xl">{counts.subjects}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Materials</h2>
            <p className="text-3xl">{counts.materials}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Assignments</h2>
            <p className="text-3xl">{counts.assignments}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/subjects"
          className="btn btn-primary"
        >
          Tambah / Kelola Mata Pelajaran
        </Link>
        <Link
          to="/admin/users"
          className="btn btn-secondary"
        >
          Kelola User
        </Link>
      </div>
    </div>
  )
}
