import { redirect } from "next/navigation";

/** Entry for Telegram Mini App (BotFather Web App URL → /telegram). */
export default function TelegramMiniAppPage() {
  redirect("/profile");
}
