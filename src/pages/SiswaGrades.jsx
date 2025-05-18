import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

export default function SiswaGrades() {
  const [submissions, setSubmissions] = useState([])
  const user = JSON.parse(localStorage.getItem('lms-user'))

  useEffect(() => {
    async function fetchGrades() {
      const { data, error } = await supabase
        .from('submissions')
        .select('id, assignment_id, grade, feedback, submitted_at, assignments(title)')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })
      if (!error && data) setSubmissions(data)
    }
    fetchGrades()
  }, [user.id])

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-xl mb-4 font-bold text-center">Nilai & Feedback Saya</h2>
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="italic text-center">Belum ada tugas yang dinilai.</div>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="bg-base-100 p-4 rounded-lg shadow">
              <p>
                <b>Assignment:</b> {sub.assignments?.title || <span className="text-gray-400">Tanpa Judul</span>}
              </p>
              <p><b>Dikumpulkan:</b> {new Date(sub.submitted_at).toLocaleString()}</p>
              <p>
                <b>Nilai:</b>{' '}
                {sub.grade !== null && sub.grade !== undefined
                  ? sub.grade
                  : <span className="italic text-gray-500">Belum dinilai</span>
                }
              </p>
              <p>
                <b>Feedback:</b>{' '}
                {sub.feedback
                  ? sub.feedback
                  : <span className="italic text-gray-500">-</span>
                }
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
