import React from 'react';
import { Send } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-24 relative bg-surface-container-lowest">
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full mix-blend-screen filter blur-[100px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Get in touch</h2>
          <p className="text-xl text-on-surface-variant">Have questions or feedback? We would love to hear from you.</p>
        </div>
        
        <div className="max-w-2xl mx-auto glass-card rounded-3xl p-8 sm:p-10 shadow-xl border border-white/5">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-on-surface-variant">First Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-outline/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="Alex" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-on-surface-variant">Last Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-outline/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="Chen" />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-on-surface-variant">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-outline/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="alex@example.com" />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-on-surface-variant">Message</label>
              <textarea rows="4" className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-outline/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none" placeholder="How can we help you?"></textarea>
            </div>
            
            <button className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-lg hover:bg-surface-tint transition-all shadow-glow flex justify-center items-center gap-2">
              Send Message <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
