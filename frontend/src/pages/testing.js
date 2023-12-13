export default function Testing() {
  const demo = async () => {
    const response = await fetch("http://localhost:5001/api/demo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        myinput: "helloyou are so right",
        myinput2: "asdfsdafasdf2",
      }),
    });
    console.log(response);
  };

  return (
    <>
      <button
        onClick={() => {
          demo();
          console.log("fetch");
        }}
      >
        nut
      </button>
    </>
  );
}
