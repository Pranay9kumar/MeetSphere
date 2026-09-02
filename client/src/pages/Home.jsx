import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Footer from '../components/Footer';

export default function Home({ theme, toggleTheme }) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <HowItWorks />
      <Features />
      <Footer />
    </div>
  );
}
