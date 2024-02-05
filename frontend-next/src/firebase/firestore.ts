import { User } from 'firebase/auth'
import {
  FieldPath,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { firestoreDB } from './firebase'

/**
 * Checks if a user exists in the Firestore database.
 * @param userID - The ID of the user to check.
 * @returns A promise that resolves to a boolean indicating whether the user exists or not.
 * @throws An error if there was an error checking if the user exists.
 */
export const firestoreCheckUserExists = async (
  userID: string,
): Promise<boolean> => {
  try {
    // create a reference to the users collection
    const userRef = collection(firestoreDB, 'users')

    // attempt to retrieve the user document
    const docSnap = await getDoc(doc(userRef, userID))

    // return true if the user exists, false otherwise
    return docSnap.exists()
  } catch {
    console.log('Error checking if user exists')
    throw new Error('Error checking if user exists')
  }
}

/**
 * Creates a new user document in Firestore.
 *
 * @param collectionName - The name of the collection where the user document will be created.
 * @param user - The user object containing the user's information.
 * @returns A Promise that resolves when the user document is successfully created.
 * @throws An error if there is an issue creating the user document.
 */
export const firestoreCreateUser = async (
  collectionName: string,
  user: User,
): Promise<void> => {
  try {
    const userRef = doc(collection(firestoreDB, collectionName), user.uid)
    await setDoc(userRef, {
      avatarUrl: user.photoURL,
      displayName: user.displayName,
      email: user.email,
      emailNotification: true,
      userId: user.uid,
    })
  } catch (error) {
    // TODO: redirect to error page
    console.log(error)
    throw new Error('Error creating user')
  }
}

// TODO: untested
/**
 * Retrieves a document from Firestore based on the given path.
 *
 * @param path - A string representing the path to the document in Firestore.
 * @returns The data of the retrieved document, or null if the document does not exist.
 */
export const firestoreRetrieveDocument = async (path: string) => {
  const docRef = doc(firestoreDB, path)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data()
  } else {
    console.log('No such document!')
    return null // return null if the document does not exist
  }
}

/**
 * Retrieves a specific field from a document in Firestore.
 *
 * @param path - A string representing the path to the document in Firestore.
 * @param fieldName - The name of the field to retrieve.
 * @returns A Promise that resolves to the value of the field, or void if the document or field does not exist.
 */
export const firestoreRetrieveDocumentField = async (
  path: string,
  fieldName: string,
): Promise<any> => {
  const docRef = doc(firestoreDB, path)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data()[fieldName]
  } else {
    // docSnap.data() will be undefined in this case
    throw new Error('Document does not exist')
  }
}

interface DocumentDataResult {
  [key: string]: any
}

/**
 * Retrieves documents from a collection or subcollection in Firestore.
 *
 * @param path - A string representing the path to the collection or subcollection in Firestore.
 * @returns A promise that resolves to an array of DocumentDataResult objects.
 */
export const firestoreRetrieveCollectionDocuments = async (
  path: string,
): Promise<DocumentDataResult[]> => {
  // construct the reference to the collection or subcollection
  const collectionRef = collection(firestoreDB, path)

  // fetch documents from the collection or subcollection
  const querySnapshot = await getDocs(collectionRef)

  // extract data from each document
  const documentsData = querySnapshot.docs.map(
    (doc) => doc.data() as DocumentDataResult,
  )

  return documentsData
}

export const firestoreArrayAppend = async (
  docPath: string,
  fieldName: string,
  value: any,
) => {
  const docRef = doc(firestoreDB, docPath)

  try {
    await setDoc(
      docRef,
      {
        [fieldName]: arrayUnion(value),
      },
      { merge: true },
    )
  } catch (error) {
    console.error(
      `Error adding ${value} to ${fieldName} in document at ${docPath}:`,
      error,
    )
    throw new Error(
      `Error adding ${value} to ${fieldName} in document at ${docPath}`,
    )
  }
}

interface UpdateItem {
  path: string
  fieldName: string
  newValue: any
}

let updateQueue: UpdateItem[] = []

/**
 * Commits an update to the Firestore database.
 * @param path - The path to the document in the Firestore database.
 * @param fieldName - The name of the field to be updated.
 * @param newValue - The new value for the field.
 */
export const firestoreCommitUpdate = (
  path: string,
  fieldName: string,
  newValue: any,
): void => {
  console.log('Commiting update:', path, fieldName, newValue)
  updateQueue.push({ path, fieldName, newValue })
}

interface UpdateDocumentItem {
  path: string
  updateObject: any
}

let updateDocumentQueue: UpdateDocumentItem[] = []

/**
 * Commits an update to an entire document in the Firestore database.
 * @param path - The path to the document in the Firestore database.
 * @param updateObject - The object containing the new values for the document.
 */
