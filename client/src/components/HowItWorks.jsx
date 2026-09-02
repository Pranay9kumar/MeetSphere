import React from 'react';
import { CalendarPlus, Send, Users } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: "Create a Meeting",
      description: "Start an instant meeting or schedule one for later with just a single click.",
      icon: CalendarPlus
    },
    {
      title: "Share the Link",
      description: "Send the secure invite link to anyone. No account required for guests to join.",
      icon: Send
    },
    {
      title: "Collaborate",
      description: "Join the call, share your screen, and work together in real-time.",
      icon: Users
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full mix-blend-screen filter blur-[100px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">How it works</h2>
          <p className="mt-4 text-xl text-on-surface-variant">Three simple steps to start collaborating.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-outline-variant/30 z-0"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl glass-card flex items-center justify-center mb-6 shadow-glow border-primary/20 bg-surface">
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">{step.title}</h3>
              <p className="text-on-surface-variant max-w-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
