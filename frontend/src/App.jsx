import { useState } from 'react'
import { Route, Routes, Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import './App.css'
import ProfileSettings from './pages/ProfileSettings.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">GreenLoop</div>

        <nav className="app-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<h1>Hello World!</h1>} />
          <Route path="/about" element={<h1>About Page</h1>} />
          <Route path="/profile" element={<ProfileSettings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
