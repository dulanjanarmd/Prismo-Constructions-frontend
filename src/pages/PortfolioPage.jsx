import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { motion } from 'framer-motion';

const PortfolioPage = () => {
  const projects = [
    { name: 'Skyline Tower', type: 'Commercial', desc: 'A 45-story premium office complex completed 2 months ahead of schedule.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800' },
    { name: 'Oasis Residences', type: 'Residential', desc: 'Luxury condominium with sustainable energy systems and smart home integrations.', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800' },
    { name: 'Metro Transit Hub', type: 'Infrastructure', desc: 'Modern transit center connecting over 50,000 daily commuters.', image: 'https://images.unsplash.com/photo-1517598811128-08a0d0a519a4?auto=format&fit=crop&q=80&w=800' },
    { name: 'Apex Retail Park', type: 'Commercial', desc: 'A 200,000 sq ft shopping destination featuring open-air promenades.', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Hero Section */}
      <div className="bg-[#e5e7eb] rounded-b-[3rem] pb-20 relative px-4 sm:px-8 overflow-hidden">
        <PublicNavbar />
        
        <div className="max-w-5xl mx-auto text-center pt-16 pb-8 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            Our <span className="text-primary">Portfolio</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto"
          >
            A showcase of our commitment to excellence. See how Prismo turns blueprints into breathtaking reality.
          </motion.p>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {projects.map((project, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all group overflow-hidden cursor-pointer flex flex-col"
            >
              {/* Project Image */}
              <div className="h-64 w-full overflow-hidden">
                <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              
              <div className="p-8">
                <span className="text-primary text-sm font-bold uppercase tracking-wider mb-2 block">{project.type}</span>
                <h3 className="text-2xl font-bold mb-4">{project.name}</h3>
                <p className="text-slate-500 text-lg leading-relaxed">{project.desc}</p>
                <div className="mt-8 flex items-center text-[#1e2a35] font-bold group-hover:text-primary transition-colors">
                  View Project Details <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
