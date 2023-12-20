import express, { json } from 'express'
import cors from 'cors'
import path from 'path'
import forge from 'node-forge'
import { patientDb , patient_Acc_Creation , getDocumentRef} from './src/firebase/firestore.js'
import { hashing , encryption_AES , decrpytion_AES} from "./tools.js"
import dotenv from "dotenv"
import { serverTimestamp, updateDoc } from 'firebase/firestore'



dotenv.config()
const privateKey = process.env.privateKey
const publicKey = process.env.publicKey
const app = express()
const PORT = 5001

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
    const hash_salt = hashing("yes")
    res.send(hash_salt[0] +" "+ hash_salt[1])
  })

app.post('/api/document_sub', async (req, res) => {
  const data = req.body
  const doc = data.input
  var userId = data.id
  console.log(userId , doc)
  const encrypted = await encryption_AES(doc)
  const ref = await getDocumentRef("patient" , "111")
  await updateDoc(ref,{
    "health_document.document" : encrypted,
    lastupdate_time : serverTimestamp()
    
  })
  
  
  
  res.send("ok")
})

app.get('/api/2', async (req, res) => {
  const pray = await decrpytion_AES("U2FsdGVkX1/vFUO4zGtJHFbfUiQu/JwdpUa2IlhHJuE=")
  console.log(pray)
  
  res.send(pray)
})