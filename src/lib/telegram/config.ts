/** Server-only — never expose in NEXT_PUBLIC_* */
export function getTelegramBotToken(): string {
  return (
    process.env.TELEGRAM_BOT_TOKEN?.trim() ||
    process.env.CRAK_TELEGRAM_BOT_TOKEN?.trim() ||
    ""
  );
}

export function getTelegramBotUsername(): string {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() || "";
}
