import React, { useState } from 'react';


export default function SubmitDocument() {
  const [file, setFile] = useState(null);
  const [id, setId] = useState(0);


  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
 

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(file)
    const formData = new FormData();
    formData.append('file', file);

    // API endpoint URL
    const response = await fetch("http://localhost:5001/api/document_sub", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
    body: JSON.stringify({
        input : formData,
        id : id.toString()
        }),
    });



    if (response.ok) {
      // Show success message
      alert('Document submitted successfully!');
    } else {
      // Handle error
      alert('Error submitting document: ' + data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="file">Select Document:</label>
      <input type="file" id="file" name="file" required onChange={handleFileChange} />
      <input type="text" id="id" name="id" required onChange={(e)=>setId(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}