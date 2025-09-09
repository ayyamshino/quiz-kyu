export interface KyuGrade {
  kyu: number;
  name: string;
  description: string;
  color: string;
  hasStripe: boolean;
}

export const KYU_GRADES: KyuGrade[] = [
  {
    kyu: 1,
    name: "1er kyu",
    description: "Ceinture marron + barrette",
    color: "#8B4513",
    hasStripe: true
  },
  {
    kyu: 2,
    name: "2ème kyu",
    description: "Ceinture marron",
    color: "#8B4513",
    hasStripe: false
  },
  {
    kyu: 3,
    name: "3ème kyu",
    description: "Ceinture verte + barrette",
    color: "#228B22",
    hasStripe: true
  },
  {
    kyu: 4,
    name: "4ème kyu",
    description: "Ceinture verte",
    color: "#228B22",
    hasStripe: false
  },
  {
    kyu: 5,
    name: "5ème kyu",
    description: "Ceinture jaune + barrette",
    color: "#FFD700",
    hasStripe: true
  },
  {
    kyu: 6,
    name: "6ème kyu",
    description: "Ceinture jaune",
    color: "#FFD700",
    hasStripe: false
  },
  {
    kyu: 7,
    name: "7ème kyu",
    description: "Ceinture bleu + barrette",
    color: "#4169E1",
    hasStripe: true
  },
  {
    kyu: 8,
    name: "8ème kyu",
    description: "Ceinture bleu",
    color: "#4169E1",
    hasStripe: false
  },
  {
    kyu: 9,
    name: "9ème kyu",
    description: "Ceinture orange + barrette",
    color: "#FF8C00",
    hasStripe: true
  },
  {
    kyu: 10,
    name: "10ème kyu",
    description: "Ceinture orange",
    color: "#FF8C00",
    hasStripe: false
  }
];

export interface QuizQuestion {
  id: string;
  type: 'kyuToDescription' | 'descriptionToKyu';
  question: string;
  correctAnswer: string;
  options: string[];
  correctGrade: KyuGrade;
}

export interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  streak: number;
  bestStreak: number;
}

export const DURATIONS = [5, 10, 15] as const;
export type Duration = typeof DURATIONS[number];
