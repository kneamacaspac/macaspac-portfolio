// src/App.jsx
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SplashScreen from './components/splash/SplashScreen.jsx'
import Navbar from './components/navigation/Navbar'
import HUD from './components/ui/HUD.jsx'

import Projects from './pages/Projects.jsx'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <BrowserRouter>
        <HUD/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}