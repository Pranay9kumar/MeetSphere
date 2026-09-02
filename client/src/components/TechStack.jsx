import React from 'react';
import { Layers, Database, Server, Cpu, Globe, Zap } from 'lucide-react';

const technologies = [
  { name: 'React (Vite)', description: 'Frontend SPA framework for responsive UI.', icon: Globe, color: 'text-blue-400' },
  { name: 'Node.js & Express', description: 'REST API and WebSocket upgrade handling.', icon: Server, color: 'text-green-500' },
  { name: 'LiveKit SFU', description: 'Scalable media routing and WebRTC streams.', icon: Zap, color: 'text-yellow-500' },
  { name: 'MongoDB', description: 'Persistent data storage with Mongoose ODM.', icon: Database, color: 'text-green-600' },
  { name: 'Redis', description: 'In-memory state cache for active rosters.', icon: Layers, color: 'text-red-500' },
  { name: 'Tailwind CSS', description: 'Utility-first styling with glassmorphism.', icon: Cpu, color: 'text-cyan-400' },
];

export default function TechStack() {
  return (
    <section id="tech-stack" className="py-24 relative">
      <div className="absolute inset-0 bg-surface-container opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">Technology Stack</h2>
          <p className="mt-4 text-xl text-on-surface-variant">Built using modern tools and scalable infrastructure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technologies.map((tech, i) => (
            <div key={i} className="glass-card rounded-xl p-6 flex items-start gap-4 hover:scale-[1.02] transition-transform">
              <div className="bg-surface-container-high p-3 rounded-lg">
                <tech.icon className={`w-6 h-6 ${tech.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-lg mb-1">{tech.name}</h3>
                <p className="text-on-surface-variant text-sm">{tech.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
