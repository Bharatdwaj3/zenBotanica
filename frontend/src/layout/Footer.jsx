import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto overflow-hidden">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <h3 className="font-display text-3xl tracking-wide text-foreground hover:text-primary transition-colors">
                HonKhana
              </h3>
            </Link>
            <p className="mt-4 text-foreground/50 text-sm max-w-xs">
              Your digital and walk-in library.<br />
              Borrow, read, and renew — all in one place.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">
              Library
            </h4>
            <ul className="space-y-3 text-foreground/50 text-sm">
              <li><Link to="/explore" className="hover:text-primary transition-colors">Explore Books</Link></li>
              <li><Link to="/my-loans" className="hover:text-primary transition-colors">My Loans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">
              Account
            </h4>
            <ul className="space-y-3 text-foreground/50 text-sm">
              <li><Link to="/login" className="hover:text-primary transition-colors">Log In</Link></li>
              <li><Link to="/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">
              Support
            </h4>
            <ul className="space-y-3 text-foreground/50 text-sm">
              <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Community</Link></li>
              <li className="pt-2">
                <Link to="/coming-soon" className="hover:text-primary transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/coming-soon" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">
              Contact
            </h4>
            <ul className="space-y-3 text-foreground/50 text-sm">
              <li>support@honkhana.app</li>
              <li>+1 555 010 0123</li>
              <li>0800-HONKHANA</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-sm text-foreground/50">
            <p>HonKhana HQ, 42 Willow Campus Drive, Springfield</p>
            <p className="mt-1">© {currentYear} HonKhana. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/coming-soon"
              aria-label="Twitter"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-foreground/10 text-foreground/70 hover:bg-primary hover:text-white transition-colors"
            >
              <Twitter size={16} strokeWidth={2} />
            </Link>
            <Link
              to="/coming-soon"
              aria-label="Instagram"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-foreground/10 text-foreground/70 hover:bg-primary hover:text-white transition-colors"
            >
              <Instagram size={16} strokeWidth={2} />
            </Link>
            <Link
              to="/coming-soon"
              aria-label="GitHub"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-foreground/10 text-foreground/70 hover:bg-primary hover:text-white transition-colors"
            >
              <Github size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>

      <div className="select-none pointer-events-none -mt-4 md:-mt-8">
        <p className="text-center font-black uppercase tracking-tighter text-foreground/5 leading-none text-[18vw] md:text-[14vw] whitespace-nowrap">
          HonKhana
        </p>
      </div>
    </footer>
  );
};

export default Footer;
