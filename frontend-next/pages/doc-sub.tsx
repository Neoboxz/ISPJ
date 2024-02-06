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
import { serverTimestamp } from "firebase/firestore";

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
    firestoreCommitUpdate(`patient/${id}`, 'health_document', encryptedString)

    // add in other updates
    firestoreCommitUpdate(`patient/${id}`, 'id', id)
    firestoreCommitUpdate(`patient/${id}`, 'last_Accessed', serverTimestamp() )
    firestoreCommitUpdate(`patient/${id}`, 'last_Updated', serverTimestamp() )
    firestoreCommitUpdate(`patient/${id}`, 'Creation_Time' , serverTimestamp() )
    alert("Documment uploaded sucessfully")
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
