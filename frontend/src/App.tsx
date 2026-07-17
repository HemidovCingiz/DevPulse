import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import DashBoard from './components/DashBoard'

export default function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  )
}