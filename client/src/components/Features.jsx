import React from 'react';
import { MonitorPlay, Radio, MessagesSquare, FileText, Lock, Moon, Bot, Video } from 'lucide-react';

const features = [
  { name: 'HD Video Meetings', description: 'Crystal clear 1080p video with noise cancellation and auto-framing.', icon: Video },
  { name: 'Screen Sharing', description: 'Share your entire screen or specific application windows instantly.', icon: MonitorPlay },
  { name: 'Meeting Recording', description: 'Securely record sessions and save them to the cloud automatically.', icon: Radio },
  { name: 'Live Chat', description: 'Integrated rich-text messaging with file sharing and reactions.', icon: MessagesSquare },
  { name: 'AI Meeting Notes', description: 'Automated transcriptions and smart summaries of your meetings.', icon: Bot },
  { name: 'Channels', description: 'Organize teams and projects with dedicated collaboration spaces.', icon: FileText },
  { name: 'Secure Authentication', description: 'Enterprise-grade security with SSO and end-to-end encryption.', icon: Lock },
  { name: 'Dark Mode', description: 'Beautifully designed themes that reduce eye strain during late sessions.', icon: Moon },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">Capabilities</h2>
          <p className="text-3xl md:text-4xl font-extrabold text-on-surface">
            Everything you need for seamless teamwork
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-on-surface-variant">
            MeetSphere provides a comprehensive suite of tools designed to elevate your collaborative experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="glass-card rounded-2xl p-6 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-surface-container-high w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">{feature.name}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
