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

export interface LifeEvent {
  id: string;
  date: string;
  label: string;
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
    });

    setMonth("");
    setDay("");
    setYear("");
    setLabel("");
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
        Add a Key Date in Your Life
      </p>
      <div className="flex flex-row items-center gap-2 flex-wrap justify-center w-full max-w-2xl">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger
            data-testid="select-event-month"
            className="w-[120px] border border-primary/10 text-sm"
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
            className="w-[80px] border border-primary/10 text-sm"
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
            className="w-[90px] border border-primary/10 text-sm"
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
          className="w-[200px] border border-primary/10 text-sm"
        />

        <Button
          data-testid="button-add-event"
          size="sm"
          disabled={!isValid}
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
