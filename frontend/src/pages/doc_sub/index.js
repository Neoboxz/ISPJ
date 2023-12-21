import React, { useState } from 'react'

export default function SubmitDocument() {
  const [file, setFile] = useState(null)
  const [id, setId] = useState(0)

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!file) {
      alert('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    // add id to formData
    formData.append('id', id.toString())

    try {
      // TODO: rmb to change the api endpoint
      const response = await fetch('http://localhost:5001/api/document_sub', {
        method: 'POST',
        // over here dont set headers
        // everything put inside formData body
        body: formData,
      })

      if (response.ok) {
        alert('Document submitted successfully!')
      } else {
        const data = await response.json()
        alert('Error submitting document: ' + data.error)
      }
    } catch (error) {
      alert('Error submitting document: ' + error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='file'>Select Document:</label>
      <input
        type='file'
        id='file'
        name='file'
        required
        onChange={handleFileChange}
      />
      <input
        type='text'
        id='id'
        name='id'
        required
        onChange={(e) => setId(e.target.value)}
      />
      <button type='submit'>Submit</button>
    </form>
  )
}
