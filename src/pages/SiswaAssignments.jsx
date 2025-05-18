import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import UploadTugas from './UploadTugas'

export default function SiswaAssignments() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [tab, setTab] = useState('materi')
  const [materials, setMaterials] = useState([])
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState({})
  const [uploadingAssignment, setUploadingAssignment] = useState(null)
  const user = JSON.parse(localStorage.getItem('lms-user'))

  // Fetch subjects (kelas/mapel)
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

  // Fetch materials & assignments for selectedSubject
  useEffect(() => {
    if (!selectedSubject) {
      setMaterials([])
      setAssignments([])
      return
    }
    async function fetchAll() {
      const { data: matData } = await supabase
        .from('materials')
        .select('id, title, file_url, uploaded_at, subject_id')
        .eq('subject_id', selectedSubject.id)
        .order('uploaded_at', { ascending: false })
      setMaterials(matData || [])

      // **PASTIKAN select ambil file_url di assignments!**
      const { data: assignmentList } = await supabase
        .from('assignments')
        .select('id, title, due_date, subject_id, file_url') // <-- ini penting!
        .eq('subject_id', selectedSubject.id)
        .order('due_date', { ascending: true })
      setAssignments(assignmentList || [])

      const { data: submissionList } = await supabase
        .from('submissions')
        .select('id, assignment_id, file_url, grade, feedback, submitted_at')
        .eq('student_id', user.id)
      const map = {}
      for (const sub of submissionList || []) {
        if (!map[sub.assignment_id] || new Date(sub.submitted_at) > new Date(map[sub.assignment_id].submitted_at)) {
          map[sub.assignment_id] = sub
        }
      }
      setSubmissions(map)
    }
    fetchAll()
    // eslint-disable-next-line
  }, [selectedSubject, user.id, uploadingAssignment])

  // Download handlers
  async function handleDownloadMaterial(fileUrl) {
    const { data, error } = await supabase
      .storage
      .from('materials')
      .createSignedUrl(fileUrl, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else alert('Gagal download')
  }
  async function handleDownloadSubmission(fileUrl) {
    const { data, error } = await supabase
      .storage
      .from('submissions')
      .createSignedUrl(fileUrl, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else alert('Gagal download')
  }
  // **Handler baru: Download file tugas dari guru**
  async function handleDownloadAssignment(fileUrl) {
    if (!fileUrl) return
    // Ganti 'assignments' sesuai nama bucket Storage untuk file tugas!
    const { data, error } = await supabase
      .storage
      .from('assignments')
      .createSignedUrl(fileUrl, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else alert('Gagal download tugas dari guru')
  }

  function showUploadForm(assignmentId) {
    setUploadingAssignment(assignmentId)
  }
  function closeUploadForm() {
    setUploadingAssignment(null)
  }

  // Render: card list jika belum pilih kelas, tab materi/tugas jika sudah
  if (!selectedSubject) {
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
                onClick={() => {
                  setSelectedSubject(subj)
                  setTab('materi')
                }}
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

  // Jika sudah pilih kelas, tampilkan tab
  return (
    <div className="max-w-2xl mx-auto">
      <button
        className="btn btn-xs btn-outline mb-4"
        onClick={() => setSelectedSubject(null)}
      >
        &larr; Kembali ke Daftar Kelas
      </button>
      <h2 className="text-xl font-bold mb-2 text-center">{selectedSubject.name}</h2>

      <div className="flex gap-4 justify-center mb-6">
        <button
          className={`btn ${tab === 'materi' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setTab('materi')}
        >
          Materi
        </button>
        <button
          className={`btn ${tab === 'tugas' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setTab('tugas')}
        >
          Tugas
        </button>
      </div>

      {tab === 'materi' && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Materi</h3>
          {materials.length === 0 ? (
            <div className="italic">Belum ada materi.</div>
          ) : (
            <ul className="space-y-2">
              {materials.map(mat => (
                <li key={mat.id} className="bg-base-200 rounded p-3 flex justify-between items-center">
                  <span>{mat.title}</span>
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => handleDownloadMaterial(mat.file_url)}
                  >
                    Download
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'tugas' && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Tugas</h3>
          {assignments.length === 0 ? (
            <div className="italic">Tidak ada tugas.</div>
          ) : (
            assignments.map(asgn => {
              const sub = submissions[asgn.id]
              return (
                <div key={asgn.id} className="bg-base-200 rounded p-3 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{asgn.title}</span>
                    <span className="text-xs text-gray-500">
                      Deadline: {new Date(asgn.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  {/* TOMBOL DOWNLOAD FILE LAMPIRAN TUGAS DARI GURU */}
                  <div className="mb-1">
                    <span className="font-semibold">Lampiran Tugas:&nbsp;</span>
                    {asgn.file_url
                      ? (
                        <button
                          className="btn btn-xs btn-success"
                          onClick={() => handleDownloadAssignment(asgn.file_url)}
                        >
                          Download Lampiran
                        </button>
                      )
                      : <span className="text-gray-400">Tidak ada</span>
                    }
                  </div>
                  <div>
                    <span className="font-semibold">Status:&nbsp;</span>
                    {sub
                      ? (
                        <span className="text-green-600 font-medium">
                          Sudah dikumpulkan
                          <span className="text-xs block text-gray-500">
                            {new Date(sub.submitted_at).toLocaleString()}
                          </span>
                        </span>
                      )
                      : (
                        <span className="text-red-500">Belum dikumpulkan</span>
                      )
                    }
                  </div>
                  <div>
                    <span className="font-semibold">File Tugas Anda:&nbsp;</span>
                    {sub && sub.file_url
                      ? (
                        <button
                          onClick={() => handleDownloadSubmission(sub.file_url)}
                          className="btn btn-xs btn-outline"
                        >
                          Download
                        </button>
                      )
                      : <span className="text-gray-400">-</span>
                    }
                  </div>
                  <div>
                    <span className="font-semibold">Nilai:&nbsp;</span>
                    {sub && sub.grade !== null && sub.grade !== undefined
                      ? sub.grade
                      : <span className="italic text-gray-400">-</span>
                    }
                  </div>
                  <div>
                    <span className="font-semibold">Feedback:&nbsp;</span>
                    {sub && sub.feedback
                      ? sub.feedback
                      : <span className="italic text-gray-400">-</span>
                    }
                  </div>
                  <div className="mt-2">
                    {!sub && uploadingAssignment !== asgn.id && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => showUploadForm(asgn.id)}
                      >
                        Upload Tugas
                      </button>
                    )}
                    {sub && uploadingAssignment !== asgn.id && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => showUploadForm(asgn.id)}
                      >
                        Upload Ulang
                      </button>
                    )}
                    {uploadingAssignment === asgn.id && (
                      <div className="mt-3">
                        <UploadTugas assignmentId={asgn.id} />
                        <button
                          className="btn btn-xs btn-outline mt-2"
                          onClick={closeUploadForm}
                        >
                          Tutup
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
