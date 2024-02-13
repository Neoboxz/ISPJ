import { useState } from 'react'
import {
  cryptoBase64ToBlob,
  cryptoDecryptBlob,
  cryptoGenerateIv,
  cryptoGenerateKey,
  cryptoDecryptKey,
  cryptoCreateHash
} from '../src/crypto'
import { firestoreRetrieveDocumentField } from '../src/firebase/firestore'
import {
  firestoreCommitUpdate,
  firestoreFieldExists,
  firestorePushUpdates,
} from '../src/firebase/firestore'
import { serverTimestamp } from "firebase/firestore";

export default function DocRetrive() {
  const [id, setId] = useState<number | null>(null)
  const [pass , setPass] = useState<string | null>(null)

  const handleRetrieve = async () => {
    try {
      const healthDocumentBase64 = await firestoreRetrieveDocumentField(
        `patient/${id}`,
        'health_document',
      )
      const passwordHash = await firestoreRetrieveDocumentField(
        `patient/${id}`,
        'password',
      )
      const iv  = await firestoreRetrieveDocumentField(
        `patient/${id}`,
        'iv',
      )
      const encryptedKey = await firestoreRetrieveDocumentField(
        `patient/${id}`,
        'key',
      )


      firestoreCommitUpdate(`patient/${id}`, 'last_Accessed', serverTimestamp() )

      await firestorePushUpdates()
      const checkHash = cryptoCreateHash(pass)
      if (checkHash == passwordHash) {
        
        const encryptedBlob = await cryptoBase64ToBlob(healthDocumentBase64)
        const ivBuffer : Buffer=  Buffer.from(iv , "hex") 
        //Get decrypted key
        const dencryptKey : Buffer =Buffer.from(await cryptoDecryptKey(pass , ivBuffer , encryptedKey) , "hex")
        console.log(dencryptKey.toString("hex"),"    ",ivBuffer.toString("hex") , iv )
      
  
        const decryptedBlob = await cryptoDecryptBlob(
          encryptedBlob,
          dencryptKey,
          ivBuffer,
        )
  
        // convert a blob type into a file type
        const decryptedFile = new File([decryptedBlob], `id_${id}_Health_Document.pdf`, {
          type: 'text/plain',
        })
  
        const fileUrl = URL.createObjectURL(decryptedFile)
  
        const a = document.createElement('a')
        a.href = URL.createObjectURL(decryptedFile)
        a.download = decryptedFile.name
  
        document.body.appendChild(a)
  
        a.click()
  
        document.body.removeChild(a)
        URL.revokeObjectURL(a.href)
      }else{
        alert("Incorrect password")
      }

      } catch (error) {
        console.log(error)
        alert('Invalid ID or no document found. Please try again.')
      }
  }

  const handleRetrieve2 = async () => {
    // const fileUrlLocal = await storageGetUrl(
    //   `patient/${id}/health_document.pdf`,
    // )
    // const fileBlob = await storageDownloadAsBlob(
    //   `patient/${id}/health_document.pdf`,
    // )
    // const decryptedBlob = await cryptoDecryptBlob(
    //   fileBlob,
    //   cryptoGenerateKey(),
    //   cryptoGenerateIv(),
    // )
    // setFileUrl(URL.createObjectURL(decryptedBlob))
  }

  return (
    <>
      <button onClick={handleRetrieve}>Retrieve</button>
      <label >ID:</label>
      <input
        onChange={(e) => setId(Number(e.target.value))}
        type='number'
        value={id}
      />
      <label >Password:</label>
      <input
        onChange={(e) => setPass(String(e.target.value))}
        type='password'
        value={pass}
      />
    </>
  )
}
