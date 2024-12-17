import { moveTeamPosition } from "./api-control";
import { $problems, $teams, sortTeam, Team } from "./state";
import { randomColor, randomInt } from "./util";

export function prepareMockData() {
  const baseA = "A".charCodeAt(0);

  const initProblem = new Array(5).fill(0).map((_, index) => {
    return {
      key: `${index}`,
      name: String.fromCharCode(baseA + index),
    };
  });

  $problems.set(initProblem);

  const initList = new Array(80).fill(0).map((_, index) => {
    return {
      id: index,
      bg: randomColor(),
      rank: -1,
      problemList: initProblem.map((it) => {
        return {
          key: it.key,
          total: 0,
          failed: 0,
          accepted_time: 0,
        };
      }),
    };
  });

  $teams.set(initList);
}

// 模拟一个随机排名变化
export function mockScoreChange() {
  const startMs = +new Date();

  const timer = setInterval(() => {
    const teamId = randomInt(80);

    // 随机一个 加分还是减分
    const tmp = randomInt(3);
    // -1 是加分 名次减少 分数变高
    const direction = tmp >= 1 ? -1 : 1;

    const oldTeamList = $teams.get();

    // 加分和减分都需要队伍有未 ac 题目，这里做校验
    const team = oldTeamList.find((it) => it.id === teamId);
    if (!team) {
      return;
    }
    const canChangeProblem = team.problemList.find((it) => it.accepted_time === 0);

    if (!canChangeProblem) {
      // 没有可以增减分的题目
      return;
    }

    const nextTeamList = oldTeamList.slice().filter((it) => it.id !== teamId);

    const nowMs = +new Date();
    const nextTeam: Team = {
      ...team,
      problemList: team.problemList.map((it) => {
        if (canChangeProblem.key === it.key) {
          if (direction === -1) {
            return {
              ...it,
              total: it.total + 1,
              accepted_time: nowMs - startMs,
            };
          }
          return {
            ...it,
            failed: it.failed + 1,
            total: it.total + 1,
          };
        }
        return it;
      }),
    };

    const sortedList = sortTeam(nextTeamList.concat(nextTeam));
    const rankMap = new Map<number, number>();

    sortedList.forEach((localTeam, index) => {
      const hasSubmit = localTeam.problemList.some((it) => it.total > 0);
      if (hasSubmit) {
        return rankMap.set(localTeam.id, index);
      }

      rankMap.set(localTeam.id, -1);
    });

    // 这里更新数据时需要注意顺序
    // 回写到 teams 中的数据，循序需要和这个函数开始时的一致
    // 数据中的顺序是在动画结束后才会修改
    $teams.set(
      oldTeamList.map((it) => {
        let newTeam = { ...it };

        if (it.id === teamId) {
          newTeam = { ...nextTeam };
        }

        const newIndex = rankMap.get(it.id)!;
        if (newIndex >= 0) {
          newTeam.rank = newIndex + 1;
        }

        return newTeam;
      }),
    );

    const oldIndex = oldTeamList.findIndex((it) => it.id === teamId);
    const newIndex = rankMap.get(teamId)!;

    console.log("move team ", teamId, { delta: newIndex - oldIndex, oldRank: oldIndex + 1, newRank: newIndex + 1 });
    moveTeamPosition(teamId, { delta: newIndex - oldIndex, from: oldIndex, to: newIndex });
  }, 4000);

  function dispose() {
    clearInterval(timer);
  }

  window.stop = dispose;

  return dispose;
}
