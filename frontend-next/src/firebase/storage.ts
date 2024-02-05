import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  updateMetadata,
  uploadBytes,
  uploadBytesResumable,
  UploadMetadata,
  uploadString,
  UploadTask,
} from 'firebase/storage'
import { firebaseStorage } from './firebase'

type MetadataProps = {
  hash: string
  owner: string
  encryptionKey?: string
  iv: string
}

/**
 * Uploads a file to Firebase storage.
 *
 * @param filePath - The path where the file will be stored.
 * @param file - The file or blob to be uploaded.
 * @param metadata - Additional metadata properties for the file.
 * @param onProgressChange - Optional callback function to track the upload progress.
 * @returns An object containing the upload task and a promise that resolves to the download URL of the uploaded file.
 */
export const storageUpload = (
  filePath: string,
  file: File | Blob,
  metadata?: {},
  onProgressChange?: (progress: number) => void,
): { uploadTask: UploadTask; uploadPromise: Promise<string> } => {
  const fileRef = ref(firebaseStorage, filePath)

  const uploadTask = uploadBytesResumable(fileRef, file, metadata)

  const uploadPromise = new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        if (onProgressChange) {
          onProgressChange(progress)
        }
      },
      (error) => reject(error),
      () => getDownloadURL(uploadTask.snapshot.ref).then(resolve, reject),
    )
  })

  return { uploadTask, uploadPromise }
}

export const storageUploadMetadata = async (
  filePath: string,
  metadata: {},
): Promise<void> => {
  const fileRef = ref(firebaseStorage, filePath)

  try {
    await updateMetadata(fileRef, metadata)
    console.log('Metadata updated successfully:', filePath)
  } catch (error) {
    console.error('Error occurred while updating metadata:', error)
    throw new Error('Error occurred while updating metadata')
  }
}

export const storageDeletePath = async (filePath: string) => {
  try {
    // create a reference to the file
    const fileRef = ref(firebaseStorage, filePath)

    // delete the file
    await deleteObject(fileRef)
    console.log('File deleted successfully:', filePath)
  } catch (error) {
    console.error('Error occurred while deleting the file:', error)
    throw new Error('Error occurred while deleting the file')
  }
}

// basically the exact same thing as the above function
// apparently you can create a ref from a path or a url
export const storageDeleteUrl = async (fileUrl: string) => {
  try {
    // create a reference from the URL
    const fileRef = ref(firebaseStorage, fileUrl)

    // delete the file
    await deleteObject(fileRef)
    console.log('File deleted successfully from URL:', fileUrl)
  } catch (error) {
    console.error('Error occurred while deleting the file from URL:', error)
    throw new Error('Error occurred while deleting the file from URL')
  }
}

export const storageDeleteDirectory = async (directoryPath: string) => {
  try {
    // create a reference to the directory
    const directoryRef = ref(firebaseStorage, directoryPath)

    // list all files in the directory
    const files = await listAll(directoryRef)

    // delete each file in the directory
    await Promise.all(files.items.map((fileRef) => deleteObject(fileRef)))

    console.log('Directory deleted successfully:', directoryPath)
  } catch (error) {
    console.error('Error occurred while deleting the directory:', error)
    throw new Error('Error occurred while deleting the directory')
  }
}

export type FileMetadataProps = {
  name: string
  metadata: {}
  lastModified: string
  fileSize: string
  fullPath: string
  downloadUrl: string
}

// function to get all the files in a directory
export const storageGetFileList = async (
  directoryPath: string,
): Promise<FileMetadataProps[]> => {
  const fileMetadataList: FileMetadataProps[] = []
  const directoryRef = ref(firebaseStorage, directoryPath)

  try {
    const res = await listAll(directoryRef)

    for (const itemRef of res.items) {
      const downloadUrl = await getDownloadURL(itemRef)
      const metadata = await getMetadata(itemRef)

      fileMetadataList.push({
        name: metadata.name,
        metadata: metadata.customMetadata,
        lastModified: metadata.updated,
        fileSize: metadata.size.toString(),
        fullPath: itemRef.fullPath,
        downloadUrl: downloadUrl,
      })
    }

    return fileMetadataList
  } catch (error) {
    console.error('Error retrieving files: ', error)
    throw new Error('Error retrieving files')
  }
}

