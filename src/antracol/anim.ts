import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./theme";

export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
export const easeBack = Easing.out(Easing.back(1.6));

/** Tween satu segmen, di-clamp di kedua sisi. */
export const tw = (
  f: number,
  f0: number,
  f1: number,
  from: number,
  to: number,
  easing: (t: number) => number = easeOut,
) =>
  interpolate(f, [f0, f1], [from, to], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Keyframe [frame, nilai][]; nilai sama berturut-turut = tahan. */
export const kf = (
  f: number,
  keys: [number, number][],
  easing: (t: number) => number = easeInOut,
) =>
  interpolate(
    f,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

/** Opacity masuk-keluar: fade in [a,b], fade out [c,d]. */
export const inOut = (f: number, a: number, b: number, c = 1e9, d = 1e9 + 1) =>
  Math.min(tw(f, a, b, 0, 1), tw(f, c, d, 1, 0, easeIn));

/** Pop dengan sedikit overshoot. */
export const pop = (f: number, start: number) =>
  spring({ frame: f - start, fps: FPS, config: { damping: 11, stiffness: 180 } });
