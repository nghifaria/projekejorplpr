import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchSubjects()
  }, [])

  async function fetchSubjects() {
    const { data } = await supabase
      .from('subjects')
      .select('id, name, description')
      .order('name', { ascending: true })
    setSubjects(data || [])
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName) return setStatus('Nama mapel wajib diisi!')
    const { error } = await supabase
      .from('subjects')
      .insert([{ name: newName, description: newDesc }])
    if (error) setStatus('Gagal tambah: ' + error.message)
    else {
      setNewName('')
      setNewDesc('')
      setStatus('✅ Mapel berhasil ditambah')
      fetchSubjects()
    }
  }

  function startEdit(sub) {
    setEditingId(sub.id)
    setEditName(sub.name)
    setEditDesc(sub.description || '')
    setStatus('')
  }

  async function handleEdit(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('subjects')
      .update({ name: editName, description: editDesc })
      .eq('id', editingId)
    if (error) setStatus('Gagal update: ' + error.message)
    else {
      setEditingId(null)
      setEditName('')
      setEditDesc('')
      setStatus('✅ Berhasil diupdate')
      fetchSubjects()
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Yakin ingin menghapus mapel ini? Semua materi, tugas, dan submissions terkait juga akan hilang!')) return

    // Ambil semua assignments dari subject yang akan dihapus
    const { data: assignments } = await supabase.from('assignments').select('id').eq('subject_id', id)

    // Hapus semua submissions untuk assignments itu (jika ada assignments)
    if (assignments && assignments.length > 0) {
      const assignmentIds = assignments.map(a => a.id)
      await supabase.from('submissions').delete().in('assignment_id', assignmentIds)
      await supabase.from('assignments').delete().in('id', assignmentIds)
    }

    // Hapus semua materials yang terkait
    await supabase.from('materials').delete().eq('subject_id', id)

    // Hapus subject
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) setStatus('Gagal hapus: ' + error.message)
    else {
      setStatus('✅ Mapel & data terkait dihapus')
      fetchSubjects()
    }
  }


  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Kelola Mata Pelajaran</h2>
      <form onSubmit={handleAdd} className="mb-6 flex flex-col gap-2">
        <input
          className="input input-bordered"
          placeholder="Nama mapel baru"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <input
          className="input input-bordered"
          placeholder="Deskripsi (opsional)"
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
        />
        <button className="btn btn-primary w-fit">Tambah Mapel</button>
      </form>
      {status && <div className="mb-4 text-sm">{status}</div>}
      <ul className="space-y-3">
        {subjects.map(sub =>
          editingId === sub.id ? (
            <li key={sub.id} className="bg-base-100 p-4 rounded shadow flex flex-col gap-2">
              <form onSubmit={handleEdit} className="flex flex-col gap-2">
                <input
                  className="input input-bordered"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <input
                  className="input input-bordered"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Deskripsi (opsional)"
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">Simpan</button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setEditingId(null)}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </li>
          ) : (
            <li key={sub.id} className="bg-base-100 p-4 rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold">{sub.name}</div>
                <div className="text-sm text-gray-500">{sub.description}</div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => startEdit(sub)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => handleDelete(sub.id)}
                >
                  Hapus
                </button>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  )
}
