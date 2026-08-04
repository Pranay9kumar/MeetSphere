import React from 'react';
import { Video, Github, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/30 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-1.5 rounded-lg">
                <Video className="w-5 h-5 text-on-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-on-surface">MeetSphere</span>
            </Link>
            <p className="text-on-surface-variant mb-6 text-sm">
              Enterprise video collaboration for modern, high-performance teams. Build together, seamlessly.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-outline hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-outline hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-outline hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-on-surface mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Features</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Integrations</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-on-surface mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-on-surface mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-outline-variant/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-outline text-sm">
            &copy; {new Date().getFullYear()} MeetSphere, Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-sm text-outline">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
