import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { IncidentProvider } from './contexts/IncidentContext';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/Citizen/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <IncidentProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/citizen/*" element={<CitizenDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
          </Router>
        </IncidentProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
