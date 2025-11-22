import { useState } from 'react'
import { Route, Routes, Link } from 'react-router-dom'
import Navigation from './components/Navigation.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import reactLogo from './assets/react.svg'
import './App.css'
import ProfileSettings from './pages/ProfileSettings.jsx'
import Leaderboard from './pages/Leaderboard.jsx'

function App() { 

  return (
    <>
      <Navigation />
      <div className='content-container'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
           <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
     </>
  )
}

export default App
