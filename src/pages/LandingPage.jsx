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
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      
      {/* Top Section with light grey background and rounded bottom */}
      <div className="bg-[#e5e7eb] rounded-b-[3rem] pb-0 relative px-4 sm:px-8">
        {/* Navbar */}
        <PublicNavbar />

        {/* Hero Content matching the screenshot layout */}
        <div className="max-w-4xl mx-auto text-center pt-8 pb-10 relative z-10">

          {/* Hero Title with Bolder Font */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-[#1e293b] mb-6 leading-[1.1] tracking-tight">
            Building Your Vision <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500">With Excellence</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 font-semibold mb-10 max-w-2xl mx-auto leading-relaxed">
            From luxury residential homes to massive commercial complexes, Prismo Construction delivers unmatched quality, safety, and transparency.
          </p>

        </div>

        {/* Hero Image overlapping the bottom curve */}
        <div className="max-w-7xl mx-auto relative px-4 z-10">
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full rounded-t-3xl overflow-hidden shadow-2xl">
            <ImageCarousel className="absolute inset-0 w-full h-full" />
            
            {/* Text Overlay (placed above carousel) */}
            <div className="absolute bottom-12 left-12 z-20 pointer-events-none">
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                Construction Site<br/>Management
              </h2>
              <p className="text-2xl text-white/90 drop-shadow-md">Insights</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content below the curved top section */}
      <main className="flex-1 bg-white pt-12 pb-24 px-4 sm:px-8 overflow-hidden">
        
        {/* Statistics Section */}
        <div className="max-w-7xl mx-auto mb-24 mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-2">500+</motion.div>
              <div className="text-[#64748b] font-medium uppercase tracking-wide text-sm">Projects Completed</div>
            </div>
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-2">20+</motion.div>
              <div className="text-[#64748b] font-medium uppercase tracking-wide text-sm">Years Experience</div>
            </div>
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-2">100%</motion.div>
              <div className="text-[#64748b] font-medium uppercase tracking-wide text-sm">Safety Record</div>
            </div>
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-2">$2B+</motion.div>
              <div className="text-[#64748b] font-medium uppercase tracking-wide text-sm">Value Delivered</div>
            </div>
          </div>
        </div>

        {/* Services Highlight */}
        <div className="max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">Our Expertise</h2>
            <p className="text-lg text-[#64748b] max-w-2xl mx-auto">We bring decades of experience across multiple sectors, ensuring your project is handled by specialists.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#f8fafc] p-10 rounded-2xl border border-[#e2e8f0] hover:shadow-lg transition-shadow">
              <Home className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-[#1e293b] mb-4">Residential</h3>
              <p className="text-[#64748b] leading-relaxed">From luxury custom homes to multi-family complexes, we build living spaces that combine elegance with structural integrity.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[#f8fafc] p-10 rounded-2xl border border-[#e2e8f0] hover:shadow-lg transition-shadow">
              <Building2 className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-[#1e293b] mb-4">Commercial</h3>
              <p className="text-[#64748b] leading-relaxed">State-of-the-art office buildings, retail centers, and industrial facilities designed for modern business needs.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#f8fafc] p-10 rounded-2xl border border-[#e2e8f0] hover:shadow-lg transition-shadow">
              <Wrench className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-[#1e293b] mb-4">Infrastructure</h3>
              <p className="text-[#64748b] leading-relaxed">Heavy civil projects, renovations, and public works executed with precision and uncompromising safety standards.</p>
            </motion.div>
          </div>
        </div>

        {/* Featured Projects */}
        <div className="max-w-7xl mx-auto mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">Featured Work</h2>
              <p className="text-lg text-[#64748b] max-w-xl">A glimpse into our recent award-winning projects.</p>
            </div>
            <Link to="/portfolio" className="mt-6 md:mt-0 text-[#1e293b] font-bold hover:text-primary transition-colors flex items-center">
              View All Projects <span className="ml-2">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="group cursor-pointer">
              <div className="h-80 bg-slate-300 rounded-2xl mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-800/10 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="w-full h-full bg-slate-200 group-hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                   <span className="text-slate-400 font-bold uppercase tracking-widest">Skyline Image</span>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-[#1e293b] mb-2 group-hover:text-primary transition-colors">Skyline Tower</h3>
                  <p className="text-[#64748b]">Commercial Office Complex</p>
                </div>
                <div className="bg-[#f1f5f9] px-4 py-2 rounded-lg text-sm font-bold text-[#475569]">2025</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="group cursor-pointer">
              <div className="h-80 bg-slate-300 rounded-2xl mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-800/10 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="w-full h-full bg-slate-400 group-hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                   <span className="text-slate-200 font-bold uppercase tracking-widest">Oasis Image</span>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-[#1e293b] mb-2 group-hover:text-primary transition-colors">Oasis Residences</h3>
                  <p className="text-[#64748b]">Luxury Condominiums</p>
                </div>
                <div className="bg-[#f1f5f9] px-4 py-2 rounded-lg text-sm font-bold text-[#475569]">2024</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-7xl mx-auto mb-32 bg-[#f8fafc] border border-slate-200 rounded-[2rem] p-10 md:p-16 text-slate-900 relative overflow-hidden shadow-sm">
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1e293b]">Client Success Stories</h2>
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
        
        <div id="contact" className="max-w-7xl mx-auto bg-[#f8fafc] border border-slate-200 p-10 md:p-16 rounded-[2rem] shadow-xl relative overflow-hidden">
          
          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl font-bold text-[#1e293b] mb-3">Request a Consultation</h2>
            <p className="text-slate-600">Tell us about your project, and our experts will get back to you with a proposal.</p>
          </div>

          {submitSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 relative z-10">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1e293b] mb-2">Request Received!</h3>
              <p className="text-slate-600">Our team will review your requirements and contact you shortly.</p>
              <button onClick={() => setSubmitSuccess(false)} className="mt-4 text-primary font-bold hover:underline">Submit Another Inquiry</button>
            </motion.div>
          ) : (
            <form className="space-y-6 relative z-10" onSubmit={async (e) => {
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
                    initialNotes: formData.notes
                  })
                });
                if (res.ok) {
                  setSubmitSuccess(true);
                  setFormData({ name: '', email: '', phone: '', projectType: 'Commercial Build', location: '', notes: '' });
                }
              } catch (error) {
                console.error("Failed to submit inquiry", error);
              } finally {
                setIsSubmitting(false);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400" 
                    placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Work Email</label>
                  <input type="email" required
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400" 
                    placeholder="john@company.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input type="tel" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400" 
                    placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Type</label>
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Location</label>
                <input type="text" 
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400" 
                  placeholder="City, State or Address" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Details</label>
                <textarea rows="4" 
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-slate-900 placeholder-slate-400" 
                  placeholder="Tell us about your requirements, timeline, and budget..."></textarea>
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
      <footer className="bg-[#1c2431] text-[#9ca3af] pt-16 pb-12 px-6 sm:px-12 w-full border-t border-[#374151]">
        
        {/* Bottom CTA Section */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 pb-12 border-b border-[#374151]">
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
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Logo */}
        <div className="w-full mt-16 pt-8 border-t border-[#374151] flex justify-center items-end overflow-hidden">
          <h1 className="text-[6vw] leading-[1] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#374151] to-[#1c2431] uppercase tracking-wider w-full text-center select-none whitespace-nowrap">
            PRISMO CONSTRUCTIONS
          </h1>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
