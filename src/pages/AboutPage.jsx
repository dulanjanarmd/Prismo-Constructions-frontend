import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Hero Section */}
      <div className="bg-[#e5e7eb] rounded-b-[3rem] pb-24 relative px-4 sm:px-8 overflow-hidden">
        <PublicNavbar />
        
        <div className="max-w-4xl mx-auto text-center pt-16 pb-8 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            About <span className="text-primary">Prismo</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8"
          >
            A legacy of building excellence, rooted in safety, transparency, and innovation. We don't just build structures; we build trust.
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-20 text-lg leading-relaxed text-slate-600">
        <h2 className="text-3xl font-bold text-[#1e2a35] mb-6">Our Story</h2>
        <p className="mb-8">
          Founded on the principle that modern construction requires more than just bricks and mortar, Prismo has grown into an industry leader over the past two decades. We leverage cutting-edge project management tools to ensure our clients always know exactly where their project stands.
        </p>

        <h2 className="text-3xl font-bold text-[#1e2a35] mb-6">Our Core Values</h2>
        <ul className="list-disc pl-6 mb-12 space-y-4">
          <li><strong>Absolute Transparency:</strong> Our clients get real-time access to logs, approvals, and timelines via our dedicated Client Portal.</li>
          <li><strong>Uncompromising Safety:</strong> We adhere to the strictest industry safety standards, protecting our workers and your investment.</li>
          <li><strong>Sustainable Building:</strong> We prioritize eco-friendly materials and energy-efficient designs whenever possible.</li>
        </ul>

        <div className="bg-[#1e2a35] text-white rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to build?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Contact our team today to get a quote on your next residential, commercial, or infrastructure project.
          </p>
          <a href="#contact" className="px-8 py-4 bg-primary text-[#022c22] rounded-xl font-bold text-lg hover:opacity-90 transition-opacity inline-block">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
