// Types partagés du jeu.

export type Category = 'nutrition' | 'sport' | 'sommeil';

export type Stat = 'atk' | 'maxHp' | 'regen' | 'crit';

// Un modèle d'habitude proposé à l'utilisateur (bouton dans une catégorie).
export interface HabitPreset {
  id: string;
  category: Category;
  label: string;
  emoji: string;
  xp: number;
  gold: number;
  stat: Stat; // stat du héros que cette habitude renforce
  statGain: number; // gain permanent de la stat par log
}

// Une habitude enregistrée dans le journal.
export interface LoggedHabit {
  presetId: string;
  category: Category;
  label: string;
  emoji: string;
  xp: number;
  gold: number;
  ts: number; // timestamp du log
}

// Niveaux achetés pour chaque amélioration de forge.
export interface Upgrades {
  atk: number;
  maxHp: number;
  regen: number;
  crit: number;
}

// Une ligne du journal de combat du donjon.
export interface DungeonLogEntry {
  id: string;
  ts: number;
  kind: 'kill' | 'boss' | 'defeat' | 'loot' | 'offline';
  text: string;
}

export interface GameState {
  // Progression / monnaies
  gold: number;
  xp: number; // xp total cumulé
  level: number;

  // Stats permanentes gagnées via les habitudes (par stat)
  habitStats: Record<Stat, number>;

  // Améliorations achetées avec l'or
  upgrades: Upgrades;

  // État du donjon (idle)
  floor: number;
  monsterIndex: number; // 0..MONSTERS_PER_FLOOR-1 (dernier = boss)
  monsterHp: number;
  heroHp: number;

  // Journal
  todayDate: string; // 'YYYY-MM-DD'
  todayLog: LoggedHabit[];
  history: Record<string, number>; // date -> nombre d'habitudes ce jour-là
  dungeonLog: DungeonLogEntry[];

  // Rétention
  streak: number;
  lastHabitDate: string | null;

  // Personnalisation (toutes optionnelles)
  customHabits: HabitPreset[]; // habitudes créées par l'utilisateur
  dailyGoal: number; // objectif d'habitudes/jour (0 = désactivé)
  notificationsEnabled: boolean; // rappel quotidien opt-in
  reminderHour: number; // heure du rappel (0-23)

  // Stats à vie
  totalHabits: number;
  bestFloor: number;

  // Idle
  lastActive: number; // timestamp du dernier tick sauvegardé
}
