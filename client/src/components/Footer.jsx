import React from 'react';
import { Video, Github, BookOpen, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/30 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-1.5 rounded-lg">
                <Video className="w-5 h-5 text-on-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-on-surface">MeetSphere</span>
            </Link>
            <p className="text-on-surface-variant mb-6 text-sm max-w-md">
              A final year academic project showcasing a full-stack implementation of a scalable video conferencing workspace. Built with React, Node.js, WebRTC, and LiveKit.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-outline hover:text-primary transition-colors flex items-center gap-2"><Github className="w-5 h-5" /> <span className="text-sm font-medium">Source Code</span></a>
              <a href="#" className="text-outline hover:text-primary transition-colors flex items-center gap-2"><BookOpen className="w-5 h-5" /> <span className="text-sm font-medium">Documentation</span></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-on-surface mb-4">Project Links</h3>
            <ul className="space-y-3">
              <li><a href="#architecture" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Architecture</a></li>
              <li><a href="#tech-stack" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Tech Stack</a></li>
              <li><a href="#features" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Core Features</a></li>
              <li><a href="#team" className="text-on-surface-variant hover:text-primary text-sm transition-colors">Team Members</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-on-surface mb-4">Academic Information</h3>
            <ul className="space-y-3">
              <li><span className="text-on-surface-variant text-sm">Course: CS 499 - Final Project</span></li>
              <li><span className="text-on-surface-variant text-sm">Institution: University Name</span></li>
              <li><span className="text-on-surface-variant text-sm">Year: 2026</span></li>
              <li><a href="#" className="text-primary hover:text-surface-tint text-sm transition-colors flex items-center gap-1 mt-2">View Report <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-outline-variant/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-outline text-sm">
            &copy; {new Date().getFullYear()} MeetSphere Academic Project. Open Source.
          </p>
        </div>
      </div>
    </footer>
  );
}
