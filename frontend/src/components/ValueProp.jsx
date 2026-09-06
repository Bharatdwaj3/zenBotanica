const STEPS = [
  {
    number: '01',
    title: 'Scan & Borrow',
    description: 'Pick up physical copies on campus or instantly unlock e-books.',
  },
  {
    number: '02',
    title: 'Read & Renew',
    description: 'Seamless in-browser reading, with a one-click renewal before your due date.',
  },
  {
    number: '03',
    title: 'Auto Reminders',
    description: 'Get notified before the due date, so late fines never sneak up on you.',
  },
];

export const ValueProp = () => (
  <section className="py-24 text-center container mx-auto px-6">
    <h2 className="font-display text-5xl tracking-wide mb-4">How It Works</h2>
    <h3 className="font-accent text-primary text-2xl font-semibold mb-6">
      &ldquo;One library card, every format.&rdquo;
    </h3>
    <p className="max-w-2xl mx-auto text-lg text-foreground/60 mb-16">
      Borrow physical books from the shelf, or read digital copies straight in your browser.
      We&apos;ll even remind you before something&apos;s due.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
      {STEPS.map((step) => (
        <div
          key={step.number}
          className="bg-card p-6 rounded-2xl border border-border space-y-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
        >
          <span className="text-xs font-black text-primary">{step.number}</span>
          <h4 className="font-display text-xl tracking-wide text-foreground">{step.title}</h4>
          <p className="text-sm text-foreground/50 leading-relaxed">{step.description}</p>
        </div>
      ))}
    </div>
  </section>
);
