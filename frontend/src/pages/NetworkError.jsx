import ErrorScreen from '../components/ErrorScreen';

const PlugFace = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto mb-6">
    <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="4" className="text-foreground/20" />
    <path d="M 65 95 Q 75 87 85 95" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground/60" />
    <path d="M 115 95 Q 125 87 135 95" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground/60" />
    <path d="M 78 132 Q 100 122 122 132" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground/60" />
    <path d="M 40 60 L 55 75 M 40 75 L 55 60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-primary" />
    <path d="M 145 60 L 160 75 M 145 75 L 160 60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-primary" />
  </svg>
);

export default function NetworkError({ onRetry }) {
  return (
    <ErrorScreen
      icon={<PlugFace />}
      code=""
      title="Can't reach the server."
      message="Check your internet connection, or the server might be temporarily down. Try again in a moment."
      actionLabel={onRetry ? 'Try Again' : 'Back to Home'}
      actionTo={onRetry ? undefined : '/'}
    />
  );
}
