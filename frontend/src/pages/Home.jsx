import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/hello`)
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching from backend:", error);
      });
  }, []);
   
  return (<h1>Welcome to GreenLoop!</h1>);

}