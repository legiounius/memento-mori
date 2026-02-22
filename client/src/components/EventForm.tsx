import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export type EventType = "BIRTHDAY" | "DEATH" | "MARRIAGE" | "MOVE" | "OTHER";

export const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: "BIRTHDAY", label: "Birthday", color: "#d4a017" },
  { value: "DEATH", label: "Death", color: "#2563eb" },
  { value: "MARRIAGE", label: "Marriage", color: "#ec4899" },
  { value: "MOVE", label: "Move", color: "#16a34a" },
  { value: "OTHER", label: "Other", color: "#7c3aed" },
];

export interface LifeEvent {
  id: string;
  date: string;
  label: string;
  type: EventType;
}

interface EventFormProps {
  onAdd: (event: LifeEvent) => void;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function EventForm({ onAdd }: EventFormProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 150 }, (_, i) => currentYear - i);

  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [label, setLabel] = useState("");
  const [eventType, setEventType] = useState<string>("");

  const selectedMonth = month ? parseInt(month) : undefined;
  const selectedYear = year ? parseInt(year) : undefined;

  const maxDays =
    selectedMonth !== undefined && selectedYear !== undefined
      ? getDaysInMonth(selectedMonth, selectedYear)
      : 31;

  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  useEffect(() => {
    if (day && parseInt(day) > maxDays) {
      setDay("");
    }
  }, [maxDays, day]);

  const isValid = month !== "" && day !== "" && year !== "" && label.trim() !== "" && eventType !== "";

  const handleAdd = () => {
    if (!isValid) return;
    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);
    const date = new Date(y, m, d);

    onAdd({
      id: crypto.randomUUID(),
      date: date.toISOString(),
      label: label.trim(),
      type: eventType as EventType,
    });

    setMonth("");
    setDay("");
    setYear("");
    setLabel("");
    setEventType("");
  };

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
        Add a Key Date in Your Life
      </p>
      <div className="flex flex-row items-center gap-1.5 flex-wrap justify-center w-full max-w-3xl">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger
            data-testid="select-event-month"
            className="w-[70px] h-7 border border-primary/10 text-xs px-2"
          >
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS_SHORT.map((m, i) => (
              <SelectItem key={m} value={String(i)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={day} onValueChange={setDay}>
          <SelectTrigger
            data-testid="select-event-day"
            className="w-[65px] h-7 border border-primary/10 text-xs px-2"
          >
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger
            data-testid="select-event-year"
            className="w-[75px] h-7 border border-primary/10 text-xs px-2"
          >
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          data-testid="input-event-label"
          placeholder="Event"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          className="w-[120px] h-7 border border-primary/10 text-xs px-2"
        />

        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger
            data-testid="select-event-type"
            className="w-[100px] h-7 border border-primary/10 text-xs px-2"
          >
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          data-testid="button-add-event"
          size="sm"
          disabled={!isValid}
          onClick={handleAdd}
          className="h-7 text-xs px-2.5"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
