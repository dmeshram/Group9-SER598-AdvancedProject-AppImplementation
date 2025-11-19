import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/' element={<h1>Hello World!</h1>} />
      <Route path='/about' element={<h1>About Page</h1>} />
    </Routes>
  )
}

export default App
