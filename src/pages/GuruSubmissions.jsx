import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

export default function GuruSubmissions() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [assignments, setAssignments] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [grades, setGrades] = useState({})

  // Fetch subjects (mapel)
  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase.from('subjects').select('id, name')
      setSubjects(data || [])
    }
    fetchSubjects()
  }, [])

  // Fetch assignments by subject (created by guru)
  useEffect(() => {
    async function fetchAssignments() {
      const user = JSON.parse(localStorage.getItem('lms-user'))
      let query = supabase
        .from('assignments')
        .select('id, title, subject_id')
        .eq('created_by', user.id)
      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject)
      }
      const { data } = await query
      setAssignments(data || [])
    }
    fetchAssignments()
  }, [selectedSubject])

  // Fetch submissions by assignment
  useEffect(() => {
    async function fetchSubs() {
      let query = supabase
        .from('submissions')
        .select('id, assignment_id, file_url, grade, feedback, submitted_at, student_id, users!submissions_student_id_fkey(name, email), assignments(title)')
      if (selectedAssignment) {
        query = query.eq('assignment_id', selectedAssignment)
      } else if (assignments.length > 0) {
        const ids = assignments.map(a => a.id)
        query = query.in('assignment_id', ids)
      } else {
        setSubmissions([])
        return
      }
      const { data } = await query
      setSubmissions(data || [])

      // Prepare grades/feedback state
      const gradeMap = {}
      ;(data || []).forEach(sub => {
        gradeMap[sub.id] = {
          grade: sub.grade ?? '',
          feedback: sub.feedback ?? ''
        }
      })
      setGrades(gradeMap)
    }
    fetchSubs()
    // eslint-disable-next-line
  }, [selectedAssignment, assignments])

  function handleChange(id, field, value) {
    setGrades((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  async function handleSave(id) {
    const { grade, feedback } = grades[id]
    const { error } = await supabase
      .from('submissions')
      .update({ grade, feedback })
      .eq('id', id)

    if (error) {
      return alert('Gagal simpan: ' + error.message)
    }
    alert('✅ Nilai & feedback tersimpan')
    // Refresh
    const selected = selectedAssignment
    setSelectedAssignment('') // Force refresh
    setTimeout(() => setSelectedAssignment(selected), 0)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Submissions & Grading</h2>
      <div className="mb-4 flex gap-2 items-center flex-wrap">
        <label className="font-medium">Filter Mata Pelajaran:</label>
        <select
          value={selectedSubject}
          onChange={e => {
            setSelectedSubject(e.target.value)
            setSelectedAssignment('')
          }}
          className="select select-bordered"
        >
          <option value="">Semua Mapel</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <label className="font-medium ml-4">Filter Tugas:</label>
        <select
          value={selectedAssignment}
          onChange={e => setSelectedAssignment(e.target.value)}
          className="select select-bordered"
        >
          <option value="">Semua Tugas</option>
          {assignments.map(a => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="italic text-center">Belum ada submissions.</div>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="bg-base-100 p-4 rounded-xl shadow mb-3">
              <div className="mb-2">
                <b>Tugas:</b> {sub.assignments?.title}
              </div>
              <div className="mb-2">
                <b>Siswa:</b> {sub.users?.name || sub.users?.email || sub.student_id || '-'}
              </div>
              <div className="mb-2">
                <b>Dikumpulkan:</b> {new Date(sub.submitted_at).toLocaleString()}
              </div>
              <div className="mb-2">
                <b>File:</b>{' '}
                {sub.file_url && (
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={async () => {
                      const { data, error } = await supabase
                        .storage
                        .from('submissions')
                        .createSignedUrl(sub.file_url, 3600)
                      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
                      else alert('Gagal download')
                    }}
                  >
                    Download
                  </button>
                )}
              </div>
              <div className="mb-2 flex items-center gap-2">
                <label><b>Nilai:</b></label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input input-bordered w-24"
                  value={grades[sub.id]?.grade}
                  onChange={(e) => handleChange(sub.id, 'grade', e.target.value)}
                />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <label><b>Feedback:</b></label>
                <textarea
                  className="textarea textarea-bordered flex-1"
                  rows={1}
                  value={grades[sub.id]?.feedback}
                  onChange={(e) => handleChange(sub.id, 'feedback', e.target.value)}
                />
              </div>
              <button
                onClick={() => handleSave(sub.id)}
                className="btn btn-primary btn-sm mt-2"
              >
                Simpan
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
