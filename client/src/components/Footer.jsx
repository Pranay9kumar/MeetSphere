import React from 'react';
import { Video } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/30 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-1.5 rounded-lg">
                <Video className="w-5 h-5 text-on-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-on-surface">MeetSphere</span>
            </Link>
            <p className="text-on-surface-variant text-sm">
              Enterprise video collaboration workspace for modern teams.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-on-surface mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Home</Link></li>
              <li><a href="#features" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Features</a></li>
              <li><a href="#contact" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-on-surface mb-4">Account</h3>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Log In</Link></li>
              <li><Link to="/signup" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Sign Up</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-outline-variant/30 pt-8 text-center">
          <p className="text-outline text-sm">
            &copy; {new Date().getFullYear()} MeetSphere. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
