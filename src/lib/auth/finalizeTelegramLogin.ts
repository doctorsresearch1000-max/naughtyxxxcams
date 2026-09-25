import type { TelegramUser } from "@/lib/auth/telegramSession";
import { writeTelegramUser } from "@/lib/auth/telegramSession";
import { syncTelegramLibraryAfterLogin } from "@/lib/telegram/telegramLibraryClient";

/** Persist session + sync library after server-verified Telegram Login (widget). */
export async function finalizeTelegramBrowserLogin(
  user: TelegramUser,
): Promise<void> {
  writeTelegramUser(user);
  await syncTelegramLibraryAfterLogin(user);
}