export const firestoreCommitDocumentUpdate = (
  path: string,
  updateObject: any,
): void => {
  console.log('Commiting document update:', path, updateObject)
  updateDocumentQueue.push({ path, updateObject })
}

/**
 * Pushes updates to Firestore using a batch write operation.
 *
 * @returns A Promise that resolves when the batch update is successful.
 */
export const firestorePushUpdates = async (): Promise<void> => {
  const batch = writeBatch(firestoreDB)

  // handle field updates
  updateQueue.forEach((update) => {
    const docRef = doc(firestoreDB, update.path)
    batch.set(docRef, { [update.fieldName]: update.newValue }, { merge: true })
  })

  // handle document updates
  updateDocumentQueue.forEach((update) => {
    const docRef = doc(firestoreDB, update.path)
    batch.set(docRef, update.updateObject, { merge: true })
  })

  console.log('Pushing batch update')
  await batch.commit()
  console.log('Batch update successful')
  updateQueue = [] // clear the queue after successful batch update
  updateDocumentQueue = [] // clear the document update queue as well
}

let deleteQueue: string[] = []

/**
 * Commits a delete operation to the Firestore database.
 *
 * @param path - The path to the document to be deleted.
 */
export const firestoreCommitDelete = (path: string): void => {
  console.log('Commiting delete:', path)
  deleteQueue.push(path)
}

/**
 * Pushes batch deletes to Firestore.
 * Deletes documents specified in the delete queue.
 * @returns A Promise that resolves when the batch delete is successful.
 */
export const firestorePushDeletes = async (): Promise<void> => {
  const batch = writeBatch(firestoreDB)

  deleteQueue.forEach((path) => {
    const docRef = doc(firestoreDB, path)
    batch.delete(docRef) // schedule the delete operation
  })

  console.log('Pushing batch deletes')
  await batch.commit()
  console.log('Batch delete successful')
  deleteQueue = [] // clear the delete queue after a successful batch delete
}

interface DeleteArrayItem {
  path: string
  fieldName: string
  valueToDelete: any
}

let deleteQueueArray: DeleteArrayItem[] = []

/**
 * Commits the deletion of a value from an array in Firestore.
 *
 * @param path - The path to the document in Firestore.
 * @param fieldName - The name of the field in the array.
 * @param valueToDelete - The value to be deleted from the array.
 */
export const firestoreCommitDeleteArray = (
  path: string,
  fieldName: string,
  valueToDelete: any,
): void => {
  console.log('Committing array delete:', path, fieldName, valueToDelete)
  deleteQueueArray.push({ path, fieldName, valueToDelete })
}

/**
 * Pushes batch array deletes to Firestore.
 * Deletes specified values from an array field in multiple documents using a batch write operation.
 * @returns A Promise that resolves when the batch delete operation is successful.
 */
export const firestorePushDeleteArray = async (): Promise<void> => {
  const batch = writeBatch(firestoreDB)

  deleteQueueArray.forEach((deleteItem) => {
    const docRef = doc(firestoreDB, deleteItem.path)
    batch.update(docRef, {
      [deleteItem.fieldName]: arrayRemove(deleteItem.valueToDelete),
    })
  })

  console.log('Pushing batch array deletes')
  await batch.commit()
  console.log('Batch array delete successful')
}

/**
 * Deletes an entire collection or subcollection in Firestore.
 *
 * @param collectionPath - The path to the collection or subcollection.
 * @returns A Promise that resolves when all documents in the collection have been deleted.
 */
export const firestoreDeleteCollection = async (
  collectionPath: string,
): Promise<void> => {
  try {
    const collRef = collection(firestoreDB, collectionPath)
    const snapshot = await getDocs(collRef)
    const batch = writeBatch(firestoreDB)

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
  } catch {
    console.log('Error deleting collection')
    throw new Error('Error deleting collection')
  }
}

/**
 * Checks if a field with a specific value exists in a Firestore collection or subcollection.
 * @param path - The path to the collection or subcollection to query.
 * @param fieldName - The name of the field to check.
 * @param value - The value to search for in the field.
 * @returns A Promise that resolves to a boolean indicating whether the field with the specified value exists.
 */
export const firestoreFieldExists = async (
  path: string,
  fieldName: string,
  value: string | number | boolean,
): Promise<boolean> => {
  console.log('field: ', fieldName)
  console.log('value: ', value)

  // create a reference to the collection or subcollection
  const collectionRef = collection(firestoreDB, path)

  // create a query against the collection or subcollection
  const q = query(collectionRef, where(fieldName, '==', value))

  // get the query snapshot
  const querySnapshot = await getDocs(q)
  if (querySnapshot.empty) {
    // no matching documents/value
    return false
  } else {
    // error message, value already exists
    return true
  }
}

/**
 * Retrieves all field values from a Firestore collection.
 *
 * @param collectionName - The name of the collection.
 * @param fieldName - The name of the field whose values are to be retrieved.
 * @returns A promise that resolves to an array of field values (string, number, or boolean).
 */
