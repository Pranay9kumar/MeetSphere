import React from 'react';
import { GitBranch, Activity, LayoutTemplate } from 'lucide-react';

export default function ProjectOverview() {
  return (
    <section id="architecture" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6">System Architecture</h2>
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
              MeetSphere separates concerns into a distinct client application, a robust REST/WebSocket signaling server, and a specialized Selective Forwarding Unit (SFU) for media routing. This topology minimizes bandwidth overhead for participants and allows horizontal scaling.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-primary/20 p-2 rounded-lg h-fit">
                  <LayoutTemplate className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Client Layer</h4>
                  <p className="text-sm text-on-surface-variant">Vite React SPA managing local media devices and peer connection state.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-secondary/20 p-2 rounded-lg h-fit">
                  <GitBranch className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Signaling Server</h4>
                  <p className="text-sm text-on-surface-variant">Express Node API handling WebSocket handshakes (Offers/Answers/ICE).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-tertiary/20 p-2 rounded-lg h-fit">
                  <Activity className="w-5 h-5 text-tertiary" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">SFU Media Server</h4>
                  <p className="text-sm text-on-surface-variant">LiveKit instance receiving individual streams and broadcasting to subscribers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 filter blur-[80px] rounded-full"></div>
            <div className="glass-card rounded-2xl p-6 relative z-10 border border-outline-variant/30 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="border border-outline-variant/50 rounded-xl p-4 w-full bg-surface-container-high mb-6">
                <p className="font-mono text-sm text-on-surface">Client (React SPA)</p>
              </div>
              <div className="flex gap-4 w-full justify-center text-outline mb-6">
                <div className="h-16 w-px bg-outline-variant/50"></div>
                <div className="h-16 w-px bg-outline-variant/50"></div>
              </div>
              <div className="flex gap-4 w-full mb-6">
                <div className="border border-outline-variant/50 rounded-xl p-4 w-1/2 bg-surface-container-high">
                  <p className="font-mono text-sm text-on-surface">Express API</p>
                </div>
                <div className="border border-outline-variant/50 rounded-xl p-4 w-1/2 bg-surface-container-high">
                  <p className="font-mono text-sm text-on-surface">LiveKit SFU</p>
                </div>
              </div>
              <div className="flex gap-4 w-full justify-center text-outline mb-6">
                <div className="h-16 w-px bg-outline-variant/50"></div>
              </div>
              <div className="border border-outline-variant/50 rounded-xl p-4 w-1/2 bg-surface-container-high">
                <p className="font-mono text-sm text-on-surface">MongoDB & Redis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
