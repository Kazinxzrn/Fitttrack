"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AttendanceStatus = "present" | "absent" | "rest" | null;

const STATUS_ORDER: AttendanceStatus[] = [null, "present", "rest", "absent"];

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long" });
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay();

  useEffect(() => {
    if (!user) return;

    const fetchAttendance = async () => {
      const supabase = createClient();
      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate);

      const attendanceMap: Record<string, AttendanceStatus> = {};
      data?.forEach((a) => {
        if (a.status === "present" || a.status === "absent" || a.status === "rest") {
          attendanceMap[a.date] = a.status;
        }
      });

      setAttendance(attendanceMap);
      setLoading(false);
    };

    fetchAttendance();
  }, [user, year, month]);

  const toggleAttendance = async (day: number) => {
    if (!user) return;

    const date = new Date(year, month, day).toISOString().split("T")[0];
    const currentStatus = attendance[date];
    
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    const newStatus = STATUS_ORDER[nextIndex];

    const supabase = createClient();

    // Optimistic update
    setAttendance({ ...attendance, [date]: newStatus });

    try {
      if (newStatus === null) {
        await supabase
          .from("attendance")
          .delete()
          .eq("user_id", user.id)
          .eq("date", date);
      } else if (currentStatus) {
        await supabase
          .from("attendance")
          .update({ status: newStatus })
          .eq("user_id", user.id)
          .eq("date", date);
      } else {
        await supabase
          .from("attendance")
          .insert({ user_id: user.id, date, status: newStatus });
      }
    } catch (err) {
      console.error("Attendance error:", err);
      setAttendance(attendance);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const presentDays = Object.values(attendance).filter((s) => s === "present").length;
  const restDays = Object.values(attendance).filter((s) => s === "rest").length;
  const absentDays = Object.values(attendance).filter((s) => s === "absent").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Frequência</h1>
        <p className="text-zinc-400">Acompanhe sua presença na academia</p>
      </header>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <span className="font-semibold text-white capitalize">
              {monthName} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map((day) => (
              <div key={day} className="text-center text-xs text-zinc-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day).toISOString().split("T")[0];
              const status = attendance[date];

              return (
                <button
                  key={day}
                  onClick={() => toggleAttendance(day)}
                  className={cn(
                    "aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all",
                    isToday(day) && "ring-2 ring-emerald-500",
                    status === "present" && "bg-emerald-500 text-white",
                    status === "absent" && "bg-red-500/20 text-red-400",
                    status === "rest" && "bg-amber-500/20 text-amber-400",
                    !status && "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {status === "present" ? (
                    <Check className="w-4 h-4" />
                  ) : status === "absent" ? (
                    <X className="w-4 h-4" />
                  ) : status === "rest" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    day
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{presentDays}</p>
            <p className="text-sm text-zinc-400">Presenças</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{restDays}</p>
            <p className="text-sm text-zinc-400">Descanso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{absentDays}</p>
            <p className="text-sm text-zinc-400">Faltas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="text-sm text-zinc-400">Presente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500/20" />
            <span className="text-sm text-zinc-400">Descanso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/20" />
            <span className="text-sm text-zinc-400">Ausente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-zinc-800" />
            <span className="text-sm text-zinc-400">Não marcado</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}