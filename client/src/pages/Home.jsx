import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import { CheckCircle2 } from 'lucide-react';

export default function Home({ theme, toggleTheme }) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <Features />
      
      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">Simple, transparent pricing</h2>
            <p className="mt-4 text-xl text-on-surface-variant">Scale your team's collaboration without the guesswork.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="glass-card rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-on-surface mb-2">Starter</h3>
              <p className="text-on-surface-variant mb-6">Perfect for small teams getting started.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-on-surface">$0</span>
                <span className="text-on-surface-variant">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 10 users', 'Basic video meetings (720p)', 'Standard chat', 'Community support'].map((item, i) => (
                  <li key={i} className="flex items-center text-on-surface">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-lg border border-outline text-on-surface font-semibold hover:bg-surface-container transition-colors">
                Get Started
              </button>
            </div>
            
            {/* Pro */}
            <div className="glass-card rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-glow border-primary/50">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">Pro</h3>
              <p className="text-on-surface-variant mb-6">For growing companies needing more power.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-on-surface">$12</span>
                <span className="text-on-surface-variant">/user/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 100 users', 'HD video meetings (1080p)', 'Meeting recording', 'Priority support', 'Basic integrations'].map((item, i) => (
                  <li key={i} className="flex items-center text-on-surface">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-lg bg-primary text-on-primary font-semibold hover:bg-surface-tint transition-colors shadow-glow">
                Start Free Trial
              </button>
            </div>
            
            {/* Enterprise */}
            <div className="glass-card rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-on-surface mb-2">Enterprise</h3>
              <p className="text-on-surface-variant mb-6">Advanced security and control for large orgs.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-on-surface">Custom</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited users', '4K video support', 'SSO & Advanced Security', 'Dedicated success manager', 'Custom AI features'].map((item, i) => (
                  <li key={i} className="flex items-center text-on-surface">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-lg border border-outline text-on-surface font-semibold hover:bg-surface-container transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-on-surface mb-6">Ready to transform how your team works?</h2>
          <p className="text-xl text-on-surface-variant mb-10">Join thousands of companies already using MeetSphere.</p>
          <button className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-tint transition-colors shadow-glow">
            Start Collaborating Today
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
