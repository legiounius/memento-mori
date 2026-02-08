import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function DatePicker({ date, setDate }: DatePickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [year, setYear] = useState<string>("");

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

  useEffect(() => {
    if (month !== "" && day !== "" && year !== "") {
      const m = parseInt(month);
      const d = parseInt(day);
      const y = parseInt(year);
      const newDate = new Date(y, m, d);
      if (newDate <= new Date()) {
        setDate(newDate);
      }
    } else {
      setDate(undefined);
    }
  }, [month, day, year, setDate]);

  return (
    <div className="flex flex-row items-center gap-3 w-full max-w-sm flex-wrap justify-center">
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger
          data-testid="select-month"
          className="w-[130px] border-2 border-primary/10"
        >
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m, i) => (
            <SelectItem key={m} value={String(i)} data-testid={`option-month-${i}`}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={day} onValueChange={setDay}>
        <SelectTrigger
          data-testid="select-day"
          className="w-[90px] border-2 border-primary/10"
        >
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={String(d)} data-testid={`option-day-${d}`}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={setYear}>
        <SelectTrigger
          data-testid="select-year"
          className="w-[100px] border-2 border-primary/10"
        >
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)} data-testid={`option-year-${y}`}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
