import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Customize from './pages/Customize'
import Assistant from './pages/Assistant'


function App() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to="/signup" replace />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/signin' element={<Signin />} />
      <Route path='/customize' element={<Customize />} />
      <Route path='/assistant' element={<Assistant />} />
    </Routes>
  )
}

export default App
