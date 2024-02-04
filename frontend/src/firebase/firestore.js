export const firestoreRetrieveDocumentField = async (path, fieldName) => {
  const docRef = doc(firestoreDB, path)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data()[fieldName]
  } else {
    // docSnap.data() will be undefined in this case
    throw new Error('Document does not exist')
  }
}
