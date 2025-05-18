import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

export default function GuruMaterialsAndAssignments() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [tab, setTab] = useState('materi')
  const [materials, setMaterials] = useState([])
  const [assignments, setAssignments] = useState([])
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)         // file untuk materi
  const [assignFile, setAssignFile] = useState(null) // file untuk tugas
  const [desc, setDesc] = useState('')
  const [due, setDue] = useState('')
  const [status, setStatus] = useState('')
  const [statusAssign, setStatusAssign] = useState('')

  const user = JSON.parse(localStorage.getItem('lms-user'))

  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase.from('subjects').select('id, name, description').order('name', { ascending: true })
      setSubjects(data || [])
    }
    fetchSubjects()
  }, [])

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
      const { data: assignData } = await supabase
        .from('assignments')
        .select('id, title, description, due_date, file_url')
        .eq('subject_id', selectedSubject.id)
        .order('due_date', { ascending: true })
      setAssignments(assignData || [])
    }
    fetchAll()
    // eslint-disable-next-line
  }, [selectedSubject, status, statusAssign])

  // Upload materi
  async function handleUploadMateri(e) {
    e.preventDefault()
    setStatus('')
    if (!title || !file) {
      setStatus('Judul & file wajib diisi')
      return
    }
    const filename = `${crypto.randomUUID()}_${Date.now()}_${file.name.replace(/\s/g, '_')}`
    const filePath = `${filename}`
    // Upload file ke bucket materials
    const { error: uploadErr } = await supabase
      .storage
      .from('materials')
      .upload(filePath, file)
    if (uploadErr) return setStatus('Gagal upload: ' + uploadErr.message)
    // Simpan row ke tabel materials
    const { error: dbErr } = await supabase
      .from('materials')
      .insert([{
        subject_id: selectedSubject.id,
        title,
        file_url: filePath,
        uploaded_at: new Date(),
        uploaded_by: user.id
      }])
    if (dbErr) return setStatus('Gagal simpan ke DB: ' + dbErr.message)
    setStatus('✅ Materi berhasil diupload!')
    setTitle('')
    setFile(null)
  }

  // Buat tugas (file opsional)
  async function handleCreateAssignment(e) {
    e.preventDefault()
    setStatusAssign('')
    let assignFileUrl = null

    if (assignFile) {
      const filename = `${crypto.randomUUID()}_${Date.now()}_${assignFile.name.replace(/\s/g, '_')}`
      const filePath = `${filename}`
      const { error: uploadErr } = await supabase
        .storage
        .from('assignments')
        .upload(filePath, assignFile)
      if (uploadErr) return setStatusAssign('Gagal upload file tugas: ' + uploadErr.message)
      assignFileUrl = filePath
    }

    if (!title || !due) {
      setStatusAssign('Judul & due date wajib diisi')
      return
    }
    const { error } = await supabase
      .from('assignments')
      .insert([{
        subject_id: selectedSubject.id,
        title,
        description: desc,
        due_date: due,
        created_by: user.id,
        file_url: assignFileUrl // null jika tidak upload file
      }])
    if (error) {
      setStatusAssign('Gagal membuat tugas: ' + error.message)
    } else {
      setStatusAssign('✅ Tugas berhasil dibuat!')
      setTitle('')
      setDesc('')
      setDue('')
      setAssignFile(null)
    }
  }

  async function handleDownloadMaterial(fileUrl) {
    const { data, error } = await supabase
      .storage
      .from('materials')
      .createSignedUrl(fileUrl, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else alert('Gagal download')
  }

  async function handleDownloadAssignment(fileUrl) {
    const { data, error } = await supabase
      .storage
      .from('assignments')
      .createSignedUrl(fileUrl, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else alert('Gagal download')
  }

  if (!selectedSubject) {
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Pilih Kelas / Mapel</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          {subjects.length === 0 ? (
            <div className="italic col-span-2 text-center">Belum ada kelas/mapel.</div>
          ) : (
            subjects.map(subj => (
              <button
                key={subj.id}
                onClick={() => {
                  setSelectedSubject(subj)
                  setTab('materi')
                  setTitle('')
                  setDesc('')
                  setDue('')
                  setFile(null)
                  setAssignFile(null)
                  setStatus('')
                  setStatusAssign('')
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

  return (
    <div className="max-w-2xl mx-auto">
      <button
        className="btn btn-xs btn-outline mb-4"
        onClick={() => setSelectedSubject(null)}
      >
        &larr; Kembali ke Daftar Mapel
      </button>
      <h2 className="text-xl font-bold mb-2 text-center">{selectedSubject.name}</h2>
      <div className="flex gap-4 justify-center mb-6">
        <button
          className={`btn ${tab === 'materi' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            setTab('materi')
            setTitle('')
            setDesc('')
            setDue('')
            setFile(null)
            setStatus('')
          }}
        >
          Upload Materi
        </button>
        <button
          className={`btn ${tab === 'tugas' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            setTab('tugas')
            setTitle('')
            setDesc('')
            setDue('')
            setAssignFile(null)
            setStatusAssign('')
          }}
        >
          Buat Tugas
        </button>
      </div>

      {tab === 'materi' && (
        <div>
          <form className="mb-6" onSubmit={handleUploadMateri}>
            <h3 className="font-semibold mb-2">Upload Materi</h3>
            <input
              type="text"
              placeholder="Judul Materi"
              className="input input-bordered w-full mb-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setFile(e.target.files[0] ?? null)}
              className="file-input file-input-bordered w-full mb-2"
            />
            <button type="submit" className="btn btn-primary">Upload</button>
            {status && <div className="mt-2 text-sm">{status}</div>}
          </form>
          <h3 className="font-semibold text-lg mb-2">Materi Terunggah</h3>
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
          <form className="mb-6" onSubmit={handleCreateAssignment}>
            <h3 className="font-semibold mb-2">Buat Tugas Baru</h3>
            <input
              type="text"
              placeholder="Judul Tugas"
              className="input input-bordered w-full mb-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Deskripsi (opsional)"
              className="textarea textarea-bordered w-full mb-2"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
            <input
              type="date"
              className="input input-bordered w-full mb-2"
              value={due}
              onChange={e => setDue(e.target.value)}
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setAssignFile(e.target.files[0] ?? null)}
              className="file-input file-input-bordered w-full mb-2"
            />
            <button type="submit" className="btn btn-primary">Buat Tugas</button>
            {statusAssign && <div className="mt-2 text-sm">{statusAssign}</div>}
          </form>
          <h3 className="font-semibold text-lg mb-2">Daftar Tugas</h3>
          {assignments.length === 0 ? (
            <div className="italic">Belum ada tugas.</div>
          ) : (
            <ul className="space-y-2">
              {assignments.map(asgn => (
                <li key={asgn.id} className="bg-base-200 rounded p-3 flex flex-col">
                  <div>
                    <span className="font-semibold">{asgn.title}</span>
                    <span className="text-xs text-gray-500 ml-2">Deadline: {new Date(asgn.due_date).toLocaleDateString()}</span>
                  </div>
                  {asgn.description && <span className="text-sm">{asgn.description}</span>}
                  {asgn.file_url && (
                    <button
                      className="btn btn-xs btn-outline mt-2 w-fit"
                      onClick={() => handleDownloadAssignment(asgn.file_url)}
                    >
                      Download File
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
