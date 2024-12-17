/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Activators, SensorInstance, SensorOptions, SensorProps } from "@dnd-kit/core";
import { spring } from "motion";

export type ApiSensorProps = SensorProps<unknown>;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mockAnimate(props: ApiSensorProps) {
  // @ts-ignore
  const delta: number = props.event.data.delta;
  // @ts-ignore
  const toIndex: number = props.event.data.to;

  const toEl = document.querySelectorAll(`.team`)[toIndex];
  if (toEl) {
    // @ts-ignore
    toEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }

  const generator = spring({
    keyframes: [0, 40 * delta],
    bounce: 0,
    duration: 1000,
  });

  const output = [];

  let isDone = false;
  let time = 0;
  const sampleDuration = 20; // ms

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

  props.onEnd();

  const el = document.querySelector(`#team-${props.active}`);
  if (el) {
    // @ts-ignore
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
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

/**
 * @TODO 需要做成 promise
 */
export function moveTeamPosition(id: number, action: MoveAction) {
  if (ActiveFn.has(id)) {
    const ev = new Event("fake");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ev.data = { ...action };

    ActiveFn.get(id)!({ nativeEvent: ev });
  }
}
