import { useState } from 'react'
import {
  cryptoBase64ToBlob,
  cryptoDecryptBlob,
  cryptoGenerateIv,
  cryptoGenerateKey,
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

  const handleRetrieve = async () => {
    try {
      const healthDocumentBase64 = await firestoreRetrieveDocumentField(
        `patient/${id}`,
        'health_document',
      )
      firestoreCommitUpdate(`patient/${id}`, 'last_Accessed', serverTimestamp() )
      await firestorePushUpdates()
      const encryptedBlob = await cryptoBase64ToBlob(healthDocumentBase64)

      const decryptedBlob = await cryptoDecryptBlob(
        encryptedBlob,
        cryptoGenerateKey(),
        cryptoGenerateIv(),
      )

      // convert a blob type into a file type
      const decryptedFile = new File([decryptedBlob], 'something.pdf', {
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
      <button onClick={handleRetrieve}>asdf</button>
      <input
        onChange={(e) => setId(Number(e.target.value))}
        type='number'
        value={id}
      />
    </>
  )
}
