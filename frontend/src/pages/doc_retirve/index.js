import { useEffect } from "react"


export default function doc_retrive() {
    useEffect(()=>{
        asdf()
    })

    const asdf = async () => {
        console.log('fetching api')
        const yes = await fetch('http://localhost:5001/api/2', {
        method: 'GET'
      })
      console.log(yes)
    }
  
    return (
      <>
      {yes}
      <button
      onClick={() => {
        
      }}
      >
        
      </button>
      </>
      
    )
  }