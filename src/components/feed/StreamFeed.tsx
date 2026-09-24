import { feedStreams } from "@/data/mock";
import { StreamSlide } from "./StreamSlide";

export function StreamFeed() {
  return (
    <section
      className="snap-feed h-[100dvh] w-full overflow-y-scroll hide-scrollbar"
      aria-label="Live streams feed"
    >
      {feedStreams.map((stream, index) => (
        <StreamSlide key={stream.id} stream={stream} priority={index === 0} />
      ))}
    </section>
  );
}
