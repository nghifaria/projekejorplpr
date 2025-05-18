import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('siswa')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // fetch semua users
  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true })
    if (error) setError(error.message)
    else setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // tambah user
  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password) {
      setError('Semua field wajib diisi')
      return
    }
    const { error } = await supabase.from('users').insert([{
      name,
      email,
      password,
      role
    }])
    if (error) setError(error.message)
    else {
      setName(''); setEmail(''); setPassword(''); setRole('siswa')
      fetchUsers()
    }
  }

  // update user
  const handleUpdate = async (id) => {
    const newName = prompt('Nama baru:', users.find(u => u.id === id).name)
    const newEmail = prompt('Email baru:', users.find(u => u.id === id).email)
    const newRole = prompt('Role baru (admin/guru/siswa):', users.find(u => u.id === id).role)
    if (!newName || !newEmail || !newRole) return
    const { error } = await supabase.from('users')
      .update({ name: newName, email: newEmail, role: newRole })
      .eq('id', id)
    if (error) setError(error.message)
    else fetchUsers()
  }

  // hapus user
  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus user ini?')) return
    const { error } = await supabase.from('users')
      .delete()
      .eq('id', id)
    if (error) setError(error.message)
    else fetchUsers()
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Kelola User</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleAdd} className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input
          type="text"
          placeholder="Nama"
          className="input input-bordered"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input input-bordered"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="admin">admin</option>
          <option value="guru">guru</option>
          <option value="siswa">siswa</option>
        </select>
        <button type="submit" className="btn btn-primary sm:col-span-4 md:col-span-1">
          Tambah User
        </button>
      </form>

      {loading
        ? <p>Loading…</p>
        : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td className="space-x-2">
                    <button
                      onClick={() => handleUpdate(u.id)}
                      className="btn btn-sm btn-outline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="btn btn-sm btn-error"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  )
}
