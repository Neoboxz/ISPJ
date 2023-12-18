const express = require('express')
const cors = require('cors')
const path = require('path')
var forge = require('node-forge');


const app = express()
const PORT = 5001

app.use(express.json())
app.use(cors())

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})


app.get("/api/home", async (req, res) => {
  // var md = forge.md.sha256.create();
  // md.update('testtest');
  // res.send(md.digest().toHex());
  res.send('bruh');
})

app.get("/api/testing", async (req, res) => {
  res.send('bruh');
})

app.post("/api/demo", async (req, res) => {
  const data = req.body

  const plainText = data.myinput
 

  console.log(plainText)
  var md = forge.md.sha256.create();
  md.update(plainText);
  res.send(md.digest().toHex());  
})

app.post("/api/document_sub", async (req, res) => {
  const data = req.body

  const doc = data.input
 

  console.log(doc)
  var md = forge.md.sha256.create();
  md.update(doc);
  console.log(md.digest().toHex())
  res.send(md.digest().toHex());  
})