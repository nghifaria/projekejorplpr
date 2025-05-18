import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase/client'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    // manual cek tabel users
    const { data, error: sbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single()

    if (sbError) {
      setError('Login gagal: ' + sbError.message)
      return
    }
    if (!data) {
      setError('Email/password salah!')
      return
    }

    // simpan user ke Context
    login(data)

    // redirect sesuai role
    if (data.role === 'admin') {
      navigate('/admin/subjects', { replace: true })
    } else if (data.role === 'guru') {
      navigate('/guru/materials', { replace: true })
    } else if (data.role === 'siswa') {
      navigate('/siswa/materials', { replace: true })
    } else {
      setError('Role tidak dikenali')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-base-200">
      <form
        onSubmit={handleLogin}
        className="card p-6 w-full max-w-sm shadow-md bg-base-100"
      >
        <h1 className="text-2xl mb-4">Login LMS SMA</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-primary w-full">
          Login
        </button>
      </form>
    </div>
  )
}
