import React from 'react';
import { Video, MonitorUp, MessageSquare, Link as LinkIcon, Users, Moon } from 'lucide-react';

const features = [
  {
    name: 'Video Meetings',
    description: 'High-quality, reliable video and audio for all participants.',
    icon: Video,
  },
  {
    name: 'Screen Sharing',
    description: 'Present your screen or a specific window to the entire room instantly.',
    icon: MonitorUp,
  },
  {
    name: 'In-meeting Chat',
    description: 'Send text messages to everyone without interrupting the speaker.',
    icon: MessageSquare,
  },
  {
    name: 'Team Channels',
    description: 'Organize your conversations and team meetings by dedicated topics.',
    icon: Users,
  },
  {
    name: 'Meeting Links',
    description: 'Secure, shareable URLs so anyone can join with a single click.',
    icon: LinkIcon,
  },
  {
    name: 'Dark Mode',
    description: 'A beautifully crafted dark theme that is easy on the eyes.',
    icon: Moon,
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
            Everything you need for better meetings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="p-6 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-colors bg-surface-container-lowest">
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">{feature.name}</h3>
              <p className="text-on-surface-variant leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
