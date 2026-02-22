import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import skullImage from "@assets/skull_minimal.png";

interface PeaceEntry {
  type: string;
  author: string;
  source: string;
  text: string;
}

function parseCSV(csv: string): PeaceEntry[] {
  const entries: PeaceEntry[] = [];
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let fields: string[] = [];

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"' && csv[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else if (ch === '\n' || (ch === '\r' && csv[i + 1] === '\n')) {
        if (ch === '\r') i++;
        fields.push(current);
        current = '';
        rows.push(fields);
        fields = [];
      } else {
        current += ch;
      }
    }
  }
  if (current || fields.length > 0) {
    fields.push(current);
    rows.push(fields);
  }

  const headers = rows[0]?.map(h => h.trim().toLowerCase()) || [];
  const typeIdx = headers.indexOf('type');
  const authorIdx = headers.indexOf('author');
  const sourceIdx = headers.indexOf('source');
  const textIdx = headers.indexOf('text');

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const text = textIdx >= 0 ? row[textIdx]?.trim() : '';
    if (!text) continue;
    entries.push({
      type: typeIdx >= 0 ? row[typeIdx]?.trim() || '' : '',
      author: authorIdx >= 0 ? row[authorIdx]?.trim() || '' : '',
      source: sourceIdx >= 0 ? row[sourceIdx]?.trim() || '' : '',
      text,
    });
  }
  return entries;
}

const QUOTES = [
  "You could leave life right now. Let that determine what you do and say and think. — Marcus Aurelius",
  "Let us prepare our minds as if we'd come to the very end of life. — Seneca",
  "It is not that we have a short time to live, but that we waste a great deal of it. — Seneca",
  "Think of yourself as dead. You have lived your life. Now, take what's left and live it properly. — Marcus Aurelius",
  "The whole future lies in uncertainty: live immediately. — Seneca",
  "He who fears death will never do anything worthy of a man who is alive. — Seneca",
  "Begin at once to live, and count each separate day as a separate life. — Seneca",
  "No man can have a peaceful life who thinks too much about lengthening it. — Seneca",
  "We are dying every day. — Seneca",
  "The soul that is not prepared today is even less so tomorrow. — Ovid",
  "Do not act as if you had ten thousand years to throw away. — Marcus Aurelius",
  "While we wait for life, life passes. — Seneca",
  "Death smiles at us all; all we can do is smile back. — Marcus Aurelius",
  "Life is long, if you know how to use it. — Seneca",
  "If you live each day as if it were your last, someday you'll be right. — Marcus Aurelius",
  "It is not death that a man should fear, but rather he should fear never beginning to live. — Marcus Aurelius",
  "Time discovers truth. — Seneca",
  "As is a tale, so is life: not how long it is, but how good it is, is what matters. — Seneca",
  "When a man has made peace with mortality, he can get on with the business of living. — Epictetus",
  "Let each thing you would do, say, or intend, be like that of a dying person. — Marcus Aurelius",
  "No one is so old that he does not think he could live another year. — Cicero",
  "The art of living well and dying well are one. — Epicurus",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. — Seneca",
  "Every man dies. Not every man truly lives. — Seneca",
  "The hour which gives us life begins to take it away. — Seneca",
];

