import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

const teamMembers = [
  {
    name: 'Student Name',
    role: 'Full Stack Developer',
    description: 'Responsible for architecture design, WebRTC signaling, and frontend UI implementation.',
    image: 'https://i.pravatar.cc/150?u=student1',
    github: '#',
    linkedin: '#'
  },
  {
    name: 'Project Guide',
    role: 'Faculty Advisor',
    description: 'Provided guidance on system design patterns, WebRTC protocols, and database schemas.',
    image: 'https://i.pravatar.cc/150?u=advisor',
    mail: '#'
  }
];

export default function Team() {
  return (
    <section id="team" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-surface to-surface-container-lowest opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">Project Team</h2>
          <p className="mt-4 text-xl text-on-surface-variant">The minds behind the MeetSphere project.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, i) => (
            <div key={i} className="glass-card rounded-2xl p-8 flex flex-col items-center text-center">
              <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full mb-4 border-2 border-primary/50 shadow-glow" />
              <h3 className="text-xl font-bold text-on-surface mb-1">{member.name}</h3>
              <p className="text-primary font-medium text-sm mb-4">{member.role}</p>
              <p className="text-on-surface-variant text-sm mb-6 flex-1">{member.description}</p>
              <div className="flex gap-4">
                {member.github && <a href={member.github} className="text-outline hover:text-on-surface transition-colors"><Github className="w-5 h-5" /></a>}
                {member.linkedin && <a href={member.linkedin} className="text-outline hover:text-on-surface transition-colors"><Linkedin className="w-5 h-5" /></a>}
                {member.mail && <a href={member.mail} className="text-outline hover:text-on-surface transition-colors"><Mail className="w-5 h-5" /></a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
