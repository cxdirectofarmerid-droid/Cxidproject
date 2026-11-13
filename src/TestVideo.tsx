import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const TestVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(
    frame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f2027, #2c5364)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: 140,
          fontWeight: 800,
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        Cxidproject
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          color: "#9fd3e6",
          fontSize: 40,
          opacity,
        }}
      >
        1920×1080 · 30fps · frame {frame}
      </div>
    </AbsoluteFill>
  );
};
