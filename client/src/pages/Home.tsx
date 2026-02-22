import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "wouter";
import { LifeGrid } from "@/components/LifeGrid";
import { DatePicker } from "@/components/DatePicker";
import { EventForm, type LifeEvent, EVENT_TYPES } from "@/components/EventForm";
import { GravestoneBanner } from "@/components/GravestoneBanner";
import { motion } from "framer-motion";
import skullImage from "@assets/skull_minimal.png";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { differenceInWeeks, differenceInMonths } from "date-fns";
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

  const isReturningUser = !!birthdate;
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isReturningUser && showSplash) {
      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isReturningUser, showSplash]);

  const [editingBirthdate, setEditingBirthdate] = useState(false);
  const [editingTargetAge, setEditingTargetAge] = useState(false);
  const [splashBirthdate, setSplashBirthdate] = useState<Date | undefined>(undefined);
  const [wisdomOpen, setWisdomOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const wisdomRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (e: MouseEvent) => {
      if (wisdomRef.current && !wisdomRef.current.contains(e.target as Node)) setWisdomOpen(false);
      if (messageRef.current && !messageRef.current.contains(e.target as Node)) setMessageOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const ages = Array.from({ length: 120 }, (_, i) => i + 1);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const weeksRemaining = useMemo(() => {
    if (!birthdate) return 0;
    const targetDate = new Date(birthdate);
    targetDate.setFullYear(targetDate.getFullYear() + targetAge);
    return Math.max(0, differenceInWeeks(targetDate, new Date()));
  }, [birthdate, targetAge]);

  const monthsRemaining = useMemo(() => {
    if (!birthdate) return 0;
    const targetDate = new Date(birthdate);
    targetDate.setFullYear(targetDate.getFullYear() + targetAge);
    return Math.max(0, differenceInMonths(targetDate, new Date()));
  }, [birthdate, targetAge]);

  const weeksLived = useMemo(() => {
    if (!birthdate) return 0;
    return Math.max(0, differenceInWeeks(new Date(), birthdate));
  }, [birthdate]);

  const brandingFooter = `\n\nCreated With\nMemento Mori App — todieisto.live\nLive Aware`;

  const handleShareLife = async () => {
    if (!chartRef.current || !birthdate) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const chartAspect = canvas.width / canvas.height;

      const pdfWidth = 11;
      const pdfHeight = 8.5;
      const margin = 0.3;
      const footerSpace = 0.5;
      const availW = pdfWidth - margin * 2;
      const availH = pdfHeight - margin * 2 - footerSpace;

      const imgW = Math.min(availW, availH * chartAspect);
      const imgH = imgW / chartAspect;
      const offsetX = margin + (availW - imgW) / 2;
      const offsetY = margin + (availH - imgH) / 2;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: 'letter' });

      doc.addImage(imgData, 'PNG', offsetX, offsetY, imgW, imgH);

      const footerY = pdfHeight - footerSpace + 0.15;
      doc.setTextColor(161, 161, 170);
      doc.setFontSize(7);
      doc.text('Memento Mori  •  todieisto.live  •  Remember You Must Die', pdfWidth / 2, footerY, { align: 'center' });
      doc.setFontSize(6);
      doc.text('The Philosophy  •  Privacy Policy  •  Terms of Use  •  Contact: eric@legiounius.com', pdfWidth / 2, footerY + 0.15, { align: 'center' });

      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], 'memento-mori-life-chart.pdf', { type: 'application/pdf' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: 'My Life Chart — Memento Mori',
            text: 'My life visualized.\n\nCreated With\nMemento Mori App — todieisto.live\nLive Aware',
            files: [file],
          });
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            downloadFile(file);
          }
        }
      } else {
        downloadFile(file);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleBeKind = () => {
    const message = `Be kind to me, I only have ${weeksRemaining.toLocaleString()} weeks to live.${brandingFooter}`;
    shareTextMessage('Be Kind To Me — Memento Mori', message);
  };

  const shareTextMessage = async (title: string, message: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: message });
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          await navigator.clipboard.writeText(message);
        }
      }
    } else {
      await navigator.clipboard.writeText(message);
    }
  };

  const handleLetsNotFight = () => {
    const message = `Let's not fight. I only have ${weeksRemaining.toLocaleString()} weeks left to live.${brandingFooter}`;
    shareTextMessage("Let's Not Fight — Memento Mori", message);
  };

  const handleThinkPositive = () => {
    const message = `Think positive. We only have about ${monthsRemaining.toLocaleString()} months left to deal with this sh*t.${brandingFooter}`;
    shareTextMessage('Think Positive — Memento Mori', message);
  };

  const handleBePatient = () => {
    const message = `Be patient. I've been dealing with this sh*t for over ${weeksLived.toLocaleString()} weeks of my life.${brandingFooter}`;
    shareTextMessage('Be Patient — Memento Mori', message);
  };

  const weekendsRemaining = useMemo(() => {
    return Math.floor(weeksRemaining);
  }, [weeksRemaining]);

  const handleHappyHour = () => {
    const message = `Lets have happy hour - I only have about ${weekendsRemaining.toLocaleString()} more weekends until I die.${brandingFooter}`;
    shareTextMessage('Happy Hour — Memento Mori', message);
  };

  const handleNoTime = () => {
    const message = `Sorry, I dont have time for this - I only have about ${monthsRemaining.toLocaleString()} months left in my life.${brandingFooter}`;
    shareTextMessage('No Time For This — Memento Mori', message);
  };

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isReturningUser && showSplash) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
        <motion.img
          src={skullImage}
          alt=""
          className="absolute pointer-events-none select-none object-contain"
          style={{ width: '70vmin', height: '70vmin', maxWidth: '500px', maxHeight: '500px' }}
          data-testid="img-skull-returning"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.06, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-foreground tracking-tight text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        >
          Memento<br />Mori
        </motion.h1>
      </div>
    );
  }

  if (!birthdate) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <motion.img
          src={skullImage}
          alt=""
          className="absolute pointer-events-none select-none object-contain"
          style={{ width: '70vmin', height: '70vmin', maxWidth: '500px', maxHeight: '500px' }}
          data-testid="img-skull-splash"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.06, scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />

        <div className="flex flex-col items-center space-y-6 max-w-md w-full relative z-10">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-foreground tracking-tight text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          >
            Memento<br />Mori
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
            className="mt-2"
          >
            <Link href="/philosophy" className="text-[11px] font-bold text-foreground/50 hover:text-foreground/80 transition-colors tracking-widest uppercase underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/50" data-testid="link-click-to-understand">
              Click To Understand
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
            className="w-full pt-6 flex flex-col items-center space-y-6"
          >
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-foreground/70 text-center">
                When were you born?
              </p>
              <div className="flex justify-center w-full">
                <DatePicker date={splashBirthdate} setDate={setSplashBirthdate} />
              </div>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <p className="text-sm text-foreground/70 text-center inline-flex items-center gap-1.5 flex-wrap justify-center">
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
      <GravestoneBanner position="top" patternId="gravestones" />
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
          <div className="mt-2 flex items-center gap-4">
            <div className="relative" ref={wisdomRef}>
              <button
                onClick={() => { setWisdomOpen(!wisdomOpen); setMessageOpen(false); }}
                className="text-[11px] font-bold text-foreground/70 hover:text-foreground transition-colors tracking-widest uppercase flex items-center gap-1"
                data-testid="dropdown-get-wisdom"
              >
                Get Wisdom
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${wisdomOpen ? 'rotate-180' : ''}`}>
                  <path d="M2 4 L5 7 L8 4" />
                </svg>
              </button>
              {wisdomOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-background border border-foreground/20 rounded shadow-lg py-1 z-50 min-w-[160px]" data-testid="dropdown-wisdom-menu">
                  <button onClick={() => { window.location.href = '/peace?type=Stoic Wisdom'; }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="wisdom-stoic">Stoic</button>
                  <button onClick={() => { window.location.href = '/peace?type=Religious Wisdom'; }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="wisdom-religious">Religious</button>
                  <button onClick={() => { window.location.href = '/peace?type=Existentialist Wisdom'; }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="wisdom-existentialist">Existentialist</button>
                  <button onClick={() => { window.location.href = '/peace?type=Literary Wisdom'; }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="wisdom-literary">Literary</button>
                  <button onClick={() => { window.location.href = '/peace?type=Movie Wisdom'; }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="wisdom-movie">Movie</button>
                </div>
              )}
            </div>
            <div className="relative" ref={messageRef}>
              <button
                onClick={() => { setMessageOpen(!messageOpen); setWisdomOpen(false); }}
                className="text-[11px] font-bold text-foreground/70 hover:text-foreground transition-colors tracking-widest uppercase flex items-center gap-1"
                data-testid="dropdown-send-message"
              >
                Send A Message
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${messageOpen ? 'rotate-180' : ''}`}>
                  <path d="M2 4 L5 7 L8 4" />
                </svg>
              </button>
              {messageOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-background border border-foreground/20 rounded shadow-lg py-1 z-50 min-w-[180px]" data-testid="dropdown-message-menu">
                  <button onClick={() => { handleBeKind(); setMessageOpen(false); }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="message-be-kind">Be Kind To Me...</button>
                  <button onClick={() => { handleLetsNotFight(); setMessageOpen(false); }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="message-lets-not-fight">Lets Not Fight...</button>
                  <button onClick={() => { handleThinkPositive(); setMessageOpen(false); }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="message-think-positive">Think Positive...</button>
                  <button onClick={() => { handleBePatient(); setMessageOpen(false); }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="message-be-patient">Be Patient...</button>
                  <button onClick={() => { handleHappyHour(); setMessageOpen(false); }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="message-happy-hour">Happy Hour...</button>
                  <button onClick={() => { handleNoTime(); setMessageOpen(false); }} className="w-full text-left px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-foreground/5 transition-colors" data-testid="message-no-time">No Time For This...</button>
                </div>
              )}
            </div>
            <button
              onClick={() => { setWisdomOpen(false); setMessageOpen(false); handleShareLife(); }}
              className="text-[11px] font-bold text-foreground/70 hover:text-foreground transition-colors tracking-widest uppercase"
              data-testid="link-share-my-life"
            >
              Share My Dot Plot
            </button>
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
        <div ref={chartRef}>
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
        </div>

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
        <div className="w-full max-w-[960px] mx-auto px-4 md:px-8 mt-8 flex justify-center gap-6">
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

      <div className="fixed bottom-2 left-3 text-[9px] text-foreground select-none" data-testid="text-copyright">
        Copyright Legio Unius MMXXVI
      </div>

      <GravestoneBanner position="bottom" patternId="gravestones-bottom" />

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
