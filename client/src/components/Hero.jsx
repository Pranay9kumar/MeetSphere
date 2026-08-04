import React from 'react';
import { Play, ArrowRight, Users, Briefcase, Zap, Video } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-secondary/20 rounded-full mix-blend-screen filter blur-[120px] animation-delay-2000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-8">
          Collaborate. Meet. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Create Together.
          </span>
        </h1>
        
        <p className="mt-4 max-w-2xl text-xl text-on-surface-variant mx-auto mb-10">
          The all-in-one enterprise video workspace for high-performance teams.
          Experience crystal-clear audio, seamless screen sharing, and integrated workflows.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
          <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-on-primary font-semibold text-lg flex items-center justify-center gap-2 hover:bg-surface-tint hover:scale-105 transition-all shadow-glow">
            Start Meeting <ArrowRight className="w-5 h-5" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-on-surface font-semibold text-lg flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all">
            <Play className="w-5 h-5" /> Watch Demo
          </button>
        </div>

        {/* Hero Illustration Placeholder */}
        <div className="relative mx-auto max-w-5xl rounded-2xl glass-card p-2 md:p-4 shadow-2xl mb-24 transform hover:scale-[1.02] transition-transform duration-500">
          <div className="aspect-video bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <div className="flex flex-col items-center justify-center opacity-50">
              <Video className="w-16 h-16 mb-4 text-primary" />
              <p className="text-lg font-medium text-on-surface">Interactive Meeting UI Placeholder</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className="bg-primary/20 p-3 rounded-xl mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">50K+</h3>
            <p className="text-on-surface-variant">Active Users</p>
          </div>
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className="bg-secondary/20 p-3 rounded-xl mb-4">
              <Briefcase className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">10K+</h3>
            <p className="text-on-surface-variant">Teams globally</p>
          </div>
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className="bg-tertiary/20 p-3 rounded-xl mb-4">
              <Zap className="w-8 h-8 text-tertiary" />
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">99.99%</h3>
            <p className="text-on-surface-variant">Uptime SLA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
