import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import WhyMeetSphere from '../components/WhyMeetSphere';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home({ theme, toggleTheme }) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <HowItWorks />
      <WhyMeetSphere />
      <Features />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
