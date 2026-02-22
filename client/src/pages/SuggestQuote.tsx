import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import skullImage from "@assets/skull_minimal.png";

export default function SuggestQuote() {
  const [, setLocation] = useLocation();
  const [type, setType] = useState('');
  const [author, setAuthor] = useState('');
  const [place, setPlace] = useState('');
  const [quote, setQuote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const typeOptions = ['Stoic Peace', 'Religious Peace', 'Existentialist Peace', 'Literary Peace'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !author || !place || !quote) return;

    const subject = encodeURIComponent('Quote Suggestion — Memento Mori App');
    const body = encodeURIComponent(
      `Type of Peace: ${type}\nAuthor: ${author}\nSource / Place: ${place}\n\nQuote:\n"${quote}"`
    );

    setSubmitted(true);

    setTimeout(() => {
      window.open(`mailto:eric@legiounius.com?subject=${subject}&body=${body}`, '_blank');
    }, 500);

    setTimeout(() => {
      setLocation('/peace');
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative">
      <header className="w-full max-w-[900px] mx-auto pt-4 pb-1 px-4 md:px-8 text-center flex flex-col items-center space-y-1 relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          <div className="flex items-center gap-1.5 justify-center" style={{ paddingLeft: '0.35em' }}>
            <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Live</span>
            <img src={skullImage} alt="Memento Mori" className="w-[30px] h-[30px] object-contain" data-testid="img-skull-header" />
            <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Aware</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mt-0.5">
            Memento Mori
          </h1>
          <Link href="/peace" className="mt-2 text-[11px] font-bold text-foreground/70 hover:text-foreground transition-colors tracking-widest uppercase underline underline-offset-2 decoration-foreground/30 hover:decoration-foreground/60" data-testid="link-back-to-peace">
            Back To Wisdom
          </Link>
        </motion.div>
      </header>

      <main className="w-full max-w-[500px] mx-auto px-4 md:px-8 mt-8 flex-1">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <p className="text-sm text-foreground font-bold tracking-wide" data-testid="text-thank-you">
              Thank you! We will consider your quote for inclusion into the database.
            </p>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
              Returning to wisdom...
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-5"
            data-testid="form-suggest-quote"
          >
            <h2 className="text-sm font-bold tracking-widest uppercase text-center text-foreground/80">
              Suggest A Quote
            </h2>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground" htmlFor="type">
                Type of Peace
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="w-full bg-background border border-foreground/20 rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                data-testid="select-quote-type"
              >
                <option value="">Select a category...</option>
                {typeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground" htmlFor="author">
                Author
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                placeholder="e.g. Marcus Aurelius"
                className="w-full bg-background border border-foreground/20 rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/50 transition-colors"
                data-testid="input-quote-author"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground" htmlFor="place">
                Source / Place
              </label>
              <input
                id="place"
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                required
                placeholder="e.g. Meditations, Book IV"
                className="w-full bg-background border border-foreground/20 rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/50 transition-colors"
                data-testid="input-quote-place"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground" htmlFor="quote">
                Quote
              </label>
              <textarea
                id="quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                required
                rows={4}
                placeholder="Enter the quote text..."
                className="w-full bg-background border border-foreground/20 rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/50 transition-colors resize-none"
                data-testid="input-quote-text"
              />
            </div>

            <button
              type="submit"
              disabled={sending || !type || !author || !place || !quote}
              className="w-full border border-foreground/30 hover:border-foreground/60 rounded px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase text-foreground/70 hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="button-submit-quote"
            >
              {sending ? 'Sending...' : 'Submit Suggestion'}
            </button>
          </motion.form>
        )}
      </main>

      <footer className="w-full max-w-[900px] mx-auto px-4 md:px-8 py-6 mt-auto">
        <div className="border-t border-border/30 pt-4 flex justify-center gap-4 text-[9px] text-muted-foreground/50">
          <Link href="/" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-home">Home</Link>
          <Link href="/philosophy" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-philosophy">The Philosophy</Link>
          <Link href="/privacy" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-privacy">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-terms">Terms of Use</Link>
          <a href="mailto:eric@legiounius.com" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}
