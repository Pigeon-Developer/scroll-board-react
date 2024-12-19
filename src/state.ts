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
 * 暂时使用的排序规则
 * 1. 提交过的比没有提交的靠前
 * 2. AC 数量多的靠前
 * 3. AC 数量一致时，校验耗时（包含罚时）
 * 4. 都没提交过，按 teamId 排序
 *
 * 如果分数都为 0，则使用 id 进行排序
 */
export function sortTeam(oldList: Team[]) {
  const newList = oldList.slice();
  // 计算缓存数据
  const resultMap = new Map<number, { ac: number; costTime: number }>();

  for (const team of newList) {
    const ac = team.problemList.reduce((prev, it) => (it.accepted_time > 0 ? prev + 1 : prev), 0);

    // @TODO 罚时怎么计算需要做成配置
    const costTime = team.problemList.reduce((prev, it) => {
      return prev + it.accepted_time + it.failed * 5 * 60_000;
    }, 0);

    resultMap.set(team.id, {
      ac,
      costTime,
    });
  }

  const teamLength = newList.length;
  for (let leftIndex = 0; leftIndex < teamLength; leftIndex++) {
    for (let rightIndex = leftIndex + 1; rightIndex < teamLength; rightIndex++) {
      const left = newList[leftIndex];
      const right = newList[rightIndex];

      const hScoreLeft = resultMap.get(left.id)!;
      const hScoreRight = resultMap.get(right.id)!;
      if (hScoreLeft.costTime === 0 && hScoreRight.costTime === 0) {
        // 两边都没提交
        if (left.id > right.id) {
          // 把 id 小的放前面
          newList[leftIndex] = right;
          newList[rightIndex] = left;
        }

        continue;
      }

      if (hScoreLeft.costTime === 0 || hScoreRight.costTime === 0) {
        // 其中一方没有提交
        // 把提交过的放左面
        if (hScoreRight.costTime > 0) {
          newList[leftIndex] = right;
          newList[rightIndex] = left;
        }

        continue;
      }

      if (hScoreLeft.ac === hScoreRight.ac) {
        // 两边 AC 数量一致
        if (hScoreLeft.costTime > hScoreRight.costTime) {
          // 把 耗时 小的放前面
          newList[leftIndex] = right;
          newList[rightIndex] = left;
        }

        continue;
      }

      if (hScoreLeft.ac < hScoreRight.ac) {
        // 左面的 AC 数量更少

        // 把 AC 多的放左面
        newList[leftIndex] = right;
        newList[rightIndex] = left;
      }
    }
  }

  return newList;
}
