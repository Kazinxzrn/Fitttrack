"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell, TrendingUp, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAY_NAMES } from "@/types";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const supabase = createClient();

      const [workoutsRes, attendanceRes] = await Promise.all([
        supabase
          .from("workouts")
          .select("*, exercises(*)")
          .eq("user_id", user.id)
          .order("day_of_week"),
        supabase
          .from("attendance")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
      ]);

      if (workoutsRes.data) setWorkouts(workoutsRes.data);
      if (attendanceRes.data) setAttendance(attendanceRes.data);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const thisWeekAttendance = attendance.filter((a) => {
    const date = new Date(a.date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    return date >= weekStart;
  });

  const presentCount = thisWeekAttendance.filter((a) => a.status === "present").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-white">
          Olá, {profile?.name || "Atleta"} 👋
        </h1>
        <p className="text-zinc-400">Vamos continuar evoluindo!</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{presentCount}/5</p>
                <p className="text-xs text-zinc-400">Esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-zinc-800">
                <Dumbbell className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{workouts.length}</p>
                <p className="text-xs text-zinc-400">Treinos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Semana</CardTitle>
          <Calendar className="w-4 h-4 text-zinc-500" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((day) => {
              const workout = workouts.find((w) => w.day_of_week === day);
              const hasWorkout = !!workout;
              return (
                <Link
                  key={day}
                  href={hasWorkout ? `/train/${day}` : "/workouts"}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                      hasWorkout
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {hasWorkout ? "✓" : "—"}
                  </div>
                  <span className="text-xs text-zinc-500">{DAY_NAMES[day as 1 | 2 | 3 | 4 | 5]}</span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Próximos Treinos</h2>
        {workouts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">Nenhum treino cadastrado</p>
              <Link
                href="/workouts"
                className="text-emerald-500 text-sm hover:underline mt-2 inline-block"
              >
                Criar primeiro treino →
              </Link>
            </CardContent>
          </Card>
        ) : (
          workouts.slice(0, 3).map((workout) => (
            <Link key={workout.id} href={`/train/${workout.day_of_week}`}>
              <Card className="hover:border-zinc-700 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{workout.name}</h3>
                    <p className="text-sm text-zinc-400">{DAY_NAMES[workout.day_of_week as 1 | 2 | 3 | 4 | 5]} • {workout.exercises?.length || 0} exercícios</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-lg">→</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}