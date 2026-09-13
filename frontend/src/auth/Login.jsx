import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchUser } from '../store/avatarSlice';
import { Mail, Lock, Eye, EyeOff, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';
import { loginUser } from '../util/gardenersApi';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(formData);
      const userData = await dispatch(fetchUser()).unwrap();
      // Route based on the updated bonsai theme roles
      const route = userData.accountType === 'apprentice' ? '/apprentice' : userData.accountType === 'botanist' ? '/botanist' : '/';
      navigate(route);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d1a17] p-4 md:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row w-full max-w-5xl min-h-[550px] rounded-3xl overflow-hidden shadow-2xl border border-[#1a2e28] bg-[#12201b]"
      >
        {/* Left Panel - Branding */}
        <div className="relative w-full md:w-[40%] bg-[#4f8a6f] flex flex-col justify-center px-8 md:px-12 py-10 text-[#e7e3d8] shrink-0">
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <Sprout className="text-[#e7e3d8]" size={20} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Mionchoillte</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-none">
            Welcome<br />Back
          </h1>
          <div className="w-12 h-1 bg-[#e7e3d8] mb-6 rounded-full" />

          <p className="text-sm font-light opacity-90 leading-relaxed max-w-[220px]">
            Return to your garden. Continue cultivating your knowledge and tending to your collection.
          </p>

          <div className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#4f8a6f] border-[6px] border-[#12201b] rounded-full items-center justify-center z-10 shadow-xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#e7e3d8]"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col relative bg-[#12201b]">
          <div className="flex md:absolute md:top-8 md:right-8 mb-8 md:mb-0 self-end bg-[#0d1a17]/50 rounded-full p-1 border border-[#1a2e28]">
            <Link to="/signup" className="px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-[#e7e3d8]/50 hover:text-[#e7e3d8] transition-colors">SIGN UP</Link>
            <button className="px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest bg-[#4f8a6f] text-[#e7e3d8] shadow-md">LOGIN</button>  
          </div>

          <div className="flex-grow flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-sm w-full mx-auto md:mx-0">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-[#4f8a6f]/10 border border-[#4f8a6f]/20 rounded-xl text-[#4f8a6f] text-xs font-medium">
                  {successMessage}
                </div>
              )}    

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#4f8a6f] tracking-widest uppercase">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-[#e7e3d8]/30 group-focus-within:text-[#4f8a6f] transition-colors" size={16} />
                  <input
                    name="email"
                    type="email"
                    placeholder="gardener@zenbotanica.com"
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-[#1a2e28] pl-8 py-3 text-[#e7e3d8] focus:outline-none focus:border-[#4f8a6f] transition-colors text-sm placeholder:text-[#e7e3d8]/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-[10px] font-bold text-[#4f8a6f] tracking-widest uppercase">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-[#e7e3d8]/30 group-focus-within:text-[#4f8a6f] transition-colors" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" autoComplete="current-password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-[#1a2e28] pl-8 py-3 text-[#e7e3d8] focus:outline-none focus:border-[#4f8a6f] transition-colors text-sm placeholder:text-[#e7e3d8]/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#e7e3d8]/30 hover:text-[#4f8a6f] transition-colors"      
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#4f8a6f] hover:bg-[#3c7a5e] text-[#e7e3d8] font-bold text-sm tracking-widest uppercase rounded-xl transition-all duration-300 shadow-lg shadow-[#4f8a6f]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Authenticating...' : 'Enter the Garden'}
                </button>
              </div>
            </form>

            <p className="mt-8 text-[10px] text-[#e7e3d8]/40 tracking-widest uppercase text-center md:text-left">
              New to the garden?{' '}
              <Link to="/signup" className="text-[#e7e3d8] border-b border-[#e7e3d8]/30 hover:text-[#4f8a6f] hover:border-[#4f8a6f] transition-colors ml-1">
                Plant your first seed
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
