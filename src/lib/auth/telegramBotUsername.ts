/** Public bot username for Telegram Login Widget (set in BotFather + domain). */
export function getPublicTelegramBotUsername(): string {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() || "";
}
