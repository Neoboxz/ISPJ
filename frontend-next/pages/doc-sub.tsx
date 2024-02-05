import { useState } from 'react'
import {
  cryptoBlobToBase64,
  cryptoEncryptBlob,
  cryptoGenerateIv,
  cryptoGenerateKey,
} from '../src/crypto'
import {
  firestoreCommitUpdate,
  firestoreFieldExists,
  firestorePushUpdates,
} from '../src/firebase/firestore'

export default function SubmitDocument() {
  const [file, setFile] = useState<File | null>(null)
  const [id, setId] = useState<number>(0)

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0])
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()

    // validations for file
    if (!file) {
      alert('Please select a file')
      return
    } else if (file.name.split('.').pop() !== 'pdf') {
      alert('Only PDF files are allowed')
      return
    }

    // check if id already used
    const isIdExists = await firestoreFieldExists(`patient`, 'id', id)

    if (isIdExists) {
      alert('ID already exists')
      return
    }

    // encrypt the file
    const encryptedBlob = await cryptoEncryptBlob(
      file,
      cryptoGenerateKey(),
      cryptoGenerateIv(),
    )

    const encryptedString = await cryptoBlobToBase64(encryptedBlob)

    // upload the file to firestore
    firestoreCommitUpdate('patient/111', 'health_document', encryptedString)

    // add in other updates
    firestoreCommitUpdate('patient/111', 'id', id)
    firestoreCommitUpdate(
      'patient/111',
      'last_updated',
      new Date().toLocaleString(),
    )

    await firestorePushUpdates()
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
        type='number'
        id='id'
        name='id'
        required
        onChange={(e) => setId(Number(e.target.value))}
      />
      <button type='submit'>Submit</button>
    </form>
  )
}
