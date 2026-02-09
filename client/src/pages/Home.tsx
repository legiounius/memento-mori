import { useState, useEffect } from "react";
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

const STORAGE_KEY = "memento-birthdate";
const AGE_STORAGE_KEY = "memento-target-age";
const EVENTS_STORAGE_KEY = "memento-events";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
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

  const ages = Array.from({ length: 41 }, (_, i) => 60 + i);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full max-w-4xl mx-auto pt-4 pb-3 px-6 text-center flex flex-col items-center space-y-2">
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
           <img src={skullImage} alt="Memento Mori" className="w-12 h-12 object-contain" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-0.5"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
            Memento Mori
          </h1>
          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            Live Accordingly
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full flex justify-center pt-2"
        >
          <div className="flex flex-col items-center gap-1.5 w-full max-w-md">
            <DatePicker date={birthdate} setDate={setBirthdate} />
            <p className="text-[10px] text-muted-foreground text-center inline-flex items-center gap-1 flex-wrap justify-center">
              <span>Enter your birthdate to visualize your life in weeks until age</span>
              <Select
                value={String(targetAge)}
                onValueChange={(v) => setTargetAge(parseInt(v))}
              >
                <SelectTrigger
                  data-testid="select-target-age"
                  className="inline-flex w-[52px] h-5 text-[10px] px-1.5 border border-primary/10"
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
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full flex justify-center pt-3"
        >
          <EventForm onAdd={handleAddEvent} />
        </motion.div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full flex-1 pb-20 px-4"
      >
        <LifeGrid birthdate={birthdate} targetAge={targetAge} events={events} />

        {events.length > 0 && (
          <div className="w-full max-w-[960px] mx-auto px-4 md:px-8 mt-8">
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-widest border-b border-border pb-2 mb-3 text-center">
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
                      <Star className="w-3 h-3 text-black fill-black dark:text-white dark:fill-white shrink-0" />
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
            className="font-mono text-xs uppercase tracking-widest"
          >
            <Printer className="w-3.5 h-3.5 mr-2" />
            Print Dot Matrix
          </Button>
        </div>
      </motion.main>
    </div>
  );
}
