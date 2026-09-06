import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchUser } from '../store/avatarSlice';
import { Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { loginUser } from '../util/membersApi';

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
      navigate(userData.accountType === 'reader' ? '/reader' : userData.accountType === 'creator' ? '/creator' : '/');
    } catch (err) {
      setError('Invalid credentials');
      setLoading(false);
    }
  };

  return (
   
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 md:p-6 pt-24 overflow-y-auto">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        
        className="flex flex-col md:flex-row w-full max-w-4xl min-h-[500px] md:h-[min(600px,70vh)] rounded-3xl overflow-hidden shadow-2xl border border-border bg-card"
      >
        
        
        <div className="relative w-full md:w-[38%] bg-primary flex flex-col justify-center px-8 md:px-10 py-10 text-foreground shrink-0">
          <div className="absolute top-6 left-8 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-foreground" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Augen</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 leading-none uppercase">Log<br/>In</h1>
          <div className="w-10 h-1 bg-foreground mb-6" />
          
          <p className="text-[13px] font-light opacity-80 leading-relaxed max-w-[200px]">
            Welcome back. Continue your unfiltered journey.
          </p>

          
          <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary border-[5px] border-card rounded-full items-center justify-center z-10 shadow-lg">
            <ChevronRight className="text-foreground" size={18} />
          </div>
        </div>

      
        <div className="w-full md:w-[62%] p-8 md:p-12 flex flex-col relative overflow-hidden bg-card">
          
          
          <div className="flex md:absolute md:top-8 md:right-8 mb-8 md:mb-0 self-end bg-background/50 rounded-full p-1 border border-border/50">
            <Link to="/signup" className="px-4 py-1 rounded-full text-[8px] font-bold tracking-widest text-foreground/40 hover:text-foreground">SIGN UP</Link>
            <button className="px-4 py-1 rounded-full text-[8px] font-bold tracking-widest bg-primary text-foreground">LOGIN</button>
          </div>

          <div className="flex-grow flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-sm w-full mx-auto md:mx-0">
              {error && <p className="text-primary text-[9px] font-bold uppercase tracking-widest">{error}</p>}
              {successMessage && <p className="text-secondary text-[9px] font-bold uppercase tracking-widest">{successMessage}</p>}
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-primary tracking-widest uppercase">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={14} />
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="hello@augen.com" 
                    onChange={handleChange} 
                    className="w-full bg-transparent border-b border-border pl-6 py-2 text-foreground focus:outline-none focus:border-primary transition-colors text-xs" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-[9px] font-bold text-primary tracking-widest uppercase">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={14} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    placeholder="••••••••" 
                    onChange={handleChange} 
                    className="w-full bg-transparent border-b border-border pl-6 py-2 text-foreground focus:outline-none focus:border-primary transition-colors text-xs" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full md:w-max btn-primary"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>
            </form>

            <p className="mt-8 text-[9px] text-foreground/30 tracking-widest uppercase">
              No account? <Link to="/signup" className="text-foreground border-b border-foreground/20 hover:text-primary transition-colors ml-2">Join the vision</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}