import Script from "next/script";
import type { ProfileFaqItem } from "@/lib/profile/profileFaq";

type ProfileFaqJsonLdProps = {
  items: ProfileFaqItem[];
  /** Stable id for the script tag (per profile). */
  scriptId: string;
};

export function ProfileFaqJsonLd({ items, scriptId }: ProfileFaqJsonLdProps) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const json = JSON.stringify(schema);

  return (
    <Script
      id={scriptId}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
