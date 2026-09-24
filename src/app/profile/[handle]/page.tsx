import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateUniqueSEOContent } from "@/lib/profile/seoContent";
import { resolveModelProfile } from "@/lib/profile/modelProfile";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const model = await resolveModelProfile(handle);
  if (!model) {
    return {
      title: "Model profile not found — NaughtyXXXCams",
      robots: { index: false, follow: false },
    };
  }

  const seo = generateUniqueSEOContent({
    name: model.name,
    handle: model.handle,
    traits: model.traits,
    language: model.language,
    bodyType: model.bodyType,
  });

  return {
    title: seo.title,
    description: seo.intro.slice(0, 160),
    openGraph: {
      title: seo.title,
      description: seo.intro.slice(0, 200),
      images: model.avatar ? [{ url: model.avatar }] : undefined,
    },
  };
}

export default async function ModelProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const modelData = await resolveModelProfile(handle);

  if (!modelData) {
    notFound();
  }

  const seoContent = generateUniqueSEOContent({
    name: modelData.name,
    handle: modelData.handle,
    traits: modelData.traits,
    language: modelData.language,
    bodyType: modelData.bodyType,
  });

  const isLive = modelData.status === "live";

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pb-16 pt-4 text-white md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="relative h-44 overflow-hidden rounded-2xl border border-white/10 md:h-52">
          <Image
            src={modelData.bannerUrl}
            alt={`${modelData.name} live banner`}
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
          {isLive && (
            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
              • EN VIVO
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-neutral-900/60 p-4 backdrop-blur-md">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-pink-500">
            <Image
              src={modelData.avatar}
              alt={modelData.name}
              fill
              sizes="80px"
              className="object-cover"
              priority
            />
            {isLive && (
              <span
                className="absolute bottom-0 right-0 h-4 w-4 animate-pulse rounded-full border-2 border-neutral-950 bg-red-500"
                aria-hidden
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {isLive ? (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  • LIVE
                </span>
              ) : (
                <span className="rounded-full bg-neutral-700 px-2 py-0.5 text-xs font-bold text-neutral-200">
                  OFFLINE
                </span>
              )}
              <span className="text-xs text-neutral-400">
                {modelData.platform}
                {modelData.age != null ? ` · ${modelData.age}` : ""} ·{" "}
                {modelData.bodyType} · {modelData.language} ·{" "}
                {modelData.country}
              </span>
            </div>
            <h1 className="mt-1 truncate text-2xl font-bold">{modelData.name}</h1>
            <p className="text-sm text-neutral-400">{modelData.handle}</p>
          </div>
        </div>

        <a
          href={modelData.affiliateUrl}
          target="_blank"
          rel="nofollow noopener"
          className="block w-full rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4 text-center text-lg font-bold shadow-lg shadow-pink-600/30 transition-all hover:from-pink-500 hover:to-purple-500 active:scale-[0.99]"
        >
          {isLive
            ? `• LIVE Chat with ${modelData.name}`
            : `Notify & Chat — ${modelData.name}`}
        </a>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-800"
          >
            + Follow (Telegram Alerts)
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-800"
          >
            ★ Save to Library
          </button>
        </div>

        {modelData.gallery.length > 1 && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-neutral-900/40 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Gallery Preview
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {modelData.gallery.slice(0, 6).map((src) => (
                <div
                  key={src}
                  className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10"
                >
                  <Image
                    src={src}
                    alt={`${modelData.name} preview`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-2xl border border-white/10 bg-neutral-900/40 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Welcome
          </h3>
          <p className="text-sm leading-relaxed text-neutral-300">
            {seoContent.intro}
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-neutral-900/40 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Interests & Attributes
          </h3>
          <div className="flex flex-wrap gap-2">
            {modelData.traits.map((trait) => (
              <span
                key={trait}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs transition hover:bg-white/10"
              >
                ✨ {trait}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/5 bg-neutral-900/20 p-5 text-xs leading-relaxed text-neutral-400">
          <h3 className="text-sm font-semibold text-white">
            About {modelData.name}&apos;s Live Stream Hub
          </h3>
          <p>{seoContent.longDescription}</p>
        </div>
      </div>
    </main>
  );
}
