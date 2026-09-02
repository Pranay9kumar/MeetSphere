import React from 'react';
import { Video, Mic, MicOff, Camera, MonitorUp, PhoneOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface mb-6">
          Simple meetings. Better collaboration.
        </h1>
        
        <p className="mt-4 max-w-2xl text-lg text-on-surface-variant mx-auto mb-10">
          MeetSphere brings your team together with crystal-clear video, seamless screen sharing, and effortless collaboration. Secure, fast, and easy to use.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
          <Link to="/login" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-lg flex items-center justify-center hover:bg-surface-tint transition-all">
            New Meeting
          </Link>
          <div className="relative w-full sm:w-auto flex items-center">
            <input 
              type="text" 
              placeholder="Enter meeting code..." 
              className="w-full sm:w-64 px-4 py-3 rounded-xl bg-surface-container-high border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <button className="absolute right-2 px-3 py-1.5 rounded-lg text-primary hover:bg-surface-container-highest transition-colors font-medium">
              Join
            </button>
          </div>
        </div>

        {/* Realistic Meeting Preview */}
        <div className="relative mx-auto max-w-5xl rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col h-[500px]">
          {/* Main Meeting Area */}
          <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 gap-4 bg-surface-container-low">
            {/* Participant 1 (Active Speaker) */}
            <div className="col-span-2 md:col-span-2 relative bg-surface-container-highest rounded-xl overflow-hidden border-2 border-primary">
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="https://i.pravatar.cc/300?u=a042581f4e29026704d" alt="Alex" className="w-24 h-24 rounded-full opacity-90" />
              </div>
              <div className="absolute bottom-3 left-3 bg-surface-container-highest/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium text-on-surface flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Alex Chen
              </div>
            </div>
            {/* Participant 2 */}
            <div className="relative bg-surface-container-highest rounded-xl overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Sarah" className="w-16 h-16 rounded-full opacity-90" />
              </div>
              <div className="absolute bottom-3 left-3 bg-surface-container-highest/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium text-on-surface flex items-center gap-2">
                Sarah Jenkins
              </div>
              <div className="absolute top-3 right-3 bg-error/90 p-1.5 rounded-md">
                 <MicOff className="w-4 h-4 text-on-error" />
              </div>
            </div>
            {/* Participant 3 */}
            <div className="relative bg-surface-container-highest rounded-xl overflow-hidden hidden md:block">
               <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-tertiary flex items-center justify-center text-xl font-bold text-on-tertiary">M</div>
              </div>
              <div className="absolute bottom-3 left-3 bg-surface-container-highest/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium text-on-surface flex items-center gap-2">
                Marcus
              </div>
            </div>
          </div>
          
          {/* Meeting Controls Bar */}
          <div className="h-20 bg-surface-container-lowest border-t border-outline-variant/30 flex items-center justify-between px-6">
            <div className="text-on-surface-variant text-sm font-medium hidden sm:block">10:00 AM | Team Sync</div>
            
            <div className="flex items-center gap-3">
              <button className="p-3 rounded-full bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface transition-colors">
                <Camera className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface transition-colors hidden sm:block">
                <MonitorUp className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full bg-error hover:bg-error-container text-on-error transition-colors px-6">
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-on-surface-variant flex items-center gap-2">
               <div className="p-2 rounded-md hover:bg-surface-container-highest transition-colors cursor-pointer hidden sm:flex items-center gap-1">
                 <Video className="w-4 h-4" /> <span>3</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
