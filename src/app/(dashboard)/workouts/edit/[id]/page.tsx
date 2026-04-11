"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Save, GripVertical } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { DAY_NAMES, Exercise } from "@/types";

export default function WorkoutEditorPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("Treino");
  const [exercises, setExercises] = useState<Partial<Exercise>[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const fetchWorkout = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("workouts")
        .select("*, exercises(*)")
        .eq("id", id)
        .single();

      if (data) {
        setName(data.name);
        setExercises(data.exercises || []);
      }
      setInitialLoading(false);
    };

    fetchWorkout();
  }, [user, id]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: "", sets: 3, reps: 12, image_url: null, order_index: exercises.length },
    ]);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user || !id) return;
    setLoading(true);

    const supabase = createClient();

    // Update workout name
    await supabase.from("workouts").update({ name }).eq("id", id);

    // Get existing exercises
    const { data: existingExercises } = await supabase
      .from("exercises")
      .select("id")
      .eq("workout_id", id);

    // Delete removed exercises
    const existingIds = new Set(exercises.filter(e => e.id).map(e => e.id));
    for (const ex of existingExercises || []) {
      if (!existingIds.has(ex.id)) {
        await supabase.from("exercises").delete().eq("id", ex.id);
      }
    }

    // Upsert exercises
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const exerciseData = {
        workout_id: id,
        name: ex.name || "Exercício",
        sets: ex.sets || 3,
        reps: ex.reps || 12,
        image_url: ex.image_url || null,
        order_index: i,
      };

      if (ex.id) {
        await supabase.from("exercises").update(exerciseData).eq("id", ex.id);
      } else {
        await supabase.from("exercises").insert(exerciseData);
      }
    }

    setLoading(false);
    router.push("/workouts");
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex items-center gap-4">
        <Link href="/workouts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Editar Treino</h1>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </header>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Nome do Treino</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Treino A - Peito"
            className="text-lg font-semibold"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Exercícios</h2>
            <Button onClick={addExercise} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {exercises.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-zinc-400 mb-4">Nenhum exercício ainda</p>
                <Button onClick={addExercise}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Exercício
                </Button>
              </CardContent>
            </Card>
          ) : (
            exercises.map((exercise, index) => (
              <Card key={exercise.id || index} className="overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-3 text-zinc-600 cursor-grab">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <Input
                        value={exercise.name || ""}
                        onChange={(e) => updateExercise(index, "name", e.target.value)}
                        placeholder="Nome do exercício"
                        className="font-medium"
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-zinc-500">Séries</label>
                          <Input
                            type="number"
                            value={exercise.sets || ""}
                            onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value) || 0)}
                            min={1}
                            max={20}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500">Reps</label>
                          <Input
                            type="number"
                            value={exercise.reps || ""}
                            onChange={(e) => updateExercise(index, "reps", parseInt(e.target.value) || 0)}
                            min={1}
                            max={100}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeExercise(index)}
                      className="mt-3 p-2 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <ImageUpload
                    value={exercise.image_url || ""}
                    onChange={(url) => updateExercise(index, "image_url", url)}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}