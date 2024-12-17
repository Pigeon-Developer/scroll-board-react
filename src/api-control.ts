/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Activators, SensorInstance, SensorOptions, SensorProps } from "@dnd-kit/core";
import { spring } from "motion";
import { randomInt } from "./util";

export type ApiSensorProps = SensorProps<unknown>;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mockAnimate(props: ApiSensorProps) {
  console.log("mockAnimate", props);
  // @ts-ignore
  const delta: number = props.event.data.delta;
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

  console.log("output", delta, output);

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

// 模拟一个随机排名变化
export function mockScoreChange() {
  const timer = setInterval(() => {
    const teamId = randomInt(80);

    // 上下变化
    const delta = randomInt(80) - 40;

    console.log("team ", teamId, "名次变化", delta);

    if (ActiveFn.has(teamId)) {
      const ev = new Event("fake");
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ev.data = { delta };

      ActiveFn.get(teamId)!({ nativeEvent: ev });
    }
  }, 4000);

  return function dispose() {
    clearInterval(timer);
  };
}
