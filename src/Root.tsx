import { Composition } from "remotion";
import { TestVideo } from "./TestVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TestVideo"
      component={TestVideo}
      durationInFrames={90} // 3 detik @ 30fps
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
