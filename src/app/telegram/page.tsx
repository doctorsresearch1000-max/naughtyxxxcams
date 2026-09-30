import { permanentRedirect } from "next/navigation";

/** Legacy Mini App entry — 301 to profile hub (see next.config redirect). */
export default function TelegramMiniAppPage() {
  permanentRedirect("/profile");
}
