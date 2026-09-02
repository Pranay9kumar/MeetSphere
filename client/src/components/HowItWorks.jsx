import React from 'react';
import { CalendarPlus, Send, Users } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: "Create a meeting",
      description: "Start an instant meeting from your dashboard.",
      icon: CalendarPlus
    },
    {
      title: "Share the link",
      description: "Send the meeting link to anyone you want to join.",
      icon: Send
    },
    {
      title: "Start talking",
      description: "Join the call, share your screen, and collaborate.",
      icon: Users
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">Meet in three simple steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-outline-variant/30 z-0"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl glass-card flex items-center justify-center mb-6 border border-outline-variant/30 bg-surface">
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">{step.title}</h3>
              <p className="text-on-surface-variant max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
