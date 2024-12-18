/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Activators, SensorInstance, SensorOptions, SensorProps } from "@dnd-kit/core";
import { spring } from "motion";
import { sleep } from "./util";

export type ApiSensorProps = SensorProps<unknown>;

const AnimatePromise = new Map<number, () => void>();

let ActiveId = -1;

export function getActiveId() {
  return ActiveId;
}

async function mockAnimate(props: ApiSensorProps) {
  ActiveId = props.active as number;

  // @ts-ignore
  const delta: number = props.event.data.delta;
  // @ts-ignore
  const promiseId: number = props.event.data.promiseId;
  // @ts-ignore
  const toIndex: number = props.event.data.to;

  const toEl = document.querySelectorAll(`.team`)[toIndex];
  if (toEl) {
    // @ts-ignore
    toEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }

  // 长距离的移动补偿一些动画时间
  const plus = Math.floor(Math.abs(delta) / 20) * 500;
  const generator = spring({
    keyframes: [0, 40 * delta],
    bounce: 0,
    duration: 1000 + plus,
  });

  const output = [];

  let isDone = false;
  let time = 0;
  const sampleDuration = 30; // ms

  while (!isDone) {
    const { value, done } = generator.next(time);

    output.push(value);

    time += sampleDuration;

    if (done) isDone = true;
  }

  // @TODO 修改为读时间间隔

  props.onStart({ x: 0, y: 0 });

  for (const d of output) {
    props.onMove({ x: 0, y: d });

    await sleep(sampleDuration);
  }

  // onEnd 之后会去掉所有动画，所以这里需要等待一下，让结束动画看上去更平滑
  await sleep(3 * sampleDuration);
  props.onEnd();

  const el = document.querySelector(`#team-${props.active}`);
  if (el) {
    // @ts-ignore
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }

  ActiveId = -1;

  const cb = AnimatePromise.get(promiseId);
  if (cb) {
    cb();
    AnimatePromise.delete(promiseId);
  }
}

export class ApiSensor implements SensorInstance {
  public autoScrollEnabled = false;
  static activators: Activators<SensorOptions> = [
    {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      eventName: "onFakeApiCall",
      handler: () => {
        return true;
      },
    },
  ];

  // @ts-ignore
  constructor(private props: ApiSensorProps) {
    mockAnimate(props);
  }
}

const ActiveFn = new Map<number, (data: unknown) => void>();

export function registerActiveFn(id: number, fn: () => void) {
  ActiveFn.set(id, fn);
}

interface MoveAction {
  /**
   * 移动几个格子
   *
   * 负数为名次减多少（向上移动，排名会更靠前）
   */
  delta: number;

  /**
   * 0-base index
   */
  from: number;
  to: number;
}

let promiseId = 10010;

/**
 * @TODO 需要做成 promise
 */
export async function moveTeamPosition(id: number, action: MoveAction) {
  if (ActiveFn.has(id)) {
    const localId = promiseId;
    ++promiseId;
    const promise = new Promise((r) => {
      AnimatePromise.set(localId, r as any);
    });
    const ev = new Event("fake");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ev.data = { ...action, promiseId: localId };

    ActiveFn.get(id)!({ nativeEvent: ev });

    return await promise;
  }
}
