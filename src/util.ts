export function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function randomHex(max: number) {
  return randomInt(max).toString(16);
}

export function randomColor() {
  return "#fff";
  // return `#${randomHex(255)}${randomHex(255)}${randomHex(255)}`;
}

function padZero(num: number) {
  return `${num >= 10 ? "" : "0"}${num}`;
}

export function formatCostTime(ms: number) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60_0000);

  const rest = ms - (m * 60_0000 + s * 1000);
  const afterDot = Math.floor(rest / 100);
  return `${padZero(m)}:${padZero(s)}.${afterDot}`;
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