export default function FindPeace() {
  const randomQuote = useMemo(() => {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }, []);

  const [entries, setEntries] = useState<PeaceEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<PeaceEntry | null>(null);
  const [passageKey, setPassageKey] = useState(0);

  useEffect(() => {
    fetch('/peace_archive.csv')
      .then(r => r.text())
      .then(csv => setEntries(parseCSV(csv)))
      .catch(() => {});
  }, []);

  const handleFindPeace = useCallback((type: string) => {
    const filtered = entries.filter(e => e.type === type);
    if (filtered.length === 0) return;
    let entry;
    do {
      entry = filtered[Math.floor(Math.random() * filtered.length)];
    } while (entry.source === currentEntry?.source && entry.text === currentEntry?.text && filtered.length > 1);
    setCurrentEntry(entry);
    setPassageKey(k => k + 1);
  }, [entries, currentEntry]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative">
      <div
        className="absolute left-0 w-full pointer-events-none select-none"
        style={{ top: '38px', height: '60px', opacity: 0.06, overflow: 'hidden' }}
        data-testid="gravestone-banner"
      >
        <svg
          width="100%"
          height="60"
          preserveAspectRatio="none"
          viewBox="0 0 1200 60"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          style={{ minWidth: '100%' }}
        >
          <defs>
            <pattern id="gravestones-peace" x="0" y="0" width="200" height="60" patternUnits="userSpaceOnUse">
              <rect x="4" y="26" width="32" height="34" fill="currentColor" />
              <path d="M4 26 Q4 10 20 10 Q36 10 36 26" fill="currentColor" />
              <rect x="46" y="22" width="30" height="38" fill="currentColor" />
              <rect x="57" y="6" width="8" height="20" fill="currentColor" />
              <rect x="50" y="12" width="22" height="6" fill="currentColor" />
              <rect x="86" y="16" width="34" height="44" fill="currentColor" />
              <path d="M86 16 Q86 0 103 0 Q120 0 120 16" fill="currentColor" />
              <rect x="130" y="32" width="26" height="28" fill="currentColor" />
              <path d="M130 32 Q130 20 143 20 Q156 20 156 32" fill="currentColor" />
              <rect x="166" y="28" width="28" height="32" fill="currentColor" />
              <rect x="176" y="14" width="8" height="18" fill="currentColor" />
              <rect x="170" y="18" width="20" height="6" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="1200" height="60" fill="url(#gravestones-peace)" />
        </svg>
      </div>

      <header className="w-full max-w-[900px] mx-auto pt-4 pb-1 px-4 md:px-8 text-center flex flex-col items-center space-y-1 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          <p className="text-muted-foreground text-[11px] italic leading-relaxed text-center" data-testid="text-quote">
            "{randomQuote}"
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center w-full relative"
        >
          <Link href="/" className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground/60 hover:text-foreground transition-colors tracking-wider uppercase" data-testid="link-back-to-life">Back To Life</Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Memento Mori
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5 justify-center" style={{ paddingLeft: '0.35em' }}>
            <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Live</span>
            <img
              src={skullImage}
              alt="Memento Mori"
              className="w-[30px] h-[30px] object-contain"
              data-testid="img-skull-header"
            />
            <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Aware</span>
          </div>
        </motion.div>
      </header>

      <motion.main
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="w-full max-w-[600px] mx-auto px-4 md:px-8 flex-1 flex flex-col items-center"
      >
        <div className="text-center w-full pt-6">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => handleFindPeace('Stoic Peace')}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              data-testid="button-stoic-peace"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/60 group-hover:text-foreground transition-colors">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/60 group-hover:text-foreground transition-colors">Stoic Peace</span>
            </button>

            <button
              onClick={() => handleFindPeace('Religious Peace')}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              data-testid="button-religious-peace"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/60 group-hover:text-foreground transition-colors">
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="6" y1="8" x2="18" y2="8" />
              </svg>
              <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/60 group-hover:text-foreground transition-colors">Religious Peace</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {currentEntry && (
              <motion.div
                key={passageKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mt-8 text-center"
                data-testid="passage-container"
              >
                <p className="text-sm leading-relaxed text-foreground/80 italic max-w-lg mx-auto" data-testid="text-passage-content">
                  "{currentEntry.text}"
                </p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50 mt-4" data-testid="text-passage-ref">
                  — {currentEntry.author}, {currentEntry.source} —
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>

      <div className="fixed bottom-2 left-3 text-[9px] text-muted-foreground/50 select-none" data-testid="text-copyright">
        Copyright Legio Unius MMXXVI
      </div>

      <div
        className="absolute left-0 w-full pointer-events-none select-none"
        style={{ bottom: '0', height: '60px', opacity: 0.06, overflow: 'hidden' }}
        data-testid="gravestone-banner-bottom"
      >
        <svg
          width="100%"
          height="60"
          preserveAspectRatio="none"
          viewBox="0 0 1200 60"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          style={{ minWidth: '100%' }}
        >
          <defs>
            <pattern id="gravestones-peace-bottom" x="0" y="0" width="200" height="60" patternUnits="userSpaceOnUse">
              <rect x="4" y="26" width="32" height="34" fill="currentColor" />
              <path d="M4 26 Q4 10 20 10 Q36 10 36 26" fill="currentColor" />
              <rect x="46" y="22" width="30" height="38" fill="currentColor" />
              <rect x="57" y="6" width="8" height="20" fill="currentColor" />
              <rect x="50" y="12" width="22" height="6" fill="currentColor" />
              <rect x="86" y="16" width="34" height="44" fill="currentColor" />
              <path d="M86 16 Q86 0 103 0 Q120 0 120 16" fill="currentColor" />
              <rect x="130" y="32" width="26" height="28" fill="currentColor" />
              <path d="M130 32 Q130 20 143 20 Q156 20 156 32" fill="currentColor" />
              <rect x="166" y="28" width="28" height="32" fill="currentColor" />
              <rect x="176" y="14" width="8" height="18" fill="currentColor" />
              <rect x="170" y="18" width="20" height="6" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="1200" height="60" fill="url(#gravestones-peace-bottom)" />
        </svg>
      </div>
    </div>
  );
}
