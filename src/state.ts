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

/**
 * 按分数对队伍重新排序
 *
 * 如果分数都为 0，则使用 id 进行排序
 */
export function sortTeam(oldList: Team[]) {
  const newList = oldList.slice();
  newList.sort((a, b) => {
    // 返回负数 会让 a 更加靠前

    const aAccepted = a.problemList.reduce((prev, it) => (it.accepted_time > 0 ? prev + 1 : prev), 0);
    const bAccepted = b.problemList.reduce((prev, it) => (it.accepted_time > 0 ? prev + 1 : prev), 0);

    const aFailed = a.problemList.reduce((prev, it) => (it.failed > 0 ? prev + 1 : prev), 0);
    const bFailed = b.problemList.reduce((prev, it) => (it.failed > 0 ? prev + 1 : prev), 0);

    if (aAccepted === 0 && bAccepted === 0) {
      // 两队都没有 ac 的题目
      // 计算罚时

      if (aFailed === 0 && bFailed === 0) {
        // 两队都没有提交过代码
        return a.id - b.id;
      }

      // 每个罚时 = 1_000_000_000
      return (aFailed - bFailed) * 1_000_000_000;
    }

    if (aAccepted === bAccepted) {
      // 两队 ac 数量一致
      if (aFailed !== bFailed) {
        // 优先考虑罚时
        return (aFailed - bFailed) * 1_000_000_000;
      }

      const aTotalAcCost = a.problemList.reduce(
        (prev, it) => (it.accepted_time > 0 ? prev + it.accepted_time : prev),
        0,
      );
      const bTotalAcCost = b.problemList.reduce(
        (prev, it) => (it.accepted_time > 0 ? prev + it.accepted_time : prev),
        0,
      );

      // 让耗时小的排前面
      return (aTotalAcCost - bTotalAcCost) * 1_000_000;
    }

    // 1 ac = 1_000_000_000_000 让 ac 数量多的总是排前面
    return (aAccepted - bAccepted) * -1_000_000_000_000;
  });

  return newList;
}
