import express, { json } from 'express'
import cors from 'cors'
import {
  patientDb,
  patient_Acc_Creation,
  getDocumentRef,
} from './src/firebase/firestore.js'
import dotenv from 'dotenv'
import { serverTimestamp, updateDoc } from 'firebase/firestore'
import { upload } from './src/multer/multer.js'

dotenv.config()
const app = express()
const PORT = 3001

app.use(json())
app.use(cors())

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})

// app.get('/api/home', async (req, res) => {
// var md = forge.md.sha256.create();
// md.update('testtest');
// res.send(md.digest().toHex());
// res.send('bruh')
// })

// app.post('/api/demo', async (req, res) => {
//   const data = req.body

//   const plainText = data.myinput

//   console.log(plainText)
//   var md = forge.sha256.create()
//   md.update(plainText)
//   res.send(md.digest().toHex())
// })

//ORRR encrypt with RSA and save the encrypted into firestore
app.get('/api/testing', async (req, res) => {
  const hash_salt = hashing('yes')
  res.send(hash_salt[0] + ' ' + hash_salt[1])
})

app.post('/api/document_sub', upload.single('file'), async (req, res) => {
  const data = req.body
  const doc = req.file
  const sdk = require('api')('@virustotal/v3.0#40nj53llc655dro');

  sdk.postFiles({
    file: doc
  }, {'x-apikey': '55eb7e6ec97035ab8de9968fc55050b55d42941c99f998e56513d7d646a13f95'})
    .then(({ data }) => console.log(data))
    .catch(err => console.error(err));
    res.send('ok')
  })



// new api for document submission
app.post('/api/document_sub2', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded')
  }

  const userId = req.body.id

  // i just console log the file to show
  console.log(userId, req.file)

  res.send('ok')
})

app.get('/api/2', async (req, res) => {
  const document = getDocuments_patients('111')
  const health_doc = document.health_document
  console.log(health_doc)
  const pray = await decrpytion_AES(health_doc)
  console.log(pray)

  res.send(pray)
})
