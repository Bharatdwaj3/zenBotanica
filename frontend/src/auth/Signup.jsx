import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser } from '../util/membersApi';
import { fetchUser } from '../store/avatarSlice';

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
      // Step 1: create the account
      await registerUser( {
        email: form.email,
        password: form.password,
        role: form.role,
      });

      // Step 2: register() does not auto-login, so log in right after
      // with the same credentials to establish the session
      await loginUser( {
        email: form.email,
        password: form.password,
      });

      // Step 3: now that we have a session, load the user into Redux
      await dispatch(fetchUser());

      // Step 4: send them to fill in Fname/Lname/age/gender/etc.
      navigate('/complete-profile');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-lg p-8">
        <h1 className="text-3xl font-black text-foreground text-center mb-2">Join HonKhana</h1>
        <p className="text-foreground/60 text-sm text-center mb-6">Create your library account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">I am a...</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/60 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
