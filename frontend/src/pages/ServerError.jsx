import ErrorScreen from '../components/ErrorScreen';

const DizzyFace = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto mb-6">
    <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="4" className="text-foreground/20" />
    <path d="M 68 84 L 82 96 M 82 84 L 68 96" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-primary" />
    <path d="M 118 84 L 132 96 M 132 84 L 118 96" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-primary" />
    <path d="M 78 132 Q 100 122 122 132" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground/60" />
  </svg>
);

export default function ServerError() {
  return (
    <ErrorScreen
      icon={<DizzyFace />}
      code="500"
      title="Something broke on our end."
      message="This wasn't your fault — our server ran into a problem. We're on it. Try refreshing in a bit."
    />
  );
}
