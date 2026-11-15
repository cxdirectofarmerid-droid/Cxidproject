import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, useCurrentFrame } from "remotion";
import "./fonts";
import { easeBack, easeIn, easeOut, inOut, kf, pop, tw } from "./anim";
import { AvatarWindow, Chip, Logo, Placeholder, Reticle, RewardIcon, Sfx, Words } from "./parts";
import { ASSET, C, FONT, FONT_TAGLINE, JINGLE_BED, SfxCue, asset } from "./theme";

/**
 * Feed 1080 × 1080. VO sama dengan master tanpa kalimat Scene 5 (langkah):
 * audio 0–10,9 dtk diputar utuh, lalu lompat ke 16,1 dtk (sebelum "Tukar Bayer Coins").
 * Klip avatar dipotong di titik yang sama supaya lip-sync tetap pas.
 */
export const FEED = { width: 1080, height: 1080 };
const CUT = 327; // 10,9 dtk: akhir Scene 4 di feed & audio
const RESUME = 483; // 16,1 dtk di audio master
const SHIFT = RESUME - CUT; // frame master = frame feed + SHIFT (setelah CUT)
export const FEED_FRAMES = 660; // 22 dtk

const F = {
  s2: 48,
  s3: 132,
  s4: 234,
  s6: CUT,
  s7: 645 - SHIFT, // 489
  s8: 748 - SHIFT, // 592
};
const M = 70; // margin
const BUMPER_BG = "#33A225";

const FEED_SFX: SfxCue[] = [
  { at: 6, sfx: "click" },
  { at: 10, sfx: "beep", volume: 0.8 },
  { at: 205, sfx: "cring" },
  { at: F.s4 + 10, sfx: "beep_success" },
  { at: F.s4 + 18, sfx: "pop", volume: 0.8 },
  { at: F.s4 + 24, sfx: "pop", volume: 0.8 },
  { at: CUT + 6, sfx: "click", volume: 0.7 }, // lock ulang di titik potong
  { at: 515 - SHIFT, sfx: "cring", volume: 0.45 },
  { at: 548 - SHIFT, sfx: "cring", volume: 0.45 },
  { at: 585 - SHIFT, sfx: "cring", volume: 0.45 },
  { at: F.s7 + 12, sfx: "beep_success", volume: 0.8 },
];

export type FeedProps = { bumperFrames: number };

