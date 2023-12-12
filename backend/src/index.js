import express, { Express, Request, Response } from 'express'
import { firestoreCommitUpdate, firestorePushUpdate, firestoreRetrieveCollection } from './src/firebase/firestore'
import { randomUUID } from 'crypto'
import cors from 'cors'
import { serverTimestamp } from 'firebase/firestore'

const app = express()
const PORT = 5000

app.use(express.json())
app.use(cors())

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})


app.get('/api/home', async (req, res) => {

  res.json({ message: chingchong })
})