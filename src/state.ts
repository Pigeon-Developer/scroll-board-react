import { atom } from "nanostores";

export interface ProblemScore {
  /**
   * 题目的唯一 key
   */
  key: string;
  /**
   * 尝试次数
   */
  total: number;
  /**
   * 失败计数
   */
  failed: number;

  /**
   * 解决问题时，距离开赛的时间
   *
   * 0 为未解决
   */
  accepted_time: number;
}

export interface Team {
  /**
   * 队伍的唯一 key
   */
  id: number;
  /**
   * 背景色
   */
  bg: string;

  /**
   * 排序，-1 为未参与排序
   */
  rank: number;

  problemList: ProblemScore[];
}

interface ProblemDefine {
  key: string;

  name: string;
}

export const $teams = atom<Team[]>([]);
export const $problems = atom<ProblemDefine[]>([]);
