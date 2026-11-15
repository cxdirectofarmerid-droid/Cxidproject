import { Composition } from "remotion";
import { TestVideo } from "./TestVideo";
import { AntracolStory, StoryProps } from "./antracol/Story";
import { AntracolFeed, FEED, FEED_FRAMES, FeedProps } from "./antracol/Feed";
import { AntracolBanner, BANNER, BANNER_FRAMES } from "./antracol/Banner";
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
        id="AntracolFeed"
        component={AntracolFeed}
        durationInFrames={FEED_FRAMES}
        fps={FPS}
        width={FEED.width}
        height={FEED.height}
        defaultProps={{ bumperFrames: 150 } satisfies FeedProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: FEED_FRAMES + Math.max(0, props.bumperFrames),
        })}
      />
      <Composition
        id="AntracolBanner"
        component={AntracolBanner}
        durationInFrames={BANNER_FRAMES}
        fps={FPS}
        width={BANNER.width}
        height={BANNER.height}
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
