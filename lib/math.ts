export function clamp(min: number, n: number, max: number) {
  return Math.max(min, Math.min(n, max))
}

export function lerpNum(from: number, to: number, t: number) {
  return (1 - t) * from + t * to
}

export function lerpArray(from: number[], to: number[], t: number) {
  return from.map((x, i) => lerpNum(x, to[i], t))
}

export function lerpState(from: string, to: string, t: number) {
  return t > 0.5 ? to : from
}
