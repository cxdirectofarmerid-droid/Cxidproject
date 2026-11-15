import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import "./fonts";
import { easeBack, easeOut, pop, tw } from "./anim";
import { AvatarWindow, Chip, Reticle, Words } from "./parts";
import { ASSET, C, FONT, asset } from "./theme";

/**
 * Banner 1200 × 628, 6 dtk loop, tanpa VO.
 * 0–2 dtk headline ("Koinnya." ±110 px), 2–4 dtk TANIA + lingkaran + chip,
 * 4–6 dtk tombol "Unduh FarmRise" (tanpa QR) lalu key visual lengkap ditahan ±1 dtk.
 */
export const BANNER = { width: 1200, height: 628 };
export const BANNER_FRAMES = 180;

const RET = { cx: 940, cy: 300, size: 330 };

export const AntracolBanner: React.FC = () => {
  const f = useCurrentFrame();
  const logo = asset(ASSET.logo);

  const k = tw(f, 26, 34, 0, 1, easeOut);
  const glint = tw(f, 36, 54, -60, 160, easeOut);
  const koinStyle: React.CSSProperties = { fontWeight: 900, fontSize: 110, lineHeight: 1, letterSpacing: -4, whiteSpace: "nowrap" };

  const circle = tw(f, 60, 70, 0, 1);
  const tania = tw(f, 64, 76, 0, 1);
  const taniaDx = tw(f, 64, 76, 60, 0);
  const spread = f >= 62 ? tw(f, 62, 70, 160, 0, easeBack) : 400;
  const scan = f >= 70 && f <= 88 ? (f - 70) / 18 : null;

  const btnIn = tw(f, 120, 130, 0, 1, easeOut);
  // dua kali pulse, selesai sebelum frame 150 supaya ±1 dtk terakhir diam
  const pulse = f >= 130 && f < 150 ? 1 + 0.06 * Math.abs(Math.sin((Math.PI * (f - 130)) / 10)) : 1;

  return (
    <AbsoluteFill style={{ background: C.darkGreen, fontFamily: FONT, overflow: "hidden" }}>
      {/* Kolom kanan: lingkaran + TANIA + bidikan + chip */}
      <div
        style={{
          position: "absolute",
          left: RET.cx - 290,
          top: RET.cy - 290,
          width: 580,
          height: 580,
          borderRadius: "50%",
          background: C.farmriseGreen,
          transform: `scale(${circle})`,
        }}
      />
      <AvatarWindow cx={RET.cx} cy={RET.cy} size={RET.size} opacity={tania} dx={taniaDx} still />
      {f >= 62 ? <Reticle cx={RET.cx} cy={RET.cy} size={RET.size} spread={spread} scan={scan} thickness={8} /> : null}
      {f >= 84 ? (
        <>
          <Chip x={RET.cx - RET.size / 2 - 90} y={RET.cy + 52} label="Bayer Coins" bg={C.lime} scale={pop(f, 84)} fontSize={28} />
          <Chip
            x={RET.cx - RET.size / 2 - 90}
            y={RET.cy + 116}
            label="Terverifikasi"
            bg={C.white}
            scale={pop(f, 90)}
            check={tw(f, 94, 106, 0, 1)}
            fontSize={28}
          />
        </>
      ) : null}

      {/* Kolom kiri: logo, headline, tombol */}
      <div style={{ position: "absolute", left: 60, top: 44, height: 44 }}>
        {logo ? <Img src={logo} style={{ height: 44 }} /> : null}
      </div>
      <div style={{ position: "absolute", left: 60, top: 128 }}>
        <div style={{ color: C.white, fontWeight: 300, fontSize: 46, lineHeight: 1.1 }}>
          <Words text="Pastikan keasliannya," start={0} gap={4} mode="mask" />
        </div>
        <div
          style={{
            color: C.lime,
            fontWeight: 900,
            fontSize: 62,
            lineHeight: 1.05,
            marginTop: 6,
            opacity: tw(f, 14, 22, 0, 1),
            transform: `translateX(${tw(f, 14, 24, -40, 0)}px)`,
          }}
        >
          kumpulkan
        </div>
        <div
          style={{
            position: "relative",
            opacity: f >= 26 ? 1 : 0,
            transform: `scale(${1.2 - 0.2 * k})`,
            transformOrigin: "left center",
            filter: `blur(${(1 - k) * 3}px)`,
          }}
        >
          <div style={{ ...koinStyle, color: C.lime }}>Koinnya.</div>
          {f > 36 && f < 56 ? (
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
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 486,
          opacity: btnIn,
          transform: `translateY(${(1 - btnIn) * 40}px) scale(${pulse})`,
          transformOrigin: "left center",
          background: C.farmriseGreen,
          color: C.black,
          fontWeight: 900,
          fontSize: 34,
          padding: "18px 34px",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 10px 24px #00000040",
        }}
      >
        Unduh FarmRise
        <svg width={34} height={24} viewBox="0 0 86 60">
          <path d="M4 30 H70 M50 8 L76 30 L50 52" fill="none" stroke={C.black} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
