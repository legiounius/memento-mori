import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { LifeGrid } from "@/components/LifeGrid";
import { DatePicker } from "@/components/DatePicker";
import { EventForm, type LifeEvent, EVENT_TYPES } from "@/components/EventForm";
import { motion } from "framer-motion";
import skullImage from "@assets/skull_minimal.png";
import { Button } from "@/components/ui/button";
import { Trash2, Printer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STORAGE_KEY = "memento-birthdate";
const AGE_STORAGE_KEY = "memento-target-age";
const EVENTS_STORAGE_KEY = "memento-events";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatDateFull(date: Date) {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function Home() {
  const [birthdate, setBirthdate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = new Date(saved);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return undefined;
  });

  const [editingBirthdate, setEditingBirthdate] = useState(false);
  const [editingTargetAge, setEditingTargetAge] = useState(false);
  const [splashBirthdate, setSplashBirthdate] = useState<Date | undefined>(undefined);

  const [targetAge, setTargetAge] = useState<number>(() => {
    const saved = localStorage.getItem(AGE_STORAGE_KEY);
    return saved ? parseInt(saved) : 80;
  });

  const [events, setEvents] = useState<LifeEvent[]>(() => {
    const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  const randomQuote = useMemo(() => {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }, []);

  useEffect(() => {
    if (birthdate) {
      localStorage.setItem(STORAGE_KEY, birthdate.toISOString());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [birthdate]);

  useEffect(() => {
    localStorage.setItem(AGE_STORAGE_KEY, String(targetAge));
  }, [targetAge]);

  useEffect(() => {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const handleAddEvent = (event: LifeEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleBirthdateSet = (date: Date | undefined) => {
    setBirthdate(date);
  };

  const ages = Array.from({ length: 41 }, (_, i) => 60 + i);

  if (!birthdate) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center space-y-6 max-w-md w-full">
          <motion.img
            src={skullImage}
            alt="Memento Mori"
            className="w-24 h-24 object-contain"
            data-testid="img-skull-splash"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          <motion.h1
            className="text-4xl md:text-5xl font-bold text-foreground tracking-tight text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 2, ease: "easeOut" }}
          >
            Memento Mori
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 1.5, ease: "easeOut" }}
            className="w-full border-t border-border pt-6 flex flex-col items-center space-y-6"
          >
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                When were you born?
              </p>
              <div className="flex justify-center w-full">
                <DatePicker date={splashBirthdate} setDate={setSplashBirthdate} />
              </div>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <p className="text-sm text-muted-foreground text-center inline-flex items-center gap-1.5 flex-wrap justify-center">
                <span>I expect to live to</span>
                <Select
                  value={String(targetAge)}
                  onValueChange={(v) => setTargetAge(parseInt(v))}
                >
                  <SelectTrigger
                    data-testid="select-target-age-splash"
                    className="inline-flex w-[56px] h-6 text-sm px-1.5 border border-primary/10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ages.map((a) => (
                      <SelectItem key={a} value={String(a)} data-testid={`option-age-splash-${a}`}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </p>
            </div>
            {splashBirthdate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Button
                  variant="outline"
                  data-testid="button-start-to-live"
                  onClick={() => handleBirthdateSet(splashBirthdate)}
                  className="text-sm font-bold uppercase tracking-widest px-8"
                >
                  Start To Live
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

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
            <pattern id="gravestones" x="0" y="0" width="200" height="60" patternUnits="userSpaceOnUse">
              {/* Wide rounded gravestone */}
              <rect x="4" y="26" width="32" height="34" fill="currentColor" />
              <path d="M4 26 Q4 10 20 10 Q36 10 36 26" fill="currentColor" />

              {/* Wide cross-topped gravestone */}
              <rect x="46" y="22" width="30" height="38" fill="currentColor" />
              <rect x="57" y="6" width="8" height="20" fill="currentColor" />
              <rect x="50" y="12" width="22" height="6" fill="currentColor" />

              {/* Large rounded gravestone */}
              <rect x="86" y="16" width="34" height="44" fill="currentColor" />
              <path d="M86 16 Q86 0 103 0 Q120 0 120 16" fill="currentColor" />

              {/* Small wide rounded gravestone */}
              <rect x="130" y="32" width="26" height="28" fill="currentColor" />
              <path d="M130 32 Q130 20 143 20 Q156 20 156 32" fill="currentColor" />

              {/* Wide cross-topped short gravestone */}
              <rect x="166" y="28" width="28" height="32" fill="currentColor" />
              <rect x="176" y="14" width="8" height="18" fill="currentColor" />
              <rect x="170" y="18" width="20" height="6" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="1200" height="60" fill="url(#gravestones)" />
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
          <Link href="/peace" className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-bold text-muted-foreground/60 hover:text-foreground transition-colors tracking-wider uppercase" data-testid="link-find-peace">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
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
            Find Peace
          </Link>
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

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full flex justify-center pt-0"
        >
          <div className="flex flex-col items-center gap-1 w-full max-w-md">
            {editingBirthdate && (
              <div className="flex flex-col items-center gap-2">
                <DatePicker date={birthdate} setDate={handleBirthdateSet} />
                {birthdate && (
                  <button
                    onClick={() => setEditingBirthdate(false)}
                    className="text-xs text-muted-foreground underline underline-offset-2 decoration-muted-foreground/40"
                    data-testid="button-done-birthdate"
                  >
                    done
                  </button>
                )}
              </div>
            )}
            {editingTargetAge && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-foreground">Months to age</span>
                <Select
                  value={String(targetAge)}
                  onValueChange={(v) => {
                    setTargetAge(parseInt(v));
                    setEditingTargetAge(false);
                  }}
                >
                  <SelectTrigger
                    data-testid="select-target-age"
                    className="inline-flex w-[56px] h-6 text-[11px] px-1.5 border border-primary/10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ages.map((a) => (
                      <SelectItem key={a} value={String(a)} data-testid={`option-age-${a}`}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </motion.div>

      </header>

      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full flex-1 pb-20 px-4"
      >
        <LifeGrid
          birthdate={birthdate}
          targetAge={targetAge}
          events={events}
          bornLabel={birthdate ? formatDateFull(birthdate) : undefined}
          deadLabel={birthdate ? (() => {
            const d = new Date(birthdate);
            d.setFullYear(d.getFullYear() + targetAge);
            return formatDateFull(d);
          })() : undefined}
        />

        <div className="w-full max-w-[900px] mx-auto px-4 md:px-8 mt-4">
          <EventForm onAdd={handleAddEvent} />
        </div>

        {events.length > 0 && (
          <div className="w-full max-w-[960px] mx-auto px-4 md:px-8 mt-8">
            <h2 className="text-sm text-muted-foreground uppercase tracking-widest border-b border-border pb-2 mb-3 text-center">
              Key Events of My Life
            </h2>
            <div className="space-y-1">
              {events.map((event) => {
                let weekInfo = "";
                if (birthdate) {
                  const eventDate = new Date(event.date);
                  const diffMs = eventDate.getTime() - birthdate.getTime();
                  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
                  if (diffWeeks >= 0) {
                    const yearNum = Math.floor(diffWeeks / 52);
                    const weekNum = (diffWeeks % 52) + 1;
                    weekInfo = `Year ${yearNum}, Week ${weekNum}`;
                  }
                }
                return (
                  <div
                    key={event.id}
                    data-testid={`event-row-${event.id}`}
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded-md bg-muted/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {(() => {
                        const evtColor = EVENT_TYPES.find(t => t.value === event.type)?.color || '#2563eb';
                        return <span className="inline-block w-[12px] h-[12px] rounded-full shrink-0" style={{ backgroundColor: evtColor }} />;
                      })()}
                      <span className="text-sm font-medium truncate" data-testid={`event-label-${event.id}`}>
                        {event.label}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDate(event.date)}
                      </span>
                      {weekInfo && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          ({weekInfo})
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-remove-event-${event.id}`}
                      onClick={() => handleRemoveEvent(event.id)}
                      className="text-muted-foreground shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="w-full max-w-[960px] mx-auto px-4 md:px-8 mt-8 flex justify-center print:hidden">
          <Button
            variant="outline"
            data-testid="button-print"
            onClick={() => window.print()}
            className="text-xs uppercase tracking-widest"
          >
            <Printer className="w-3.5 h-3.5 mr-2" />
            Print Life Chart
          </Button>
        </div>
        <div className="w-full max-w-[960px] mx-auto px-4 md:px-8 mt-4 flex justify-center gap-6 print:hidden">
          <button
            onClick={() => setEditingBirthdate(true)}
            className="text-xs text-muted-foreground underline underline-offset-2 decoration-muted-foreground/40"
            data-testid="link-change-birthday"
          >
            Change Birthday
          </button>
          <button
            onClick={() => setEditingTargetAge(true)}
            className="text-xs text-muted-foreground underline underline-offset-2 decoration-muted-foreground/40"
            data-testid="link-change-age-of-death"
          >
            Change Age Of Death
          </button>
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
            <pattern id="gravestones-bottom" x="0" y="0" width="200" height="60" patternUnits="userSpaceOnUse">
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
          <rect width="1200" height="60" fill="url(#gravestones-bottom)" />
        </svg>
      </div>
    </div>
  );
}
