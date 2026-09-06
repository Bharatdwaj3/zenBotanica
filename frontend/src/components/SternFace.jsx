const SternFace = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto mb-6">
    <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="4" className="text-foreground/20" />
    <path d="M 65 88 L 85 92" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground/60" />
    <path d="M 115 92 L 135 88" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground/60" />
    <circle cx="75" cy="98" r="5" fill="currentColor" className="text-primary" />
    <circle cx="125" cy="98" r="5" fill="currentColor" className="text-primary" />
    <path d="M 78 132 L 122 132" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground/60" />
  </svg>
);
export default SternFace;
