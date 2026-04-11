// Types for the Fitness Tracker App

export interface Profile {
  id: string;
  name: string | null;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  day_of_week: number;
  name: string;
  created_at: string;
  exercises?: Exercise[];
}

export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  sets: number;
  reps: number;
  image_url: string | null;
  order_index: number;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  status: 'present' | 'absent';
}

export interface User {
  id: string;
  email: string;
}

export type DayOfWeek = 1 | 2 | 3 | 4 | 5;

export const DAY_NAMES: Record<DayOfWeek, string> = {
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
};

export const DAY_NAMES_SHORT: Record<DayOfWeek, string> = {
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
};