import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const [theme, setTheme] = useState('dark');

  // Synchronize dark/light theme class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans transition-colors duration-300">
      <Routes>
        <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/login" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/signup" element={<Signup theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
