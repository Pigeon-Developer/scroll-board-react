export function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function randomHex(max: number) {
  return randomInt(max).toString(16);
}

export function randomColor() {
  return `#${randomHex(255)}${randomHex(255)}${randomHex(255)}`;
}
