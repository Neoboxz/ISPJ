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

    async function scanFile(file) {
      // Upload endpoint
      const filesUrl = "https://www.virustotal.com/api/v3/files";
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
  
      // Create request headers
      const filesHeaders = {
          "x-apikey": "55eb7e6ec97035ab8de9968fc55050b55d42941c99f998e56513d7d646a13f95"
      };
  
      // Upload the file
      const filesResponse = await fetch(filesUrl, {
          method: 'POST',
          body: formData,
          headers: filesHeaders
      });
  
      if (filesResponse.status === 200) {
          const filesResponseData = await filesResponse.json();
          const analysisId = filesResponseData.data.id;
  
          // Analysis endpoint with file id
          const analysisUrl = `https://www.virustotal.com/api/v3/analyses/${analysisId}`;
          
          // Request headers for analysis
          const analysisHeaders = {
              "x-apikey": "55eb7e6ec97035ab8de9968fc55050b55d42941c99f998e56513d7d646a13f95"
          };
  
          let attempts = 1;
  
          // Retry getting analysis response
          while (attempts < 120) {
              const analysisResponse = await fetch(analysisUrl, { headers: analysisHeaders });
              const analysisData = await analysisResponse.json();
              const status = analysisData.data.attributes.status;
  
              if (analysisResponse.status === 200 && ['queued', 'in-progress'].includes(status)) {
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Sleep for 1 second
                  attempts++;
              } else {
                  break;
              }
  
              if (attempts >= 30) {
                  return ['File timed out.', 'Timeout'];
              }
          }
  
          // Get analysis response
          const analysisResponse = await fetch(analysisUrl, { headers: analysisHeaders });
          const analysisResponseData = await analysisResponse.json();
          const amogusus = analysisResponseData.data.attributes.stats.suspicious;
          const malicious = analysisResponseData.data.attributes.stats.malicious;
  
          // Check for suspicious or malicious content
          if (amogusus > 0 || malicious > 0) {
              return "False";
          } else {
              return ["The file is safe. No antivirus engines detected any threats.", 'Safe'];
          }
      } else {
          return ['UploadError', 'Error'];
      }
  }

    
    const scanFileResult = await scanFile(file)
    console.log(scanFileResult)
    if (scanFileResult == "False"){
      alert("The file is potentially unsafe.")
      return
    }else{
      alert ("The file is safe. No antivirus engines detected any threats.")
    }
    
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
