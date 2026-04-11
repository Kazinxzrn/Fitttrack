"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Dumbbell, Calendar, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Início" },
  { href: "/workouts", icon: Dumbbell, label: "Treinos" },
  { href: "/calendar", icon: Calendar, label: "Calendário" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 px-4 py-2 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl transition-colors",
                isActive ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut()}
          className="flex flex-col items-center gap-1 p-3 rounded-xl text-zinc-500 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Sair</span>
        </button>
      </div>
    </nav>
  );
}