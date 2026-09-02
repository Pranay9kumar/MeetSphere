import React from 'react';
import { Video, Plus, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-secondary/20 rounded-full mix-blend-screen filter blur-[120px] animation-delay-2000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-8">
          One platform to <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            connect everyone.
          </span>
        </h1>
        
        <p className="mt-4 max-w-2xl text-xl text-on-surface-variant mx-auto mb-10">
          MeetSphere brings your team together with crystal-clear video, seamless screen sharing, and effortless collaboration. Secure, fast, and simple.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-24">
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-on-primary font-semibold text-lg flex items-center justify-center gap-2 hover:bg-surface-tint hover:scale-105 transition-all shadow-glow">
            <Plus className="w-5 h-5" /> New Meeting
          </Link>
          <div className="relative w-full sm:w-auto flex items-center group">
            <input 
              type="text" 
              placeholder="Enter meeting code..." 
              className="w-full sm:w-64 px-6 py-4 rounded-xl glass-card border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <button className="absolute right-2 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:text-primary hover:bg-surface-container-highest transition-colors font-medium">
              Join
            </button>
          </div>
        </div>

        {/* Hero Illustration Placeholder */}
        <div className="relative mx-auto max-w-5xl rounded-2xl glass-card p-2 md:p-4 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
          <div className="aspect-video bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <div className="flex flex-col items-center justify-center opacity-50">
              <Video className="w-16 h-16 mb-4 text-primary" />
              <p className="text-lg font-medium text-on-surface">Meeting Preview Screen Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
