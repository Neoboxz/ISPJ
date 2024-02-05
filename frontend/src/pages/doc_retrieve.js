import { firestoreRetrieveDocumentField } from '@/firebase/firestore'
import { useEffect } from 'react'

export default function doc_retrive() {
  const asdf = async () => {
    const health_document = await firestoreRetrieveDocumentField(
      'patient/111',
      'health_document',
    )
    console.log(health_document)
  }

  useEffect(() => {
    asdf()
  })

  return (
    <>
      testing
      <button onClick={() => {}}>asdf</button>
    </>
  )
}
