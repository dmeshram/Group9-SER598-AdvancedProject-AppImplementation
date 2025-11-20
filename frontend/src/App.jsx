import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() { 

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/Login' element={<Login />} />
    </Routes>
  )
}

export default App
