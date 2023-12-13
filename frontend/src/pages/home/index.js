export default function Home() {
  const asdf = async () => {
      console.log('fetching api')
      const yes = await fetch('http://localhost:5001/api/testing', {
      method: 'GET'
    })
    console.log(yes)
  }

  return (
    <>
    <button
    onClick={() => {
      asdf()
    }}
    >
      asdf
    </button>
    </>
  )
}