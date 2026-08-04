import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import TechStack from '../components/TechStack';
import ProjectOverview from '../components/ProjectOverview';
import Team from '../components/Team';
import Footer from '../components/Footer';

export default function Home({ theme, toggleTheme }) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <ProjectOverview />
      <TechStack />
      <Features />
      <Team />
      <Footer />
    </div>
  );
}
