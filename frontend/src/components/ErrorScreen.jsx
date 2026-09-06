import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ErrorScreen({ icon, code, title, message, actionLabel = 'Back to Home', actionTo = '/' }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {icon}

        {code && <h1 className="text-6xl font-black tracking-tight mb-3">{code}</h1>}
        <p className="text-lg font-semibold text-foreground/80 mb-2">{title}</p>
        <p className="text-sm text-foreground/50 mb-8">{message}</p>

        <Link
          to={actionTo}
          className="btn-primary"
        >
          {actionLabel}
        </Link>
      </motion.div>
    </div>
  );
}
