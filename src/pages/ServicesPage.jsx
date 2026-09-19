import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { motion } from 'framer-motion';

const ServicesPage = () => {
  const services = [
    { title: 'Residential Construction', desc: 'Custom luxury homes built to your exact specifications with premium materials.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
    { title: 'Commercial Development', desc: 'Office buildings, retail spaces, and industrial facilities delivered on time and under budget.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800' },
    { title: 'Renovation & Remodeling', desc: 'Transforming existing spaces into modern, functional, and beautiful environments.', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800' },
    { title: 'Project Management', desc: 'End-to-end oversight ensuring absolute safety, quality control, and transparency.', image: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&q=80&w=800' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Hero Section */}
      <div className="bg-[#e5e7eb] rounded-b-[3rem] pb-24 relative px-4 sm:px-8 overflow-hidden">
        <PublicNavbar />
        
        <div className="max-w-4xl mx-auto text-center pt-16 pb-8 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            Expert <span className="text-primary block mt-2">Construction Services</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10"
          >
            From pouring the foundation to handing over the keys, Prismo Construction is your trusted partner for projects of any scale.
          </motion.p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div className="h-64 w-full overflow-hidden">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-slate-500 text-lg leading-relaxed">{service.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
