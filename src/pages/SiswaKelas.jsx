import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

export default function SiswaKelas({ onSelectKelas }) {
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase
        .from('subjects')
        .select('id, name, description')
        .order('name', { ascending: true })
      setSubjects(data || [])
    }
    fetchSubjects()
  }, [])

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Pilih Kelas</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        {subjects.length === 0 ? (
          <div className="italic col-span-2 text-center">Belum ada kelas tersedia.</div>
        ) : (
          subjects.map(subj => (
            <button
              key={subj.id}
              onClick={() => onSelectKelas(subj)}
              className="bg-base-100 rounded-xl shadow-md p-6 text-left hover:bg-base-200 transition flex flex-col"
            >
              <span className="text-lg font-semibold">{subj.name}</span>
              <span className="text-sm text-gray-500 mt-2">{subj.description || '-'}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