export const AntracolFeed: React.FC<FeedProps> = ({ bumperFrames }) => {
  const vo = asset(ASSET.vo);
  const jingle = asset(ASSET.jingle);
  const bumper = asset(ASSET.bumper);
  return (
    <AbsoluteFill style={{ background: C.darkGreen }}>
      <Sequence durationInFrames={FEED_FRAMES}>
        <FeedMaster />
      </Sequence>
      {vo ? (
        <>
          <Sequence durationInFrames={CUT}>
            <Audio src={vo} />
          </Sequence>
          <Sequence from={CUT} durationInFrames={FEED_FRAMES - CUT}>
            <Audio src={vo} trimBefore={RESUME} />
          </Sequence>
        </>
      ) : null}
      <Sfx cues={FEED_SFX} />
      {jingle ? (
        <Audio
          src={jingle}
          volume={(f) =>
            Math.min(
              f < FEED_FRAMES - 6 ? JINGLE_BED : tw(f, FEED_FRAMES - 6, FEED_FRAMES + 6, JINGLE_BED, 1),
              tw(f, FEED_FRAMES + bumperFrames - 20, FEED_FRAMES + bumperFrames, 1, 0, easeIn),
            )
          }
        />
      ) : null}
      {bumper && bumperFrames > 0 ? (
        <Sequence from={FEED_FRAMES} durationInFrames={bumperFrames}>
          <AbsoluteFill style={{ background: BUMPER_BG, justifyContent: "center" }}>
            <OffthreadVideo src={bumper} muted style={{ width: FEED.width }} />
          </AbsoluteFill>
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

const FeedMaster: React.FC = () => {
  const f = useCurrentFrame();

  // Bidikan + TANIA. Di CUT, avatar lompat waktu; bidikan "lock" ulang untuk menyamarkannya.
  const cx = kf(f, [
    [0, 790], [F.s2, 790], [F.s2 + 14, 830], [F.s4, 830], [F.s4 + 16, 830],
    [F.s6, 830], [F.s6 + 12, 890], [F.s8, 890], [F.s8 + 14, 540],
  ]);
  const cy = kf(f, [
    [0, 760], [F.s2, 760], [F.s2 + 14, 820], [F.s4, 820], [F.s4 + 16, 770],
    [F.s6, 770], [F.s6 + 12, 310], [F.s8, 310], [F.s8 + 14, 400],
  ]);
  const size = kf(f, [
    [0, 400], [F.s2, 400], [F.s2 + 14, 340], [F.s4, 340], [F.s4 + 16, 460],
    [F.s6, 460], [F.s6 + 12, 250], [F.s8, 250], [F.s8 + 14, 260],
  ]);
  const spread =
    tw(f, 0, 8, 420, 0, easeBack) +
    (f >= F.s4 + 6 ? tw(f, F.s4 + 6, F.s4 + 14, 70, 0, easeBack) : 0) +
    (f >= F.s6 + 4 ? tw(f, F.s6 + 4, F.s6 + 12, 60, 0, easeBack) : 0);
  const scan =
    scanAt(f, 8, 30) ?? scanAt(f, F.s4 + 10, F.s4 + 32) ?? scanAt(f, F.s6 + 8, F.s6 + 28);
  const taniaOut = [630, 645] as const;
  const tania = inOut(f, 4, 12, ...taniaOut);
  // kilatan singkat di CUT menutupi lompatan klip avatar
  const flash = f >= CUT - 2 && f < CUT + 6 ? 1 - Math.abs(f - CUT) / 6 : 0;
  const bob = f >= F.s4 + 16 && f < F.s4 + 32 ? -6 * Math.sin((Math.PI * (f - F.s4 - 16)) / 16) : 0;
  const KOIN = 205;
  const bump = f >= KOIN && f < KOIN + 10 ? 1 + 0.01 * Math.sin((Math.PI * (f - KOIN)) / 10) : 1;

  const avatarProps = { cx, cy, size, opacity: tania, dy: bob };
  return (
    <AbsoluteFill style={{ transform: `scale(${bump})`, fontFamily: FONT }}>
      <div
        style={{
          position: "absolute",
          left: cx - size * 0.78,
          top: cy - size * 0.78,
          width: size * 1.56,
          height: size * 1.56,
          borderRadius: "50%",
          background: C.farmriseGreen,
          transform: `scale(${tw(f, F.s4, F.s4 + 10, 0, 1)})`,
          opacity: inOut(f, F.s4, F.s4 + 2, ...taniaOut),
        }}
      />
      <Sequence durationInFrames={CUT} layout="none">
        <AvatarWindow {...avatarProps} />
      </Sequence>
      <Sequence from={CUT} layout="none">
        <AvatarWindow {...avatarProps} trimBefore={RESUME} />
      </Sequence>
      {flash > 0 ? (
        <div
          style={{
            position: "absolute",
            left: cx - size * 0.43,
            top: cy - size * 0.43,
            width: size * 0.86,
            height: size * 0.86,
            borderRadius: size * 0.1,
            background: C.lime,
            opacity: flash * 0.85,
          }}
        />
      ) : null}
      <Reticle cx={cx} cy={cy + bob} size={size} spread={spread} scan={scan} opacity={inOut(f, 0, 1, ...taniaOut)} />

      <Logo cx={FEED.width / 2} top={56} height={64} opacity={1} />

      <Hook f={f} />
      <Headline f={f} koin={KOIN} />
      <Chips f={f} cx={cx} cy={cy} size={size} />
      <Rewards f={f} />
      <Cta f={f} />
      <Tagline f={f} />
    </AbsoluteFill>
  );
};

const scanAt = (f: number, a: number, b: number) => (f >= a && f <= b ? (f - a) / (b - a) : null);

const Hook: React.FC<{ f: number }> = ({ f }) => {
  const out = tw(f, F.s2, F.s2 + 12, 0, 1, easeIn);
  return (
    <div style={{ position: "absolute", left: M, top: 250, opacity: 1 - out, transform: `translateY(${-40 * out}px)` }}>
      <div style={{ color: C.lime, fontWeight: 700, fontSize: 26, letterSpacing: 7, opacity: tw(f, 6, 14, 0, 1) }}>
        ANTRACOL × FARMRISE
      </div>
      <Words
        text="Halo, Sobat Petani!"
        start={3}
        gap={5}
        style={{ display: "block", marginTop: 16, color: C.white, fontWeight: 700, fontSize: 64, width: 560 }}
      />
    </div>
  );
};

const Headline: React.FC<{ f: number; koin: number }> = ({ f, koin }) => {
  const scale = kf(f, [[F.s4, 1], [F.s4 + 16, 0.8]]);
  const opacity = 1 - tw(f, F.s6, F.s6 + 10, 0, 1, easeIn);
  if (opacity <= 0) return null;
  const k = tw(f, koin, koin + 8, 0, 1, easeOut);
  const glint = tw(f, koin + 8, koin + 26, -60, 160, easeOut);
  const koinStyle: React.CSSProperties = { fontWeight: 900, fontSize: 150, lineHeight: 1, letterSpacing: -5, whiteSpace: "nowrap" };
  return (
    <div style={{ position: "absolute", left: M, top: 190, transform: `scale(${scale})`, transformOrigin: "left top", opacity }}>
      <div style={{ color: C.white, fontWeight: 300, fontSize: 80, lineHeight: 1.08 }}>
        <Words text="Pastikan" start={54} mode="mask" />
        <br />
        <Words text="keasliannya," start={62} mode="mask" />
      </div>
      <div
        style={{
          color: C.lime,
          fontWeight: 900,
          fontSize: 96,
          lineHeight: 1.05,
          marginTop: 12,
          opacity: tw(f, 188, 196, 0, 1),
          transform: `translateX(${tw(f, 188, 198, -60, 0)}px)`,
        }}
      >
        kumpulkan
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 4,
          opacity: f >= koin ? 1 : 0,
          transform: `scale(${1.2 - 0.2 * k})`,
          transformOrigin: "left center",
          filter: `blur(${(1 - k) * 4}px)`,
        }}
      >
        <div style={{ ...koinStyle, color: C.lime }}>Koinnya.</div>
        {f > koin + 8 && f < koin + 28 ? (
          <div
            style={{
              ...koinStyle,
              position: "absolute",
              inset: 0,
              color: "transparent",
              backgroundImage: "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.95) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
              backgroundPosition: `${100 - glint}% 0`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            Koinnya.
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Chips: React.FC<{ f: number; cx: number; cy: number; size: number }> = ({ f, cx, cy, size }) => {
  const out = 1 - tw(f, F.s6, F.s6 + 8, 0, 1, easeIn);
  if (f < F.s4 + 18 || out <= 0) return null;
  const x = cx - size / 2 - 150;
  const y = cy + size / 2 - 190;
  return (
    <div style={{ opacity: out }}>
      <Chip x={x} y={y} label="Bayer Coins" bg={C.lime} scale={pop(f, F.s4 + 18)} fontSize={36} />
      <Chip
        x={x}
        y={y + 84}
        label="Terverifikasi"
        bg={C.white}
        scale={pop(f, F.s4 + 24)}
        check={tw(f, F.s4 + 28, F.s4 + 40, 0, 1)}
        fontSize={36}
      />
    </div>
  );
};

/* Tiga kartu reward berjajar horizontal, di atas strip CTA. Timing = master − SHIFT. */
const CARDS = [
  { kind: "pulsa" as const, title: "Pulsa", sub: "", start: 515 - SHIFT },
  { kind: "wallet" as const, title: "E-wallet", sub: "GoPay & OVO", start: 548 - SHIFT },
  { kind: "voucher" as const, title: "Voucher belanja", sub: "Alfamart & Indomaret", start: 585 - SHIFT },
];
const CARD = { top: 500, w: 300, h: 220, gap: 30 };
const CHIP_POS = { x: M, y: 190 };

const Rewards: React.FC<{ f: number }> = ({ f }) => {
  if (f < F.s6 || f > F.s8 + 14) return null;
  const out = 1 - tw(f, F.s8, F.s8 + 12, 0, 1, easeIn);
  const chipPulse = f >= F.s6 + 18 && f < F.s6 + 30 ? 1 + 0.12 * Math.sin((Math.PI * (f - F.s6 - 18)) / 12) : 1;
  return (
    <div style={{ opacity: out }}>
      <Chip x={CHIP_POS.x} y={CHIP_POS.y} label="Bayer Coins" bg={C.lime} scale={pop(f, F.s6 + 4) * chipPulse} fontSize={36} />
      <div style={{ position: "absolute", left: M, top: 280, color: C.white, fontWeight: 700, fontSize: 46, width: 470 }}>
        <Words text="Tukar Bayer Coins jadi:" start={F.s6 + 10} gap={3} />
      </div>
      {CARDS.map((c, i) => {
        const left = 60 + i * (CARD.w + CARD.gap);
        const flip = tw(f, c.start, c.start + 12, -90, 0, easeOut);
        const t = tw(f, c.start - 14, c.start, 0, 1, easeOut);
        const sx = CHIP_POS.x + 40;
        const sy = CHIP_POS.y + 36;
        const ex = left + CARD.w / 2;
        const ey = CARD.top + 70;
        const px = sx + (ex - sx) * t;
        const py = sy + (ey - sy) * t - Math.sin(Math.PI * t) * 80;
        return (
          <React.Fragment key={i}>
            {f >= c.start - 14 && f < c.start + 2 ? (
              <div
                style={{
                  position: "absolute",
                  left: px - 16,
                  top: py - 16,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: C.lime,
                  boxShadow: `0 0 20px 6px ${C.lime}aa`,
                }}
              />
            ) : null}
            <div
              style={{
                position: "absolute",
                left,
                top: CARD.top,
                width: CARD.w,
                height: CARD.h,
                borderRadius: 28,
                background: C.white,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "0 18px",
                boxSizing: "border-box",
                textAlign: "center",
                color: C.black,
                opacity: f >= c.start ? 1 : 0,
                transform: `perspective(900px) rotateY(${flip}deg)`,
                boxShadow: "0 12px 30px #00000033",
              }}
            >
              <RewardIcon kind={c.kind} size={64} />
              <div style={{ fontWeight: 900, fontSize: 38, lineHeight: 1.1 }}>{c.title}</div>
              {c.sub ? <div style={{ fontWeight: 600, fontSize: 28, lineHeight: 1.2 }}>{c.sub}</div> : null}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* Strip CTA ±180 px di bawah. */
const STRIP = { left: 40, top: 826, width: 1000, height: 214 };
const QR_SIZE = 290; // termasuk quiet zone putih (padding 22); QR padat, jadi dibuat besar
const QR_IN = F.s7 + 8;

const Cta: React.FC<{ f: number }> = ({ f }) => {
  if (f < F.s7 || f > F.s8 + 14) return null;
  const slide = tw(f, F.s7, F.s7 + 8, 260, 0, easeOut);
  const out = 1 - tw(f, F.s8, F.s8 + 12, 0, 1, easeIn);
  const nudge = f >= F.s7 + 30 && f < F.s7 + 54 ? 12 * Math.abs(Math.sin((Math.PI * (f - F.s7 - 30)) / 12)) : 0;
  const qr = asset(ASSET.qr);
  const qrLeft = STRIP.left + STRIP.width - 8 - QR_SIZE;
  const qrTop = STRIP.top + STRIP.height - QR_SIZE; // menjorok ke atas strip
  return (
    <div style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          ...STRIP,
          borderRadius: 30,
          background: C.farmriseGreen,
          transform: `translateY(${slide}px)`,
          color: C.black,
          padding: "26px 0 0 40px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 54, lineHeight: 1, letterSpacing: -1 }}>
          Scan & unduh
          <br />
          sekarang!
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginTop: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 30 }}>Cek link di bio</span>
          <span style={{ fontWeight: 600, fontSize: 22 }}>S&K berlaku</span>
        </div>
        <svg width={72} height={50} viewBox="0 0 86 60" style={{ position: "absolute", left: 470 + nudge, top: 70 }}>
          <path d="M4 30 H70 M50 8 L76 30 L50 52" fill="none" stroke={C.black} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {f >= QR_IN ? (
        <>
          <div
            style={{
              position: "absolute",
              left: qrLeft,
              top: qrTop,
              width: QR_SIZE,
              height: QR_SIZE,
              borderRadius: 14,
              background: C.white,
              padding: 22,
              boxShadow: "0 10px 30px #00000040",
              boxSizing: "border-box",
            }}
          >
            {qr ? <Img src={qr} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <Placeholder label="QR" />}
          </div>
          <Reticle
            cx={qrLeft + QR_SIZE / 2}
            cy={qrTop + QR_SIZE / 2}
            size={QR_SIZE + 20}
            thickness={6}
            spread={tw(f, QR_IN, QR_IN + 8, 70, 0, easeBack)}
          />
        </>
      ) : null}
    </div>
  );
};

const Tagline: React.FC<{ f: number }> = ({ f }) => {
  if (f < F.s8 + 10) return null;
  const style: React.CSSProperties = {
    fontFamily: FONT_TAGLINE,
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: 66,
    lineHeight: 1.15,
    color: C.white,
  };
  return (
    <div style={{ position: "absolute", top: 650, width: FEED.width, textAlign: "center" }}>
      <Words text="Tumbuh Lebih Baik" start={F.s8 + 14} gap={6} style={{ ...style, display: "block" }} />
      <Words text="Bersama FarmRise" start={F.s8 + 32} gap={6} style={{ ...style, display: "block" }} />
    </div>
  );
};
