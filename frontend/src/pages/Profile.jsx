import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Mail, Calendar, Leaf, GraduationCap } from 'lucide-react';
import { fetchUser } from '../store/avatarSlice';
import { useTendings } from '../hooks/useTendings';
import StatCard from '../components/StatCard';
import TendingsSection from '../features/TendingsSection';
import SpecimensSection from '../features/SpecimensSection';

const getProfile = (user) => user?.masters || user?.apprentice || null;
const getDisplayName = (user) => {
  const profile = getProfile(user);
  if (profile) return `${profile.Fname} ${profile.Lname}`;
  if (user?.role === 'curator') return 'System Administrator';
  return user?.email || 'User';
};

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.avatar);
  const [section, setSection] = useState('tendings');

  useEffect(() => {
    if (!user) dispatch(fetchUser());
  }, [user, dispatch]);

  const isAdmin = user?.role === 'curator';
  const tendingsState = useTendings(isAdmin);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const profile = getProfile(user);
  const isMasters = Boolean(user.masters);
  const activeTendingCount = tendingsState.tendings.filter((tending) => !tending.returnedAt).length;
  const overdueCount = tendingsState.tendings.filter(tendingsState.isOverdue).length;

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-4 ring-background font-bold text-2xl text-primary flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={getDisplayName(user)} className="w-full h-full rounded-full object-cover" />
              ) : (
                getDisplayName(user)[0]?.toUpperCase()
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl tracking-wide">{getDisplayName(user)}</h1>
              <span className="inline-block mt-1 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-full capitalize">
                {user.role}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-border pt-4 text-sm text-foreground/70">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-foreground/40" />
              {user.email}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-foreground/40" />
              Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            {profile && (
              <div className="flex items-center gap-2">
                {isMasters ? <GraduationCap size={16} className="text-foreground/40" /> : <Leaf size={16} className="text-foreground/40" />}
                {(isMasters ? profile.Expertise : profile.Subjects)?.replace(/_/g, ' ')}
              </div>
            )}
          </div>

          {!isAdmin && !tendingsState.loading && (
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 mt-4">
              <StatCard label="Active Tendings" value={activeTendingCount} />
              <StatCard label="Overdue" value={overdueCount} danger={overdueCount > 0} />
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {isAdmin ? (
            <>
              <button
                onClick={() => setSection('tendings')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  section === 'tendings' ? 'bg-primary text-white border border-primary' : 'bg-card border border-border text-foreground/60 hover:border-primary'
                }`}
              >
                <Leaf size={16} /> System Tendings
              </button>
              <button
                onClick={() => setSection('specimens')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  section === 'specimens' ? 'bg-primary text-white border border-primary' : 'bg-card border border-border text-foreground/60 hover:border-primary'
                }`}
              >
                <Grove size={16} /> Specimens
              </button>
            </>
          ) : (
            <h2 className="font-display text-lg tracking-wide">My Grove Activity</h2>
          )}
        </div>

        {section === 'tendings' && <TendingsSection isAdmin={isAdmin} {...tendingsState} />}

        {section === 'specimens' && isAdmin && <SpecimensSection />}
      </div>
    </div>
  );
}
