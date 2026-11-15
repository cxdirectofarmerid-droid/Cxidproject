import React from "react";
import { Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { tw, easeOut } from "./anim";
import { ASSET, AVATAR, C, FONT, SfxCue, asset } from "./theme";

/* ---------- Bidikan scan (4 sudut + garis scan) ---------- */

export const Reticle: React.FC<{
  cx: number;
  cy: number;
  size: number;
  /** Jarak tambahan sudut ke luar (px), untuk animasi snap. */
  spread?: number;
  /** 0..1 posisi garis scan; null = tidak tampil. */
  scan?: number | null;
  opacity?: number;
  thickness?: number;
}> = ({ cx, cy, size, spread = 0, scan = null, opacity = 1, thickness = 10 }) => {
  const arm = size * 0.22;
  const half = size / 2 + spread;
  const corners: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity }}>
      {corners.map(([sx, sy], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: cx + sx * half - (sx < 0 ? 0 : arm),
            top: cy + sy * half - (sy < 0 ? 0 : arm),
            width: arm,
            height: arm,
            boxSizing: "border-box",
            borderColor: C.lime,
            borderStyle: "solid",
            borderWidth: 0,
            [sy < 0 ? "borderTopWidth" : "borderBottomWidth"]: thickness,
            [sx < 0 ? "borderLeftWidth" : "borderRightWidth"]: thickness,
            borderRadius: 6,
          }}
        />
      ))}
      {scan !== null && scan > 0 && scan < 1 ? (
        <div
          style={{
            position: "absolute",
            left: cx - size / 2 + 16,
            top: cy - size / 2 + scan * size,
            width: size - 32,
            height: 6,
            borderRadius: 3,
            background: C.lime,
            boxShadow: `0 0 28px 8px ${C.lime}88`,
            opacity: Math.sin(scan * Math.PI),
          }}
        />
      ) : null}
    </div>
  );
};

/* ---------- Avatar TANIA (klip lip-sync, dimasker) ---------- */

export const AvatarWindow: React.FC<{
  cx: number;
  cy: number;
  size: number;
  opacity?: number;
  dx?: number;
  dy?: number;
  /** Frame klip yang dilewati di awal (untuk memotong bagian VO). */
  trimBefore?: number;
  /** Pakai potret diam (tania_still.png), mis. untuk banner tanpa VO. */
  still?: boolean;
}> = ({ cx, cy, size, opacity = 1, dx = 0, dy = 0, trimBefore = 0, still = false }) => {
  const inner = size * 0.86;
  const src = asset(still ? ASSET.avatarStill : ASSET.avatar);
  const w = inner * AVATAR.zoom;
  const h = w / AVATAR.videoAspect;
  const mediaStyle: React.CSSProperties = {
    position: "absolute",
    width: w,
    height: h,
    left: inner / 2 - AVATAR.faceX * w,
    top: inner / 2 - AVATAR.faceY * h,
  };
  return (
    <div
      style={{
        position: "absolute",
        left: cx - inner / 2 + dx,
        top: cy - inner / 2 + dy,
        width: inner,
        height: inner,
        borderRadius: inner * 0.12,
        overflow: "hidden",
        opacity,
        background: C.darkGreen,
      }}
    >
      {src && still ? (
        <Img src={src} style={mediaStyle} />
      ) : src ? (
        <OffthreadVideo src={src} muted trimBefore={trimBefore || undefined} style={mediaStyle} />
      ) : (
        <Placeholder label="TANIA avatar" sub="public/tania_avatar.mp4" dark />
      )}
    </div>
  );
};

/* ---------- Placeholder untuk aset yang belum ada ---------- */

export const Placeholder: React.FC<{ label: string; sub?: string; dark?: boolean }> = ({
  label,
  sub,
  dark,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      border: `4px dashed ${dark ? "#ffffff66" : "#23202066"}`,
      borderRadius: "inherit",
      color: dark ? "#ffffffaa" : "#231F20aa",
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 32,
      textAlign: "center",
      background: dark ? "#0d4f27" : "#e9e9e9",
    }}
  >
    <div>{label}</div>
    {sub ? <div style={{ fontSize: 20, fontWeight: 600 }}>{sub}</div> : null}
  </div>
);

