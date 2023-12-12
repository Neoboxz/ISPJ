import { data } from "autoprefixer"
import React, { useEffect , useState } from "react"


export default async function home(){
    const [message , setMessage] = useState("loading")
    useEffect(()=>{
        fetch("http://localhost:5000/api/home").then(
            response => response.json
        ).then(
            data => {
                console.log(data)
                setMessage(data.message)
            }
        )
    }, [] )
    return(
        <div></div>
    )
}