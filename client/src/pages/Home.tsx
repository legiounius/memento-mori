import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "wouter";
import { LifeGrid } from "@/components/LifeGrid";
import { DatePicker } from "@/components/DatePicker";
import { EventForm, type LifeEvent, EVENT_TYPES } from "@/components/EventForm";
import { motion } from "framer-motion";
import skullImage from "@assets/skull_minimal.png";
import { Button } from "@/components/ui/button";
import { Trash2, Share2, Heart } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { differenceInWeeks } from "date-fns";
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
            text: 'My life visualized. Remember you must die. Live accordingly.\n\ntodieisto.live',
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

  const handleBeKind = async () => {
    const message = `Be kind to me, I only have ${weeksRemaining.toLocaleString()} weeks to live.\n\nCreated using the Memento Mori app — todieisto.live\nRemember you must die. Live accordingly.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Be Kind To Me — Memento Mori',
          text: message,
        });
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          await navigator.clipboard.writeText(message);
        }
      }
    } else {
      await navigator.clipboard.writeText(message);
    }
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
            className="w-full border-t border-border pt-6 flex flex-col items-center space-y-6"
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
          <Link href="/peace" className="mt-2 text-[11px] font-bold text-foreground/70 hover:text-foreground transition-colors tracking-widest uppercase underline underline-offset-2 decoration-foreground/30 hover:decoration-foreground/60" data-testid="link-find-peace">
            Find Peace
          </Link>
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
        <div className="w-full max-w-[960px] mx-auto px-4 md:px-8 mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            data-testid="button-share-life"
            onClick={handleShareLife}
            disabled={isGeneratingPdf}
            className="text-xs uppercase tracking-widest"
          >
            <Share2 className="w-3.5 h-3.5 mr-2" />
            {isGeneratingPdf ? 'Generating...' : 'Share My Life'}
          </Button>
          <Button
            variant="outline"
            data-testid="button-be-kind"
            onClick={handleBeKind}
            className="text-xs uppercase tracking-widest"
          >
            <Heart className="w-3.5 h-3.5 mr-2" />
            Be Kind To Me
          </Button>
        </div>
        <div className="w-full max-w-[960px] mx-auto px-4 md:px-8 mt-4 flex justify-center gap-6">
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
