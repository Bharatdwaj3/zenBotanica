import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Hammer, ArrowLeft } from 'lucide-react';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Hammer size={28} className="text-primary" />
        </div>
        <h1 className="font-display text-3xl tracking-wide mb-3">Coming Soon</h1>
        <p className="text-foreground/60 mb-8">
          This feature is still being worked on. Check back soon!
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </motion.div>
    </main>
  );
}
