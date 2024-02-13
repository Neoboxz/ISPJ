import { useState } from 'react'
import {
  cryptoBlobToBase64,
  cryptoEncryptBlob,
  cryptoGenerateIv,
  cryptoGenerateKey,
  cryptoCreateHash,
  cryptoEncryptKey,
  cryptoDecryptKey
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
  const [pass, setPass] = useState<string>(null)

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
    const passwordHash =  cryptoCreateHash(
      pass
    )
    const iv = cryptoGenerateIv()
    const key = await cryptoGenerateKey()
    // encrypt the file
    const encryptedBlob = await cryptoEncryptBlob(
      file,
      key,
      iv,
    )
  
    const encryptedString = await cryptoBlobToBase64(encryptedBlob)

    const encryptedKey = await cryptoEncryptKey(pass , iv , key)
    const decryptedKey = await cryptoDecryptKey(pass , iv , encryptedKey)
    console.log("Key " ,key.toString("hex"))
    console.log("encrypted Key ",encryptedKey)
    console.log("decrypted Key ",decryptedKey)


    // upload the file to firestore
    firestoreCommitUpdate(`patient/${id}`, 'health_document', encryptedString)

    // add in other updates
    firestoreCommitUpdate(`patient/${id}`, 'id', id)
    firestoreCommitUpdate(`patient/${id}`, 'last_Accessed', serverTimestamp() )
    firestoreCommitUpdate(`patient/${id}`, 'last_Updated', serverTimestamp() )
    firestoreCommitUpdate(`patient/${id}`, 'Creation_Time' , serverTimestamp() )
    firestoreCommitUpdate(`patient/${id}`, 'iv' , iv.toString('hex') )
    firestoreCommitUpdate(`patient/${id}`, 'key' , encryptedKey )
    firestoreCommitUpdate(`patient/${id}`, 'password' , passwordHash )
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
      <label >Enter ID:</label>
      <input
        type='number'
        id='id'
        name='id'
        required
        onChange={(e) => setId(Number(e.target.value))}
      />
      <label >Enter password:

       <input
        type='password'
        id='pass'
        name='pass'
        required
        onChange={(e) => setPass(String(e.target.value))}
      />
      </label>
      <button type='submit'>Submit</button>
      <br />
      <a href="/doc-retrieve"> to document retrieve</a>
    </form>
  )
}
