"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Play, Pause, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DAY_NAMES } from "@/types";

export default function TrainPage() {
  const { day } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [workout, setWorkout] = useState<any>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !day) return;

    const fetchWorkout = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("workouts")
        .select("*, exercises(*)")
        .eq("user_id", user.id)
        .eq("day_of_week", parseInt(day as string))
        .single();

      if (data) {
        setWorkout(data);
      }
    };

    fetchWorkout();
  }, [user, day]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timer]);

  const startTimer = (exerciseIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);
    setTimer(60);
    setIsTimerRunning(true);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setTimer(60);
    setIsTimerRunning(false);
  };

  const markComplete = (exerciseId: string, index: number) => {
    const newCompleted = new Set(completedExercises);
    newCompleted.add(exerciseId);
    setCompletedExercises(newCompleted);
    startTimer(index);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!workout) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{workout.name}</h1>
          <p className="text-sm text-zinc-400">{DAY_NAMES[parseInt(day as string) as 1 | 2 | 3 | 4 | 5]}</p>
        </div>
      </header>

      {/* Timer */}
      {isTimerRunning && (
        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-zinc-400 mb-2">Descanso</p>
            <p className="text-5xl font-bold text-emerald-500 mb-4">{formatTime(timer)}</p>
            <div className="flex justify-center gap-3">
              <Button onClick={toggleTimer} variant="outline" size="icon">
                {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button onClick={resetTimer} variant="outline" size="icon">
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${(completedExercises.size / workout.exercises.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-zinc-400">
          {completedExercises.size}/{workout.exercises.length}
        </span>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {workout.exercises
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((exercise: any, index: number) => {
            const isCompleted = completedExercises.has(exercise.id);

            return (
              <Card
                key={exercise.id}
                className={cn(
                  "overflow-hidden transition-all",
                  isCompleted && "border-emerald-500/50 bg-emerald-500/5"
                )}
              >
                {exercise.image_url && (
                  <div className="relative h-40 w-full">
                    <img
                      src={exercise.image_url}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                    {isCompleted && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={cn("font-semibold text-lg", isCompleted && "text-emerald-400")}>
                        {exercise.name}
                      </h3>
                      <div className="flex gap-4 mt-2">
                        <div className="text-center">
                          <p className="text-xl font-bold text-white">{exercise.sets}</p>
                          <p className="text-xs text-zinc-500">Séries</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-white">{exercise.reps}</p>
                          <p className="text-xs text-zinc-500">Reps</p>
                        </div>
                      </div>
                    </div>
                    {!isCompleted && (
                      <Button
                        onClick={() => markComplete(exercise.id, index)}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {completedExercises.size === workout.exercises.length && (
        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Treino Concluído! 🎉</h2>
            <p className="text-zinc-400 mb-4">Você completou todos os exercícios</p>
            <Button onClick={() => router.push("/dashboard")}>
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}