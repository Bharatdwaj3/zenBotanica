import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser } from '../util/gardenersApi';
import { fetchUser } from '../store/avatarSlice';
import { Mail, Lock, Sprout, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'student',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser({
        email: form.email,
        password: form.password,
        role: form.role,
      });

      await loginUser({
        email: form.email,
        password: form.password,
      });

      await dispatch(fetchUser());
      navigate('/complete-profile');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
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
        {/* Left Panel - Branding (Mirrored concept for Signup) */}
        <div className="relative w-full md:w-[40%] bg-[#3c5f6e] flex flex-col justify-center px-8 md:px-12 py-10 text-[#e7e3d8] shrink-0">
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <Sprout className="text-[#e7e3d8]" size={20} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Mionchoillte</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-none">
            Begin Your<br />Journey
          </h1>
          <div className="w-12 h-1 bg-[#e7e3d8] mb-6 rounded-full" />

          <p className="text-sm font-light opacity-90 leading-relaxed max-w-[220px]">
            Join our community of cultivators. Start tending to your knowledge and growing your collection today.
          </p>

          <div className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#3c5f6e] border-[6px] border-[#12201b] rounded-full items-center justify-center z-10 shadow-xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#e7e3d8]"><path d="m15 18-6-6 6-6"/></svg>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col relative bg-[#12201b]">
          <div className="flex md:absolute md:top-8 md:right-8 mb-8 md:mb-0 self-end bg-[#0d1a17]/50 rounded-full p-1 border border-[#1a2e28]">
            <button className="px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest bg-[#3c5f6e] text-[#e7e3d8] shadow-md">SIGN UP</button>
            <Link to="/login" className="px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-[#e7e3d8]/50 hover:text-[#e7e3d8] transition-colors">LOGIN</Link>  
          </div>

          <div className="flex-grow flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-5 max-w-sm w-full mx-auto md:mx-0">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                  {error}
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

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#4f8a6f] tracking-widest uppercase">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-[#e7e3d8]/30 group-focus-within:text-[#4f8a6f] transition-colors" size={16} />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    minLength={6}
                    className="w-full bg-transparent border-b border-[#1a2e28] pl-8 py-3 text-[#e7e3d8] focus:outline-none focus:border-[#4f8a6f] transition-colors text-sm placeholder:text-[#e7e3d8]/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#4f8a6f] tracking-widest uppercase">I am a...</label>
                <div className="relative group">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 text-[#e7e3d8]/30 group-focus-within:text-[#4f8a6f] transition-colors" size={16} />
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-[#1a2e28] pl-8 py-3 text-[#e7e3d8] focus:outline-none focus:border-[#4f8a6f] transition-colors text-sm appearance-none cursor-pointer"
                  >
                    <option value="student" className="bg-[#12201b]">Student (Apprentice)</option>
                    <option value="faculty" className="bg-[#12201b]">Faculty (Master)</option>
                  </select>
                  <svg className="absolute right-0 top-1/2 -translate-y-1/2 text-[#e7e3d8]/30 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#4f8a6f] hover:bg-[#3c7a5e] text-[#e7e3d8] font-bold text-sm tracking-widest uppercase rounded-xl transition-all duration-300 shadow-lg shadow-[#4f8a6f]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Planting Seeds...' : 'Create Account'}
                </button>
              </div>
            </form>

            <p className="mt-8 text-[10px] text-[#e7e3d8]/40 tracking-widest uppercase text-center md:text-left">
              Already cultivating?{' '}
              <Link to="/login" className="text-[#e7e3d8] border-b border-[#e7e3d8]/30 hover:text-[#4f8a6f] hover:border-[#4f8a6f] transition-colors ml-1">
                Return to the garden
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
