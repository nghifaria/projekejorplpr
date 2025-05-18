// src/pages/UploadTugas.jsx
import React, { useState } from 'react'
import { supabase } from '../supabase/client'
import { v4 as uuidv4 } from 'uuid'

export default function UploadTugas({ assignmentId }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) {
      return alert('⚠️ Mohon pilih file tugas terlebih dahulu.')
    }
    try {
      setUploading(true)
      const user = JSON.parse(localStorage.getItem('lms-user'))
      const ext = file.name.split('.').pop()
      const filename = `${uuidv4()}_${user.id}.${ext}`
      // Upload ke bucket 'submissions', filename saja
      const { error: uploadError } = await supabase
        .storage
        .from('submissions')
        .upload(filename, file)
      if (uploadError) throw uploadError

      // Simpan nama file saja ke DB, bukan signed URL
      const { error: dbError } = await supabase
        .from('submissions')
        .insert([{
          assignment_id: assignmentId,
          student_id   : user.id,
          file_url     : filename,
          submitted_at : new Date()
        }])
      if (dbError) throw dbError
      alert('✅ Tugas berhasil dikumpulkan!')
      setFile(null)
    } catch (err) {
      alert('❌ Gagal upload: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <input
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={e => setFile(e.target.files[0] ?? null)}
        className="file-input file-input-bordered w-full"
      />
      <button
        type="submit"
        disabled={!file || uploading}
        className={`btn btn-primary ${uploading ? 'loading' : ''}`}
      >
        {uploading ? 'Mengunggah…' : 'Kumpulkan Tugas'}
      </button>
    </form>
  )
}
