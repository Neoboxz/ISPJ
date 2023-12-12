import React,{useEffect , useState} from 'react'

response = await fetch("http://localhost:5001/api/home")
async function index() {

  



  return (
    <div>{response}</div>
  )
}

export default index