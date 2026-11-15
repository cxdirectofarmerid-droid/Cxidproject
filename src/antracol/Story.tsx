import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, useCurrentFrame } from "remotion";
import "./fonts";
import { easeBack, easeIn, easeOut, inOut, kf, pop, tw } from "./anim";
import {
  AvatarWindow,
  Chip,
  FeatureIcon,
  Logo,
  Placeholder,
  Reticle,
  RewardIcon,
  Words,
} from "./parts";
import { ASSET, C, FONT, FONT_TAGLINE, MARGIN_X, S, STORY_FRAMES, WIDTH, asset } from "./theme";

export type StoryProps = { bumperFrames: number };

/** Warna latar Bumper Outro.mp4 (diambil dari videonya). */
const BUMPER_BG = "#33A225";

/** Nilai 0..1 garis scan di jendela [a,b]; null di luar. */
const scanAt = (f: number, a: number, b: number) => (f >= a && f <= b ? (f - a) / (b - a) : null);

export const AntracolStory: React.FC<StoryProps> = ({ bumperFrames }) => {
  const vo = asset(ASSET.vo);
  const jingle = asset(ASSET.jingle);
  const bumper = asset(ASSET.bumper);
  return (
    <AbsoluteFill style={{ background: C.darkGreen }}>
      <Sequence durationInFrames={STORY_FRAMES}>
        <Master />
      </Sequence>
      {vo ? <Audio src={vo} /> : null}
      {jingle ? (
        <Audio
          src={jingle}
          // di bawah VO (±−22 LUFS), naik penuh saat bumper, fade out di akhir
          volume={(f) =>
            Math.min(
              f < STORY_FRAMES - 6 ? 0.14 : tw(f, STORY_FRAMES - 6, STORY_FRAMES + 6, 0.14, 1),
              tw(f, STORY_FRAMES + bumperFrames - 20, STORY_FRAMES + bumperFrames, 1, 0, easeIn),
            )
          }
        />
      ) : null}
      {bumper && bumperFrames > 0 ? (
        <Sequence from={STORY_FRAMES} durationInFrames={bumperFrames}>
          {/* Bumper 16:9, latar hijaunya diteruskan ke seluruh frame 9:16 */}
          <AbsoluteFill style={{ background: BUMPER_BG, justifyContent: "center" }}>
            <OffthreadVideo src={bumper} muted style={{ width: WIDTH }} />
          </AbsoluteFill>
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

const Master: React.FC = () => {
  const f = useCurrentFrame();

  /* ---- Bidikan + TANIA: satu jalur posisi untuk seluruh video ---- */
  const cx = kf(f, [
    [0, 540], [S.s2, 540], [S.s2 + 14, 800], [S.s4, 800], [S.s4 + 16, 680],
    [S.s5, 680], [S.s5 + 16, 810], [S.s7, 810], [S.s7 + 16, 540], [S.s8, 540],
  ]);
  const cy = kf(f, [
    [0, 980], [S.s2, 980], [S.s2 + 14, 1360], [S.s4, 1360], [S.s4 + 16, 1180],
    [S.s5, 1180], [S.s5 + 16, 1430], [S.s7, 1430], [S.s7 + 16, 960], [S.s8, 960], [S.s8 + 14, 640],
  ]);
  const size = kf(f, [
    [0, 600], [S.s2, 600], [S.s2 + 14, 400], [S.s4, 400], [S.s4 + 16, 560],
    [S.s5, 560], [S.s5 + 16, 392], [S.s7, 392], [S.s7 + 16, 520], [S.s8, 520], [S.s8 + 14, 420],
  ]);
  const spread =
    tw(f, 0, 8, 520, 0, easeBack) +
    (f >= S.s4 + 6 ? tw(f, S.s4 + 6, S.s4 + 14, 70, 0, easeBack) : 0) +
    (f >= S.s7 + 14 ? tw(f, S.s7 + 14, S.s7 + 22, 50, 0, easeBack) : 0);
  const scan = scanAt(f, 8, 30) ?? scanAt(f, S.s4 + 10, S.s4 + 32) ?? scanAt(f, S.s7 + 18, S.s7 + 38);
  const tania = inOut(f, 4, 12, 790, 805);
  const taniaDx = f >= S.s4 && f < S.s4 + 16 ? tw(f, S.s4, S.s4 + 16, 90, 0) : 0;
  const bob = f >= S.s4 + 16 && f < S.s4 + 32 ? -6 * Math.sin((Math.PI * (f - S.s4 - 16)) / 16) : 0;

  /* ---- Beat "Koinnya." ---- */
  const KOIN = 205;
  const bump = f >= KOIN && f < KOIN + 10 ? 1 + 0.01 * Math.sin((Math.PI * (f - KOIN)) / 10) : 1;

  return (
    <AbsoluteFill style={{ transform: `scale(${bump})`, fontFamily: FONT }}>
      {/* Lingkaran FarmRise Green di belakang TANIA (mulai Scene 4) */}
      <div
        style={{
          position: "absolute",
          left: cx - size * 0.78,
          top: cy - size * 0.78,
          width: size * 1.56,
          height: size * 1.56,
          borderRadius: "50%",
          background: C.farmriseGreen,
          transform: `scale(${tw(f, S.s4, S.s4 + 10, 0, 1)})`,
          opacity: inOut(f, S.s4, S.s4 + 2, 790, 805),
        }}
      />

      <AvatarWindow cx={cx} cy={cy} size={size} opacity={tania} dx={taniaDx} dy={bob} />
      <Reticle cx={cx} cy={cy + bob} size={size} spread={spread} scan={scan} opacity={inOut(f, 0, 1, 790, 805)} />

      <Logo cx={WIDTH / 2} top={270} height={90} opacity={1} />

      <Hook f={f} />
      <Headline f={f} koin={KOIN} />
      <Chips f={f} cx={cx} cy={cy} size={size} />
      <Steps f={f} />
      <Rewards f={f} />
      <Cta f={f} />
      <Tagline f={f} />
    </AbsoluteFill>
  );
};

/* ---------------- Scene 1: Hook ---------------- */

const Hook: React.FC<{ f: number }> = ({ f }) => {
  const out = tw(f, S.s2, S.s2 + 12, 0, 1, easeIn);
  return (
    <div
      style={{
        position: "absolute",
        top: 395,
        width: WIDTH,
        textAlign: "center",
        opacity: 1 - out,
        transform: `translateY(${-50 * out}px)`,
      }}
    >
      <div
        style={{
          color: C.lime,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 8,
          opacity: tw(f, 6, 14, 0, 1),
        }}
      >
        ANTRACOL × FARMRISE
      </div>
      <Words
        text="Halo, Sobat Petani!"
        start={3}
        gap={5}
        style={{ display: "block", marginTop: 18, color: C.white, fontWeight: 700, fontSize: 64 }}
      />
    </div>
  );
};

/* ---------------- Scene 2–4: Headline ---------------- */

const Headline: React.FC<{ f: number; koin: number }> = ({ f, koin }) => {
  const top = kf(f, [[S.s4, 560], [S.s4 + 16, 400]]);
  const scale = kf(f, [[S.s4, 1], [S.s4 + 16, 0.72]]);
  const opacity = 1 - tw(f, S.s5, S.s5 + 12, 0, 1, easeIn);
  const k = tw(f, koin, koin + 8, 0, 1, easeOut);
  const glint = tw(f, koin + 8, koin + 26, -60, 160, easeOut);
  const koinStyle: React.CSSProperties = {
    fontWeight: 900,
    fontSize: 182,
    lineHeight: 1,
    letterSpacing: -6,
    whiteSpace: "nowrap",
  };
  return (
    <div
      style={{
        position: "absolute",
        left: MARGIN_X,
        top,
        transform: `scale(${scale})`,
        transformOrigin: "left top",
        opacity,
      }}
    >
      <div style={{ color: C.white, fontWeight: 300, fontSize: 96, lineHeight: 1.08 }}>
        <Words text="Pastikan" start={54} mode="mask" />
        <br />
        <Words text="keasliannya," start={62} mode="mask" />
      </div>
      <div
        style={{
          color: C.lime,
          fontWeight: 900,
          fontSize: 112,
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
              backgroundImage:
                "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.95) 50%, transparent 60%)",
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

/* ---------------- Scene 4: chip ---------------- */

const Chips: React.FC<{ f: number; cx: number; cy: number; size: number }> = ({ f, cx, cy, size }) => {
  const out = 1 - tw(f, S.s5, S.s5 + 10, 0, 1, easeIn);
  if (f < S.s4 + 18 || out <= 0) return null;
  const x = cx - size / 2 - 110;
  const y = cy + size / 2 - 170;
  return (
    <div style={{ opacity: out }}>
      <Chip x={x} y={y} label="Bayer Coins" bg={C.lime} scale={pop(f, S.s4 + 18)} />
      <Chip
        x={x}
        y={y + 92}
        label="Terverifikasi"
        bg={C.white}
        scale={pop(f, S.s4 + 24)}
        check={tw(f, S.s4 + 28, S.s4 + 40, 0, 1)}
      />
    </div>
  );
};

/* ---------------- Scene 5: langkah 1–3 ---------------- */

const STEPS = [
  { text: "Buka FarmRise", icon: ASSET.iconFarmrise, start: 345 },
  { text: "Scan QR di kemasan Antracol", icon: ASSET.iconVerifikasi, start: 381 },
  { text: "Dapat Bayer Coins", icon: ASSET.iconCoins, start: 420 },
];
const STEP_TOP = 560;
const STEP_GAP = 210;

const Steps: React.FC<{ f: number }> = ({ f }) => {
  if (f < S.s5 || f > S.s6 + 14) return null;
  const out = 1 - tw(f, S.s6, S.s6 + 12, 0, 1, easeIn);
  const packIn = tw(f, 381, 395, 1, 0, easeOut);
  const pack = asset(ASSET.pack);
  return (
    <div style={{ opacity: out }}>
      {STEPS.map((s, i) => {
        const p = tw(f, s.start, s.start + 12, 0, 1);
        const top = STEP_TOP + i * STEP_GAP;
        return (
          <React.Fragment key={i}>
            {i > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: MARGIN_X + 42,
                  top: top - STEP_GAP + 100,
                  width: 4,
                  height: (STEP_GAP - 112) * tw(f, s.start - 10, s.start, 0, 1),
                  background: C.lime,
                  borderRadius: 2,
                }}
              />
            ) : null}
            <div
              style={{
                position: "absolute",
                left: MARGIN_X,
                top,
                display: "flex",
                alignItems: "center",
                gap: 22,
                opacity: p,
                transform: `translateX(${(1 - p) * -90}px)`,
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: C.lime,
                  color: C.black,
                  fontWeight: 900,
                  fontSize: 46,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <FeatureIcon name={s.icon} size={68} />
              <div style={{ color: C.white, fontWeight: 700, fontSize: 44, lineHeight: 1.15, width: 400 }}>
                {s.text}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Mockup kemasan Antracol New 2026 (500 gr) */}
      {f >= 381 ? (
        <div
          style={{
            position: "absolute",
            left: 715,
            top: 500,
            width: 300,
            height: 560,
            borderRadius: 18,
            transform: `translateX(${packIn * 420}px)`,
          }}
        >
          {pack ? (
            <Img src={pack} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <Placeholder label="Antracol 500 gr" sub="mockup kemasan" />
          )}
        </div>
      ) : null}
      {f >= 395 ? (
        <Reticle
          cx={865}
          cy={688}
          size={210}
          thickness={7}
          spread={tw(f, 395, 403, 120, 0, easeBack)}
          scan={scanAt(f, 401, 417)}
        />
      ) : null}
    </div>
  );
};

/* ---------------- Scene 6: tukar Bayer Coins ---------------- */

const CARDS = [
  { kind: "pulsa" as const, title: "Pulsa", sub: "", start: 515 },
  { kind: "wallet" as const, title: "E-wallet", sub: "GoPay & OVO", start: 548 },
  { kind: "voucher" as const, title: "Voucher belanja", sub: "Alfamart & Indomaret", start: 585 },
];
const CARD_TOP = 740;
const CARD_GAP = 172;
const CHIP_POS = { x: MARGIN_X, y: 520 };

const Rewards: React.FC<{ f: number }> = ({ f }) => {
  if (f < S.s6 || f > S.s7 + 16) return null;
  const out = 1 - tw(f, S.s7, S.s7 + 14, 0, 1, easeIn);
  const outScale = 1 - 0.1 * (1 - out);
  const chipPulse = f >= S.s6 + 18 && f < S.s6 + 30 ? 1 + 0.12 * Math.sin((Math.PI * (f - S.s6 - 18)) / 12) : 1;
  return (
    <div style={{ opacity: out, transform: `scale(${outScale})`, transformOrigin: "left center" }}>
      <Chip x={CHIP_POS.x} y={CHIP_POS.y} label="Bayer Coins" bg={C.lime} scale={pop(f, S.s6 + 6) * chipPulse} />
      <div style={{ position: "absolute", left: MARGIN_X, top: 640, color: C.white, fontWeight: 700, fontSize: 46 }}>
        <Words text="Tukar Bayer Coins jadi:" start={S.s6 + 12} gap={3} />
      </div>
      {CARDS.map((c, i) => {
        const top = CARD_TOP + i * CARD_GAP;
        const flip = tw(f, c.start, c.start + 12, -90, 0, easeOut);
        // partikel koin terbang dari chip ke kartu
        const t = tw(f, c.start - 14, c.start, 0, 1, easeOut);
        const px = CHIP_POS.x + 40 + (MARGIN_X + 66 - CHIP_POS.x - 40) * t;
        const py = CHIP_POS.y + 40 + (top + 75 - CHIP_POS.y - 40) * t - Math.sin(Math.PI * t) * 60;
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
                left: MARGIN_X,
                top,
                width: 560,
                height: 150,
                borderRadius: 28,
                background: C.white,
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "0 32px",
                boxSizing: "border-box",
                opacity: f >= c.start ? 1 : 0,
                transform: `perspective(900px) rotateX(${flip}deg)`,
                transformOrigin: "center top",
                boxShadow: "0 12px 30px #00000033",
              }}
            >
              <RewardIcon kind={c.kind} size={72} />
              <div style={{ color: C.black }}>
                <div style={{ fontWeight: 900, fontSize: 42, lineHeight: 1.1 }}>{c.title}</div>
                {c.sub ? <div style={{ fontWeight: 600, fontSize: 32, marginTop: 4 }}>{c.sub}</div> : null}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ---------------- Scene 7: CTA + QR ---------------- */

const BLOCK = { left: 60, top: 1380, width: 960, height: 290 };
const QR_SIZE = 236;
const QR_IN = S.s7 + 8; // QR diam dari sini sampai S.s8 (> 3 detik)

const Cta: React.FC<{ f: number }> = ({ f }) => {
  if (f < S.s7 || f > S.s8 + 14) return null;
  const slide = tw(f, S.s7, S.s7 + 8, 380, 0, easeOut);
  const out = 1 - tw(f, S.s8, S.s8 + 12, 0, 1, easeIn);
  const nudge = f >= 676 && f < 700 ? 14 * Math.abs(Math.sin((Math.PI * (f - 676)) / 12)) : 0;
  const qr = asset(ASSET.qr);
  const qrLeft = BLOCK.left + BLOCK.width - 30 - QR_SIZE;
  const qrTop = BLOCK.top + (BLOCK.height - QR_SIZE) / 2;
  return (
    <div style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          ...BLOCK,
          borderRadius: 36,
          background: C.farmriseGreen,
          transform: `translateY(${slide}px)`,
          color: C.black,
          padding: "34px 0 0 44px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 64, lineHeight: 1.02, letterSpacing: -1 }}>
          Scan & unduh
          <br />
          sekarang!
        </div>
        <div style={{ fontWeight: 700, fontSize: 32, marginTop: 22 }}>Cek link di bio</div>
        <div style={{ fontWeight: 600, fontSize: 22, marginTop: 6 }}>S&K berlaku</div>
        <svg
          width={86}
          height={60}
          viewBox="0 0 86 60"
          style={{ position: "absolute", left: 510 + nudge, top: 115 }}
        >
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
              borderRadius: 20,
              background: C.white,
              padding: 16,
              boxSizing: "border-box",
            }}
          >
            {qr ? (
              <Img src={qr} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              <Placeholder label="QR" sub="public/qr_farmrise.png" />
            )}
          </div>
          <Reticle
            cx={qrLeft + QR_SIZE / 2}
            cy={qrTop + QR_SIZE / 2}
            size={QR_SIZE + 26}
            thickness={7}
            spread={tw(f, QR_IN, QR_IN + 8, 90, 0, easeBack)}
          />
        </>
      ) : null}
    </div>
  );
};

/* ---------------- Scene 8: tagline ---------------- */

const Tagline: React.FC<{ f: number }> = ({ f }) => {
  if (f < S.s8 + 10) return null;
  const style: React.CSSProperties = {
    fontFamily: FONT_TAGLINE,
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: 76,
    lineHeight: 1.15,
    color: C.white,
  };
  return (
    <div style={{ position: "absolute", top: 960, width: WIDTH, textAlign: "center" }}>
      <Words text="Tumbuh Lebih Baik" start={S.s8 + 14} gap={6} style={{ ...style, display: "block" }} />
      <Words text="Bersama FarmRise" start={S.s8 + 32} gap={6} style={{ ...style, display: "block" }} />
    </div>
  );
};
