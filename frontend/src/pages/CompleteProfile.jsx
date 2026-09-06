import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { completeProfile } from '../util/membersApi';
import { fetchUser } from '../store/avatarSlice';

const SUBJECTS = ['Geography', 'Social_Studies', 'Computer_Science', 'Literature', 'History'];

export default function CompleteProfile() {
  const { user } = useSelector((state) => state.avatar);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isFaculty = user?.role === 'faculty';

  const [form, setForm] = useState({
    email: user?.email || '',
    Fname: '',
    Lname: '',
    age: '',
    gender: '',
    Expertise: SUBJECTS[0],
    Subjects: SUBJECTS[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await completeProfile( {
        email: form.email,
        Fname: form.Fname,
        Lname: form.Lname,
        age: form.age,
        gender: form.gender,
        Expertise: isFaculty ? form.Expertise : undefined,
        Subjects: !isFaculty ? form.Subjects : undefined,
      });

      await dispatch(fetchUser());
      navigate('/profile');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save profile. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-lg p-8">
        <h1 className="font-display text-2xl tracking-wide text-foreground text-center mb-2">Complete Your Profile</h1>
        <p className="text-foreground/60 text-sm text-center mb-6">
          Just a few more details as a {user?.role || 'member'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">First Name</label>
              <input
                type="text"
                name="Fname"
                value={form.Fname}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Last Name</label>
              <input
                type="text"
                name="Lname"
                value={form.Lname}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Gender</label>
              <input
                type="text"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">
              {isFaculty ? 'Area of Expertise' : 'Subjects'}
            </label>
            <select
              name={isFaculty ? 'Expertise' : 'Subjects'}
              value={isFaculty ? form.Expertise : form.Subjects}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Finish Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
