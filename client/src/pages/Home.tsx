import { useState, useEffect, useMemo } from "react";
import { LifeGrid } from "@/components/LifeGrid";
import { DatePicker } from "@/components/DatePicker";
import { EventForm, type LifeEvent } from "@/components/EventForm";
import { motion } from "framer-motion";
import skullImage from "@assets/Screenshot_2026-02-08_at_4.43.31_PM_1770587042191.png";
import { Button } from "@/components/ui/button";
import { Trash2, Printer, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const STORAGE_KEY = "memento-birthdate";
const AGE_STORAGE_KEY = "memento-target-age";
const EVENTS_STORAGE_KEY = "memento-events";
const TRACKED_KEY = "memento-tracked";

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
  return `${MONTHS_FULL[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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

  const { data: trackerData } = useQuery<{ count: number }>({
    queryKey: ['/api/tracker/count'],
  });

  useEffect(() => {
    if (birthdate) {
      localStorage.setItem(STORAGE_KEY, birthdate.toISOString());
      const alreadyTracked = localStorage.getItem(TRACKED_KEY);
      if (!alreadyTracked) {
        localStorage.setItem(TRACKED_KEY, "true");
        apiRequest("POST", "/api/tracker/increment")
          .then(() => queryClient.invalidateQueries({ queryKey: ['/api/tracker/count'] }))
          .catch(() => {});
      }
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

  const showDatePicker = !birthdate || editingBirthdate;

  if (!birthdate) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center space-y-6 max-w-md w-full">
          <motion.img
            src={skullImage}
            alt="Memento Mori"
            className="w-24 h-24 object-contain"
            style={{ mixBlendMode: 'multiply' }}
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
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full max-w-[700px] mx-auto pt-4 pb-3 px-4 md:px-8 text-center flex flex-col items-center space-y-1.5">
        
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
          className="flex items-center gap-2"
        >
          <img
            src={skullImage}
            alt="Memento Mori"
            className="w-10 h-10 object-contain"
            style={{ mixBlendMode: 'multiply' }}
            data-testid="img-skull-header"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Memento Mori
            </h1>
            <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Live Accordingly
            </p>
          </div>
          <img
            src={skullImage}
            alt="Memento Mori"
            className="w-10 h-10 object-contain"
            style={{ mixBlendMode: 'multiply' }}
            data-testid="img-skull-header-right"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full flex justify-center pt-0.5"
        >
          <div className="flex flex-col items-center gap-1.5 w-full max-w-md">
            {showDatePicker ? (
              <div className="flex flex-col items-center gap-2">
                <DatePicker date={birthdate} setDate={handleBirthdateSet} />
                {editingBirthdate && birthdate && (
                  <button
                    onClick={() => setEditingBirthdate(false)}
                    className="text-xs text-muted-foreground underline underline-offset-2 decoration-muted-foreground/40"
                    data-testid="button-done-birthdate"
                  >
                    done
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2" data-testid="birthdate-display">
                <span className="text-sm font-bold text-foreground">
                  Born: {formatDateFull(birthdate)}
                </span>
                <button
                  onClick={() => setEditingBirthdate(true)}
                  className="text-[10px] text-muted-foreground underline underline-offset-2 decoration-muted-foreground/40"
                  data-testid="button-change-birthdate"
                >
                  change
                </button>
              </div>
            )}
            {editingTargetAge ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">Visualizing to age</span>
                <Select
                  value={String(targetAge)}
                  onValueChange={(v) => {
                    setTargetAge(parseInt(v));
                    setEditingTargetAge(false);
                  }}
                >
                  <SelectTrigger
                    data-testid="select-target-age"
                    className="inline-flex w-[56px] h-6 text-sm px-1.5 border border-primary/10"
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
            ) : (
              <div className="flex items-center gap-2" data-testid="target-age-display">
                <span className="text-sm font-bold text-foreground">
                  Visualizing your life in weeks to age {targetAge}
                </span>
                <button
                  onClick={() => setEditingTargetAge(true)}
                  className="text-[10px] text-muted-foreground underline underline-offset-2 decoration-muted-foreground/40"
                  data-testid="button-change-target-age"
                >
                  change
                </button>
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
        <LifeGrid birthdate={birthdate} targetAge={targetAge} events={events} />

        <div className="w-full max-w-[700px] mx-auto px-4 md:px-8 mt-4">
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
                      <Star className="w-4 h-4 shrink-0" style={{ color: '#dc2626', fill: '#dc2626' }} />
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
      </motion.main>

      <div className="fixed bottom-2 left-3 text-[9px] text-muted-foreground/50 select-none" data-testid="text-copyright">
        Copyright Legio Unius MMXXVI
      </div>

      {trackerData && trackerData.count > 0 && (
        <div className="fixed bottom-2 right-3 text-[9px] text-muted-foreground/50 select-none" data-testid="text-tracker-count">
          {trackerData.count.toLocaleString()} {trackerData.count === 1 ? 'soul' : 'souls'} reflecting
        </div>
      )}
    </div>
  );
}
