import React from 'react';
import { Video } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center gap-2 mb-2">
              <div className="bg-primary p-1 rounded-md">
                <Video className="w-5 h-5 text-on-primary" />
              </div>
              <span className="font-bold text-lg text-on-surface">MeetSphere</span>
            </Link>
            <p className="text-on-surface-variant text-sm text-center md:text-left">
              Simple video meetings and collaboration.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Home</Link>
            <a href="#features" className="text-on-surface-variant hover:text-primary transition-colors">Features</a>
            <Link to="/login" className="text-on-surface-variant hover:text-primary transition-colors">Log In</Link>
            <Link to="/signup" className="text-on-surface-variant hover:text-primary transition-colors">Sign Up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
