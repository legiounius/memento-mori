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

export const EVENT_COLORS = [
  { name: "Red", value: "border-red-500", swatch: "bg-red-500" },
  { name: "Blue", value: "border-blue-500", swatch: "bg-blue-500" },
  { name: "Green", value: "border-emerald-500", swatch: "bg-emerald-500" },
  { name: "Purple", value: "border-purple-500", swatch: "bg-purple-500" },
  { name: "Pink", value: "border-pink-500", swatch: "bg-pink-500" },
  { name: "Orange", value: "border-orange-500", swatch: "bg-orange-500" },
  { name: "Yellow", value: "border-yellow-500", swatch: "bg-yellow-500" },
  { name: "Teal", value: "border-teal-500", swatch: "bg-teal-500" },
  { name: "Indigo", value: "border-indigo-500", swatch: "bg-indigo-500" },
  { name: "Cyan", value: "border-cyan-500", swatch: "bg-cyan-500" },
] as const;

export interface LifeEvent {
  id: string;
  date: string;
  label: string;
  color: string;
}

interface EventFormProps {
  onAdd: (event: LifeEvent) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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
  const [color, setColor] = useState(EVENT_COLORS[0].value);

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

  const isValid = month !== "" && day !== "" && year !== "" && label.trim() !== "";

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
      color,
    });

    setMonth("");
    setDay("");
    setYear("");
    setLabel("");
    setColor(EVENT_COLORS[0].value);
  };

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        Add a Key Date in Your Life
      </p>
      <div className="flex flex-row items-center gap-1.5 flex-wrap justify-center w-full max-w-3xl">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger
            data-testid="select-event-month"
            className="w-[100px] h-7 border border-primary/10 text-xs px-2"
          >
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
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
          placeholder="e.g. Kid's First Birthday"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          className="w-[170px] h-7 border border-primary/10 text-xs px-2"
        />

        <Select value={color} onValueChange={setColor}>
          <SelectTrigger
            data-testid="select-event-color"
            className="w-[100px] h-7 border border-primary/10 text-xs px-2"
          >
            <SelectValue>
              <span className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${EVENT_COLORS.find((c) => c.value === color)?.swatch}`} />
                <span className="text-xs">{EVENT_COLORS.find((c) => c.value === color)?.name}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EVENT_COLORS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                <span className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.swatch}`} />
                  {c.name}
                </span>
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
