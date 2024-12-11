import { atom } from "nanostores";

interface Team {
  id: number;
  bg: string;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
}

export const $teams = atom<Team[]>([]);
