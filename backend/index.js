const express = require("express")
const app = express()
const PORT = 5001 ; 5000
const cors = require("cors")
var forge = require('node-forge');

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})


app.get("/api/home", (req, res) => {
  var md = forge.md.sha256.create();
  md.update('The quick brown fox jumps over the lazy dog');
  res.send(md.digest().toHex());
})