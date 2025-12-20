"use client";

import { calendarFetcher } from "@/lib/fetchers";
import { ReactNode, useMemo, useState } from "react";
import useSWR from "swr";

interface WorkInfo {
  day: number | null,
  didWork: boolean,
}

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function getDaysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate() + 1; // TODO: figure out if +1 is necessary
}

function getFirstWeekday(year: number, month: number) {
  const d = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return (d + 6) % 7; // that's one way to do overflow
}

export default function Calendar({ username }: { username: string }) {
  const today = new Date();
  const [date, setDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth()
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(date.year, date.month);
  const firstWeekday = getFirstWeekday(date.year, date.month);

  const onPrev = () => {
    setDate(({ year, month }) => {
      if (month === 0) {
        return { year: year - 1, month: 11 };
      }
      return { year, month: month - 1 }
    })
    setSelectedDay(null);
  }

  const onNext = () => {
    setDate(({ year, month }) => {
      if (month === 11) {
        return { year: year + 1, month: 0 };
      }
      return { year, month: month + 1 }
    })
    setSelectedDay(null);
  }

  const onDayClick = (day: string) => {
    setSelectedDay(day);
  }

  const { data, error } = useSWR(
    `/api/users/calendar?u=${username}&y=${date.year}&m=${date.month + 1}`,
    calendarFetcher
  );

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d < daysInMonth; d++) cells.push(d);

  const workedDays = useMemo(() => {
    if (!data?.workHours) return new Set<number>();
    return new Set(
      data.workHours.map(wh =>
        new Date(wh.date)
          .getUTCDate()
      )
    )
  }, [data])

  const hoursOnSelectedDay = useMemo<string | null>(() => {
    if (!selectedDay || !data?.workHours) return null;

    const day = Number.parseInt(selectedDay);
    if (!workedDays.has(day)) return null;

    const selectedDate = data.workHours.find(wh => (new Date(wh.date)).getUTCDate() === day);
    if (!selectedDate) return null;

    const total = Math.floor(selectedDate.seconds);

    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return [
      h.toString().padStart(2, "0"),
      m.toString().padStart(2, "0"),
      s.toString().padStart(2, "0"),
    ].join(":");

  }, [data, selectedDay, workedDays])


  return (
    <div className="flex flex-col grow select-none gap-1 min-h-56">
      {/* header */}
      <div className="flex flex-row items-center justify-between">
        <button onClick={onPrev} className="min-w-6 cursor-pointer">{"<"}</button>
        <span className="font-bold">{
          new Date(Date.UTC(date.year, date.month)).toLocaleString(
            "en",
            { month: "long", year: "numeric" }
          )
        }</span>
        <button onClick={onNext} className="min-w-6 cursor-pointer">{">"}</button>
      </div>
      {/* weekdays */}
      <div className="grid grid-cols-7 text-center gap-y-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-secondary">{d}</div>
        ))}
        {/* days */}
        {cells.map((d, key) => {
          if (!d) return <div key={key} />

          const isToday =
            d === today.getUTCDate() &&
            date.month === today.getUTCMonth() &&
            date.year === today.getUTCFullYear()

          const isSelected: boolean = Boolean(selectedDay && d === Number.parseInt(selectedDay));

          const hasWork = workedDays.has(d);

          return <Day
            key={key}
            day={d}
            onClick={onDayClick}
            isToday={isToday}
            isSelected={isSelected}
            workDone={hasWork}
          />

        })}
      </div>

      {hoursOnSelectedDay &&
        <span className="font-semibold text-outline">
          {"Worked for: " + hoursOnSelectedDay}
        </span>
      }
    </div>
  )
}

function Day({
  day,
  onClick,
  isToday,
  isSelected,
  workDone,
}: {
  day: number | null,
  onClick: any,
  isSelected: boolean,
  isToday: boolean,
  workDone: boolean,
}) {
  return (
    <div className={`relative ${isSelected ? "text-on-secondary bg-secondary" : ""} ${isToday ? "outline-2 outline-tertiary" : ""} rounded-sm`}
      onClick={() => onClick(day)}
    >
      {day ?? ""}
      {workDone &&
        <div className={`absolute text-sm -top-2 right-0 text-outline`}>
          .
        </div>
      }
    </div>
  )
}