/* ---------- Logo Bayer | FarmRise putih (hanya fade) ---------- */

export const Logo: React.FC<{ cx: number; top: number; height: number; opacity: number }> = ({
  cx,
  top,
  height,
  opacity,
}) => {
  const src = asset(ASSET.logo);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: cx * 2,
        height,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      {src ? (
        <Img src={src} style={{ height, objectFit: "contain" }} />
      ) : (
        <div
          style={{
            height,
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            border: "3px dashed #ffffff88",
            borderRadius: 12,
            color: C.white,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: height * 0.42,
          }}
        >
          Bayer | FarmRise
        </div>
      )}
    </div>
  );
};

/* ---------- Teks per kata ---------- */

export const Words: React.FC<{
  text: string;
  start: number;
  gap?: number;
  /** "rise": fade + naik; "mask": reveal kiri ke kanan. */
  mode?: "rise" | "mask";
  style?: React.CSSProperties;
}> = ({ text, start, gap = 4, mode = "rise", style }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  return (
    <span style={{ ...style }}>
      {words.map((w, i) => {
        const s = start + i * gap;
        const p = tw(f, s, s + 9, 0, 1, easeOut);
        const st: React.CSSProperties =
          mode === "rise"
            ? { opacity: p, transform: `translateY(${(1 - p) * 30}px)` }
            : { clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)` };
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", ...st }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
};

/* ---------- Chip ---------- */

export const Chip: React.FC<{
  x: number;
  y: number;
  label: string;
  bg: string;
  scale: number;
  check?: number;
  fontSize?: number;
}> = ({ x, y, label, bg, scale, check, fontSize = 40 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${scale})`,
      transformOrigin: "left center",
      background: bg,
      color: C.black,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize,
      padding: `${fontSize * 0.35}px ${fontSize * 0.7}px`,
      borderRadius: 999,
      display: "flex",
      alignItems: "center",
      gap: fontSize * 0.35,
      boxShadow: "0 10px 30px #00000033",
      whiteSpace: "nowrap",
    }}
  >
    {check !== undefined ? <CheckIcon progress={check} size={fontSize * 1.05} /> : null}
    {label}
  </div>
);

export const CheckIcon: React.FC<{ progress: number; size: number }> = ({ progress, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="19" fill={C.farmriseGreen} />
    <path
      d="M11 21 L17.5 27 L29.5 14"
      fill="none"
      stroke={C.white}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={30}
      strokeDashoffset={30 * (1 - progress)}
    />
  </svg>
);

/* ---------- Ikon reward generik (gaya garis) ---------- */

const line = { fill: "none", stroke: C.black, strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const RewardIcon: React.FC<{ kind: "pulsa" | "wallet" | "voucher"; size: number }> = ({
  kind,
  size,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    {kind === "pulsa" ? (
      <>
        <rect x="14" y="5" width="20" height="38" rx="4" {...line} />
        <path d="M21 37 h6" {...line} />
        <path d="M38 14 q4 4 0 8 M41 11 q7 7 0 14" {...line} />
      </>
    ) : kind === "wallet" ? (
      <>
        <rect x="6" y="13" width="36" height="26" rx="5" {...line} />
        <path d="M10 13 L32 6 L34 13" {...line} />
        <rect x="30" y="22" width="12" height="9" rx="3" {...line} />
      </>
    ) : (
      <>
        <path d="M6 14 h36 v7 a4 4 0 0 0 0 8 v7 h-36 v-7 a4 4 0 0 0 0 -8 z" {...line} />
        <path d="M28 15 v4 M28 23 v3 M28 30 v4" {...line} />
      </>
    )}
  </svg>
);

/** Ikon fitur resmi bila file ada; kalau tidak, tidak menampilkan apa pun. */
export const FeatureIcon: React.FC<{ name: string; size: number }> = ({ name, size }) => {
  const src = asset(name);
  return src ? <Img src={src} style={{ width: size, height: size, objectFit: "contain" }} /> : null;
};

/* ---------- SFX ---------- */

export const Sfx: React.FC<{ cues: SfxCue[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={30} layout="none">
        <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume ?? 1} />
      </Sequence>
    ))}
  </>
);
