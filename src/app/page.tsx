import { HomeVerticalFeed } from "@/components/feed/HomeVerticalFeed";
import { SessionAudioProvider } from "@/components/feed/SessionAudioProvider";

export default function HomePage() {
  return (
    <SessionAudioProvider>
      <HomeVerticalFeed />
    </SessionAudioProvider>
  );
}
