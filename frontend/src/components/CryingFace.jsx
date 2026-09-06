const CryingFace = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto mb-6">
    <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="4" className="text-foreground/20" />
    <path d="M 65 90 Q 75 82 85 90" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground/60" />
    <path d="M 115 90 Q 125 82 135 90" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground/60" />
    <path d="M 75 135 Q 100 115 125 135" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground/60" />
    <path d="M 70 98 Q 66 110 70 122 Q 74 110 70 98 Z" fill="currentColor" className="text-primary" />
    <path d="M 130 98 Q 126 110 130 122 Q 134 110 130 98 Z" fill="currentColor" className="text-primary" />
  </svg>
);
export default CryingFace;
