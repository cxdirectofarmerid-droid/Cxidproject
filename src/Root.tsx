import { Composition } from "remotion";
import { TestVideo } from "./TestVideo";
import { AntracolStory, StoryProps } from "./antracol/Story";
import { FPS, HEIGHT, STORY_FRAMES, WIDTH } from "./antracol/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AntracolStory"
        component={AntracolStory}
        durationInFrames={STORY_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        // bumperFrames: durasi Bumper Outro.mp4 (5 detik @30fps)
        defaultProps={{ bumperFrames: 150 } satisfies StoryProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: STORY_FRAMES + Math.max(0, props.bumperFrames),
        })}
      />
      <Composition
        id="TestVideo"
        component={TestVideo}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
