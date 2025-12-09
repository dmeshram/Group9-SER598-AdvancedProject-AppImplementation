import { useState, useEffect } from 'react'
import { Route, Routes, Link } from 'react-router-dom'
import Navigation from './components/Navigation.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import reactLogo from './assets/react.svg'
import './App.css'
import ProfileSettings from './pages/ProfileSettings.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import History from "./pages/history.jsx";
import Forest from './pages/Forest.jsx'
import AchievementsPage from './pages/AchievementPage.jsx'
import Landing from './pages/Landing.jsx'

function App() {

  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <>
      <Navigation />
      <div className='content-container'>
        {!online && (
          <div className="offline-banner">
            You’re offline — showing cached data.
          </div>
        )}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/landing' element={<Landing />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/forest" element={<Forest />} />
        </Routes>
      </div>
    </>
  )
}

export default App
