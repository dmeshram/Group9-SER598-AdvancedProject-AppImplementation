import { useState } from 'react'
import { Route, Routes, Link } from 'react-router-dom'
import Navigation from './components/Navigation.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import reactLogo from './assets/react.svg'
import './App.css'
import ProfileSettings from './pages/ProfileSettings.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import AchievementsPage from './pages/AchievementPage.jsx'

function App() {

  return (
    <>
      <Navigation />
      <div className='content-container'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Routes>
      </div>
    </>
  )
}

export default App
