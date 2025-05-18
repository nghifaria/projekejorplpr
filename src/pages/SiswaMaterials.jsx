import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

export default function SiswaMaterials() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubj, setSelectedSubj] = useState('')
  const [materials, setMaterials] = useState([])

  // load daftar mapel
  useEffect(() => {
    supabase.from('subjects')
      .select('id,name')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setSubjects(data)
      })
  }, [])

  // load materi untuk mapel terpilih
  useEffect(() => {
    if (!selectedSubj) return setMaterials([])
    supabase.from('materials')
      .select('*')
      .eq('subject_id', selectedSubj)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setMaterials(data)
      })
  }, [selectedSubj])

  return (
    <div>
      <h2 className="text-xl mb-4">Daftar Materi</h2>
      <div className="mb-4">
        <select
          className="select select-bordered w-full max-w-xs"
          value={selectedSubj}
          onChange={e => setSelectedSubj(e.target.value)}
        >
          <option value="">-- Pilih Mata Pelajaran --</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {selectedSubj === '' ? (
        <p className="italic">Pilih mata pelajaran untuk melihat materinya.</p>
      ) : materials.length === 0 ? (
        <p className="italic">Belum ada materi untuk mapel ini.</p>
      ) : (
        <ul className="space-y-2">
          {materials.map(m => (
            <li key={m.id} className="flex justify-between items-center bg-base-100 p-3 rounded shadow">
              <span>{m.title}</span>
              <a
                href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/materials/${m.file_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline"
              >
                Lihat
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
