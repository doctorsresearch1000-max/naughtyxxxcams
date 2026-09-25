"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { finalizeTelegramBrowserLogin } from "@/lib/auth/finalizeTelegramLogin";
import { verifyTelegramWidgetLogin } from "@/lib/auth/telegramClient";
import {
  consumeTelegramLoginReturnPath,
  parseWidgetAuthFromSearchParams,
} from "@/lib/auth/telegramLoginReturn";

export default function TelegramLoginReturnPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing Telegram sign-in…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = parseWidgetAuthFromSearchParams(params);

    if (!auth) {
      setMessage("Invalid or missing Telegram login data.");
      return;
    }

    void (async () => {
      const user = await verifyTelegramWidgetLogin(auth);
      if (!user) {
        setMessage(
          "We could not verify your Telegram login. Confirm naughtyxxxcams.com is set in BotFather for this bot, then try again.",
        );
        return;
      }
      await finalizeTelegramBrowserLogin(user);
      router.replace(consumeTelegramLoginReturnPath());
    })();
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-[#0A0A0A] px-6 text-center text-white">
      <p className="text-sm text-zinc-300">{message}</p>
    </main>
  );
}
