import express, { Express, Request, Response } from 'express'
import { firestoreCommitUpdate, firestorePushUpdate, firestoreRetrieveCollection } from './src/firebase/firestore'
import { randomUUID } from 'crypto'
import cors from 'cors'
import { serverTimestamp } from 'firebase/firestore'

const app = express()
const PORT = 5001

app.use(express.json())
app.use(cors())

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})



app.post('/api/tytyuyu ', (req, res ) => {

  res.send({ status: 'success', received: data })
})

app.get('/api/retrieve', async (req, res) => {

  res.send({ status: 'success', data: documentList })
})