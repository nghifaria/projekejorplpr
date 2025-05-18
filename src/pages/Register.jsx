import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('siswa')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password, role }])
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md" onSubmit={handleRegister}>
        <h1 className="text-2xl font-bold mb-6 text-center">Register LMS SMA</h1>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <input
          type="text"
          className="w-full mb-4 p-3 border rounded-xl"
          placeholder="Nama"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="email"
          className="w-full mb-4 p-3 border rounded-xl"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full mb-4 p-3 border rounded-xl"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <select
          className="w-full mb-6 p-3 border rounded-xl"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="siswa">Siswa</option>
          <option value="guru">Guru</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded-xl font-bold hover:bg-green-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  )
}
