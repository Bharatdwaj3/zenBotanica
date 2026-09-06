import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';

const STACK_CONFIG = [
  { rotate: -10, translateY: 28, z: 10, widthClass: 'w-28 sm:w-32', heightClass: 'h-80 sm:h-96', marginClass: '' },
  { rotate: 0, translateY: 0, z: 30, widthClass: 'w-36 sm:w-40', heightClass: 'h-96 sm:h-[28rem] xl:h-[32rem]', marginClass: '-ml-8' },
  { rotate: 10, translateY: 28, z: 10, widthClass: 'w-28 sm:w-32', heightClass: 'h-80 sm:h-96', marginClass: '-ml-8' },
];

const SpineCover = ({ book, config }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: config.translateY }}
    transition={{ duration: 0.9, delay: 0.2 }}
    style={{ transform: `rotate(${config.rotate}deg)`, zIndex: config.z }}
    className={`relative ${config.widthClass} ${config.heightClass} ${config.marginClass} shrink-0 group`}
  >
    <Link
      to={`/content/${book.id}`}
      className="block w-full h-full rounded-lg overflow-hidden border border-border shadow-2xl hover:scale-105 transition-transform duration-300 relative z-10"
    >
      {book.coverUrl ? (
        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-card flex items-center justify-center">
          <BookOpen size={32} className="text-foreground/10" />
        </div>
      )}
    </Link>

    {/* Floor Ground Shadow */}
    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-6 bg-black/40 blur-lg rounded-[100%] z-0 transform scale-y-50 pointer-events-none" />
  </motion.div>
);

const FloatingTitleCard = ({ book, position, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    className={`hidden xl:block absolute z-40 bg-card border border-border rounded-xl shadow-xl px-4 py-2.5 max-w-[190px] ${position}`}
  >
    <p className="text-sm font-bold text-foreground truncate">{book.title}</p>
    <p className="text-xs text-neutral-500 font-medium truncate">{book.author}</p>
  </motion.div>
);

export const Hero = ({ spotlightBook, floatingBooks = [] }) => {
  const [left, right] = floatingBooks;
  const stackBooks = [left, spotlightBook, right];

  return (
    <header className="relative min-h-screen w-full flex bg-background overflow-x-hidden">

      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[70%] bg-secondary/10 blur-[120px] rounded-full animate-slow-drift" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[60%] bg-primary/8 blur-[100px] rounded-full animate-slow-drift animation-delay-500" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2 }}
        className="w-full lg:w-[35%] lg:min-w-[380px] flex flex-col justify-center px-8 lg:px-16 xl:px-24 z-20 bg-card/50 backdrop-blur-md border-r border-border"
      >
        <div className="inline-flex items-center gap-2 w-fit mb-8 px-4 py-1.5 rounded-full border border-border bg-background/60 text-xs font-semibold text-foreground/60">
          <BookOpen size={13} strokeWidth={2.5} className="text-primary" />
          Your campus library, online and on the shelf
        </div>

        <h1 className="font-display text-6xl lg:text-7xl xl:text-8xl text-foreground mb-6 leading-none tracking-wide select-none">
          HonKhana
        </h1>

        <p className="text-base lg:text-lg text-foreground/60 leading-relaxed mb-10 font-light">
          Your digital and walk-in library, in one place. Borrow physical books,
          read digital copies instantly, and
          <span className="font-accent text-xl text-primary font-bold ml-1">never lose track of a due date again</span>.
        </p>

        <div className="flex flex-wrap items-center gap-4 mb-10">
          <Link
            to="/explore"
            className="btn-primary hover:scale-105"
          >
            Explore the Library
          </Link>

          <Link
            to="/profile"
            className="btn-outline"
          >
            <BookOpen size={14} strokeWidth={2.5} />
            View My Loans
          </Link>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-medium text-foreground/40">
          <Users size={15} strokeWidth={2} />
          Trusted by students & faculty on campus
        </div>
      </motion.div>

      <div className="hidden lg:flex flex-1 relative bg-background items-center justify-center px-12 xl:px-20 py-16 min-h-[36rem]">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

        {/* Ambient Editorial Quotes */}
        <blockquote className="absolute top-12 left-16 max-w-xs text-foreground/20 font-serif italic text-lg leading-snug pointer-events-none select-none">
          “So we beat on, boats against the current, borne back ceaselessly into the past.”
        </blockquote>

        <blockquote className="absolute bottom-12 right-16 max-w-xs text-foreground/15 font-serif italic text-sm text-right pointer-events-none select-none">
          “There is no friend as loyal as a book.”
        </blockquote>

        {spotlightBook && (
          <div className="relative flex items-end z-10">
            {stackBooks.map((book, i) =>
              book ? <SpineCover key={book.id} book={book} config={STACK_CONFIG[i]} /> : null
            )}

            {left && <FloatingTitleCard book={left} position="top-6 -left-24" delay={0.9} />}
            {right && <FloatingTitleCard book={right} position="top-16 -right-24" delay={1.05} />}
          </div>
        )}
      </div>
    </header>
  );
};
