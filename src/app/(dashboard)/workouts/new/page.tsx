"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Save } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DAY_NAMES } from "@/types";

export default function NewWorkoutPage() {
  const searchParams = useSearchParams();
  const dayParam = searchParams.get("day");
  const day = dayParam ? parseInt(dayParam) : 1;
  
  const { user } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(`Treino ${DAY_NAMES[day as 1 | 2 | 3 | 4 | 5]}`);
  }, [day]);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        day_of_week: day,
        name: name || `Treino ${DAY_NAMES[day as 1 | 2 | 3 | 4 | 5]}`,
      })
      .select()
      .single();

    setLoading(false);

    if (data) {
      router.push(`/workouts/edit/${data.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Link href="/workouts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Novo Treino</h1>
          <p className="text-sm text-zinc-400">{DAY_NAMES[day as 1 | 2 | 3 | 4 | 5]}</p>
        </div>
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

        <Button onClick={handleCreate} className="w-full" disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          {loading ? "Criando..." : "Criar Treino"}
        </Button>
      </div>
    </div>
  );
}