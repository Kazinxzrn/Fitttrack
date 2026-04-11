"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ChevronRight, Trash2, Edit3 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DAY_NAMES } from "@/types";
import { Exercise } from "@/types";

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchWorkouts = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("workouts")
        .select("*, exercises(*)")
        .eq("user_id", user.id)
        .order("day_of_week");

      if (data) setWorkouts(data);
      setLoading(false);
    };

    fetchWorkouts();
  }, [user]);

  const handleDelete = async (workoutId: string) => {
    if (!confirm("Tem certeza que deseja excluir este treino?")) return;

    const supabase = createClient();
    await supabase.from("workouts").delete().eq("id", workoutId);
    setWorkouts(workouts.filter((w) => w.id !== workoutId));
  };

  const createDefaultWorkouts = async () => {
    if (!user) return;

    const supabase = createClient();
    const defaultWorkouts = [
      { user_id: user.id, day_of_week: 1, name: "Treino A" },
      { user_id: user.id, day_of_week: 2, name: "Treino B" },
      { user_id: user.id, day_of_week: 3, name: "Treino C" },
      { user_id: user.id, day_of_week: 4, name: "Treino D" },
      { user_id: user.id, day_of_week: 5, name: "Treino E" },
    ];

    for (const workout of defaultWorkouts) {
      await supabase.from("workouts").insert(workout);
    }

    const { data } = await supabase
      .from("workouts")
      .select("*, exercises(*)")
      .eq("user_id", user.id)
      .order("day_of_week");

    if (data) setWorkouts(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus Treinos</h1>
          <p className="text-zinc-400">Gerencie seus 5 dias da semana</p>
        </div>
      </header>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-zinc-400">Você ainda não tem treinos cadastrados</p>
            <Button onClick={createDefaultWorkouts} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Criar 5 Treinos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((day) => {
            const workout = workouts.find((w) => w.day_of_week === day);
            return (
              <Card
                key={day}
                className={workout ? "hover:border-zinc-700" : "border-dashed border-zinc-700"}
              >
                <CardContent className="p-4">
                  {workout ? (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{workout.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                            {workout.exercises?.length || 0} exercícios
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">
                          {DAY_NAMES[day as 1 | 2 | 3 | 4 | 5]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/workouts/edit/${workout.id}`}>
                          <Button size="sm" variant="ghost">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleDelete(workout.id)}
                          className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link href={`/train/${day}`}>
                          <Button size="sm" variant="ghost">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Link href={`/workouts/edit?day=${day}`} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-zinc-500">{DAY_NAMES[day as 1 | 2 | 3 | 4 | 5]}</p>
                        <p className="text-sm text-zinc-600">Adicionar treino</p>
                      </div>
                      <Plus className="w-5 h-5 text-zinc-600" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}