export const firestoreRetrieveAllFieldValues = async (
  collectionName: string,
  fieldName: string,
): Promise<(string | number | boolean)[]> => {
  const collectionRef = collection(firestoreDB, collectionName)
  const snapshot = await getDocs(collectionRef)
  const fieldValues = snapshot.docs.map((doc) => doc.data()[fieldName])
  return fieldValues
}

/**
 * Fetches a list of shared files for a given user email.
 * @param {string} email The email of the user to fetch shared files for.
 * @param {string[]} userIds Array of user IDs to check for shared files.
 * @returns {Promise<any[]>} A promise that resolves to an array of shared file data.
 */
export const firestoreRetrieveFileListShared = async (
  email: string,
): Promise<any[]> => {
  const sharedFiles = []

  // retrieve the list of documents to check
  const userIds = await firestoreRetrieveDocumentNamesInCollection('Shared')

  try {
    for (const userId of userIds) {
      const userDocRef = doc(firestoreDB, `Shared/${userId}`)
      const userDocSnapshot = await getDoc(userDocRef)

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data()
        for (const fileName in userData) {
          const fileData = userData[fileName]
          if (
            fileData.recipients.some((recipient) => recipient.email === email)
          ) {
            sharedFiles.push({ ...fileData, fileName })
          }
        }
      }
    }

    return sharedFiles
  } catch (error) {
    console.error('Error fetching shared files:', error)
    throw new Error('Error fetching shared files')
  }
}

/**
 * Fetches a list of document names (IDs) from a specified Firestore collection.
 * @param {string} collectionPath The path of the collection.
 * @returns {Promise<string[]>} A promise that resolves to an array of document names (IDs).
 */
export const firestoreRetrieveDocumentNamesInCollection = async (
  collectionPath: string,
): Promise<string[]> => {
  const docNames = []

  try {
    const collectionRef = collection(firestoreDB, collectionPath)
    const querySnapshot = await getDocs(collectionRef)

    querySnapshot.forEach((doc) => {
      docNames.push(doc.id)
    })

    return docNames
  } catch (error) {
    console.error('Error fetching document names:', error)
    throw new Error('Error fetching document names')
  }
}

/**
 * Fetches documents from a specified subcollection in Firestore based on a field value.
 * @param {string} subcollectionPath The complete path to the subcollection.
 * @param {string} queryField The field name to query on.
 * @param {string} queryValue The value to query for.
 * @returns {Promise<any[]>} A promise that resolves to an array of document data from the subcollection.
 */
export const firestoreQueryCollection = async (
  subcollectionPath: string,
  queryField: string,
  queryValue: any,
): Promise<any[]> => {
  const subcollectionRef = collection(firestoreDB, subcollectionPath)
  const q = query(subcollectionRef, where(queryField, '==', queryValue))

  try {
    const querySnapshot = await getDocs(q)
    const documents = []
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    return documents
  } catch (error) {
    console.error('Error fetching from subcollection:', error)
    throw new Error('Error fetching from subcollection')
  }
}

/**
 * Queries a Firestore collection for documents where an array field contains a specific value.
 *
 * @param collectionPath - The path to the collection in Firestore.
 * @param arrayField - The name of the array field or a Firestore FieldPath object representing the array field.
 * @param value - The value to search for in the array field.
 * @returns A Promise that resolves to an array of documents matching the query.
 * @throws If there is an error querying the array field.
 */
export const firestoreQueryCollectionArray = async (
  collectionPath: string,
  arrayField: string | FieldPath,
  value: any,
) => {
  const collectionRef = collection(firestoreDB, collectionPath)
  const q = query(collectionRef, where(arrayField, 'array-contains', value))

  try {
    const querySnapshot = await getDocs(q)
    const documents = []
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    return documents
  } catch (error) {
    console.error('Error querying array field:', error)
    throw new Error('Error querying array field')
  }
}

/**
 * Queries Firestore collection for documents that match a specific field value.
 *
 * @param collectionPath - The path to the Firestore collection.
 * @param fieldName - The name of the field to query.
 * @param fieldValue - The value to match against the field.
 * @returns A promise that resolves to an array of documents matching the query.
 * @throws If there is an error querying the documents.
 */
export const firestoreQueryDocumentByField = async (
  collectionPath: string,
  fieldName: string,
  fieldValue: string,
): Promise<any[]> => {
  const collectionRef = collection(firestoreDB, collectionPath)
  const q = query(collectionRef, where(fieldName, '==', fieldValue))

  try {
    const querySnapshot = await getDocs(q)
    const docs = []
    querySnapshot.forEach((doc) => {
      docs.push({ id: doc.id, ...doc.data() })
    })
    return docs
  } catch (error) {
    console.error(`Error querying document by ${fieldName}:`, error)
    throw new Error(`Error querying document by ${fieldName}`)
  }
}
