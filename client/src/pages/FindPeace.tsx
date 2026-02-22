import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function FindPeace() {
  const [entries, setEntries] = useState<PeaceEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<(PeaceEntry & { idx: number }) | null>(null);
  const [passageKey, setPassageKey] = useState(0);
  const [seenMap, setSeenMap] = useState<Record<string, number[]>>({});
  const [lastType, setLastType] = useState<string | null>(null);
  const [autoLoadType, setAutoLoadType] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('type');
  });
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('peace_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    fetch('/peace_archive.csv')
      .then(r => r.text())
      .then(csv => {
        const parsed = parseCSV(csv);
        setEntries(parsed);
        try {
          const stored = localStorage.getItem('peace_seen');
          if (stored) setSeenMap(JSON.parse(stored));
        } catch {}
      })
      .catch(() => {});
  }, []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    return counts;
  }, [entries]);

  useEffect(() => {
    if (autoLoadType && entries.length > 0) {
      handleFindPeace(autoLoadType);
      setAutoLoadType(null);
    }
  }, [entries, autoLoadType]);

  const uniqueAuthors = useMemo(() => {
    const seen = new Set<string>();
    entries.forEach(e => { if (e.author) seen.add(e.author); });
    return Array.from(seen).sort();
  }, [entries]);

  const isFavorited = currentEntry ? favorites.includes(currentEntry.idx) : false;

  const toggleFavorite = useCallback(() => {
    if (!currentEntry) return;
    const idx = currentEntry.idx;
    let newFavs: number[];
    if (favorites.includes(idx)) {
      newFavs = favorites.filter(f => f !== idx);
    } else {
      newFavs = [...favorites, idx];
    }
    setFavorites(newFavs);
    try { localStorage.setItem('peace_favorites', JSON.stringify(newFavs)); } catch {}
  }, [currentEntry, favorites]);

  const handleShare = useCallback(() => {
    if (!currentEntry) return;
    const text = `"${currentEntry.text}"\n\n— ${currentEntry.author}, ${currentEntry.source}\n\nShared with you by the Memento Mori App\nhttps://todieisto.live`;
    const shareData = { title: 'Memento Mori', text };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      const subject = encodeURIComponent('A quote worth sharing — Memento Mori');
      const body = encodeURIComponent(text);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
    }
  }, [currentEntry]);

  const handleFindPeace = useCallback((type: string) => {
    if (type === 'My Favorites') {
      if (favorites.length === 0 || entries.length === 0) return;
      const pool = favorites.filter(idx => idx < entries.length && entries[idx]).map(idx => ({ ...entries[idx], idx })).filter(e => e.text);
      if (pool.length === 0) return;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setCurrentEntry(pick);
      setLastType(type);
      setPassageKey(k => k + 1);
      return;
    }

    const filtered = entries.map((e, i) => ({ ...e, idx: i })).filter(e => e.type === type);
    if (filtered.length === 0) return;

    let seen = seenMap[type] || [];
    if (seen.length >= filtered.length) seen = [];

    const unseen = filtered.filter(e => !seen.includes(e.idx));
    const pool = unseen.length > 0 ? unseen : filtered;
    const pick = pool[Math.floor(Math.random() * pool.length)];

    const newSeen = [...seen, pick.idx];
    const newMap = { ...seenMap, [type]: newSeen };
    setSeenMap(newMap);
    try { localStorage.setItem('peace_seen', JSON.stringify(newMap)); } catch {}

    setCurrentEntry(pick);
    setLastType(type);
    setPassageKey(k => k + 1);
  }, [entries, seenMap, favorites]);

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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          <div className="flex items-center gap-1.5 justify-center" style={{ paddingLeft: '0.35em' }}>
            <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Live</span>
            <img
              src={skullImage}
              alt="Memento Mori"
              className="w-[30px] h-[30px] object-contain"
              data-testid="img-skull-header"
            />
            <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Aware</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mt-0.5">
            Memento Mori
          </h1>
          <Link href="/" className="mt-2 text-[11px] font-bold text-foreground/70 hover:text-foreground transition-colors tracking-widest uppercase underline underline-offset-2 decoration-foreground/30 hover:decoration-foreground/60" data-testid="link-back-to-life">
            Back To Life
          </Link>
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
              {typeCounts['Stoic Peace'] > 0 && (
                <span className="text-[8px] tracking-wider text-muted-foreground/40 -mt-1" data-testid="text-stoic-count">({typeCounts['Stoic Peace']})</span>
              )}
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
              {typeCounts['Religious Peace'] > 0 && (
                <span className="text-[8px] tracking-wider text-muted-foreground/40 -mt-1" data-testid="text-religious-count">({typeCounts['Religious Peace']})</span>
              )}
            </button>

            <button
              onClick={() => handleFindPeace('Existentialist Peace')}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              data-testid="button-existentialist-peace"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/60 group-hover:text-foreground transition-colors">
                <circle cx="12" cy="8" r="4" />
                <path d="M12 12v6" />
                <path d="M9 22h6" />
              </svg>
              <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/60 group-hover:text-foreground transition-colors">Existentialist Peace</span>
              {typeCounts['Existentialist Peace'] > 0 && (
                <span className="text-[8px] tracking-wider text-muted-foreground/40 -mt-1" data-testid="text-existentialist-count">({typeCounts['Existentialist Peace']})</span>
              )}
            </button>

            <button
              onClick={() => handleFindPeace('Literary Peace')}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              data-testid="button-literary-peace"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/60 group-hover:text-foreground transition-colors">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/60 group-hover:text-foreground transition-colors">Literary Peace</span>
              {typeCounts['Literary Peace'] > 0 && (
                <span className="text-[8px] tracking-wider text-muted-foreground/40 -mt-1" data-testid="text-literary-count">({typeCounts['Literary Peace']})</span>
              )}
            </button>

            {favorites.length > 0 && entries.length > 0 && (
              <button
                onClick={() => handleFindPeace('My Favorites')}
                className="flex flex-col items-center gap-2 group cursor-pointer"
                data-testid="button-my-favorites"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/60 group-hover:text-red-400 transition-colors">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/60 group-hover:text-foreground transition-colors">My Favorites</span>
                <span className="text-[8px] tracking-wider text-muted-foreground/40 -mt-1" data-testid="text-favorites-count">({favorites.length})</span>
              </button>
            )}
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
                <div className="flex items-center justify-center gap-6 mt-6">
                  <button
                    onClick={toggleFavorite}
                    className="group cursor-pointer border border-muted-foreground/20 hover:border-red-400/50 rounded px-4 py-2 flex items-center gap-2 transition-all"
                    data-testid="button-toggle-favorite"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={isFavorited ? "text-red-500" : "text-muted-foreground/50 group-hover:text-red-400 transition-colors"}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground/50 group-hover:text-foreground transition-colors">
                      {isFavorited ? "Saved" : "I Love This"}
                    </span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="group cursor-pointer border border-muted-foreground/20 hover:border-foreground/30 rounded px-4 py-2 flex items-center gap-2 transition-all"
                    data-testid="button-share-quote"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50 group-hover:text-foreground transition-colors">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    <span className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground/50 group-hover:text-foreground transition-colors">Share This Quote</span>
                  </button>
                  {lastType && (
                    <button
                      onClick={() => handleFindPeace(lastType)}
                      className="group cursor-pointer border border-muted-foreground/20 hover:border-foreground/30 rounded px-4 py-2 flex items-center gap-2 transition-all"
                      data-testid="button-give-me-another"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50 group-hover:text-foreground transition-colors">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      <span className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground/50 group-hover:text-foreground transition-colors">Show Me Another</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {uniqueAuthors.length > 0 && (
          <div className="w-full mt-12 mb-8">
            <div className="w-full border-t border-border/30 mb-6" />
            <div className="w-full overflow-hidden" data-testid="text-authors-banner">
              <div className="inline-flex animate-scroll-authors whitespace-nowrap">
                {[0, 1].map(copy => (
                  <span key={copy} className="text-[9px] text-muted-foreground/40 leading-relaxed px-4">
                    {uniqueAuthors.map((author, i) => (
                      <span key={`${copy}-${author}`}>
                        {author}{i < uniqueAuthors.length - 1 && <span className="mx-1.5">&middot;</span>}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[8px] text-muted-foreground/30 text-center mt-4 italic" data-testid="text-disclaimer">
              All sources of wisdom are in the public domain and do not infringe copyright laws
            </p>
          </div>
        )}
      </motion.main>

      <div className="fixed bottom-2 left-3 text-[9px] text-muted-foreground/50 select-none" data-testid="text-copyright">
        Copyright Legio Unius MMXXVI
      </div>

      <a
        href="/peace_archive.csv"
        download="peace_archive.csv"
        className="fixed bottom-2 right-3 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
        title="Download archive"
        data-testid="link-download-csv"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </a>

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

      <footer className="w-full py-4 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 text-[8px] text-foreground">
          <Link href="/philosophy" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-philosophy">The Philosophy</Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-privacy-policy">Privacy Policy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-terms">Terms of Use</Link>
          <span>&middot;</span>
          <a href="mailto:eric@legiounius.com" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}