// function to get the info of a specific file
export const storageGetFileInfo = async (
  filePath: string,
): Promise<FileMetadataProps> => {
  const fileRef = ref(firebaseStorage, filePath)

  try {
    const downloadUrl = await getDownloadURL(fileRef)
    const metadata = await getMetadata(fileRef)

    const fileMetadata: FileMetadataProps = {
      name: metadata.name,
      metadata: metadata.customMetadata as FileMetadataProps['metadata'],
      lastModified: metadata.updated,
      fileSize: metadata.size.toString(),
      fullPath: fileRef.fullPath,
      downloadUrl: downloadUrl,
    }

    return fileMetadata
  } catch (error) {
    console.error('Error retrieving file: ', error)
    throw new Error('Error retrieving file')
  }
}

// DEPRECATED
// create a new directory with a placeholder inside
// a placeholder is needed because firebase storage cannot have empty directories
export const storageCreateDirectory = async (
  directoryPath: string,
): Promise<void> => {
  // ensure the directory path ends with a slash
  if (!directoryPath.endsWith('/')) {
    directoryPath += '/'
  }

  // pls click this link
  const placeholderContent = 'https://www.youtube.com/watch?v=xvFZjo5PgG0'
  const placeholderRef = ref(firebaseStorage, `${directoryPath}.placeholder`)

  try {
    await uploadString(placeholderRef, placeholderContent)
    console.log(`Directory created at ${directoryPath}`)
  } catch (error) {
    console.error('Error creating directory: ', error)
    throw new Error('Error creating directory')
  }
}

// TODO: certain file types like pdf and images will be opened in the browser instead of downloaded
// FUCKING
export const storageDownload = async (filename: string) => {
  const fileRef = ref(firebaseStorage, filename)

  try {
    const downloadUrl = await getDownloadURL(fileRef)
    // create a temp hidden anchor element
    const a = document.createElement('a')
    // set the download link to the href
    a.href = downloadUrl
    // set download attribute
    // this is needed to tell the browser to download the file instead of opening it (this doesnt work)
    a.download = filename.split('/').pop() || 'download'
    // set _blank target to open in new tab
    a.target = '_blank'
    // actually add the anchor element to the dom
    document.body.appendChild(a)
    // simulate a click on the anchor element
    a.click()
    // remove the anchor element
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error downloading file: ', error)
    throw new Error('Error downloading file')
  }
}

export const storageDownloadAsBlob = async (
  filePath: string,
): Promise<Blob> => {
  const fileRef = ref(firebaseStorage, filePath)

  try {
    const downloadUrl = await getDownloadURL(fileRef)
    const response = await fetch(downloadUrl)

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const blob = await response.blob()
    return blob
  } catch (error) {
    console.error('Error downloading file: ', error)
    throw new Error('Error downloading file')
  }
}

// function to return url of file from path
export const storageGetUrl = async (filePath: string): Promise<string> => {
  const fileRef = ref(firebaseStorage, filePath)

  try {
    const downloadUrl = await getDownloadURL(fileRef)
    return downloadUrl
  } catch (error) {
    console.error('Error getting download URL: ', error)
    throw new Error('Error getting download URL')
  }
}

// function to move file
// basically copies to new location then deletes old file
export const storageMoveFile = async (srcPath: string, destPath: string) => {
  const srcRef = ref(firebaseStorage, srcPath)
  const destRef = ref(firebaseStorage, destPath)

  try {
    // get the download URL of the source file
    const srcUrl = await getDownloadURL(srcRef)

    // fetch the file as a Blob
    console.log('Fetching file')
    const response = await fetch(srcUrl)
    const data = await response.blob()

    // get the metadata of the source file
    const metadata = await getMetadata(srcRef)

    // upload the file to the new location
    console.log('Uploading file')
    await uploadBytes(destRef, data)

    // set the metadata on the destination file
    await updateMetadata(destRef, metadata)

    // delete the original file
    await deleteObject(srcRef)
  } catch (error) {
    console.error('Error moving file:', error)
    throw new Error('Error moving file')
  }
}

// function to calculate the size of a directory
export const storageGetDirectorySize = async (
  directoryPath: string,
): Promise<number> => {
  const directoryRef = ref(firebaseStorage, directoryPath)

  try {
    // list all files in the directory
    const res = await listAll(directoryRef)

    // get the metadata for each file
    const metadataPromises = res.items.map((item) => getMetadata(item))

    // wait for all metadata to be fetched
    const metadataList = await Promise.all(metadataPromises)

    // sum up the sizes
    const totalSize = metadataList.reduce(
      (total, metadata) => total + metadata.size,
      0,
    )

    return totalSize
  } catch (error) {
    console.error('Error getting directory size: ', error)
    throw new Error('Error getting directory size')
  }
}
