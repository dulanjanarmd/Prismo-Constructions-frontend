import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import ImageCarousel from '../components/ImageCarousel';
import PublicNavbar from '../components/PublicNavbar';
import { Home, Building2, Wrench, Star } from 'lucide-react';

const LandingPage = () => {
  const { addConsultation } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'Commercial Build',
    location: '',
    budget: '10M - 50M LKR',
    timeline: '3 - 6 Months',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addConsultation({
      ...formData,
      status: 'New Inquiry',
      dateSubmitted: new Date().toISOString().split('T')[0],
      proposalUrl: null
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ clientName: '', email: '', phone: '', service: 'Construction Management', description: '' });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 flex flex-col">
      
      {/* Top Section with light grey background and rounded bottom */}
      <div className="bg-[#e5e7eb]/80 backdrop-blur-md rounded-b-[3rem] pb-0 relative px-4 sm:px-8">
        {/* Navbar */}
        <PublicNavbar />

        {/* Hero Content moved inside the image box */}

        {/* Hero Image overlapping the bottom curve */}
        <div className="max-w-7xl mx-auto relative px-4 z-10">
          <div className="relative h-[350px] md:h-[450px] lg:h-[520px] w-full rounded-t-3xl overflow-hidden shadow-2xl mt-4">
            <ImageCarousel className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 bg-slate-900/40 z-10"></div> {/* Dark overlay for readability */}
            
            {/* Text Overlay (placed above carousel) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none px-6">
              <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight drop-shadow-2xl">
                Building Your Vision <br/>
                <span className="font-playfair text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-[#ffc107]">With Excellence</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-white/90 font-semibold max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                From luxury residential homes to massive commercial complexes, Prismo Construction delivers unmatched quality, safety, and transparency.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content below the curved top section */}
      <main className="flex-1 bg-transparent pt-6 pb-24 px-4 sm:px-8 overflow-hidden">
        
        {/* Welcome Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1e2a35] mb-6 leading-tight whitespace-nowrap w-full overflow-hidden text-ellipsis">
            Welcome to
            <span className="font-ethnocentric font-black uppercase tracking-widest text-[#1e2a35] ml-2">PRISMO</span>
            <span className="font-ethnocentric font-semibold uppercase tracking-[0.1em] text-[#f5a623] ml-2">CONSTRUCTION</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            We are dedicated to building your dreams into reality. With a passion for excellence and a commitment to quality, our team of experts ensures that every project is delivered on time, within budget, and to the highest standards. Experience the difference of working with a construction partner who truly cares about your vision.
          </p>
        </div>

        {/* Statistics Section */}
        <div className="max-w-7xl mx-auto mb-24 mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-extrabold text-[#1e2a35] mb-2">500+</motion.div>
              <div className="text-[#64748b] font-medium uppercase tracking-wide text-sm">Projects Completed</div>
            </div>
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold text-[#1e2a35] mb-2">20+</motion.div>
              <div className="text-[#64748b] font-medium uppercase tracking-wide text-sm">Years Experience</div>
            </div>
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-4xl md:text-5xl font-extrabold text-[#1e2a35] mb-2">100%</motion.div>
              <div className="text-[#64748b] font-medium uppercase tracking-wide text-sm">Safety Record</div>
            </div>
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-4xl md:text-5xl font-extrabold text-[#1e2a35] mb-2">$2B+</motion.div>
              <div className="text-[#64748b] font-medium uppercase tracking-wide text-sm">Value Delivered</div>
            </div>
          </div>
        </div>

        {/* Services Highlight */}
        <div className="max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e2a35] mb-4">Our Expertise</h2>
            <p className="text-lg text-[#64748b] max-w-2xl mx-auto">We bring decades of experience across multiple sectors, ensuring your project is handled by specialists.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
              <div className="h-48 w-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" alt="Residential Construction" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 flex-1">
              <h3 className="text-2xl font-bold text-[#1e2a35] mb-4">Residential</h3>
              <p className="text-[#64748b] leading-relaxed">From luxury custom homes to multi-family complexes, we build living spaces that combine elegance with structural integrity.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
              <div className="h-48 w-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" alt="Commercial Construction" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 flex-1">
              <h3 className="text-2xl font-bold text-[#1e2a35] mb-4">Commercial</h3>
              <p className="text-[#64748b] leading-relaxed">State-of-the-art office buildings, retail centers, and industrial facilities designed for modern business needs.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
              <div className="h-48 w-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800" alt="Infrastructure Construction" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 flex-1">
              <h3 className="text-2xl font-bold text-[#1e2a35] mb-4">Infrastructure</h3>
              <p className="text-[#64748b] leading-relaxed">Heavy civil projects, renovations, and public works executed with precision and uncompromising safety standards.</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Featured Projects */}
        <div className="max-w-7xl mx-auto mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e2a35] mb-4">Featured Work</h2>
              <p className="text-lg text-[#64748b] max-w-xl">A glimpse into our recent award-winning projects.</p>
            </div>
            <Link to="/portfolio" className="mt-6 md:mt-0 text-[#1e2a35] font-bold hover:text-primary transition-colors flex items-center">
              View All Projects <span className="ml-2">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="group cursor-pointer">
              <div className="h-80 bg-slate-300 rounded-2xl mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-800/10 group-hover:bg-transparent transition-colors duration-500"></div>
                <img src="https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&q=80&w=800" alt="Skyline Tower" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-[#1e2a35] mb-2 group-hover:text-primary transition-colors">Skyline Tower</h3>
                  <p className="text-[#64748b]">Commercial Office Complex</p>
                </div>
                <div className="bg-[#f1f5f9] px-4 py-2 rounded-lg text-sm font-bold text-[#475569]">2025</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="group cursor-pointer">
              <div className="h-80 bg-slate-300 rounded-2xl mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-800/10 group-hover:bg-transparent transition-colors duration-500"></div>
                <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800" alt="Oasis Residences" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-[#1e2a35] mb-2 group-hover:text-primary transition-colors">Oasis Residences</h3>
                  <p className="text-[#64748b]">Luxury Condominiums</p>
                </div>
                <div className="bg-[#f1f5f9] px-4 py-2 rounded-lg text-sm font-bold text-[#475569]">2024</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-7xl mx-auto mb-32 text-slate-900 relative px-4 sm:px-8">
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1e2a35]">Client Success Stories</h2>
            <p className="text-slate-600 text-lg">Don't just take our word for it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
              <div className="flex text-primary mb-6">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-lg leading-relaxed mb-8 text-slate-700 flex-1">"Prismo delivered our commercial complex two months ahead of schedule. Their client portal gave us complete visibility into the process, removing all the usual anxiety of large-scale construction."</p>
              <div className="mt-auto">
                <div className="font-bold text-slate-900 text-lg">Sarah Jenkins</div>
                <div className="text-slate-500 text-sm">CEO, Apex Properties</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
              <div className="flex text-primary mb-6">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-lg leading-relaxed mb-8 text-slate-700 flex-1">"From the foundation to the final touches, the attention to detail was extraordinary. They truly lived up to their promise of uncompromising safety and quality."</p>
              <div className="mt-auto">
                <div className="font-bold text-slate-900 text-lg">Michael Chen</div>
                <div className="text-slate-500 text-sm">Director, Metro Development</div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div id="contact" className="max-w-7xl mx-auto bg-[#f8fafc] border border-slate-200 p-6 md:p-10 rounded-[2rem] shadow-xl relative overflow-hidden">
          
          <div className="text-center mb-6 relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1e2a35] mb-2">Request a Consultation</h2>
            <p className="text-slate-600 text-sm md:text-base">Tell us about your project, and our experts will get back to you with a proposal.</p>
          </div>

          {submitSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 relative z-10">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1e2a35] mb-2">Request Received!</h3>
              <p className="text-slate-600">Our team will review your requirements and contact you shortly.</p>
              <button onClick={() => setSubmitSuccess(false)} className="mt-4 text-primary font-bold hover:underline">Submit Another Inquiry</button>
            </motion.div>
          ) : (
            <form className="space-y-3 relative z-10" onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                const res = await fetch('http://localhost:8080/api/inquiries', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    projectType: formData.projectType,
                    location: formData.location,
                    initialNotes: `Budget: ${formData.budget}\nTimeline: ${formData.timeline}\n\nDetails:\n${formData.notes}`
                  })
                });
                if (res.ok) {
                  const savedInquiry = await res.json();
                  
                  // Add it to frontend context so it appears immediately if the PM navigates to the dashboard without refreshing
                  addConsultation({
                    id: savedInquiry.id,
                    clientName: savedInquiry.customerName,
                    service: savedInquiry.projectType,
                    dateSubmitted: savedInquiry.createdAt,
                    description: savedInquiry.description,
                    status: 'New Inquiry',
                    email: savedInquiry.email,
                    phone: savedInquiry.phone,
                    assignedToId: savedInquiry.assignedTo?.id
                  });

                  setSubmitSuccess(true);
                  setFormData({ name: '', email: '', phone: '', projectType: 'Commercial Build', location: '', budget: '10M - 50M LKR', timeline: '3 - 6 Months', notes: '' });
                }
              } catch (error) {
                console.error("Failed to submit inquiry", error);
              } finally {
                setIsSubmitting(false);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400" 
                    placeholder="Nimal Perera" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Work Email</label>
                  <input type="email" required
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400" 
                    placeholder="nimal@company.lk" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400" 
                    placeholder="+94 77 123 4567" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Project Location</label>
                  <input type="text" 
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400" 
                    placeholder="Colombo, Sri Lanka" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Project Type</label>
                  <select 
                    value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none text-slate-900"
                  >
                    <option>Commercial Build</option>
                    <option>Residential Complex</option>
                    <option>Infrastructure</option>
                    <option>Renovation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Estimated Budget</label>
                  <select 
                    value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none text-slate-900"
                  >
                    <option>Under 10M LKR</option>
                    <option>10M - 50M LKR</option>
                    <option>50M - 100M LKR</option>
                    <option>100M+ LKR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Expected Timeline</label>
                  <select 
                    value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none text-slate-900"
                  >
                    <option>Less than 3 Months</option>
                    <option>3 - 6 Months</option>
                    <option>6 - 12 Months</option>
                    <option>Over 12 Months</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Details</label>
                <textarea rows="2" 
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-slate-900 placeholder-slate-400" 
                  placeholder="Tell us about your requirements..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all text-lg shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Exact Match Footer from Screenshot */}
      <footer className="bg-[#0b1121] text-[#9ca3af] pt-16 pb-12 px-6 sm:px-12 w-full border-t border-[#2c3e50] rounded-t-[3rem] mt-auto relative overflow-hidden">
        
        {/* Custom Wavy Background (CSS/SVG) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-t-[3rem]">
          {/* Top Left Waves */}
          <svg className="absolute -top-10 -left-10 w-[200px] h-[200px] md:w-[350px] md:h-[350px] opacity-20" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#1e3a8a" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.9,-17.9,96.2,-2.7C95.5,12.5,88,27.3,77.3,39.1C66.6,50.9,52.7,59.7,38,66.6C23.3,73.5,7.8,78.5,-6.9,78.2C-21.6,77.9,-35.4,72.3,-49.4,65.3C-63.4,58.3,-77.6,49.9,-84.9,37C-92.2,24.1,-92.6,6.7,-88.4,-8.9C-84.2,-24.5,-75.4,-38.3,-64.1,-49.2C-52.8,-60.1,-39,-68.1,-25.1,-73.4C-11.2,-78.7,2.8,-81.3,16.5,-80C30.2,-78.7,43.6,-73.5,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
            <path fill="#2563eb" d="M38.1,-63.9C50.2,-57.4,61.4,-49.3,69.5,-38.6C77.6,-27.9,82.6,-14.5,81.4,-1.8C80.2,10.9,72.8,22.9,64.1,33.5C55.4,44.1,45.4,53.3,33.4,61.1C21.4,68.9,7.4,75.3,-6.2,74C-19.8,72.7,-33,63.7,-43.8,53.2C-54.6,42.7,-63,30.7,-68.5,17.4C-74,4.1,-76.6,-10.5,-72.1,-23C-67.6,-35.5,-56,-45.9,-43.5,-52.1C-31,-58.3,-17.6,-60.3,-3.1,-61C11.4,-61.7,26,-61.1,38.1,-63.9Z" transform="translate(80 80) scale(1)" />
          </svg>
          
          {/* Bottom Right Waves */}
          <svg className="absolute -bottom-10 -right-10 w-[250px] h-[250px] md:w-[450px] md:h-[450px] opacity-15" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#1e3a8a" d="M48.4,-73.6C62.8,-66.1,74.7,-52.9,81.6,-37.6C88.5,-22.3,90.4,-4.9,86.2,10.7C82,26.3,71.7,40.1,59.2,50.7C46.7,61.3,32,68.7,16.2,73.4C0.4,78.1,-16.5,80.1,-31.6,75.4C-46.7,70.7,-60.1,59.3,-68.9,45.3C-77.7,31.3,-81.9,14.7,-80.1,-1C-78.3,-16.7,-70.5,-31.5,-60.3,-43.3C-50.1,-55.1,-37.5,-63.9,-23.7,-70.4C-9.9,-76.9,5.1,-81.1,19.8,-79C34.5,-76.9,48.9,-68.5,48.4,-73.6Z" transform="translate(100 100) scale(1.2)" />
            <path fill="#1d4ed8" d="M42.7,-61.3C55.4,-52.5,65.8,-40.4,72.6,-26.3C79.4,-12.2,82.6,3.9,78.5,18.3C74.4,32.7,63.1,45.4,49.5,53.4C35.9,61.4,20,64.7,4.3,64.9C-11.4,65.1,-27,62.2,-41.2,54.4C-55.4,46.6,-68.2,33.9,-73.5,19.1C-78.8,4.3,-76.6,-12.6,-69.6,-26.4C-62.6,-40.2,-50.8,-50.9,-37.8,-59.5C-24.8,-68.1,-10.6,-74.6,2.7,-74C16,-73.4,30,-65.7,42.7,-61.3Z" transform="translate(120 120) scale(1)" />
          </svg>
        </div>
        
        {/* Content wrapper to stay above the absolute background */}
        <div className="relative z-10">
          {/* Bottom CTA Section */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 pb-12 border-b border-[#2c3e50]">
          <div>
            <h3 className="text-3xl md:text-4xl text-white font-bold mb-3">
              Ready to start your next project?
            </h3>
            <p className="text-[#9ca3af] text-lg">
              Let's build something extraordinary together. Contact our experts for a free consultation.
            </p>
          </div>
          <div className="w-full md:w-auto mt-8 md:mt-0">
            <a href="#contact" className="inline-flex items-center justify-center bg-primary text-[#022c22] font-extrabold text-sm px-8 py-4 uppercase tracking-wider hover:bg-white hover:text-[#1c2431] transition-all rounded-lg shadow-lg">
              Get a Free Estimate
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-sm">
          <div>
            <h4 className="text-white font-medium mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/portal" className="hover:text-white transition-colors">Client Portal</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services Overview</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition-colors">Project Portfolio</Link></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Request a Quote</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Sales</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">Our Team</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Locations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Portal Access</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-white transition-colors">Employee Login</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Client Login</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Logo */}
        <div className="w-full mt-16 pt-8 border-t border-[#2c3e50] flex justify-center items-end overflow-hidden">
          <h1 className="font-ethnocentric text-[4.5vw] leading-[1] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#2c3e50] to-[#1c2431] uppercase tracking-wider w-full text-center select-none whitespace-nowrap">
            PRISMO CONSTRUCTION
          </h1>
        </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
