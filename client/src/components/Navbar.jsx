import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Video } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ theme, toggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 glass-card border-b border-white/10 dark:border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Video className="w-5 h-5 text-on-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-on-surface">MeetSphere</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Home</Link>
            <a href="#features" className="text-on-surface-variant hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-on-surface-variant hover:text-primary transition-colors">Pricing</a>
            <a href="#about" className="text-on-surface-variant hover:text-primary transition-colors">About</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <Link to="/login" className="text-on-surface hover:text-primary transition-colors font-medium">Log in</Link>
            <Link to="/signup" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-surface-tint transition-all shadow-glow hover:shadow-lg transform hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button onClick={() => setIsOpen(!isOpen)} className="text-on-surface hover:text-primary transition-colors p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-card border-t border-white/10 dark:border-white/5 animate-in slide-in-from-top-2">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <Link to="/" className="block text-on-surface-variant hover:text-primary transition-colors px-2 py-1" onClick={() => setIsOpen(false)}>Home</Link>
            <a href="#features" className="block text-on-surface-variant hover:text-primary transition-colors px-2 py-1" onClick={() => setIsOpen(false)}>Features</a>
            <a href="#pricing" className="block text-on-surface-variant hover:text-primary transition-colors px-2 py-1" onClick={() => setIsOpen(false)}>Pricing</a>
            <a href="#about" className="block text-on-surface-variant hover:text-primary transition-colors px-2 py-1" onClick={() => setIsOpen(false)}>About</a>
            <div className="pt-4 flex flex-col gap-3">
              <Link to="/login" className="block text-center text-on-surface hover:text-primary transition-colors font-medium py-2 border border-outline-variant rounded-lg" onClick={() => setIsOpen(false)}>Log in</Link>
              <Link to="/signup" className="block text-center bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-surface-tint transition-colors shadow-glow" onClick={() => setIsOpen(false)}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
