import React from 'react';
import { ShieldCheck, Zap, Globe2 } from 'lucide-react';

export default function WhyMeetSphere() {
  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6">Designed for modern teams</h2>
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
              We built MeetSphere to solve the frustrations of everyday video conferencing. 
              No more dropped calls, confusing interfaces, or compromised security. Just reliable, crystal-clear communication.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-lg">Lightning Fast</h4>
                  <p className="text-on-surface-variant mt-1">Join meetings instantly without downloading heavy desktop applications. Our optimized platform runs seamlessly in your browser.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="mt-1">
                  <ShieldCheck className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-lg">Secure by Default</h4>
                  <p className="text-on-surface-variant mt-1">All communications are encrypted in transit. Control who joins with waiting rooms and meeting passwords.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1">
                  <Globe2 className="w-6 h-6 text-tertiary" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-lg">Works Anywhere</h4>
                  <p className="text-on-surface-variant mt-1">Whether you are on a high-end desktop or a mobile device on a slow network, MeetSphere adapts to give you the best possible experience.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-surface-container-low rounded-2xl border border-outline-variant/30 flex items-center justify-center overflow-hidden relative shadow-2xl glass-card">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
              <div className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-4">Enterprise Grade Security</h3>
                <p className="text-on-surface-variant">Your data and conversations belong to you. We never sell your data or use it for advertising.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
