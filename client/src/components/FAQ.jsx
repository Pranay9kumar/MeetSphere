import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Do I need to download an app to use MeetSphere?",
    answer: "No. MeetSphere runs entirely in your web browser. Just click a meeting link and you will join instantly."
  },
  {
    question: "Is there a time limit on meetings?",
    answer: "No, meetings on MeetSphere are unlimited. You can talk for as long as you need."
  },
  {
    question: "How many people can join a meeting?",
    answer: "You can host multiple participants seamlessly with crystal clear audio and HD video."
  },
  {
    question: "Is MeetSphere secure?",
    answer: "Yes, we use industry-standard encryption protocols. Audio and video streams are securely transmitted."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-primary/50' : 'border-outline-variant/30'}`}
            >
              <button 
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span className="font-semibold text-on-surface text-lg">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-on-surface-variant transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-primary' : ''}`} />
              </button>
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-on-surface-variant">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
